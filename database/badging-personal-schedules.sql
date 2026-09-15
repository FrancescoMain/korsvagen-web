-- Employee weekly schedules, optional lunch and audited attendance corrections.
BEGIN;
CREATE TABLE public.badge_employee_schedules (
  employee_id uuid NOT NULL REFERENCES public.badge_employees(id) ON DELETE CASCADE,
  weekday integer NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  expected_start time NOT NULL, expected_end time NOT NULL,
  break_start time, break_end time,
  PRIMARY KEY(employee_id,weekday),
  CHECK (expected_start<>expected_end),
  CHECK ((break_start IS NULL AND break_end IS NULL) OR
    (break_start IS NOT NULL AND break_end IS NOT NULL AND break_start<>break_end AND
      mod(extract(epoch FROM break_start-expected_start)+86400,86400) < mod(extract(epoch FROM expected_end-expected_start)+86400,86400) AND
      mod(extract(epoch FROM break_start-expected_start)+86400,86400)+mod(extract(epoch FROM break_end-break_start)+86400,86400)
        <=mod(extract(epoch FROM expected_end-expected_start)+86400,86400)))
);
ALTER TABLE public.badge_employee_schedules ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.badge_employee_schedules FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.badge_employee_schedules TO service_role;

CREATE FUNCTION public.badge_employee_schedule(p_employee uuid) RETURNS jsonb LANGUAGE sql STABLE SET search_path=public AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('weekday',weekday,
    'expected_start',to_char(expected_start,'HH24:MI'),'expected_end',to_char(expected_end,'HH24:MI'),
    'break_start',to_char(break_start,'HH24:MI'),'break_end',to_char(break_end,'HH24:MI')) ORDER BY weekday),'[]'::jsonb)
  FROM badge_employee_schedules WHERE employee_id=p_employee;
$$;
CREATE FUNCTION public.badge_set_employee_schedule(p_admin uuid,p_employee uuid,p_days jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path=public AS $$
DECLARE item jsonb; previous jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id=p_admin AND is_active AND role IN ('admin','super_admin')) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  IF p_days IS NULL OR jsonb_typeof(p_days)<>'array' OR jsonb_array_length(p_days)>7 THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  PERFORM 1 FROM badge_employees WHERE id=p_employee FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'EMPLOYEE_NOT_FOUND'; END IF;
  previous:=badge_employee_schedule(p_employee);
  DELETE FROM badge_employee_schedules WHERE employee_id=p_employee;
  FOR item IN SELECT * FROM jsonb_array_elements(p_days) LOOP
    IF jsonb_typeof(item)<>'object' OR coalesce(item->>'weekday','') !~ '^[1-7]$' OR
      coalesce(item->>'expected_start','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' OR
      coalesce(item->>'expected_end','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' OR
      (item->>'break_start' IS NOT NULL AND item->>'break_start' !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') OR
      (item->>'break_end' IS NOT NULL AND item->>'break_end' !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
    INSERT INTO badge_employee_schedules VALUES(p_employee,(item->>'weekday')::integer,
      (item->>'expected_start')::time,(item->>'expected_end')::time,(item->>'break_start')::time,(item->>'break_end')::time);
  END LOOP;
  INSERT INTO badge_admin_audit(admin_id,action,resource_id,details) VALUES
    (p_admin,'employee_schedule',p_employee,jsonb_build_object('previous',previous,'days',badge_employee_schedule(p_employee)));
  RETURN badge_employee_schedule(p_employee);
EXCEPTION WHEN check_violation OR unique_violation THEN RAISE EXCEPTION 'INVALID_INPUT';
END;
$$;

-- Original receipts remain immutable. The effective view is shared by reports and statistics.
CREATE TABLE public.badge_event_adjustments (
  event_id uuid PRIMARY KEY REFERENCES public.badge_events(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL, deleted boolean NOT NULL DEFAULT false,
  revision integer NOT NULL DEFAULT 1 CHECK(revision>0), reason text NOT NULL,
  admin_id uuid NOT NULL REFERENCES public.admin_users(id), updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.badge_event_adjustments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.badge_event_adjustments FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.badge_event_adjustments TO service_role;
CREATE VIEW public.badge_effective_events WITH(security_invoker=true) AS
SELECT e.id,e.employee_id,e.site_id,e.action,coalesce(a.occurred_at,e.occurred_at) AS occurred_at,e.outcome,e.reason,
  e.latitude,e.longitude,e.accuracy_m,e.distance_m,e.device_hash,e.user_agent,
  CASE WHEN e.action='out' AND (a.event_id IS NOT NULL OR p.adjusted) THEN
    array_remove(e.flags,'long_shift') || CASE WHEN extract(epoch FROM coalesce(a.occurred_at,e.occurred_at)-p.at)>57600 THEN ARRAY['long_shift'] ELSE ARRAY[]::text[] END
    ELSE e.flags END AS flags,
  e.employee_name,e.birth_date,e.job_role,e.site_name,
  CASE WHEN e.outcome='accepted' AND e.action='out' AND p.action='in' AND e.duration_seconds IS NOT NULL
    THEN greatest(0,floor(extract(epoch FROM coalesce(a.occurred_at,e.occurred_at)-p.at)))::integer
    ELSE e.duration_seconds END AS duration_seconds,
  e.entry_site_name,e.occurred_at AS original_occurred_at,coalesce(a.revision,0) AS revision,
  coalesce(a.reason,CASE WHEN e.action='out' THEN p.reason END) AS correction_note
FROM badge_events e LEFT JOIN badge_event_adjustments a ON a.event_id=e.id
LEFT JOIN LATERAL (
  SELECT n.action,coalesce(na.occurred_at,n.occurred_at) AS at,na.event_id IS NOT NULL AS adjusted,na.reason
  FROM badge_events n LEFT JOIN badge_event_adjustments na ON na.event_id=n.id
  WHERE e.action='out' AND e.outcome='accepted' AND n.employee_id=e.employee_id AND n.outcome='accepted'
    AND (n.occurred_at,n.id)<(e.occurred_at,e.id) AND NOT coalesce(na.deleted,false)
  ORDER BY n.occurred_at DESC,n.id DESC LIMIT 1
) p ON true WHERE NOT coalesce(a.deleted,false);

CREATE OR REPLACE VIEW public.badge_event_report WITH(security_invoker=true) AS
SELECT e.id,e.employee_id,e.site_id,e.action,e.occurred_at,e.outcome,e.reason,
  e.latitude,e.longitude,e.accuracy_m,e.distance_m,e.device_hash,e.user_agent,e.flags,
  e.employee_name,e.birth_date,e.job_role,e.site_name,e.duration_seconds,e.entry_site_name,
  ARRAY(SELECT DISTINCT f FROM unnest(e.flags || CASE WHEN EXISTS (
    SELECT 1 FROM badge_devices d WHERE d.device_hash=e.device_hash AND d.employee_id<>e.employee_id
  ) THEN ARRAY['shared_device'] ELSE ARRAY[]::text[] END || CASE WHEN EXISTS (
    SELECT 1 FROM badge_admin_audit a WHERE a.resource_id=e.id AND a.action='entry_closed_manually'
  ) THEN ARRAY['entry_closed_manually'] ELSE ARRAY[]::text[] END ||
    CASE WHEN e.correction_note IS NOT NULL THEN ARRAY['admin_correction'] ELSE ARRAY[]::text[] END) f) AS anomaly_flags,
  coalesce(e.correction_note,(SELECT a.details->>'reason' FROM badge_admin_audit a WHERE a.resource_id=e.id AND a.action='entry_closed_manually' ORDER BY a.created_at DESC LIMIT 1)) AS adjustment_note,
  e.original_occurred_at,e.revision
FROM badge_effective_events e;

CREATE FUNCTION public.badge_adjust_event(p_admin uuid,p_event uuid,p_revision integer,p_at timestamptz,p_delete boolean,p_paired_exit uuid,p_reason text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=public AS $$
DECLARE raw badge_events; current_event record; emp badge_employees; paired record; previous_at timestamptz; next_at timestamptz; affected uuid[];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id=p_admin AND is_active AND role IN ('admin','super_admin')) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  IF p_delete IS NULL OR p_revision IS NULL OR p_reason IS NULL OR length(trim(p_reason)) NOT BETWEEN 5 AND 500 THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  SELECT * INTO raw FROM badge_events WHERE id=p_event AND outcome='accepted';
  IF NOT FOUND THEN RAISE EXCEPTION 'EVENT_NOT_FOUND'; END IF;
  SELECT * INTO emp FROM badge_employees WHERE id=raw.employee_id FOR UPDATE;
  SELECT * INTO current_event FROM badge_effective_events WHERE id=p_event;
  IF NOT FOUND OR current_event.revision<>p_revision THEN RAISE EXCEPTION 'EVENT_CHANGED'; END IF;
  SELECT n.id,n.action,n.occurred_at INTO paired FROM badge_effective_events n
    WHERE n.employee_id=raw.employee_id AND n.outcome='accepted'
      AND (n.original_occurred_at,n.id)>(raw.occurred_at,raw.id)
    ORDER BY n.original_occurred_at,n.id LIMIT 1;
  IF p_delete THEN
    IF raw.action<>'in' THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
    IF (CASE WHEN paired.action='out' THEN paired.id END) IS DISTINCT FROM p_paired_exit THEN RAISE EXCEPTION 'EVENT_CHANGED'; END IF;
    affected:=CASE WHEN paired.action='out' THEN ARRAY[p_event,paired.id] ELSE ARRAY[p_event] END;
    INSERT INTO badge_event_adjustments(event_id,occurred_at,deleted,reason,admin_id)
      SELECT id,occurred_at,true,trim(p_reason),p_admin FROM badge_effective_events WHERE id=ANY(affected)
      ON CONFLICT(event_id) DO UPDATE SET deleted=true,reason=EXCLUDED.reason,admin_id=p_admin,
        revision=badge_event_adjustments.revision+1,updated_at=clock_timestamp();
    IF emp.current_entry_id=p_event THEN
      UPDATE badge_employees SET current_entry_id=NULL,current_site_id=NULL,current_entry_at=NULL WHERE id=emp.id;
    END IF;
  ELSE
    IF p_at IS NULL OR NOT isfinite(p_at) OR p_at>clock_timestamp() OR p_at<'2000-01-01'::timestamptz THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
    SELECT n.occurred_at INTO previous_at FROM badge_effective_events n
      WHERE n.employee_id=raw.employee_id AND n.outcome='accepted' AND (n.original_occurred_at,n.id)<(raw.occurred_at,raw.id)
      ORDER BY n.original_occurred_at DESC,n.id DESC LIMIT 1;
    next_at:=paired.occurred_at;
    IF p_at<=previous_at OR p_at>=next_at THEN RAISE EXCEPTION 'EVENT_OVERLAP'; END IF;
    affected:=ARRAY[p_event];
    INSERT INTO badge_event_adjustments(event_id,occurred_at,reason,admin_id) VALUES(p_event,p_at,trim(p_reason),p_admin)
      ON CONFLICT(event_id) DO UPDATE SET occurred_at=p_at,reason=EXCLUDED.reason,admin_id=p_admin,
        revision=badge_event_adjustments.revision+1,updated_at=clock_timestamp();
    IF emp.current_entry_id=p_event THEN UPDATE badge_employees SET current_entry_at=p_at WHERE id=emp.id; END IF;
  END IF;
  INSERT INTO badge_admin_audit(admin_id,action,resource_id,details) VALUES(p_admin,
    CASE WHEN p_delete THEN 'entry_deleted' ELSE 'event_corrected' END,p_event,
    jsonb_build_object('reason',trim(p_reason),'previous_at',current_event.occurred_at,'occurred_at',p_at,'affected_events',affected,'previous_revision',p_revision));
  RETURN jsonb_build_object('success',true,'affected_events',affected);
END;
$$;

CREATE FUNCTION public.badge_event_detail(p_event uuid) RETURNS jsonb LANGUAGE sql STABLE SET search_path=public AS $$
  SELECT to_jsonb(e)||jsonb_build_object('paired_exit',CASE WHEN e.action='in' AND n.action='out' THEN to_jsonb(n) END,
    'changes',coalesce((SELECT jsonb_agg(jsonb_build_object('action',a.action,'at',a.created_at,'details',a.details) ORDER BY a.created_at DESC)
      FROM badge_admin_audit a WHERE a.resource_id=e.id AND a.action IN ('event_corrected','entry_closed_manually')),'[]'::jsonb))
  FROM badge_event_report e LEFT JOIN LATERAL (
    SELECT id,action,occurred_at FROM badge_effective_events x WHERE x.employee_id=e.employee_id AND x.outcome='accepted'
      AND (x.original_occurred_at,x.id)>(e.original_occurred_at,e.id)
    ORDER BY x.original_occurred_at,x.id LIMIT 1
  ) n ON true WHERE e.id=p_event AND e.outcome='accepted';
$$;
CREATE OR REPLACE FUNCTION public.badge_employee_statistics(
  p_from date, p_to date, p_site uuid, p_employee uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path = public
AS $$
DECLARE settings badge_sites; result jsonb;
BEGIN
  IF p_from IS NULL OR p_to IS NULL OR p_to<=p_from OR p_to-p_from>93 OR p_site IS NULL THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  SELECT * INTO settings FROM badge_sites WHERE id=p_site;
  IF NOT FOUND THEN RAISE EXCEPTION 'SITE_NOT_FOUND'; END IF;

  WITH entries AS (
    SELECT e.*,CASE WHEN prev.expected_end<prev.expected_start AND
      (e.occurred_at AT TIME ZONE 'Europe/Rome')::time<prev.expected_end
      THEN (e.occurred_at AT TIME ZONE 'Europe/Rome')::date-1
      ELSE (e.occurred_at AT TIME ZONE 'Europe/Rome')::date END AS work_date
    FROM badge_effective_events e LEFT JOIN badge_employee_schedules prev ON prev.employee_id=e.employee_id
      AND prev.weekday=extract(isodow FROM (e.occurred_at AT TIME ZONE 'Europe/Rome')::date-1)
    WHERE e.action='in' AND e.outcome='accepted'
      AND e.occurred_at>=(p_from::timestamp AT TIME ZONE 'Europe/Rome')
      AND e.occurred_at<((p_to+1)::timestamp AT TIME ZONE 'Europe/Rome')
      AND (p_employee IS NULL OR e.employee_id=p_employee)
  ), raw_pairs AS (
    SELECT e.id,e.site_id,e.employee_id,e.work_date,e.occurred_at AS entry_at,
      CASE WHEN x.action='out' THEN x.occurred_at END AS exit_at,
      CASE WHEN x.action='out' THEN x.site_id END AS exit_site_id,
      CASE WHEN x.action='out' THEN x.site_name END AS exit_site_name,
      CASE WHEN x.action='out' THEN x.duration_seconds END AS gross_seconds,
      CASE WHEN EXISTS (SELECT 1 FROM badge_admin_audit a WHERE a.resource_id=e.id AND a.action='entry_closed_manually') THEN 'closed_manually'
        WHEN x.action IS DISTINCT FROM 'out' THEN CASE WHEN EXISTS (SELECT 1 FROM badge_employees emp WHERE emp.current_entry_id=e.id) THEN 'open' ELSE 'missing_exit' END
        WHEN x.site_id<>e.site_id THEN 'different_site'
        WHEN x.duration_seconds IS NULL THEN 'missing_exit'
        WHEN x.duration_seconds>57600 THEN 'long_shift' ELSE 'complete' END AS status
    FROM entries e LEFT JOIN LATERAL (
      SELECT n.action,n.occurred_at,n.site_id,n.site_name,n.duration_seconds FROM badge_effective_events n
      WHERE n.employee_id=e.employee_id AND n.outcome='accepted' AND (n.original_occurred_at,n.id)>(e.original_occurred_at,e.id)
      ORDER BY n.original_occurred_at,n.id LIMIT 1
    ) x ON true WHERE e.work_date>=p_from AND e.work_date<p_to
  ), lunch AS (
    SELECT p.*,s.expected_start,s.expected_end,
      CASE WHEN status='complete' AND s.break_start IS NOT NULL THEN least(gross_seconds,greatest(0,
        floor(extract(epoch FROM least(exit_at,
          ((work_date+CASE WHEN s.break_start<s.expected_start THEN 1 ELSE 0 END+CASE WHEN s.break_end<s.break_start THEN 1 ELSE 0 END)+s.break_end) AT TIME ZONE 'Europe/Rome')-
          greatest(entry_at,((work_date+CASE WHEN s.break_start<s.expected_start THEN 1 ELSE 0 END)+s.break_start) AT TIME ZONE 'Europe/Rome')))))::integer
        ELSE 0 END AS break_seconds
    FROM raw_pairs p LEFT JOIN badge_employee_schedules s ON s.employee_id=p.employee_id AND s.weekday=extract(isodow FROM p.work_date)
  ), paired AS (
    SELECT *,gross_seconds-break_seconds AS seconds FROM lunch
  ), boundaries AS (
    SELECT employee_id,work_date,min(entry_at) AS first_entry,max(exit_at) AS last_exit,bool_and(status='complete') AS complete
    FROM paired GROUP BY employee_id,work_date
  ), daily_base AS (
    SELECT employee_id,work_date AS date,min(entry_at) AS first_entry,
      CASE WHEN bool_and(status='complete') THEN max(exit_at) END AS last_exit,
      coalesce(sum(seconds) FILTER (WHERE status='complete'),0) AS worked_seconds,sum(break_seconds) AS break_seconds,
      coalesce(sum(seconds) FILTER (WHERE status IN ('different_site','long_shift')),0) AS review_seconds,
      count(*) FILTER (WHERE status IN ('open','missing_exit','closed_manually')) AS incomplete_intervals,
      count(*) FILTER (WHERE status IN ('different_site','long_shift')) AS review_intervals,
      count(*) FILTER (WHERE status='open') AS open_intervals,
      bool_and(status='complete') AS complete,
      jsonb_agg(jsonb_build_object('id',id,'entry_at',entry_at,'exit_at',exit_at,
        'exit_site_name',exit_site_name,'seconds',seconds,'break_seconds',break_seconds,'status',status) ORDER BY entry_at,id) AS intervals
    FROM paired WHERE site_id=p_site GROUP BY employee_id,work_date
  ), daily AS (
    SELECT d.*,
      extract(epoch FROM (d.first_entry AT TIME ZONE 'Europe/Rome')::time)::double precision AS entry_seconds,
      extract(epoch FROM (d.last_exit AT TIME ZONE 'Europe/Rome')::time)::double precision AS exit_seconds,
      CASE WHEN s.expected_start IS NOT NULL AND d.first_entry=b.first_entry THEN greatest(0,
        extract(epoch FROM date_trunc('minute',b.first_entry)-((date+s.expected_start) AT TIME ZONE 'Europe/Rome'))/60)::integer END AS late_minutes,
      CASE WHEN b.complete AND s.expected_end IS NOT NULL AND d.last_exit=b.last_exit AND
        (((date+CASE WHEN s.expected_end<s.expected_start THEN 1 ELSE 0 END)+s.expected_end) AT TIME ZONE 'Europe/Rome')<=now()
        THEN greatest(0,extract(epoch FROM
          (((date+CASE WHEN s.expected_end<s.expected_start THEN 1 ELSE 0 END)+s.expected_end) AT TIME ZONE 'Europe/Rome')-
          date_trunc('minute',b.last_exit))/60)::integer END AS early_minutes
    FROM daily_base d JOIN boundaries b ON b.employee_id=d.employee_id AND b.work_date=d.date
    LEFT JOIN badge_employee_schedules s ON s.employee_id=d.employee_id AND s.weekday=extract(isodow FROM d.date)
  ), per_employee AS (
    SELECT employee_id,count(*) AS presence_days,count(*) FILTER (WHERE complete) AS complete_days,
      sum(worked_seconds) AS worked_seconds,sum(break_seconds) AS break_seconds,sum(review_seconds) AS review_seconds,
      sum(incomplete_intervals) AS incomplete_intervals,sum(review_intervals) AS review_intervals,
      sum(open_intervals) AS open_intervals,
      avg(sin(entry_seconds/86400*2*pi())) AS entry_sin,avg(cos(entry_seconds/86400*2*pi())) AS entry_cos,
      avg(sin(exit_seconds/86400*2*pi())) AS exit_sin,avg(cos(exit_seconds/86400*2*pi())) AS exit_cos,
      CASE WHEN count(late_minutes)>0 THEN count(*) FILTER (WHERE late_minutes>0) END AS late_days,
      CASE WHEN count(late_minutes)>0 OR count(early_minutes)>0 THEN count(*) FILTER (WHERE early_minutes>0) END AS early_days,
      coalesce(sum(late_minutes),0) AS late_minutes,coalesce(sum(early_minutes),0) AS early_minutes,
      count(early_minutes) AS evaluated_exit_days
    FROM daily GROUP BY employee_id
  ), employee_results AS (
    SELECT p.employee_id,emp.first_name||' '||emp.last_name AS employee_name,emp.job_role,emp.status,
      presence_days,complete_days,worked_seconds,break_seconds,review_seconds,incomplete_intervals,review_intervals,open_intervals,
      -- Circular means keep 23:50 and 00:10 near midnight instead of noon.
      CASE WHEN entry_sin*entry_sin+entry_cos*entry_cos>0.00000001 THEN
        (atan2(entry_sin,entry_cos)/(2*pi())+1-floor(atan2(entry_sin,entry_cos)/(2*pi())+1))*86400 END AS average_entry_seconds,
      CASE WHEN exit_sin*exit_sin+exit_cos*exit_cos>0.00000001 THEN
        (atan2(exit_sin,exit_cos)/(2*pi())+1-floor(atan2(exit_sin,exit_cos)/(2*pi())+1))*86400 END AS average_exit_seconds,
      late_days,early_days,late_minutes,early_minutes,evaluated_exit_days
    FROM per_employee p JOIN badge_employees emp ON emp.id=p.employee_id
  ), months AS (
    SELECT to_char(m,'YYYY-MM') AS month,
      coalesce(sum(d.worked_seconds),0) AS worked_seconds,count(d.date) AS presence_days
    FROM generate_series(p_from::timestamp,(p_to-1)::timestamp,interval '1 month') m
    LEFT JOIN daily d ON date_trunc('month',d.date)=m GROUP BY m ORDER BY m
  )
  SELECT jsonb_build_object(
    'site',jsonb_build_object('id',settings.id,'name',settings.name,'archived_at',settings.archived_at),
    'schedule',jsonb_build_object('expected_start',NULL,'expected_end',NULL),
    'employee_schedule',CASE WHEN p_employee IS NOT NULL THEN badge_employee_schedule(p_employee) END,
    'summary',(SELECT jsonb_build_object('employees',count(*),
      'presence_days',coalesce(sum(presence_days),0),'complete_days',coalesce(sum(complete_days),0),
      'worked_seconds',coalesce(sum(worked_seconds),0),'break_seconds',coalesce(sum(break_seconds),0),'review_seconds',coalesce(sum(review_seconds),0),
      'incomplete_intervals',coalesce(sum(incomplete_intervals),0),'review_intervals',coalesce(sum(review_intervals),0),
      'open_intervals',coalesce(sum(open_intervals),0)) FROM per_employee),
    'employees',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.employee_name,e.employee_id) FROM employee_results e),'[]'::jsonb),
    'months',(SELECT jsonb_agg(to_jsonb(m) ORDER BY m.month) FROM months m),
    'days',CASE WHEN p_employee IS NOT NULL THEN coalesce((SELECT jsonb_agg(
      jsonb_build_object('date',date,'first_entry',first_entry,'last_exit',last_exit,'worked_seconds',worked_seconds,
        'break_seconds',break_seconds,'review_seconds',review_seconds,'complete',complete,'late_minutes',late_minutes,'early_minutes',early_minutes,'intervals',intervals)
      ORDER BY date DESC) FROM daily),'[]'::jsonb) END
  ) INTO result;
  RETURN result;
END;
$$;


-- Keep older backend deployments on the same effective records during rollout.
CREATE OR REPLACE FUNCTION public.badge_statistics(p_from date,p_to date,p_site uuid,p_employee uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE sql STABLE SET search_path=public AS $$
  SELECT badge_employee_statistics(p_from,p_to,p_site,p_employee);
$$;

REVOKE ALL ON public.badge_effective_events FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.badge_effective_events TO service_role;
REVOKE ALL ON FUNCTION public.badge_employee_schedule(uuid),public.badge_set_employee_schedule(uuid,uuid,jsonb),
  public.badge_adjust_event(uuid,uuid,integer,timestamptz,boolean,uuid,text),public.badge_event_detail(uuid),
  public.badge_employee_statistics(date,date,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.badge_employee_schedule(uuid),public.badge_set_employee_schedule(uuid,uuid,jsonb),
  public.badge_adjust_event(uuid,uuid,integer,timestamptz,boolean,uuid,text),public.badge_event_detail(uuid),
  public.badge_employee_statistics(date,date,uuid,uuid) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
