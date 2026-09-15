import React, { FormEvent, useEffect, useState } from 'react';
import { adminBadge, messageOf } from './api';
import EventEditor from './EventEditor';
import { BadgeReport, BadgeSite, Employee, anomalyLabels, dateTime, rejectionLabels, todayInRome } from './types';

export default function ReportsPanel({ sites, employees, onChange }: { sites: BadgeSite[]; employees: Employee[]; onChange?: () => void }) {
  const [editing, setEditing] = useState<{ id: string; mode: 'edit' | 'delete' } | null>(null);
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState('');
  const [filters, setFilters] = useState({ from: todayInRome(), to: todayInRome(), site: '', employee: '', outcome: '', flagged: 'false' });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [report, setReport] = useState<BadgeReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    adminBadge.get<BadgeReport>('/reports', { ...applied, page })
      .then(result => { if (!cancelled) setReport(result); })
      .catch(err => { if (!cancelled) { setReport(null); setError(messageOf(err)); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [applied, page, revision]);
  function apply(event: FormEvent) { event.preventDefault(); setPage(1); setApplied({ ...filters }); }
  function update(key: keyof typeof filters, value: string) { setFilters(prev => ({ ...prev, [key]: value })); }
  async function exportCSV() {
    setExporting(true); setError('');
    try {
      const blob = await adminBadge.csv(applied);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'presenze-' + applied.from + '-' + applied.to + '.csv';
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { setError(messageOf(err)); }
    finally { setExporting(false); }
  }
  return <section>
    <div className="badge-row"><div><h2>Report presenze</h2><p>Date e orari italiani · Periodi fino a 93 giorni</p></div><button className="badge-button" disabled={exporting || loading || !report} onClick={exportCSV}>{exporting ? 'Esportazione…' : 'Esporta tutti i risultati CSV'}</button></div>
    <form className="badge-card badge-report-filters" onSubmit={apply}>
      <label>Dal<input type="date" required value={filters.from} onChange={e => update('from', e.target.value)} /></label>
      <label>Al<input type="date" required value={filters.to} onChange={e => update('to', e.target.value)} /></label>
      <label>Sede<select value={filters.site} onChange={e => update('site', e.target.value)}><option value="">Tutte le sedi</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name}{site.archived_at ? ' (archiviata)' : ''}</option>)}</select></label>
      <label>Dipendente<select value={filters.employee} onChange={e => update('employee', e.target.value)}><option value="">Tutti i dipendenti</option>{employees.map(person => <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>)}</select></label>
      <label>Esito<select value={filters.outcome} onChange={e => update('outcome', e.target.value)}><option value="">Tutti gli esiti</option><option value="accepted">Accettate</option><option value="rejected">Respinte</option></select></label>
      <label>Controlli<select value={filters.flagged} onChange={e => update('flagged', e.target.value)}><option value="false">Tutte</option><option value="true">Solo anomalie</option></select></label>
      <button className="badge-button primary" disabled={loading}>Applica filtri</button>
    </form>
    {notice && <p role="status">{notice}</p>}
    {editing && <EventEditor key={editing.id + editing.mode} {...editing} onClose={() => setEditing(null)} onSaved={() => { setNotice(editing.mode === 'delete' ? 'Ingresso eliminato. Report aggiornato.' : 'Timbratura modificata. Ore ricalcolate.'); setEditing(null); onChange?.(); setRevision(value => value + 1); }} />}
    {error && <div className="badge-alert error" role="alert">{error}</div>}
    {loading && <p role="status">Caricamento report…</p>}
    {report && !loading && <>
      <div className="badge-stats">
        {[['Ingressi', report.summary.entries], ['Uscite', report.summary.exits], ['Tentativi respinti', report.summary.rejected], ['Con anomalie', report.summary.anomalies], ['Dipendenti', report.summary.employees], ['Ore intervalli chiusi', (report.summary.completed_seconds / 3600).toFixed(2)]].map(([label, value]) => <div className="badge-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <p className="badge-help">Totali dell’intero periodo filtrato. Le ore sono attribuite alla data e alla sede di uscita e includono gli intervalli lunghi da verificare. Sono ore lorde; in Statistiche trovi le ore al netto della pausa pranzo; non sono un conteggio paghe.</p>
      <details className="badge-card"><summary><strong>{report.present.length} ingressi aperti ora</strong> · indipendentemente dal periodo e dall’esito filtrati</summary>
        {!report.present.length ? <p>Nessun ingresso aperto.</p> : <ul>{report.present.map(person => <li key={person.id}>
          {person.first_name} {person.last_name} · {sites.find(site => site.id === person.current_site_id)?.name} · dal {dateTime(person.current_entry_at!)}
          {Date.now() - new Date(person.current_entry_at!).getTime() > 16 * 3600000 && <span className="badge-flag">Da verificare: oltre 16 ore</span>}
        </li>)}</ul>}
      </details>
      <div className="badge-table-wrap"><table className="badge-table badge-events"><thead><tr><th>Data e ora</th><th>Dipendente</th><th>Sede</th><th>Timbratura</th><th>Posizione</th><th>Browser e controlli</th></tr></thead><tbody>
        {report.data.map(event => <tr key={event.id}>
          <td>{dateTime(event.occurred_at)}{event.outcome === 'accepted' && <div className="badge-actions">
            <button className="badge-button" onClick={() => setEditing({ id: event.id, mode: 'edit' })}>Modifica</button>
            {event.action === 'in' && <button className="badge-button danger" onClick={() => setEditing({ id: event.id, mode: 'delete' })}>Elimina</button>}
          </div>}</td>
          <td><strong>{event.employee_name}</strong><small>{event.job_role} · {event.birth_date.split('-').reverse().join('/')}</small></td>
          <td>{event.site_name}{event.entry_site_name && event.entry_site_name !== event.site_name && <small>Ingresso: {event.entry_site_name}</small>}</td>
          <td><strong>{event.action === 'in' ? 'Ingresso' : 'Uscita'}</strong><span className={'badge-pill ' + (event.outcome === 'rejected' ? 'warning' : '')}>{event.outcome === 'accepted' ? 'Accettata' : 'Respinta'}</span>{event.reason && <small>{rejectionLabels[event.reason] || event.reason}</small>}{event.duration_seconds !== null && <small>{(event.duration_seconds / 3600).toFixed(2)} ore</small>}</td>
          <td><a href={'https://www.google.com/maps?q=' + event.latitude + ',' + event.longitude} target="_blank" rel="noreferrer">Apri posizione ↗</a><small>{event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}</small><small>Distanza {Math.round(event.distance_m)} m · errore ±{Math.round(event.accuracy_m)} m</small></td>
          <td><code title={event.device_hash}>{event.device_hash.slice(0, 12)}</code>{event.anomaly_flags.map(flag => <span key={flag} className="badge-flag">{anomalyLabels[flag] || flag}</span>)}{event.adjustment_note && <small>Motivo: {event.adjustment_note}</small>}<details><summary>Dettagli browser</summary><small>{event.user_agent}</small></details></td>
        </tr>)}
      </tbody></table></div>
      {!report.total && <p className="badge-empty">Nessuna timbratura per questi filtri.</p>}
      <div className="badge-row badge-pagination"><span>{report.total} risultati · pagina {page} di {Math.max(1, Math.ceil(report.total / report.pageSize))}</span><div className="badge-actions"><button className="badge-button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Precedente</button><button className="badge-button" disabled={page * report.pageSize >= report.total} onClick={() => setPage(value => value + 1)}>Successiva</button></div></div>
    </>}
  </section>;
}
