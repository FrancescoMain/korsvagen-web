import React, { FormEvent, useState } from 'react';
import { adminBadge, messageOf } from './api';
import { ScheduleDay } from './statisticsTypes';

const names = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
export default function ScheduleSettings({ employeeId, name, schedule, onSaved }: {
  employeeId: string; name: string; schedule: ScheduleDay[]; onSaved: () => void;
}) {
  const [days, setDays] = useState(() => names.map((_, i) => {
    const saved = schedule.find(day => day.weekday === i + 1);
    return { weekday: i + 1, expected_start: '08:00', expected_end: '17:00', break_start: null as string | null, break_end: null as string | null, ...saved, enabled: !!saved };
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const selected = days.filter(day => day.enabled).map(({ enabled, ...day }) => day);
  const changed = selected.length !== schedule.length || selected.some(day => {
    const previous = schedule.find(value => value.weekday === day.weekday);
    return !previous || day.expected_start !== previous.expected_start || day.expected_end !== previous.expected_end || day.break_start !== previous.break_start || day.break_end !== previous.break_end;
  });
  function update(index: number, change: Partial<typeof days[number]>) {
    setDays(previous => previous.map((day, i) => i === index ? { ...day, ...change } : day));
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try { await adminBadge.patch('/employees/' + employeeId + '/schedule', { days: selected }); onSaved(); }
    catch (err) { setError(messageOf(err)); }
    finally { setSaving(false); }
  }
  return <details className="badge-card badge-schedule" open>
    <summary><strong>Giorni, orari e pausa pranzo · {name}</strong></summary>
    <p className="badge-help">Seleziona i giorni previsti per questo dipendente. Gli orari valgono per tutte le sedi e anche per lo storico. Senza giorni impostati mostriamo solo presenze, ore e medie. Un’uscita prima dell’ingresso indica un turno notturno.</p>
    <form onSubmit={save}>
      {days.map((day, i) => <fieldset className="badge-weekday" key={day.weekday} disabled={saving}>
        <legend>{names[i]}</legend>
        <label className="badge-schedule-toggle"><input type="checkbox" checked={day.enabled} onChange={e => update(i, { enabled: e.target.checked })} />{names[i]} previsto</label>
        <div className="badge-report-filters">
          <label>Ingresso<input aria-label={'Ingresso ' + names[i]} type="time" step="60" required={day.enabled} disabled={!day.enabled} value={day.expected_start} onChange={e => update(i, { expected_start: e.target.value })} /></label>
          <label>Uscita<input aria-label={'Uscita ' + names[i]} type="time" step="60" required={day.enabled} disabled={!day.enabled} value={day.expected_end} onChange={e => update(i, { expected_end: e.target.value })} /></label>
          <label className="badge-schedule-toggle"><input type="checkbox" checked={day.break_start !== null} disabled={!day.enabled} onChange={e => update(i, { break_start: e.target.checked ? '12:00' : null, break_end: e.target.checked ? '13:00' : null })} />Pausa pranzo {names[i]}</label>
          {day.break_start !== null && <>
            <label>Inizio pausa<input aria-label={'Inizio pausa ' + names[i]} type="time" step="60" required={day.enabled} disabled={!day.enabled} value={day.break_start} onChange={e => update(i, { break_start: e.target.value })} /></label>
            <label>Fine pausa<input aria-label={'Fine pausa ' + names[i]} type="time" step="60" required={day.enabled} disabled={!day.enabled} value={day.break_end || ''} onChange={e => update(i, { break_end: e.target.value })} /></label>
          </>}
        </div>
      </fieldset>)}
      <p className="badge-help">La pausa pranzo è facoltativa e deve rientrare nel turno. Sottraiamo solo il tempo di pausa coperto da intervalli completati: se è già stata timbrata un’uscita per pranzo, quel tempo non viene sottratto di nuovo.</p>
      <div className="badge-actions"><button className="badge-button primary" disabled={saving || !changed}>{saving ? 'Salvataggio…' : 'Salva giorni e orari'}</button>
        <button type="button" className="badge-button" disabled={saving || !selected.length} onClick={() => setDays(previous => previous.map(day => ({ ...day, enabled: false })))}>Rimuovi tutti i giorni previsti</button></div>
      {error && <p className="badge-alert error" role="alert">{error}</p>}
    </form>
  </details>;
}
