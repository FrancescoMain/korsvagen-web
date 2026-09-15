import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatisticsPanel from './StatisticsPanel';
import { adminBadge } from './api';
import { BadgeSite, Employee } from './types';
import { BadgeStatistics, EmployeeStatistics } from './statisticsTypes';

jest.mock('./api', () => ({
  adminBadge: { get: jest.fn(), patch: jest.fn() },
  messageOf: (error: Error) => error.message,
}));
const get = adminBadge.get as jest.Mock;
const patch = adminBadge.patch as jest.Mock;
const sites: BadgeSite[] = ['Cantiere', 'Ufficio'].map((name, i) => ({
  id: 'site-' + i, name, address: 'Indirizzo locale', latitude: 40, longitude: 14,
  radius_m: 200, max_accuracy_m: 100, outside_policy: 'block', qr_token: 'a'.repeat(64), archived_at: null,
}));
const employees: Employee[] = ['Anna', 'Bruno', 'Carla'].map((first_name, i) => ({
  id: 'employee-' + i, first_name, last_name: 'Esempio', birth_date: '1990-01-01', job_role: 'Operaio',
  phone: '+39333000000' + i, status: 'active', must_change_password: false, current_site_id: null, current_entry_at: null,
}));
const statsPerson = (index: number, overrides: Partial<EmployeeStatistics> = {}): EmployeeStatistics => ({
  employee_id: employees[index].id, employee_name: employees[index].first_name + ' Esempio', job_role: 'Operaio', status: 'active',
  presence_days: 2, complete_days: 2, worked_seconds: 15 * 3600, review_seconds: 0, incomplete_intervals: 0,
  review_intervals: 0, open_intervals: 0, average_entry_seconds: 8.5 * 3600, average_exit_seconds: 16.5 * 3600,
  late_days: null, early_days: null, late_minutes: 0, early_minutes: 0, evaluated_exit_days: 0, ...overrides,
});
function result(site = 'site-0'): BadgeStatistics {
  return {
    site: { id: site, name: sites.find(s => s.id === site)!.name, archived_at: null },
    schedule: { expected_start: null, expected_end: null },
    period: { year: 2026, quarter: 1, from: '2026-01-01', to: '2026-04-01' },
    summary: { employees: 3, presence_days: 4, complete_days: 3, worked_seconds: 19 * 3600,
      review_seconds: 0, incomplete_intervals: 1, review_intervals: 0, open_intervals: 1 },
    employees: [statsPerson(0), statsPerson(1, { presence_days: 1, complete_days: 1, worked_seconds: 4 * 3600 }),
      statsPerson(2, { presence_days: 1, complete_days: 0, worked_seconds: 0, incomplete_intervals: 1, open_intervals: 1, average_exit_seconds: null })],
    months: [{ month: '2026-01', worked_seconds: 19 * 3600, presence_days: 4 },
      { month: '2026-02', worked_seconds: 0, presence_days: 0 }, { month: '2026-03', worked_seconds: 0, presence_days: 0 }],
    days: null,
  };
}
beforeEach(() => { jest.clearAllMocks(); get.mockResolvedValue(result()); patch.mockResolvedValue({}); });

test('shows daily averages and excludes incomplete zero-hour totals from the lowest-hours comparison', async () => {
  render(<StatisticsPanel sites={sites} employees={employees} />);
  const table = await screen.findByRole('table', { name: 'Statistiche per dipendente' });
  const anna = within(table).getByRole('row', { name: /Anna Esempio/ });
  expect(within(anna).getByText('08:30')).toBeInTheDocument();
  expect(within(anna).getByText('16:30')).toBeInTheDocument();
  const lowest = screen.getByRole('region', { name: 'Meno ore registrate' });
  expect(within(lowest).getByText('Bruno Esempio')).toBeInTheDocument();
  expect(within(lowest).queryByText('Carla Esempio')).not.toBeInTheDocument();
  expect(screen.getByText('Imposta gli orari previsti per attivare queste segnalazioni.')).toBeInTheDocument();
  expect(screen.getByText('Totale parziale: escluso dal confronto')).toBeInTheDocument();
});

test('site settings can be enabled, saved and disabled, and refresh the comparison after each save', async () => {
  let schedule: BadgeStatistics['schedule'] = { expected_start: null, expected_end: null };
  get.mockImplementation(() => Promise.resolve({ ...result(), schedule }));
  patch.mockImplementation((_path, body) => { schedule = body; return Promise.resolve({}); });
  render(<StatisticsPanel sites={sites} employees={employees} />);
  fireEvent.click(await screen.findByText('Orari previsti della sede'));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Confronta con gli orari previsti' }));
  fireEvent.change(screen.getByLabelText('Ingresso previsto'), { target: { value: '08:00' } });
  fireEvent.change(screen.getByLabelText('Uscita prevista'), { target: { value: '17:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salva orari' }));
  await waitFor(() => expect(patch).toHaveBeenCalledWith('/sites/site-0/schedule', { expected_start: '08:00', expected_end: '17:00' }));
  expect(await screen.findByText('Nessuno scostamento dagli orari previsti.')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Orari previsti della sede'));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Confronta con gli orari previsti' }));
  fireEvent.click(screen.getByRole('button', { name: 'Salva orari' }));
  await waitFor(() => expect(patch).toHaveBeenLastCalledWith('/sites/site-0/schedule', { expected_start: null, expected_end: null }));
  expect(await screen.findByText('Imposta gli orari previsti per attivare queste segnalazioni.')).toBeInTheDocument();
});

test('opens quarterly daily history including individual punches and preserves employee selection across quarters', async () => {
  get.mockImplementation((_path, params) => Promise.resolve({
    ...result(), days: params.employee ? [{ date: '2026-01-05', first_entry: '2026-01-05T07:00:00Z', last_exit: '2026-01-05T16:00:00Z',
      worked_seconds: 8 * 3600, review_seconds: 0, complete: true, late_minutes: null, early_minutes: null,
      intervals: [{ id: 'interval', entry_at: '2026-01-05T07:00:00Z', exit_at: '2026-01-05T16:00:00Z', exit_site_name: 'Cantiere', seconds: 8 * 3600, status: 'complete' }] }] : null,
  }));
  render(<StatisticsPanel sites={sites} employees={employees} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Storico di Anna Esempio' }));
  const history = await screen.findByRole('table', { name: 'Storico giornaliero di Anna Esempio' });
  expect(within(history).getByText('05/01/2026')).toBeInTheDocument();
  fireEvent.click(within(history).getByText('1 intervallo · mostra timbrature'));
  expect(within(history).getByText(/Ingresso: 05\/01\/26, 08:00:00/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Trimestre'), { target: { value: '2' } });
  await waitFor(() => expect(get).toHaveBeenCalledWith('/statistics', expect.objectContaining({ quarter: 2, employee: 'employee-0' })));
  expect(screen.getByLabelText('Storico dipendente')).toHaveValue('employee-0');
  fireEvent.change(screen.getByLabelText('Sede / QR'), { target: { value: 'site-1' } });
  expect(screen.getByLabelText('Storico dipendente')).toHaveValue('');
});

test('a slow response from the previous site cannot appear under the new QR and failures can be retried', async () => {
  let resolveOld!: (value: BadgeStatistics) => void;
  get.mockImplementation((_path, params) => params.site === 'site-0' ? new Promise(resolve => { resolveOld = resolve; }) : Promise.reject(new Error('Servizio temporaneamente non disponibile')));
  render(<StatisticsPanel sites={sites} employees={employees} />);
  fireEvent.change(screen.getByLabelText('Sede / QR'), { target: { value: 'site-1' } });
  expect(await screen.findByRole('alert')).toHaveTextContent('Servizio temporaneamente non disponibile');
  await act(async () => resolveOld(result()));
  expect(screen.queryByRole('table', { name: 'Statistiche per dipendente' })).not.toBeInTheDocument();
  get.mockResolvedValueOnce({ ...result('site-1'), employees: [], days: null });
  fireEvent.click(screen.getByRole('button', { name: 'Riprova' }));
  expect(await screen.findByText('Nessun ingresso in questa sede nel trimestre selezionato.')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('a failed save retains the draft and does not claim that the schedule changed', async () => {
  patch.mockRejectedValueOnce(new Error('Salvataggio non riuscito'));
  render(<StatisticsPanel sites={sites} employees={employees} />);
  fireEvent.click(await screen.findByText('Orari previsti della sede'));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Confronta con gli orari previsti' }));
  fireEvent.change(screen.getByLabelText('Ingresso previsto'), { target: { value: '08:00' } });
  fireEvent.change(screen.getByLabelText('Uscita prevista'), { target: { value: '17:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salva orari' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Salvataggio non riuscito');
  expect(screen.getByLabelText('Ingresso previsto')).toHaveValue('08:00');
  expect(screen.queryByText('Orari aggiornati.')).not.toBeInTheDocument();
  expect(get).toHaveBeenCalledTimes(1);
});
