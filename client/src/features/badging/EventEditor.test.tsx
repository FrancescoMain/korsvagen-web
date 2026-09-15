import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventEditor from './EventEditor';
import { adminBadge } from './api';
jest.mock('./api', () => ({ adminBadge: { get: jest.fn(), patch: jest.fn(), remove: jest.fn() }, messageOf: (error: Error) => error.message }));
const get=adminBadge.get as jest.Mock, patch=adminBadge.patch as jest.Mock, remove=adminBadge.remove as jest.Mock;
const detail={ id:'entry',action:'in',employee_name:'Anna Esempio',site_name:'Ufficio',occurred_at:'2026-01-05T07:00:00Z',original_occurred_at:'2026-01-05T07:00:00Z',revision:2,paired_exit:{id:'exit',occurred_at:'2026-01-05T16:00:00Z'},changes:[] };
beforeEach(()=>{jest.clearAllMocks();get.mockResolvedValue(detail);patch.mockResolvedValue({});remove.mockResolvedValue({});});
test('edits Italian local time and submits the loaded revision, then refreshes the caller', async()=>{
  const saved=jest.fn();render(<EventEditor id="entry" mode="edit" onClose={jest.fn()} onSaved={saved} />);
  const at=await screen.findByLabelText('Data e ora in Italia');expect(at).toHaveValue('2026-01-05T08:00');
  fireEvent.change(at,{target:{value:'2026-01-05T09:30'}});
  fireEvent.change(screen.getByLabelText('Motivo'),{target:{value:'Correzione orario'}});
  fireEvent.click(screen.getByRole('button',{name:'Salva modifica'}));
  await waitFor(()=>expect(patch).toHaveBeenCalledWith('/events/entry',{revision:2,paired_exit:'exit',reason:'Correzione orario',local_time:'2026-01-05T09:30:00'}));
  expect(saved).toHaveBeenCalledTimes(1);
});
test('deletion names the associated exit and requires an explicit reason and confirmation', async()=>{
  const saved=jest.fn();render(<EventEditor id="entry" mode="delete" onClose={jest.fn()} onSaved={saved} />);
  expect(await screen.findByText(/insieme all’uscita del 05\/01\/26, 17:00:00/)).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Conferma eliminazione'})).toBeDisabled();expect(remove).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Motivo'),{target:{value:'Timbratura errata'}});
  fireEvent.click(screen.getByRole('button',{name:'Conferma eliminazione'}));
  await waitFor(()=>expect(remove).toHaveBeenCalledWith('/events/entry',{revision:2,paired_exit:'exit',reason:'Timbratura errata'}));expect(saved).toHaveBeenCalledTimes(1);
});
test('a conflict retains the draft without reporting success or deleting anything', async()=>{
  const saved=jest.fn();patch.mockRejectedValue(new Error('La timbratura è cambiata. Chiudi e riapri la modifica.'));
  render(<EventEditor id="entry" mode="edit" onClose={jest.fn()} onSaved={saved} />);
  fireEvent.change(await screen.findByLabelText('Motivo'),{target:{value:'Correzione orario'}});
  fireEvent.click(screen.getByRole('button',{name:'Salva modifica'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('La timbratura è cambiata');
  expect(screen.getByLabelText('Motivo')).toHaveValue('Correzione orario');expect(saved).not.toHaveBeenCalled();expect(remove).not.toHaveBeenCalled();
});
