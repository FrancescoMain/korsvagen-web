import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { adminBadge, messageOf } from './api';
import { BadgeEvent, dateTime } from './types';
interface EventDetail extends BadgeEvent {
  revision: number; original_occurred_at: string;
  paired_exit: { id: string; occurred_at: string } | null;
  changes: { at: string; details: { reason: string; previous_at?: string; occurred_at?: string } }[];
}
const localTime = (value: string) => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).format(new Date(value)).replace(' ', 'T');
export default function EventEditor({ id, mode, onClose, onSaved }: {
  id: string; mode: 'edit' | 'delete'; onClose: () => void; onSaved: () => void;
}) {
  const [data, setData] = useState<EventDetail | null>(null);
  const [at, setAt] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    let active = true;
    ref.current?.focus(); ref.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    adminBadge.get<EventDetail>('/events/' + id).then(value => {
      if (active) { setData(value); setAt(localTime(value.occurred_at)); }
    }).catch(err => { if (active) setError(messageOf(err)); });
    return () => { active = false; };
  }, [id]);
  async function save(event: FormEvent) {
    event.preventDefault(); if (!data) return;
    setSaving(true); setError('');
    try {
      const body = { revision: data.revision, reason, paired_exit: data.paired_exit?.id || null };
      if (mode === 'delete') await adminBadge.remove('/events/' + id, body);
      else await adminBadge.patch('/events/' + id, { ...body, local_time: at.length === 16 ? at + ':00' : at });
      onSaved();
    } catch (err) { setError(messageOf(err)); }
    finally { setSaving(false); }
  }
  return <section className="badge-card badge-event-editor" ref={ref} tabIndex={-1} aria-label={mode === 'delete' ? 'Elimina ingresso' : 'Modifica timbratura'}>
    <h3>{mode === 'delete' ? 'Elimina ingresso' : 'Modifica timbratura'}</h3>
    {!data && !error && <p role="status">Caricamento timbratura…</p>}
    {data && <>
      <p><strong>{data.employee_name}</strong> · {data.site_name}<br />{data.action === 'in' ? 'Ingresso' : 'Uscita'}: {dateTime(data.occurred_at)}</p>
      {mode === 'delete' ? <p className="badge-alert">L’ingresso verrà escluso da report e statistiche{data.paired_exit ? ' insieme all’uscita del ' + dateTime(data.paired_exit.occurred_at) : ''}. Un ingresso ancora aperto verrà chiuso. L’operazione e le timbrature originali resteranno registrate.</p>
        : <p className="badge-help">Modifica l’orario italiano. Le ore vengono ricalcolate; posizione e timbratura originale restano conservate. Per il cambio dell’ora autunnale manteniamo, se possibile, lo stesso fuso della timbratura.</p>}
      <form onSubmit={save}>
        {mode === 'edit' && <label>Data e ora in Italia<input type="datetime-local" step="1" required value={at} disabled={saving} onChange={e => setAt(e.target.value)} /></label>}
        <label>Motivo<input required minLength={5} maxLength={500} value={reason} disabled={saving} onChange={e => setReason(e.target.value)} placeholder="Indica il motivo della correzione" /></label>
        <div className="badge-actions"><button className={'badge-button ' + (mode === 'delete' ? 'danger' : 'primary')} disabled={saving || reason.trim().length < 5}>{saving ? 'Salvataggio…' : mode === 'delete' ? 'Conferma eliminazione' : 'Salva modifica'}</button></div>
      </form>
      <details><summary>Timbratura originale e modifiche</summary><p>Originale: {dateTime(data.original_occurred_at)}</p>
        {data.changes.length ? <ul>{data.changes.map((change, i) => <li key={i}>{dateTime(change.at)} · {change.details.reason}{change.details.previous_at && ' · da ' + dateTime(change.details.previous_at)}{change.details.occurred_at && ' a ' + dateTime(change.details.occurred_at)}</li>)}</ul> : <p>Nessuna modifica precedente.</p>}</details>
    </>}
    {error && <p role="alert" className="badge-alert error">{error}</p>}
    <button className="badge-button" disabled={saving} onClick={onClose}>Chiudi</button>
  </section>;
}
