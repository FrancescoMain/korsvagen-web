import React, { useEffect, useRef, useState } from 'react';
import { adminBadge, messageOf } from './api';
import { BadgeSite, Employee, dateTime, todayInRome } from './types';
import { BadgeStatistics, EmployeeStatistics, StatisticsDay } from './statisticsTypes';
import EventEditor from './EventEditor';
import ScheduleSettings from './ScheduleSettings';

const quarters = ['Gennaio – Marzo', 'Aprile – Giugno', 'Luglio – Settembre', 'Ottobre – Dicembre'];
const intervalLabels: Record<StatisticsDay['intervals'][number]['status'], string> = {
  complete: 'Completo', open: 'Ingresso aperto', missing_exit: 'Uscita mancante',
  closed_manually: 'Chiuso dal responsabile, senza ore attribuite',
  different_site: 'Uscita su un altro QR: ore da verificare', long_shift: 'Oltre 16 ore: da verificare',
};
export const duration = (seconds: number) => Math.floor(seconds / 3600) + ' h ' + String(Math.floor(seconds % 3600 / 60)).padStart(2, '0') + ' min';
const averageClock = (seconds: number | null) => {
  if (seconds === null) return '—';
  const minutes = Math.round(seconds / 60) % 1440;
  return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
};
const clock = (stamp: string | null) => stamp ? new Intl.DateTimeFormat('it-IT', {
  timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit',
}).format(new Date(stamp)) : '—';
const comparable = (person: EmployeeStatistics) => person.incomplete_intervals === 0 && person.review_intervals === 0;
const byName = (a: EmployeeStatistics, b: EmployeeStatistics) => a.employee_name.localeCompare(b.employee_name, 'it');

function useStatistics(site: string, year: number, quarter: number, revision: number, employee?: string) {
  const key = [site, year, quarter, revision, employee].join(':');
  const valid = Boolean(site) && Number.isInteger(year) && year >= 2000 && year <= 2100;
  const [state, setState] = useState<{ key: string; data?: BadgeStatistics; error?: string }>({ key: '' });
  useEffect(() => {
    let current = true;
    if (valid) {
      adminBadge.get<BadgeStatistics>('/statistics', { site, year, quarter, ...(employee ? { employee } : {}) })
        .then(data => { if (current) setState({ key, data }); })
        .catch(error => { if (current) setState({ key, error: messageOf(error) }); });
    }
    return () => { current = false; };
  }, [site, year, quarter, revision, employee, key, valid]);
  return {
    data: valid && state.key === key ? state.data : undefined,
    error: valid && state.key === key ? state.error : undefined,
    loading: valid && state.key !== key,
    valid,
  };
}

function Ranking({ title, people, value, empty, onSelect }: {
  title: string; people: EmployeeStatistics[]; value: (person: EmployeeStatistics) => string; empty: string; onSelect: (id: string) => void;
}) {
  return <section className="badge-card" aria-label={title}><h3>{title}</h3>{people.length ? <ol className="badge-ranking">
    {people.slice(0, 3).map(person => <li key={person.employee_id}>
      <button className="badge-link" onClick={() => onSelect(person.employee_id)}>{person.employee_name}</button>
      <strong>{value(person)}</strong>
    </li>)}
  </ol> : <p className="badge-help">{empty}</p>}</section>;
}

function StatisticsHistory({ site, year, quarter, revision, employee, name, onChanged }: {
  site: string; year: number; quarter: number; revision: number; employee: string; name: string; onChanged: () => void;
}) {
  const [editing, setEditing] = useState<{ id: string; mode: 'edit' | 'delete' } | null>(null);
  const { data, loading, error } = useStatistics(site, year, quarter, revision, employee);
  return <section className="badge-history" aria-label={'Storico di ' + name}>
    <h3>Storico di {name}</h3>
    <p>{quarters[quarter - 1]} {year} · orari italiani</p>
    {loading && <p role="status">Caricamento storico…</p>}
    {error && <p className="badge-alert error" role="alert">{error}</p>}
    {editing && <EventEditor key={editing.id + editing.mode} {...editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />}
    {data && <>
      <ScheduleSettings key={employee + ':' + revision} employeeId={employee} name={name} schedule={data.employee_schedule || []} onSaved={onChanged} />
      {!data.days?.length ? <p className="badge-empty">Nessun ingresso in questa sede nel trimestre selezionato.</p> :
        <div className="badge-table-wrap badge-statistics-wrap"><table className="badge-table badge-statistics-table" role="table">
          <caption className="badge-sr-only">Storico giornaliero di {name}</caption>
          <thead><tr role="row">{['Giorno di ingresso', 'Primo ingresso', 'Ultima uscita', 'Ore registrate', 'Verifica e timbrature'].map(label => <th key={label} scope="col" role="columnheader">{label}</th>)}</tr></thead>
          <tbody>{data.days.map(day => <tr key={day.date} role="row">
            <td role="cell" className="badge-statistics-identity"><span className="badge-cell-label" aria-hidden="true">Giorno di ingresso</span><strong>{day.date.split('-').reverse().join('/')}</strong></td>
            <td role="cell"><span className="badge-cell-label" aria-hidden="true">Primo ingresso</span>{clock(day.first_entry)}{day.late_minutes !== null && day.late_minutes > 0 && <span className="badge-pill warning">Ritardo: {day.late_minutes} min</span>}</td>
            <td role="cell"><span className="badge-cell-label" aria-hidden="true">Ultima uscita</span>{day.last_exit ? dateTime(day.last_exit) : 'Giornata incompleta'}{day.early_minutes !== null && day.early_minutes > 0 && <span className="badge-pill warning">Anticipo: {day.early_minutes} min</span>}</td>
            <td role="cell"><span className="badge-cell-label" aria-hidden="true">Ore registrate</span>{duration(day.worked_seconds)}{!!day.break_seconds && <small>Pausa sottratta: {duration(day.break_seconds)}</small>}{day.review_seconds > 0 && <small>{duration(day.review_seconds)} da verificare</small>}</td>
            <td role="cell" className="badge-statistics-details">
              {!day.complete && <span className="badge-pill warning">Dati da completare o verificare</span>}
              <details><summary>{day.intervals.length} {day.intervals.length === 1 ? 'intervallo' : 'intervalli'} · mostra timbrature</summary>
                <ul className="badge-intervals">{day.intervals.map(interval => <li key={interval.id}>
                  <div className="badge-actions"><button className="badge-button" onClick={() => setEditing({ id: interval.id, mode: 'edit' })}>Modifica ingresso</button><button className="badge-button danger" onClick={() => setEditing({ id: interval.id, mode: 'delete' })}>Elimina ingresso</button></div>
                  <span>Ingresso: {dateTime(interval.entry_at)}</span>
                  <span>Uscita: {interval.exit_at ? dateTime(interval.exit_at) : 'Non registrata'}</span>
                  {interval.status === 'different_site' && <span>QR di uscita: {interval.exit_site_name}</span>}
                  <span className={interval.status === 'complete' ? 'badge-help' : 'badge-flag'}>{intervalLabels[interval.status]}{interval.seconds !== null ? ' · ' + duration(interval.seconds) : ''}</span>
                </li>)}</ul>
              </details>
            </td>
          </tr>)}</tbody>
        </table></div>}
    </>}
  </section>;
}

export default function StatisticsPanel({ sites, employees, onChange }: { sites: BadgeSite[]; employees: Employee[]; onChange?: () => void }) {
  const today = todayInRome();
  const [site, setSite] = useState(sites.find(value => !value.archived_at)?.id || sites[0]?.id || '');
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [quarter, setQuarter] = useState(Math.ceil(Number(today.slice(5, 7)) / 3));
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState('');
  const [sort, setSort] = useState('name');
  const [notice, setNotice] = useState('');
  const historySection = useRef<HTMLElement>(null);
  const { data, error, loading, valid } = useStatistics(site, year, quarter, revision);
  if (!sites.length) return <section><h2>Statistiche presenze</h2><p className="badge-empty">Crea una sede in “Sedi e QR” per consultare le statistiche.</p></section>;
  function showHistory(id: string) {
    setSelected(id);
    historySection.current?.focus();
    historySection.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
  function moveQuarter(direction: number) {
    const date = new Date(Date.UTC(year, (quarter - 1) * 3 + direction * 3, 1));
    setYear(date.getUTCFullYear()); setQuarter(Math.floor(date.getUTCMonth() / 3) + 1);
  }
  const people = data?.employees || [];
  const lowestDays = [...people].sort((a, b) => a.presence_days - b.presence_days || byName(a, b));
  const lowestHours = people.filter(comparable).sort((a, b) => a.worked_seconds - b.worked_seconds || byName(a, b));
  const deviations = people.filter(p => (p.late_days || 0) + (p.early_days || 0) > 0).sort((a, b) =>
    (b.late_days || 0) + (b.early_days || 0) - (a.late_days || 0) - (a.early_days || 0) ||
    b.late_minutes + b.early_minutes - a.late_minutes - a.early_minutes || byName(a, b));
  const rows = [...people].sort((a, b) => (sort === 'days' ? a.presence_days - b.presence_days
    : sort === 'hours' ? a.worked_seconds - b.worked_seconds : 0) || byName(a, b));
  const minDays = lowestDays.length > 1 && lowestDays[0].presence_days < lowestDays[lowestDays.length - 1].presence_days ? lowestDays[0].presence_days : -1;
  const minHours = lowestHours.length > 1 && lowestHours[0].worked_seconds < lowestHours[lowestHours.length - 1].worked_seconds ? lowestHours[0].worked_seconds : -1;
  const historyPerson = employees.find(person => person.id === selected);
  const historyName = historyPerson ? historyPerson.first_name + ' ' + historyPerson.last_name : people.find(p => p.employee_id === selected)?.employee_name || '';
  return <section className="badge-statistics">
    <h2>Statistiche presenze</h2>
    <p>Ore, abitudini di ingresso e uscita e storico trimestrale, separati per sede e QR.</p>
    <div className="badge-card badge-report-filters">
      <label>Sede / QR<select value={site} onChange={e => { setSite(e.target.value); setSelected(''); setNotice(''); }}>
        {sites.map(value => <option key={value.id} value={value.id}>{value.name}{value.archived_at ? ' (archiviata)' : ''}</option>)}
      </select></label>
      <label>Anno<input type="number" min="2000" max="2100" value={year || ''} onChange={e => setYear(Number(e.target.value))} /></label>
      <label>Trimestre<select value={quarter} onChange={e => setQuarter(Number(e.target.value))}>{quarters.map((label, i) => <option key={label} value={i + 1}>{i + 1}° · {label}</option>)}</select></label>
      <div className="badge-actions">
        <button className="badge-button" disabled={!valid || (year === 2000 && quarter === 1)} onClick={() => moveQuarter(-1)}>Trimestre precedente</button>
        <button className="badge-button" disabled={!valid || (year === 2100 && quarter === 4)} onClick={() => moveQuarter(1)}>Trimestre successivo</button>
      </div>
    </div>
    {!valid && <p role="status">Scegli un anno tra 2000 e 2100.</p>}
    {notice && <p role="status">{notice}</p>}
    {loading && <p role="status">Caricamento statistiche…</p>}
    {error && <div className="badge-alert error" role="alert">{error} <button className="badge-button" onClick={() => setRevision(value => value + 1)}>Riprova</button></div>}
    {data && <>
      <h3>{data.site.name} · {quarter}° trimestre {year}</h3>
      <div className="badge-stats" aria-label="Totali del trimestre">
        {[['Ore lavorate nette', duration(data.summary.worked_seconds)], ['Pausa pranzo sottratta', duration(data.summary.break_seconds || 0)], ['Giornate di presenza', data.summary.presence_days],
          ['Dipendenti con ingressi', data.summary.employees], ['Intervalli incompleti', data.summary.incomplete_intervals]].map(([label, value]) =>
          <div className="badge-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <p className="badge-help">Una presenza è un giorno con almeno un ingresso. Le ore sommano gli intervalli chiusi nella stessa sede, al netto della pausa pranzo prevista e sono attribuite al giorno dell’ingresso. Le medie usano il primo ingresso e l’ultima uscita di ogni giornata; l’uscita media considera solo giornate complete.</p>
      {(data.summary.incomplete_intervals > 0 || data.summary.review_intervals > 0) && <div className="badge-alert">
        <strong>Dati da completare o verificare</strong>
        <p>{data.summary.open_intervals} ingressi ancora aperti · {data.summary.incomplete_intervals} intervalli senza uscita valida · {data.summary.review_intervals} intervalli con uscita su altro QR o durata oltre 16 ore.</p>
        {data.summary.review_seconds > 0 && <p>{duration(data.summary.review_seconds)} tenute separate dal totale.</p>}
        <p className="badge-help">Chi ha dati incompleti o ore da verificare è escluso dal confronto delle ore più basse.</p>
      </div>}
      <div className="badge-months" aria-label="Ore per mese">
        {data.months.map(month => <div className="badge-card" key={month.month}>
          <span>{new Intl.DateTimeFormat('it-IT', { month: 'long', timeZone: 'UTC' }).format(new Date(month.month + '-01T00:00:00Z'))}</span>
          <strong>{duration(month.worked_seconds)}</strong>
          <div className="badge-month-track" aria-hidden="true"><span style={{ width: (month.worked_seconds / Math.max(1, ...data.months.map(value => value.worked_seconds)) * 100) + '%' }} /></div>
          <small>{month.presence_days} giornate di presenza</small>
        </div>)}
      </div>
      <h3>Confronto tra dipendenti</h3>
      <p className="badge-help">Confronto dei dati registrati da chi ha timbrato un ingresso in questa sede nel trimestre. Giorni e ore inferiori non indicano da soli un’assenza: le assegnazioni alle singole sedi non sono registrate.</p>
      <div className="badge-rankings">
        <Ranking title="Meno giorni di presenza" people={lowestDays} value={person => person.presence_days + ' giorni'} empty="Nessun ingresso nel periodo." onSelect={showHistory} />
        <Ranking title="Meno ore registrate" people={lowestHours} value={person => duration(person.worked_seconds)} empty="Nessun totale completo da confrontare." onSelect={showHistory} />
        <Ranking title="Ritardi e uscite anticipate" people={deviations} value={person => (person.late_days || 0) + ' ritardi · ' + (person.early_days || 0) + ' uscite anticipate'}
          empty={people.some(person => person.late_days !== null || person.early_days !== null) ? 'Nessuno scostamento dagli orari previsti.' : 'Imposta gli orari previsti per attivare queste segnalazioni.'} onSelect={showHistory} />
      </div>
      <p className="badge-help">Giorni, orari e pausa pranzo si impostano per dipendente in “Dipendenti → Giorni e orari” oppure aprendo lo storico qui sotto. I confronti considerano il primo ingresso e l’ultima uscita tra tutte le sedi: un cambio di QR durante la giornata non genera ritardi o uscite anticipate.</p>
      <label className="badge-search">Ordina dipendenti<select value={sort} onChange={e => setSort(e.target.value)}><option value="name">Nome</option><option value="days">Meno giorni di presenza</option><option value="hours">Meno ore registrate</option></select></label>
      {rows.length ? <div className="badge-table-wrap badge-statistics-wrap"><table className="badge-table badge-statistics-table" role="table">
        <caption className="badge-sr-only">Statistiche per dipendente</caption>
        <thead><tr role="row">{['Dipendente', 'Presenze', 'Ore registrate', 'Ingresso medio', 'Uscita media', 'Segnalazioni', 'Storico'].map(label => <th key={label} scope="col" role="columnheader">{label}</th>)}</tr></thead>
        <tbody>{rows.map(person => <tr key={person.employee_id} role="row">
          <td role="cell" className="badge-statistics-identity"><span className="badge-cell-label" aria-hidden="true">Dipendente</span><strong>{person.employee_name}</strong><small>{person.job_role}{person.status === 'suspended' ? ' · Account sospeso' : ''}</small></td>
          <td role="cell"><span className="badge-cell-label" aria-hidden="true">Presenze</span>{person.presence_days} giorni{person.presence_days === minDays && <span className="badge-pill warning">Presenze più basse</span>}</td>
          <td role="cell"><span className="badge-cell-label" aria-hidden="true">Ore registrate</span><strong>{duration(person.worked_seconds)}</strong>{!comparable(person) ? <small>Totale parziale: escluso dal confronto</small> : person.worked_seconds === minHours && <span className="badge-pill warning">Ore più basse</span>}</td>
          <td role="cell"><span className="badge-cell-label" aria-hidden="true">Ingresso medio</span>{averageClock(person.average_entry_seconds)}<small>{person.presence_days} giorni</small></td>
          <td role="cell"><span className="badge-cell-label" aria-hidden="true">Uscita media</span>{averageClock(person.average_exit_seconds)}<small>{person.complete_days} giorni completi</small></td>
          <td role="cell"><span className="badge-cell-label" aria-hidden="true">Segnalazioni</span>
            {person.late_days !== null && <span>{person.late_days} ritardi · {person.late_minutes} min totali</span>}
            {person.early_days !== null && <small>{person.early_days} uscite anticipate su {person.evaluated_exit_days} giorni valutati · {person.early_minutes} min totali</small>}
            {person.incomplete_intervals + person.review_intervals > 0 && <span className="badge-pill warning">{person.incomplete_intervals + person.review_intervals} intervalli da verificare</span>}
            {person.late_days === null && comparable(person) && <small>Nessun confronto sui giorni registrati</small>}
          </td>
          <td role="cell" className="badge-statistics-details"><button className="badge-button" onClick={() => showHistory(person.employee_id)} aria-label={'Storico di ' + person.employee_name}>Apri storico</button></td>
        </tr>)}</tbody>
      </table></div> : <p className="badge-empty">Nessun ingresso in questa sede nel trimestre selezionato.</p>}
    </>}
    <section className="badge-card" ref={historySection} tabIndex={-1}>
      <label>Storico dipendente<select value={selected} onChange={e => setSelected(e.target.value)}><option value="">Seleziona un dipendente</option>
        {employees.map(person => <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>)}
      </select></label>
      {selected && valid && <StatisticsHistory key={[site, year, quarter, selected].join(':')} site={site} year={year} quarter={quarter} revision={revision} employee={selected} name={historyName} onChanged={() => { setNotice('Dati aggiornati.'); onChange?.(); setRevision(value => value + 1); }} />}
    </section>
  </section>;
}
