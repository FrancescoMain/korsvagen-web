import React, { FormEvent, useState } from 'react';
import { adminBadge, messageOf } from './api';
import { SiteSchedule } from './statisticsTypes';

export default function ScheduleSettings({ siteId, schedule, onSaved }: {
  siteId: string; schedule: SiteSchedule; onSaved: () => void;
}) {
  const [enabled, setEnabled] = useState(schedule.expected_start !== null);
  const [start, setStart] = useState(schedule.expected_start || '');
  const [end, setEnd] = useState(schedule.expected_end || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const changed = (enabled ? start : null) !== schedule.expected_start || (enabled ? end : null) !== schedule.expected_end;
  async function save(event: FormEvent) {
    event.preventDefault();
    if (enabled && (!start || !end || start === end)) { setError('Inserisci due orari diversi.'); return; }
    setSaving(true); setError('');
    try {
      await adminBadge.patch('/sites/' + siteId + '/schedule', {
        expected_start: enabled ? start : null, expected_end: enabled ? end : null,
      });
      onSaved();
    } catch (err) { setError(messageOf(err)); }
    finally { setSaving(false); }
  }
  return <details className="badge-card badge-schedule">
    <summary><strong>Orari previsti della sede</strong> · {schedule.expected_start
      ? schedule.expected_start + ' – ' + schedule.expected_end
      : 'Non impostati'}</summary>
    <p className="badge-help">Facoltativi, uguali per chi timbra questo QR. Il riferimento salvato si applica anche ai trimestri storici. Un’uscita prima dell’ingresso indica un orario notturno.</p>
    <form onSubmit={save}>
      <label className="badge-schedule-toggle"><input type="checkbox" checked={enabled} disabled={saving} onChange={e => setEnabled(e.target.checked)} />Confronta con gli orari previsti</label>
      <div className="badge-report-filters">
        <label>Ingresso previsto<input type="time" step="60" required={enabled} disabled={!enabled || saving} value={start} onChange={e => setStart(e.target.value)} /></label>
        <label>Uscita prevista<input type="time" step="60" required={enabled} disabled={!enabled || saving} value={end} onChange={e => setEnd(e.target.value)} /></label>
        <button className="badge-button primary" disabled={saving || !changed}>{saving ? 'Salvataggio…' : 'Salva orari'}</button>
      </div>
      {error && <p className="badge-alert error" role="alert">{error}</p>}
    </form>
  </details>;
}
