import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BadgePage from './BadgePage';
import { BadgeApiError, employeeRequest, locate, SESSION_KEY } from './api';

jest.mock('./api', () => {
  class BadgeApiError extends Error {
    status: number;
    code: string;
    constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
  }
  return { BadgeApiError, employeeRequest: jest.fn(), locate: jest.fn(), deviceToken: jest.fn().mockResolvedValue('browser-token'),
    newRequestId: () => '40000000-0000-4000-8000-000000000001',
    messageOf: (error: Error) => error.message, SESSION_KEY: 'korsvagen_badge_session' };
});
const api = employeeRequest as jest.Mock;
const location = locate as jest.Mock;
const qr = 'a'.repeat(64);
const requestId = '40000000-0000-4000-8000-000000000001';
const employee = { id: 'employee', first_name: 'Anna', last_name: 'Esempio', must_change_password: false, current_site_id: null, current_entry_at: null };
const receipt = { id: requestId, outcome: 'accepted', action: 'in', site_name: 'Cantiere A', occurred_at: '2026-09-15T06:00:00Z' };
function renderPage() { return render(<MemoryRouter initialEntries={['/badge/' + qr]}><Routes><Route path="/badge/:token" element={<BadgePage />} /></Routes></MemoryRouter>); }

beforeEach(() => {
  jest.clearAllMocks(); localStorage.clear();
  localStorage.setItem(SESSION_KEY, 'employee-session');
  location.mockResolvedValue({ coords: { latitude: 40, longitude: 14, accuracy: 10 } });
  api.mockImplementation((path: string) => {
    if (path.startsWith('/sites/')) return Promise.resolve({ id: 'site', name: 'Cantiere A', address: 'Via Test' });
    if (path === '/me') return Promise.resolve({ employee, current_site_name: null, last_event: null });
    if (path === '/challenge') return Promise.resolve({ challenge: 'challenge' });
    if (path === '/punch') return Promise.resolve({ receipt });
    return Promise.reject(new Error('Unexpected API request: ' + path));
  });
});

test('remembered login offers large entry/exit controls without acquiring location in the background', async () => {
  renderPage();
  expect(await screen.findByRole('heading', { name: 'Ciao, Anna' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /↘ Ingresso/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /↗ Uscita/ })).toBeDisabled();
  expect(location).not.toHaveBeenCalled();
});

test('denying location never sends a punch and leaves a clear recoverable error', async () => {
  location.mockRejectedValue(new Error('Consenti l’accesso alla posizione.'));
  renderPage();
  fireEvent.click(await screen.findByRole('button', { name: /↘ Ingresso/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Consenti l’accesso alla posizione');
  expect(api.mock.calls.some(([path]) => path === '/punch')).toBe(false);
  expect(screen.getByRole('button', { name: /↘ Ingresso/ })).toBeEnabled();
});

test('a server-rejected geofence stamp cannot appear as a successful entry', async () => {
  const implementation = api.getMockImplementation()!;
  api.mockImplementation((path: string) => path === '/punch' ? Promise.resolve({ receipt: { ...receipt, outcome: 'rejected', reason: 'outside_zone' } }) : implementation(path));
  renderPage();
  fireEvent.click(await screen.findByRole('button', { name: /↘ Ingresso/ }));
  expect(await screen.findByText('Timbratura non registrata')).toBeInTheDocument();
  expect(screen.getByText(/Risulti fuori dalla zona/)).toBeInTheDocument();
  expect(screen.queryByText('Ingresso registrato')).not.toBeInTheDocument();
});

test('a lost HTTP response is recovered by receipt ID without submitting a second stamp', async () => {
  const implementation = api.getMockImplementation()!;
  api.mockImplementation((path: string) => {
    if (path === '/punch') return Promise.reject(new Error('Connessione interrotta'));
    if (path.startsWith('/receipts/')) return Promise.resolve({ receipt });
    return implementation(path);
  });
  renderPage();
  fireEvent.click(await screen.findByRole('button', { name: /↘ Ingresso/ }));
  await screen.findByText('Connessione interrotta');
  expect(screen.getByRole('button', { name: /↘ Ingresso/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Verifica / riprova la timbratura' }));
  expect(await screen.findByText('Ingresso registrato')).toBeInTheDocument();
  expect(api.mock.calls.filter(([path]) => path === '/punch')).toHaveLength(1);
  expect(localStorage.getItem('korsvagen_badge_pending_employee')).toBeNull();
});

test('retrying an absent receipt keeps the original request ID', async () => {
  localStorage.setItem('korsvagen_badge_pending_employee', JSON.stringify({ id: requestId, action: 'in', qrToken: qr }));
  const implementation = api.getMockImplementation()!;
  api.mockImplementation((path: string) => path.startsWith('/receipts/')
    ? Promise.reject(new BadgeApiError(404, 'RECEIPT_NOT_FOUND', 'Non trovata')) : implementation(path));
  renderPage();
  fireEvent.click(await screen.findByRole('button', { name: 'Verifica / riprova la timbratura' }));
  await screen.findByText('Ingresso registrato');
  expect(api).toHaveBeenCalledWith('/challenge', expect.objectContaining({ requestId, action: 'in' }));
});

test('registration includes all required profile fields and explains activation before allowing login', async () => {
  localStorage.clear();
  const implementation = api.getMockImplementation()!;
  api.mockImplementation((path: string) => path === '/register'
    ? Promise.resolve({ message: 'Il responsabile deve attivare il tuo account.' }) : implementation(path));
  renderPage();
  fireEvent.click(await screen.findByRole('button', { name: 'Primo accesso? Registrati' }));
  for (const [label, value] of [['Nome', 'Anna'], ['Cognome', 'Esempio'], ['Data di nascita', '1990-01-01'], ['Mansione', 'Operaia'], ['Numero di cellulare', '3331234567'], ['Password', 'PasswordSoloLocale42']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Invia registrazione' }));
  expect(await screen.findByText('Il responsabile deve attivare il tuo account.')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/register', expect.objectContaining({
    first_name: 'Anna', last_name: 'Esempio', birth_date: '1990-01-01', job_role: 'Operaia', qrToken: qr,
  }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Accedi' })).toBeEnabled());
  expect(location).not.toHaveBeenCalled();
});
