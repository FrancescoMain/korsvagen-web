import React, { useState } from 'react';
import { adminBadge, messageOf } from './api';
import { Employee, dateTime } from './types';

export default function EmployeesPanel({ employees, onChange }: { employees: Employee[]; onChange: () => Promise<void> }) {
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [temporary, setTemporary] = useState<{ name: string; password: string } | null>(null);
  const visible = employees.filter(person => (person.first_name + ' ' + person.last_name + ' ' + person.phone).toLowerCase().includes(search.toLowerCase()));
  async function status(person: Employee, next: 'active' | 'suspended') {
    if (!window.confirm(next === 'active' ? 'Confermi di aver verificato l’identità e i dati di ' + person.first_name + ' ' + person.last_name + '?' : 'Sospendere l’account di ' + person.first_name + ' ' + person.last_name + '?')) return;
    setBusy(true); setError('');
    try { await adminBadge.patch('/employees/' + person.id, { status: next }); await onChange(); }
    catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  async function reset(person: Employee) {
    if (!window.confirm('Generare una password temporanea per ' + person.first_name + ' ' + person.last_name + '? Le sessioni attuali saranno terminate.')) return;
    setBusy(true); setError('');
    try {
      const result = await adminBadge.post<{ temporaryPassword: string }>('/employees/' + person.id + '/reset-password');
      setTemporary({ name: person.first_name + ' ' + person.last_name, password: result.temporaryPassword });
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  async function closeEntry(person: Employee) {
    const reason = window.prompt('Chiudi l’ingresso aperto di ' + person.first_name + ' ' + person.last_name + '. Indica il motivo (almeno 5 caratteri). La chiusura sarà tracciata e non aggiungerà ore lavorate.');
    if (reason === null) return;
    if (reason.trim().length < 5) { setError('Indica un motivo di almeno 5 caratteri.'); return; }
    setBusy(true); setError('');
    try { await adminBadge.post('/employees/' + person.id + '/close-entry', { reason }); await onChange(); }
    catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  return <section className="badge-employees">
    <h2>Dipendenti</h2><p>Verifica nome, data di nascita e mansione prima di attivare un account.</p>
    <label className="badge-search">Cerca dipendente<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nome, cognome o cellulare" /></label>
    {error && <div role="alert" className="badge-alert error">{error}</div>}
    {temporary && <div role="status" className="badge-card">
      <h3>Password temporanea · {temporary.name}</h3><p>Comunicala direttamente al dipendente. Al prossimo accesso dovrà cambiarla.</p>
      <label>Password da comunicare<input readOnly value={temporary.password} onFocus={e => e.target.select()} /></label>
      <button className="badge-button" onClick={() => setTemporary(null)}>Ho comunicato la password · Chiudi</button>
    </div>}
    {/* Explicit roles preserve table semantics when CSS presents the rows as cards. */}
    <div className="badge-table-wrap badge-employees-wrap"><table className="badge-table badge-employees-table" role="table" aria-label="Dipendenti"><thead><tr role="row"><th scope="col" role="columnheader">Dipendente</th><th scope="col" role="columnheader">Data di nascita</th><th scope="col" role="columnheader">Mansione</th><th scope="col" role="columnheader">Stato</th><th scope="col" role="columnheader">Controlli browser</th><th scope="col" role="columnheader">Azioni</th></tr></thead><tbody>
      {visible.map(person => <tr key={person.id} role="row">
        <td role="cell" className="badge-employee-identity"><strong>{person.first_name} {person.last_name}</strong><small>{person.phone}</small>{person.current_entry_at && <small>Ingresso aperto dal {dateTime(person.current_entry_at)}</small>}</td>
        <td role="cell"><span className="badge-cell-label" aria-hidden="true">Data di nascita</span>{person.birth_date.split('-').reverse().join('/')}</td>
        <td role="cell"><span className="badge-cell-label" aria-hidden="true">Mansione</span>{person.job_role}</td>
        <td role="cell"><span className="badge-cell-label" aria-hidden="true">Stato</span><span className={'badge-pill ' + (person.status === 'pending' ? 'warning' : person.status === 'suspended' ? 'muted' : '')}>{person.status === 'active' ? 'Attivo' : person.status === 'pending' ? 'Da attivare' : 'Sospeso'}</span></td>
        <td role="cell"><span className="badge-cell-label" aria-hidden="true">Controlli browser</span>{person.device_count || 0} browser osservati{person.first_device_hash && <small>Primo: {person.first_device_hash.slice(0, 12)}</small>}
          {!!person.shared_with?.length && <span className="badge-flag">Condiviso con: {person.shared_with.join(', ')}</span>}</td>
        <td role="cell" className="badge-employee-actions"><span className="badge-cell-label" aria-hidden="true">Azioni</span><div className="badge-actions">
          {person.status !== 'active' && <button className="badge-button primary" disabled={busy} onClick={() => status(person, 'active')}>Attiva</button>}
          {person.status === 'active' && <button className="badge-button danger" disabled={busy} onClick={() => status(person, 'suspended')}>Sospendi</button>}
          <button className="badge-button" disabled={busy} onClick={() => reset(person)}>Reimposta password</button>
          {person.current_entry_at && <button className="badge-button" disabled={busy} onClick={() => closeEntry(person)}>Chiudi ingresso aperto</button>}
        </div></td>
      </tr>)}
    </tbody></table></div>
    {!visible.length && <p className="badge-empty">Nessun dipendente trovato. Le registrazioni dal QR compariranno qui.</p>}
    <p className="badge-help">L’identificativo riguarda il browser, non l’IMEI del telefono. Browser diversi, navigazione privata e cancellazione dei dati possono cambiarlo. Verifica le segnalazioni con il responsabile della sede.</p>
  </section>;
}
