import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { employeeRequest } from './features/badging/api';

jest.mock('./features/badging/api', () => ({
  employeeRequest: jest.fn(),
  SESSION_KEY: 'korsvagen_badge_session',
  messageOf: (error: Error) => error.message,
}));

test('a scanned QR opens the employee flow without mounting the marketing site or CMS', async () => {
  localStorage.clear();
  window.history.replaceState({}, '', '/badge/' + 'a'.repeat(64));
  (employeeRequest as jest.Mock).mockResolvedValue({ id: 'site', name: 'Cantiere di prova', address: 'Via Esempio' });
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Cantiere di prova' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Accedi' })).toBeInTheDocument();
  expect(employeeRequest).toHaveBeenCalledTimes(1);
  expect(employeeRequest).toHaveBeenCalledWith('/sites/' + 'a'.repeat(64));
});
