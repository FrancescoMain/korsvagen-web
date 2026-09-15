export interface BadgeSite {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  max_accuracy_m: number;
  outside_policy: 'block' | 'flag';
  qr_token: string;
  archived_at: string | null;
}
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  job_role: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended';
  must_change_password: boolean;
  current_site_id: string | null;
  current_entry_at: string | null;
  device_count?: number;
  first_device_hash?: string | null;
  shared_with?: string[];
}
export interface BadgeEvent {
  id: string;
  employee_id: string;
  site_id: string;
  employee_name: string;
  birth_date: string;
  job_role: string;
  site_name: string;
  action: 'in' | 'out';
  occurred_at: string;
  outcome: 'accepted' | 'rejected';
  reason: string | null;
  latitude: number;
  longitude: number;
  accuracy_m: number;
  distance_m: number;
  device_hash: string;
  user_agent: string;
  anomaly_flags: string[];
  duration_seconds: number | null;
  entry_site_name: string | null;
  adjustment_note?: string | null;
}
export interface EmployeeState {
  employee: Employee;
  current_site_name: string | null;
  last_event: Pick<BadgeEvent, 'id' | 'action' | 'occurred_at' | 'site_name' | 'outcome' | 'reason'> | null;
}
export interface BadgeReport {
  data: BadgeEvent[];
  total: number;
  page: number;
  pageSize: number;
  summary: { events: number; entries: number; exits: number; rejected: number; anomalies: number; employees: number; completed_seconds: number };
  present: Pick<Employee, 'id' | 'first_name' | 'last_name' | 'job_role' | 'current_entry_at' | 'current_site_id'>[];
}
export const anomalyLabels: Record<string, string> = {
  shared_device: 'Browser condiviso tra dipendenti',
  new_device: 'Browser diverso dal primo utilizzato',
  outside_zone: 'Fuori dalla zona della sede',
  boundary_accuracy: 'Posizione vicina al limite della zona',
  different_exit_site: 'Uscita da una sede diversa',
  long_shift: 'Ingresso aperto da oltre 16 ore',
  rapid_site_change: 'Spostamento troppo rapido tra sedi',
  entry_closed_manually: 'Ingresso chiuso dal responsabile',
};
export const rejectionLabels: Record<string, string> = {
  low_accuracy: 'La posizione è poco precisa. Spostati vicino a un’apertura o all’aperto e riprova.',
  outside_zone: 'Risulti fuori dalla zona della sede. Avvicinati al cantiere o contatta il responsabile.',
  already_in: 'Hai già un ingresso aperto. Registra prima l’uscita.',
  not_in: 'Non risulta un ingresso aperto. Aggiorna lo stato.',
};
export const dateTime = (value: string) => new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'medium',
}).format(new Date(value));
export const todayInRome = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
