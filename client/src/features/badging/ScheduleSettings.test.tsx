import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScheduleSettings from './ScheduleSettings';
import { adminBadge } from './api';
jest.mock('./api', () => ({ adminBadge: { patch: jest.fn() }, messageOf: (error: Error) => error.message }));
const patch = adminBadge.patch as jest.Mock;
beforeEach(() => { jest.clearAllMocks(); patch.mockResolvedValue({}); });
test('saves only selected personal days, their individual hours and optional lunch', async () => {
  const onSaved = jest.fn();
  render(<ScheduleSettings employeeId="anna" name="Anna" schedule={[]} onSaved={onSaved} />);
  expect(screen.getByLabelText('Ingresso Martedì')).toBeDisabled();
  fireEvent.click(screen.getByLabelText('Lunedì previsto'));
  fireEvent.change(screen.getByLabelText('Ingresso Lunedì'), { target: { value: '09:00' } });
  fireEvent.click(screen.getByLabelText('Pausa pranzo Lunedì'));
  fireEvent.change(screen.getByLabelText('Fine pausa Lunedì'), { target: { value: '13:30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salva giorni e orari' }));
  await waitFor(() => expect(patch).toHaveBeenCalledWith('/employees/anna/schedule', { days: [
    { weekday: 1, expected_start: '09:00', expected_end: '17:00', break_start: '12:00', break_end: '13:30' },
  ] }));
  expect(onSaved).toHaveBeenCalledTimes(1);
});
test('removing all expected days saves an empty schedule', async () => {
  render(<ScheduleSettings employeeId="anna" name="Anna" schedule={[{ weekday: 1, expected_start: '08:00', expected_end: '17:00', break_start: null, break_end: null }]} onSaved={jest.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Rimuovi tutti i giorni previsti' }));
  fireEvent.click(screen.getByRole('button', { name: 'Salva giorni e orari' }));
  await waitFor(() => expect(patch).toHaveBeenCalledWith('/employees/anna/schedule', { days: [] }));
});
test('failed saves retain the personal draft and never announce success', async () => {
  const onSaved = jest.fn(); patch.mockRejectedValue(new Error('Connessione interrotta'));
  render(<ScheduleSettings employeeId="anna" name="Anna" schedule={[]} onSaved={onSaved} />);
  fireEvent.click(screen.getByLabelText('Lunedì previsto'));
  fireEvent.change(screen.getByLabelText('Ingresso Lunedì'), { target: { value: '09:30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salva giorni e orari' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Connessione interrotta');
  expect(screen.getByLabelText('Ingresso Lunedì')).toHaveValue('09:30');
  expect(onSaved).not.toHaveBeenCalled();
});
