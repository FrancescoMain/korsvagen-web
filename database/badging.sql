-- Badging: run once in the Supabase SQL editor before deploying the feature.
-- All attendance data is private. Only the backend service_role may access it.
BEGIN;

CREATE TABLE IF NOT EXISTS public.badge_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  address text NOT NULL CHECK (length(address) BETWEEN 1 AND 250),
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  radius_m double precision NOT NULL DEFAULT 200 CHECK (radius_m BETWEEN 20 AND 5000),
  max_accuracy_m double precision NOT NULL DEFAULT 100 CHECK (max_accuracy_m BETWEEN 5 AND 1000),
  outside_policy text NOT NULL DEFAULT 'block' CHECK (outside_policy IN ('block', 'flag')),
  qr_token text UNIQUE NOT NULL DEFAULT (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.badge_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL CHECK (length(first_name) BETWEEN 1 AND 100),
  last_name text NOT NULL CHECK (length(last_name) BETWEEN 1 AND 100),
  birth_date date NOT NULL,
  job_role text NOT NULL CHECK (length(job_role) BETWEEN 1 AND 100),
  phone text UNIQUE NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
  password_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  session_version integer NOT NULL DEFAULT 0,
  must_change_password boolean NOT NULL DEFAULT false,
  first_device_hash text,
  current_site_id uuid REFERENCES public.badge_sites(id),
  current_entry_at timestamptz,
  current_entry_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((current_site_id IS NULL) = (current_entry_at IS NULL)),
  CHECK ((current_entry_at IS NULL) = (current_entry_id IS NULL))
);

CREATE TABLE IF NOT EXISTS public.badge_devices (
  device_hash text NOT NULL CHECK (device_hash ~ '^[a-f0-9]{64}$'),
  employee_id uuid NOT NULL REFERENCES public.badge_employees(id),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (device_hash, employee_id)
);

CREATE TABLE IF NOT EXISTS public.badge_events (
  id uuid PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.badge_employees(id),
  site_id uuid NOT NULL REFERENCES public.badge_sites(id),
  action text NOT NULL CHECK (action IN ('in', 'out')),
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  outcome text NOT NULL CHECK (outcome IN ('accepted', 'rejected')),
  reason text,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  accuracy_m double precision NOT NULL CHECK (accuracy_m BETWEEN 0 AND 10000),
  distance_m double precision NOT NULL CHECK (distance_m >= 0),
  device_hash text NOT NULL CHECK (device_hash ~ '^[a-f0-9]{64}$'),
  user_agent text NOT NULL,
  flags text[] NOT NULL DEFAULT '{}',
  employee_name text NOT NULL,
  birth_date date NOT NULL,
  job_role text NOT NULL,
  site_name text NOT NULL,
  duration_seconds integer CHECK (duration_seconds >= 0),
  entry_site_name text,
  CHECK ((outcome = 'accepted' AND reason IS NULL) OR (outcome = 'rejected' AND reason IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS badge_events_employee_time ON public.badge_events(employee_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS badge_events_site_time ON public.badge_events(site_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS badge_events_time ON public.badge_events(occurred_at DESC, id);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='badge_current_entry_fk' AND conrelid='public.badge_employees'::regclass) THEN
    ALTER TABLE public.badge_employees ADD CONSTRAINT badge_current_entry_fk
      FOREIGN KEY (current_entry_id) REFERENCES public.badge_events(id);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.badge_admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.admin_users(id),
  action text NOT NULL,
  resource_id uuid NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS badge_admin_audit_resource ON public.badge_admin_audit(resource_id, action);

CREATE TABLE IF NOT EXISTS public.badge_rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL,
  window_start timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS badge_rate_limits_window ON public.badge_rate_limits(window_start);

CREATE OR REPLACE FUNCTION public.badge_distance_m(a double precision, b double precision, c double precision, d double precision)
RETURNS double precision LANGUAGE sql IMMUTABLE STRICT SET search_path = public
AS $$
  SELECT 6371000 * 2 * asin(sqrt(least(1::double precision,
    power(sin(radians(c-a)/2),2) + cos(radians(a))*cos(radians(c))*power(sin(radians(d-b)/2),2))));
$$;

-- Atomic, persistent throttling also works across Vercel instances.
CREATE OR REPLACE FUNCTION public.badge_rate_limit(p_key text, p_limit integer, p_seconds integer)
RETURNS boolean LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE v_hits integer;
BEGIN
  DELETE FROM badge_rate_limits WHERE window_start < now() - interval '1 day';
  INSERT INTO badge_rate_limits AS r (key, hits, window_start) VALUES (p_key, 1, now())
  ON CONFLICT (key) DO UPDATE SET
    hits = CASE WHEN r.window_start < now() - make_interval(secs => p_seconds) THEN 1 ELSE r.hits + 1 END,
    window_start = CASE WHEN r.window_start < now() - make_interval(secs => p_seconds) THEN now() ELSE r.window_start END
  RETURNING hits INTO v_hits;
  RETURN v_hits <= p_limit;
END;
$$;

-- One transaction checks status, geofence, device associations and sequence,
-- then appends the receipt and updates current presence. No browser clock is used.
CREATE OR REPLACE FUNCTION public.badge_punch(
  p_id uuid, p_employee uuid, p_session_version integer, p_qr text, p_action text,
  p_latitude double precision, p_longitude double precision, p_accuracy double precision,
  p_device text, p_user_agent text
) RETURNS public.badge_events LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE
  emp badge_employees;
  site badge_sites;
  receipt badge_events;
  previous badge_events;
  stamp timestamptz;
  distance double precision;
  rejection text;
  flags text[] := '{}';
  duration integer;
  entry_name text;
BEGIN
  IF p_id IS NULL OR p_action IS NULL OR p_action NOT IN ('in', 'out')
    OR p_latitude IS NULL OR NOT (p_latitude BETWEEN -90 AND 90)
    OR p_longitude IS NULL OR NOT (p_longitude BETWEEN -180 AND 180)
    OR p_accuracy IS NULL OR NOT (p_accuracy BETWEEN 0 AND 10000)
    OR p_device IS NULL OR p_device !~ '^[a-f0-9]{64}$'
    OR p_user_agent IS NULL OR length(p_user_agent) > 250 THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;

  SELECT * INTO emp FROM badge_employees WHERE id = p_employee FOR UPDATE;
  IF NOT FOUND OR emp.status <> 'active' OR emp.session_version IS DISTINCT FROM p_session_version OR emp.must_change_password THEN
    RAISE EXCEPTION 'EMPLOYEE_NOT_ACTIVE';
  END IF;

  -- Serialize use of the same browser by different accounts as well.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_device, 0));
  SELECT * INTO receipt FROM badge_events WHERE id = p_id;
  IF FOUND THEN
    IF receipt.employee_id <> p_employee OR receipt.action <> p_action OR receipt.device_hash <> p_device THEN
      RAISE EXCEPTION 'REQUEST_CONFLICT';
    END IF;
    RETURN receipt;
  END IF;

  SELECT * INTO site FROM badge_sites WHERE qr_token = p_qr AND archived_at IS NULL FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'QR_INACTIVE'; END IF;
  stamp := clock_timestamp();
  distance := badge_distance_m(site.latitude, site.longitude, p_latitude, p_longitude);

  INSERT INTO badge_devices (device_hash, employee_id, first_seen_at, last_seen_at)
  VALUES (p_device, p_employee, stamp, stamp)
  ON CONFLICT (device_hash, employee_id) DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at;
  IF EXISTS (SELECT 1 FROM badge_devices WHERE device_hash = p_device AND employee_id <> p_employee) THEN
    flags := array_append(flags, 'shared_device');
  END IF;
  IF emp.first_device_hash IS NOT NULL AND emp.first_device_hash <> p_device THEN
    flags := array_append(flags, 'new_device');
  END IF;

  IF p_accuracy > site.max_accuracy_m THEN
    rejection := 'low_accuracy';
  ELSIF distance > site.radius_m THEN
    flags := array_append(flags, 'outside_zone');
    IF site.outside_policy = 'block' THEN rejection := 'outside_zone'; END IF;
  ELSIF distance + p_accuracy > site.radius_m THEN
    flags := array_append(flags, 'boundary_accuracy');
  END IF;

  IF rejection IS NULL THEN
    IF p_action = 'in' AND emp.current_site_id IS NOT NULL THEN
      rejection := 'already_in';
    ELSIF p_action = 'out' AND emp.current_site_id IS NULL THEN
      rejection := 'not_in';
    END IF;
  END IF;

  IF rejection IS NULL AND p_action = 'out' THEN
    duration := greatest(0, floor(extract(epoch FROM stamp - emp.current_entry_at)))::integer;
    SELECT name INTO entry_name FROM badge_sites WHERE id = emp.current_site_id;
    IF emp.current_site_id <> site.id THEN flags := array_append(flags, 'different_exit_site'); END IF;
    IF duration > 57600 THEN flags := array_append(flags, 'long_shift'); END IF;
  END IF;
  SELECT * INTO previous FROM badge_events
    WHERE employee_id = p_employee AND outcome = 'accepted' ORDER BY occurred_at DESC LIMIT 1;
  IF FOUND AND previous.site_id <> site.id
    AND badge_distance_m(previous.latitude, previous.longitude, p_latitude, p_longitude) > 5000
    AND badge_distance_m(previous.latitude, previous.longitude, p_latitude, p_longitude) /
      greatest(1, extract(epoch FROM stamp - previous.occurred_at)) > 50 THEN
    flags := array_append(flags, 'rapid_site_change');
  END IF;

  INSERT INTO badge_events (
    id, employee_id, site_id, action, occurred_at, outcome, reason,
    latitude, longitude, accuracy_m, distance_m, device_hash, user_agent, flags,
    employee_name, birth_date, job_role, site_name, duration_seconds, entry_site_name
  ) VALUES (
    p_id, emp.id, site.id, p_action, stamp,
    CASE WHEN rejection IS NULL THEN 'accepted' ELSE 'rejected' END, rejection,
    p_latitude, p_longitude, p_accuracy, distance, p_device, p_user_agent, flags,
    emp.first_name || ' ' || emp.last_name, emp.birth_date, emp.job_role, site.name, duration, entry_name
  ) RETURNING * INTO receipt;

  IF rejection IS NULL THEN
    UPDATE badge_employees SET
      first_device_hash = coalesce(first_device_hash, p_device),
      current_site_id = CASE WHEN p_action = 'in' THEN site.id ELSE NULL END,
      current_entry_at = CASE WHEN p_action = 'in' THEN stamp ELSE NULL END,
      current_entry_id = CASE WHEN p_action = 'in' THEN p_id ELSE NULL END
    WHERE id = emp.id;
  END IF;
  RETURN receipt;
END;
$$;

CREATE OR REPLACE FUNCTION public.badge_manage_site(p_admin uuid, p_action text, p_id uuid, p_data jsonb)
RETURNS public.badge_sites LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE site badge_sites; before_data jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id = p_admin AND is_active AND role IN ('admin', 'super_admin')) THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED';
  END IF;
  IF p_action = 'create' THEN
    INSERT INTO badge_sites (name, address, latitude, longitude, radius_m, max_accuracy_m, outside_policy)
    VALUES (p_data->>'name', p_data->>'address', (p_data->>'latitude')::double precision,
      (p_data->>'longitude')::double precision, (p_data->>'radius_m')::double precision,
      (p_data->>'max_accuracy_m')::double precision, p_data->>'outside_policy')
    RETURNING * INTO site;
  ELSE
    SELECT * INTO site FROM badge_sites WHERE id = p_id AND archived_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'QR_INACTIVE'; END IF;
    before_data := to_jsonb(site) - 'qr_token';
    IF p_action = 'update' THEN
      UPDATE badge_sites SET name = p_data->>'name', address = p_data->>'address',
        latitude = (p_data->>'latitude')::double precision, longitude = (p_data->>'longitude')::double precision,
        radius_m = (p_data->>'radius_m')::double precision, max_accuracy_m = (p_data->>'max_accuracy_m')::double precision,
        outside_policy = p_data->>'outside_policy', updated_at = clock_timestamp()
      WHERE id = p_id RETURNING * INTO site;
    ELSIF p_action = 'rotate' THEN
      UPDATE badge_sites SET qr_token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
        updated_at = clock_timestamp() WHERE id = p_id RETURNING * INTO site;
    ELSIF p_action = 'archive' THEN
      IF EXISTS (SELECT 1 FROM badge_employees WHERE current_site_id = p_id) THEN RAISE EXCEPTION 'SITE_OCCUPIED'; END IF;
      UPDATE badge_sites SET archived_at = clock_timestamp(), updated_at = clock_timestamp()
      WHERE id = p_id RETURNING * INTO site;
    ELSE RAISE EXCEPTION 'INVALID_INPUT';
    END IF;
  END IF;
  INSERT INTO badge_admin_audit(admin_id, action, resource_id, details)
  VALUES (p_admin, 'site_' || p_action, site.id,
    jsonb_build_object('before', before_data, 'after', to_jsonb(site) - 'qr_token'));
  RETURN site;
END;
$$;

CREATE OR REPLACE FUNCTION public.badge_manage_employee(p_admin uuid, p_id uuid, p_status text, p_password_hash text)
RETURNS void LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE emp badge_employees;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id = p_admin AND is_active AND role IN ('admin', 'super_admin')) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  SELECT * INTO emp FROM badge_employees WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'EMPLOYEE_NOT_FOUND'; END IF;
  IF p_status IS NOT NULL THEN
    IF p_status NOT IN ('active', 'suspended') THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
    UPDATE badge_employees SET status = p_status, session_version = session_version + 1 WHERE id = p_id;
  ELSIF p_password_hash IS NOT NULL AND p_password_hash LIKE '$2%' THEN
    UPDATE badge_employees SET password_hash = p_password_hash, must_change_password = true,
      session_version = session_version + 1 WHERE id = p_id;
  ELSE RAISE EXCEPTION 'INVALID_INPUT';
  END IF;
  INSERT INTO badge_admin_audit(admin_id, action, resource_id, details)
  VALUES (p_admin, CASE WHEN p_status IS NOT NULL THEN 'employee_status' ELSE 'password_reset' END,
    p_id, jsonb_build_object('previous_status', emp.status, 'status', coalesce(p_status, emp.status)));
END;
$$;

-- Retrospective association: the first account also becomes visible as shared
-- when a second account uses that browser later.
CREATE OR REPLACE FUNCTION public.badge_close_entry(p_admin uuid, p_employee uuid, p_reason text)
RETURNS void LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE emp badge_employees; entry_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id=p_admin AND is_active AND role IN ('admin','super_admin')) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 5 AND 500 THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  SELECT * INTO emp FROM badge_employees WHERE id=p_employee FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'EMPLOYEE_NOT_FOUND'; END IF;
  IF emp.current_entry_at IS NULL THEN RAISE EXCEPTION 'NO_OPEN_ENTRY'; END IF;
  entry_id := emp.current_entry_id;
  IF entry_id IS NULL THEN RAISE EXCEPTION 'NO_OPEN_ENTRY'; END IF;
  INSERT INTO badge_admin_audit(admin_id,action,resource_id,details) VALUES
    (p_admin,'entry_closed_manually',entry_id,jsonb_build_object('employee_id',emp.id,'reason',trim(p_reason)));
  UPDATE badge_employees SET current_site_id=NULL,current_entry_at=NULL,current_entry_id=NULL WHERE id=emp.id;
END;
$$;

CREATE OR REPLACE VIEW public.badge_event_report WITH (security_invoker = true) AS
SELECT e.*, ARRAY(
  SELECT DISTINCT f FROM unnest(e.flags || CASE WHEN EXISTS (
    SELECT 1 FROM badge_devices d WHERE d.device_hash = e.device_hash AND d.employee_id <> e.employee_id
  ) THEN ARRAY['shared_device'] ELSE ARRAY[]::text[] END || CASE WHEN EXISTS (
    SELECT 1 FROM badge_admin_audit a WHERE a.resource_id=e.id AND a.action='entry_closed_manually'
  ) THEN ARRAY['entry_closed_manually'] ELSE ARRAY[]::text[] END) AS f
) AS anomaly_flags,
(SELECT a.details->>'reason' FROM badge_admin_audit a WHERE a.resource_id=e.id AND a.action='entry_closed_manually' ORDER BY a.created_at DESC LIMIT 1) AS adjustment_note
FROM public.badge_events e;

CREATE OR REPLACE FUNCTION public.badge_report_summary(
  p_from timestamptz, p_to timestamptz, p_site uuid, p_employee uuid, p_outcome text, p_flagged boolean
) RETURNS jsonb LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'events', count(*),
    'entries', count(*) FILTER (WHERE outcome = 'accepted' AND action = 'in'),
    'exits', count(*) FILTER (WHERE outcome = 'accepted' AND action = 'out'),
    'rejected', count(*) FILTER (WHERE outcome = 'rejected'),
    'anomalies', count(*) FILTER (WHERE cardinality(anomaly_flags) > 0),
    'employees', count(DISTINCT employee_id) FILTER (WHERE outcome = 'accepted'),
    'completed_seconds', coalesce(sum(duration_seconds) FILTER (WHERE outcome = 'accepted'), 0)
  ) FROM badge_event_report
  WHERE occurred_at >= p_from AND occurred_at < p_to
    AND (p_site IS NULL OR site_id = p_site) AND (p_employee IS NULL OR employee_id = p_employee)
    AND (p_outcome IS NULL OR outcome = p_outcome)
    AND (NOT p_flagged OR cardinality(anomaly_flags) > 0);
$$;

ALTER TABLE public.badge_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.badge_sites, public.badge_employees, public.badge_devices,
  public.badge_events, public.badge_admin_audit, public.badge_rate_limits,
  public.badge_event_report FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.badge_sites, public.badge_employees, public.badge_devices TO service_role;
GRANT SELECT, INSERT ON public.badge_events, public.badge_admin_audit TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badge_rate_limits TO service_role;
GRANT SELECT ON public.badge_event_report TO service_role;

REVOKE ALL ON FUNCTION public.badge_distance_m(double precision,double precision,double precision,double precision),
  public.badge_rate_limit(text,integer,integer),
  public.badge_punch(uuid,uuid,integer,text,text,double precision,double precision,double precision,text,text),
  public.badge_manage_site(uuid,text,uuid,jsonb),
  public.badge_manage_employee(uuid,uuid,text,text),
  public.badge_close_entry(uuid,uuid,text),
  public.badge_report_summary(timestamptz,timestamptz,uuid,uuid,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.badge_distance_m(double precision,double precision,double precision,double precision),
  public.badge_rate_limit(text,integer,integer),
  public.badge_punch(uuid,uuid,integer,text,text,double precision,double precision,double precision,text,text),
  public.badge_manage_site(uuid,text,uuid,jsonb),
  public.badge_manage_employee(uuid,uuid,text,text),
  public.badge_close_entry(uuid,uuid,text),
  public.badge_report_summary(timestamptz,timestamptz,uuid,uuid,text,boolean) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
