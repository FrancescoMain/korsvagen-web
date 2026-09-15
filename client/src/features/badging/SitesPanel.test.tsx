import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SitesPanel from './SitesPanel';
import { adminBadge, locate } from './api';
import { BadgeSite } from './types';

jest.mock('./api', () => ({ adminBadge: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
  locate: jest.fn(), messageOf: (error: Error) => error.message }));
jest.mock('./SiteMap', () => ({ __esModule: true, default: ({ onChange }: { onChange: (lat: number, lon: number) => void }) =>
  <button type="button" onClick={() => onChange(40.75, 14.5)}>Sposta punto sulla mappa</button> }));
const search = adminBadge.get as jest.Mock;
const save = adminBadge.post as jest.Mock;
const result = { id: 'place', label: 'Via Roma 10, Castellammare di Stabia, Italia', latitude: 40.7496, longitude: 14.5067 };
const site = { id: 'site-id', name: 'Cantiere', address: 'Via Vecchia 1', latitude: 40, longitude: 14,
  radius_m: 200, max_accuracy_m: 100, outside_policy: 'block', qr_token: 'a'.repeat(64), archived_at: null } as BadgeSite;

beforeEach(() => { jest.resetAllMocks(); search.mockResolvedValue({ data: [result] }); save.mockResolvedValue({}); });
function create() {
  render(<SitesPanel sites={[]} onChange={jest.fn().mockResolvedValue(undefined)} />);
  fireEvent.click(screen.getByRole('button', { name: '+ Nuova sede' }));
  fireEvent.change(screen.getByLabelText('Nome ufficio o cantiere'), { target: { value: 'Cantiere' } });
  fireEvent.change(screen.getByLabelText('Indirizzo'), { target: { value: 'Via Roma 10, Castellammare' } });
}

test('an explicit address search and result selection fill and save latitude/longitude in the correct order', async () => {
  create();
  fireEvent.click(screen.getByRole('button', { name: 'Cerca indirizzo' }));
  expect(save).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByRole('button', { name: result.label }));
  expect(search).toHaveBeenCalledWith('/geocode', { q: 'Via Roma 10, Castellammare' });
  expect(screen.getByLabelText('Latitudine')).toHaveValue(result.latitude);
  expect(screen.getByLabelText('Longitudine')).toHaveValue(result.longitude);
  fireEvent.click(screen.getByRole('button', { name: 'Salva sede' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith('/sites', expect.objectContaining({
    address: result.label, latitude: result.latitude, longitude: result.longitude, radius_m: 200,
  })));
});

test('editing an address invalidates old coordinates and ignores results of an obsolete search', async () => {
  let resolve!: (value: unknown) => void;
  search.mockReturnValue(new Promise(done => { resolve = done; }));
  render(<SitesPanel sites={[site]} onChange={jest.fn().mockResolvedValue(undefined)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Modifica' }));
  expect(screen.getByLabelText('Latitudine')).toHaveValue(40);
  fireEvent.click(screen.getByRole('button', { name: 'Cerca indirizzo' }));
  fireEvent.change(screen.getByLabelText('Indirizzo'), { target: { value: 'Via Nuova 2, Napoli' } });
  expect(screen.getByLabelText('Latitudine')).toHaveValue(null);
  expect(screen.getByLabelText('Longitudine')).toHaveValue(null);
  await act(async () => resolve({ data: [result] }));
  expect(screen.queryByRole('button', { name: result.label })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Indirizzo')).toHaveValue('Via Nuova 2, Napoli');
});

test('Enter searches without saving, an empty or failed search leaves manual coordinates available', async () => {
  search.mockResolvedValueOnce({ data: [] });
  create();
  fireEvent.keyDown(screen.getByLabelText('Indirizzo'), { key: 'Enter' });
  expect(await screen.findByText(/Nessun indirizzo trovato/)).toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
  search.mockRejectedValueOnce(new Error('Ricerca temporaneamente non disponibile'));
  fireEvent.click(screen.getByRole('button', { name: 'Cerca indirizzo' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Ricerca temporaneamente non disponibile');
  fireEvent.change(screen.getByLabelText('Latitudine'), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText('Longitudine'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salva sede' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith('/sites', expect.objectContaining({ latitude: 0, longitude: 0 })));
});

test('starting a fresh form during a search discards the previous form response', async () => {
  let resolve!: (value: unknown) => void;
  search.mockReturnValue(new Promise(done => { resolve = done; }));
  create();
  fireEvent.click(screen.getByRole('button', { name: 'Cerca indirizzo' }));
  fireEvent.click(screen.getByRole('button', { name: '+ Nuova sede' }));
  await act(async () => resolve({ data: [result] }));
  expect(screen.queryByRole('button', { name: result.label })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Indirizzo')).toHaveValue('');
  expect(screen.getByLabelText('Latitudine')).toHaveValue(null);
});

test('GPS and map adjustments update an existing site and saving waits for GPS', async () => {
  let resolve!: (value: unknown) => void;
  (locate as jest.Mock).mockReturnValue(new Promise(done => { resolve = done; }));
  render(<SitesPanel sites={[site]} onChange={jest.fn().mockResolvedValue(undefined)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Modifica' }));
  fireEvent.click(screen.getByRole('button', { name: 'Usa la mia posizione' }));
  expect(screen.getByRole('button', { name: 'Salva sede' })).toBeDisabled();
  await act(async () => resolve({ coords: { latitude: 40.8, longitude: 14.4 } }));
  expect(screen.getByLabelText('Latitudine')).toHaveValue(40.8);
  fireEvent.click(screen.getByRole('button', { name: 'Sposta punto sulla mappa' }));
  expect(screen.getByLabelText('Latitudine')).toHaveValue(40.75);
  fireEvent.click(screen.getByRole('button', { name: 'Salva sede' }));
  await waitFor(() => expect(adminBadge.put).toHaveBeenCalledWith('/sites/site-id', expect.objectContaining({ latitude: 40.75, longitude: 14.5 })));
});
