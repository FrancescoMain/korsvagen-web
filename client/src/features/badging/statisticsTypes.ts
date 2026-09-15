export interface ScheduleDay {
  weekday: number; expected_start: string; expected_end: string; break_start: string | null; break_end: string | null;
}
export interface SiteSchedule {
  expected_start: string | null;
  expected_end: string | null;
}
export interface EmployeeStatistics {
  employee_id: string;
  employee_name: string;
  job_role: string;
  status: string;
  presence_days: number;
  complete_days: number;
  worked_seconds: number;
  break_seconds?: number;
  review_seconds: number;
  incomplete_intervals: number;
  review_intervals: number;
  open_intervals: number;
  average_entry_seconds: number | null;
  average_exit_seconds: number | null;
  late_days: number | null;
  early_days: number | null;
  late_minutes: number;
  early_minutes: number;
  evaluated_exit_days: number;
}
export interface StatisticsDay {
  date: string;
  first_entry: string;
  last_exit: string | null;
  worked_seconds: number;
  break_seconds?: number;
  review_seconds: number;
  complete: boolean;
  late_minutes: number | null;
  early_minutes: number | null;
  intervals: {
    id: string;
    entry_at: string;
    exit_at: string | null;
    exit_site_name: string | null;
    seconds: number | null;
    status: 'complete' | 'open' | 'missing_exit' | 'closed_manually' | 'different_site' | 'long_shift';
  }[];
}
export interface BadgeStatistics {
  site: { id: string; name: string; archived_at: string | null };
  schedule: SiteSchedule;
  employee_schedule?: ScheduleDay[];
  period: { year: number; quarter: number; from: string; to: string };
  summary: {
    employees: number;
    presence_days: number;
    complete_days: number;
    worked_seconds: number;
  break_seconds?: number;
    review_seconds: number;
    incomplete_intervals: number;
    review_intervals: number;
    open_intervals: number;
  };
  employees: EmployeeStatistics[];
  months: { month: string; worked_seconds: number; presence_days: number }[];
  days: StatisticsDay[] | null;
}
