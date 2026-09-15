import React, { useEffect, useRef, useState } from 'react';
import { adminBadge, locate, messageOf } from './api';
import SiteMap from './SiteMap';

type Location = { address: string; latitude: string; longitude: string };
type Place = { id: string; label: string; latitude: number; longitude: number };
type Props = { value: Location; radius: number; disabled: boolean;
  onChange: (value: Partial<Location>) => void; onBusyChange: (busy: boolean) => void };
function coordinate(value: string, limit: number) {
  const number = Number(value);
  return value.trim() && Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

export default function SiteLocationPicker({ value, radius, disabled, onChange, onBusyChange }: Props) {
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState<'search' | 'gps' | ''>('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const operation = useRef(0);
  useEffect(() => { onBusyChange(!!busy); }, [busy, onBusyChange]);
  useEffect(() => () => { operation.current++; onBusyChange(false); }, [onBusyChange]);

  function reset() {
    operation.current++; setBusy(''); setResults([]); setError(''); setStatus('');
  }
  function selectPoint(latitude: number, longitude: number) {
    reset();
    // Leaflet can cross the antimeridian when panning: store conventional coordinates.
    const wrapped = ((longitude + 180) % 360 + 360) % 360 - 180;
    onChange({ latitude: Math.max(-90, Math.min(90, latitude)).toFixed(6), longitude: wrapped.toFixed(6) });
  }
  async function search() {
    if (disabled || busy || value.address.trim().length < 4) return;
    const request = ++operation.current;
    setBusy('search'); setResults([]); setError(''); setStatus('');
    try {
      const response = await adminBadge.get<{ data: Place[] }>('/geocode', { q: value.address.trim() });
      if (request !== operation.current) return;
      setResults(response.data);
      setStatus(response.data.length ? 'Seleziona l’indirizzo corretto per impostare il punto.' : 'Nessun indirizzo trovato. Aggiungi il comune oppure scegli il punto sulla mappa o usa il GPS.');
    } catch (err) { if (request === operation.current) setError(messageOf(err)); }
    finally { if (request === operation.current) setBusy(''); }
  }
  async function currentPosition() {
    const request = ++operation.current;
    setBusy('gps'); setResults([]); setError(''); setStatus('');
    try {
      const position = await locate();
      if (request === operation.current) selectPoint(position.coords.latitude, position.coords.longitude);
    } catch (err) { if (request === operation.current) setError(messageOf(err)); }
    finally { if (request === operation.current) setBusy(''); }
  }
  return <div className="badge-location-picker">
    <div className="badge-address-search">
      <label>Indirizzo<input value={value.address} required maxLength={250} disabled={disabled || busy === 'gps'}
        placeholder="Via, numero civico e comune" aria-describedby="badge-address-help"
        onChange={event => { reset(); onChange({ address: event.target.value, latitude: '', longitude: '' }); }}
        onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} /></label>
      <button type="button" className="badge-button" disabled={disabled || !!busy || value.address.trim().length < 4} onClick={search}>{busy === 'search' ? 'Ricerca…' : 'Cerca indirizzo'}</button>
    </div>
    <p className="badge-help" id="badge-address-help">Cerca l’indirizzo e scegli un risultato: le coordinate si compilano automaticamente. Se cambi indirizzo, seleziona di nuovo il punto.</p>
    {error && <div className="badge-alert error" role="alert">{error}</div>}
    {status && <p className="badge-help" role="status">{status}</p>}
    {!!results.length && <ul className="badge-address-results" aria-label="Indirizzi trovati">{results.map(place => <li key={place.id}>
      <button type="button" className="badge-button" disabled={disabled} onClick={() => {
        reset(); onChange({ address: place.label, latitude: place.latitude.toFixed(6), longitude: place.longitude.toFixed(6) });
      }}>{place.label}</button>
    </li>)}</ul>}
    <SiteMap latitude={coordinate(value.latitude, 90)} longitude={coordinate(value.longitude, 180)} radius={radius}
      disabled={disabled || busy === 'gps'} onChange={selectPoint} />
    <p className="badge-help">Tocca la mappa o trascina il segnaposto sull’ingresso del cantiere. Il cerchio mostra il raggio consentito per timbrare.</p>
    <div className="badge-row"><small>Ricerca: <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer">Photon</a> · dati <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a></small>
      <button type="button" className="badge-button" disabled={disabled || !!busy} onClick={currentPosition}>{busy === 'gps' ? 'Localizzazione…' : 'Usa la mia posizione'}</button></div>
    <div className="badge-form-grid">
      <label>Latitudine<input type="number" step="any" min={-90} max={90} required value={value.latitude} disabled={disabled || busy === 'gps'} onChange={event => { reset(); onChange({ latitude: event.target.value }); }} /></label>
      <label>Longitudine<input type="number" step="any" min={-180} max={180} required value={value.longitude} disabled={disabled || busy === 'gps'} onChange={event => { reset(); onChange({ longitude: event.target.value }); }} /></label>
    </div>
  </div>;
}
