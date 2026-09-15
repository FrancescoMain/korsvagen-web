-- Additive migration: statistics and an optional comparison schedule per site.
BEGIN;

ALTER TABLE public.badge_sites
  ADD COLUMN IF NOT EXISTS expected_start time,
  ADD COLUMN IF NOT EXISTS expected_end time;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='badge_site_schedule_pair' AND conrelid='public.badge_sites'::regclass) THEN
    ALTER TABLE public.badge_sites ADD CONSTRAINT badge_site_schedule_pair CHECK (
      (expected_start IS NULL AND expected_end IS NULL) OR
      (expected_start IS NOT NULL AND expected_end IS NOT NULL AND expected_start <> expected_end)
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.badge_set_site_schedule(
  p_admin uuid, p_site uuid, p_start time, p_end time
) RETURNS public.badge_sites LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE before_site badge_sites; updated_site badge_sites;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id=p_admin AND is_active AND role IN ('admin','super_admin')) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  IF (p_start IS NULL) <> (p_end IS NULL) OR p_start=p_end THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  SELECT * INTO before_site FROM badge_sites WHERE id=p_site FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'SITE_NOT_FOUND'; END IF;
  UPDATE badge_sites SET expected_start=p_start, expected_end=p_end, updated_at=clock_timestamp()
    WHERE id=p_site RETURNING * INTO updated_site;
  INSERT INTO badge_admin_audit(admin_id,action,resource_id,details) VALUES
    (p_admin,'site_schedule',p_site,jsonb_build_object(
      'previous_start',before_site.expected_start,'previous_end',before_site.expected_end,
      'expected_start',p_start,'expected_end',p_end));
  RETURN updated_site;
END;
$$;

CREATE OR REPLACE FUNCTION public.badge_statistics(
  p_from date, p_to date, p_site uuid, p_employee uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path = public
AS $$
DECLARE settings badge_sites; result jsonb;
BEGIN
  IF p_from IS NULL OR p_to IS NULL OR p_to<=p_from OR p_to-p_from>93 OR p_site IS NULL THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  SELECT * INTO settings FROM badge_sites WHERE id=p_site;
  IF NOT FOUND THEN RAISE EXCEPTION 'SITE_NOT_FOUND'; END IF;

  WITH entries AS (
    SELECT e.*,
      CASE WHEN settings.expected_end<settings.expected_start
        AND (e.occurred_at AT TIME ZONE 'Europe/Rome')::time<settings.expected_end
        THEN (e.occurred_at AT TIME ZONE 'Europe/Rome')::date-1
        ELSE (e.occurred_at AT TIME ZONE 'Europe/Rome')::date END AS work_date
    FROM badge_events e
    WHERE e.site_id=p_site AND e.action='in' AND e.outcome='accepted'
      AND e.occurred_at>=(p_from::timestamp AT TIME ZONE 'Europe/Rome')
      AND e.occurred_at<((p_to+1)::timestamp AT TIME ZONE 'Europe/Rome')
      AND (p_employee IS NULL OR e.employee_id=p_employee)
  ), paired AS (
    -- The next accepted event closes this entry, including across QR/quarter boundaries.
    -- A manually closed entry is followed by another entry, so it cannot steal that exit.
    SELECT e.id, e.employee_id, e.work_date, e.occurred_at AS entry_at,
      CASE WHEN x.action='out' THEN x.occurred_at END AS exit_at,
      CASE WHEN x.action='out' THEN x.site_id END AS exit_site_id,
      CASE WHEN x.action='out' THEN x.site_name END AS exit_site_name,
      CASE WHEN x.action='out' THEN x.duration_seconds END AS seconds,
      CASE
        WHEN EXISTS (SELECT 1 FROM badge_admin_audit a WHERE a.resource_id=e.id AND a.action='entry_closed_manually') THEN 'closed_manually'
        WHEN x.action IS DISTINCT FROM 'out' THEN
          CASE WHEN EXISTS (SELECT 1 FROM badge_employees emp WHERE emp.id=e.employee_id AND emp.current_entry_id=e.id)
            THEN 'open' ELSE 'missing_exit' END
        WHEN x.site_id<>e.site_id THEN 'different_site'
        WHEN x.duration_seconds IS NULL THEN 'missing_exit'
        WHEN x.duration_seconds>57600 THEN 'long_shift'
        ELSE 'complete'
      END AS status
    FROM entries e
    LEFT JOIN LATERAL (
      SELECT n.action,n.occurred_at,n.site_id,n.site_name,n.duration_seconds
      FROM badge_events n WHERE n.employee_id=e.employee_id AND n.outcome='accepted'
        AND (n.occurred_at,n.id)>(e.occurred_at,e.id)
      ORDER BY n.occurred_at,n.id LIMIT 1
    ) x ON true
    WHERE e.work_date>=p_from AND e.work_date<p_to
  ), daily_base AS (
    SELECT employee_id,work_date AS date,min(entry_at) AS first_entry,
      CASE WHEN bool_and(status='complete') THEN max(exit_at) END AS last_exit,
      coalesce(sum(seconds) FILTER (WHERE status='complete'),0) AS worked_seconds,
      coalesce(sum(seconds) FILTER (WHERE status IN ('different_site','long_shift')),0) AS review_seconds,
      count(*) FILTER (WHERE status IN ('open','missing_exit','closed_manually')) AS incomplete_intervals,
      count(*) FILTER (WHERE status IN ('different_site','long_shift')) AS review_intervals,
      count(*) FILTER (WHERE status='open') AS open_intervals,
      bool_and(status='complete') AS complete,
      jsonb_agg(jsonb_build_object('id',id,'entry_at',entry_at,'exit_at',exit_at,
        'exit_site_name',exit_site_name,'seconds',seconds,'status',status) ORDER BY entry_at,id) AS intervals
    FROM paired GROUP BY employee_id,work_date
  ), daily AS (
    SELECT d.*,
      extract(epoch FROM (first_entry AT TIME ZONE 'Europe/Rome')::time)::double precision AS entry_seconds,
      extract(epoch FROM (last_exit AT TIME ZONE 'Europe/Rome')::time)::double precision AS exit_seconds,
      CASE WHEN settings.expected_start IS NOT NULL THEN greatest(0,
        extract(epoch FROM date_trunc('minute',first_entry)-
          ((date+settings.expected_start) AT TIME ZONE 'Europe/Rome'))/60)::integer END AS late_minutes,
      CASE WHEN complete AND settings.expected_end IS NOT NULL AND
        (((date+CASE WHEN settings.expected_end<settings.expected_start THEN 1 ELSE 0 END)+settings.expected_end) AT TIME ZONE 'Europe/Rome')<=now()
        THEN greatest(0,extract(epoch FROM
          (((date+CASE WHEN settings.expected_end<settings.expected_start THEN 1 ELSE 0 END)+settings.expected_end) AT TIME ZONE 'Europe/Rome')-
          date_trunc('minute',last_exit))/60)::integer END AS early_minutes
    FROM daily_base d
  ), per_employee AS (
    SELECT employee_id,count(*) AS presence_days,count(*) FILTER (WHERE complete) AS complete_days,
      sum(worked_seconds) AS worked_seconds,sum(review_seconds) AS review_seconds,
      sum(incomplete_intervals) AS incomplete_intervals,sum(review_intervals) AS review_intervals,
      sum(open_intervals) AS open_intervals,
      avg(sin(entry_seconds/86400*2*pi())) AS entry_sin,avg(cos(entry_seconds/86400*2*pi())) AS entry_cos,
      avg(sin(exit_seconds/86400*2*pi())) AS exit_sin,avg(cos(exit_seconds/86400*2*pi())) AS exit_cos,
      CASE WHEN settings.expected_start IS NOT NULL THEN count(*) FILTER (WHERE late_minutes>0) END AS late_days,
      CASE WHEN settings.expected_end IS NOT NULL THEN count(*) FILTER (WHERE early_minutes>0) END AS early_days,
      coalesce(sum(late_minutes),0) AS late_minutes,coalesce(sum(early_minutes),0) AS early_minutes,
      count(early_minutes) AS evaluated_exit_days
    FROM daily GROUP BY employee_id
  ), employee_results AS (
    SELECT p.employee_id,emp.first_name||' '||emp.last_name AS employee_name,emp.job_role,emp.status,
      presence_days,complete_days,worked_seconds,review_seconds,incomplete_intervals,review_intervals,open_intervals,
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
    'schedule',jsonb_build_object('expected_start',to_char(settings.expected_start,'HH24:MI'),'expected_end',to_char(settings.expected_end,'HH24:MI')),
    'summary',(SELECT jsonb_build_object('employees',count(*),
      'presence_days',coalesce(sum(presence_days),0),'complete_days',coalesce(sum(complete_days),0),
      'worked_seconds',coalesce(sum(worked_seconds),0),'review_seconds',coalesce(sum(review_seconds),0),
      'incomplete_intervals',coalesce(sum(incomplete_intervals),0),'review_intervals',coalesce(sum(review_intervals),0),
      'open_intervals',coalesce(sum(open_intervals),0)) FROM per_employee),
    'employees',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.employee_name,e.employee_id) FROM employee_results e),'[]'::jsonb),
    'months',(SELECT jsonb_agg(to_jsonb(m) ORDER BY m.month) FROM months m),
    'days',CASE WHEN p_employee IS NOT NULL THEN coalesce((SELECT jsonb_agg(
      jsonb_build_object('date',date,'first_entry',first_entry,'last_exit',last_exit,'worked_seconds',worked_seconds,
        'review_seconds',review_seconds,'complete',complete,'late_minutes',late_minutes,'early_minutes',early_minutes,'intervals',intervals)
      ORDER BY date DESC) FROM daily),'[]'::jsonb) END
  ) INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.badge_set_site_schedule(uuid,uuid,time,time),
  public.badge_statistics(date,date,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.badge_set_site_schedule(uuid,uuid,time,time),
  public.badge_statistics(date,date,uuid,uuid) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
