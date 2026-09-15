import React, { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { adminBadge, locate, messageOf } from './api';
import { BadgeSite } from './types';

export function badgeLink(token: string) {
  return window.location.origin + '/badge/' + token;
}

function PrintableQR({ site, onClose }: { site: BadgeSite; onClose: () => void }) {
  const [src, setSrc] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    const previousTitle = document.title;
    document.title = 'QR presenze · ' + site.name;
    document.body.classList.add('badge-printing');
    QRCode.toString(badgeLink(site.qr_token), { type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 640 })
      .then(svg => { if (!cancelled) setSrc('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)); })
      .catch(() => { if (!cancelled) setError('Non è stato possibile generare il QR. Riprova.'); });
    return () => { cancelled = true; document.body.classList.remove('badge-printing'); document.title = previousTitle; };
  }, [site.qr_token, site.name]);
  return createPortal(<div className="badge-print-layer" role="dialog" aria-modal="true" aria-label={'QR di ' + site.name}>
    <div className="badge-print-controls badge-row">
      <button className="badge-button" onClick={onClose}>Chiudi anteprima</button>
      {ready && <a className="badge-button" href={src} download={'qr-sede-' + site.id + '.svg'}>Scarica SVG</a>}
      <button className="badge-button primary" disabled={!ready} onClick={() => window.print()}>Stampa / salva PDF</button>
    </div>
    <article className="badge-sheet">
      <strong className="badge-print-brand">KORSVAGEN</strong>
      <p className="badge-eyebrow">TIMBRATURA PRESENZE</p><h1>{site.name}</h1><p>{site.address}</p>
      {error && <p role="alert">{error}</p>}
      {src && <img src={src} alt={'QR per timbrare a ' + site.name} onLoad={() => setReady(true)} />}
      <h2>Inquadra il QR con il telefono</h2>
      <ol><li>Apri la fotocamera e tocca il collegamento.</li><li>Accedi con il tuo account.</li><li>Premi <strong>Ingresso</strong> o <strong>Uscita</strong> e consenti la posizione.</li></ol>
      <p>Al primo accesso registrati e chiedi al responsabile di attivarti.</p>
      <p className="badge-help">Servono connessione e posizione attiva. Attendi sempre la conferma della timbratura.</p>
      <p className="badge-print-url">{badgeLink(site.qr_token)}</p>
    </article>
  </div>, document.body);
}

const blank = { name: '', address: '', latitude: '', longitude: '', radius_m: '200', max_accuracy_m: '100', outside_policy: 'block' };

export default function SitesPanel({ sites, onChange }: { sites: BadgeSite[]; onChange: () => Promise<void> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [printing, setPrinting] = useState<BadgeSite | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = sites.filter(site => !site.archived_at);
  const update = (key: keyof typeof blank, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  function edit(site?: BadgeSite) {
    setEditing(site?.id || null); setError('');
    setForm(site ? { name: site.name, address: site.address, latitude: String(site.latitude), longitude: String(site.longitude),
      radius_m: String(site.radius_m), max_accuracy_m: String(site.max_accuracy_m), outside_policy: site.outside_policy } : blank);
    setShowForm(true);
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), radius_m: Number(form.radius_m), max_accuracy_m: Number(form.max_accuracy_m) };
      if (editing) await adminBadge.put('/sites/' + editing, payload);
      else await adminBadge.post('/sites', payload);
      setShowForm(false); await onChange();
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  async function change(site: BadgeSite, action: 'rotate' | 'archive') {
    const question = action === 'rotate'
      ? 'Rigenerare il QR di ' + site.name + '? I fogli già stampati smetteranno di funzionare e andranno sostituiti.'
      : 'Eliminare il QR e archiviare ' + site.name + '? Lo storico delle presenze sarà conservato.';
    if (!window.confirm(question)) return;
    setBusy(true); setError('');
    try {
      if (action === 'rotate') await adminBadge.post('/sites/' + site.id + '/rotate');
      else await adminBadge.remove('/sites/' + site.id);
      await onChange();
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  async function currentPosition() {
    setBusy(true); setError('');
    try {
      const position = await locate();
      setForm(prev => ({ ...prev, latitude: position.coords.latitude.toFixed(6), longitude: position.coords.longitude.toFixed(6) }));
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(false); }
  }
  return <section>
    <div className="badge-row"><div><h2>Sedi e QR</h2><p>Un QR per ogni ufficio o cantiere. Puoi stamparne più copie.</p></div><button className="badge-button primary" onClick={() => edit()} disabled={busy}>+ Nuova sede</button></div>
    {error && <div role="alert" className="badge-alert error">{error}</div>}
    {showForm && <form className="badge-card badge-form badge-site-form" onSubmit={save}>
      <h3>{editing ? 'Modifica sede' : 'Nuova sede'}</h3>
      <label>Nome ufficio o cantiere<input value={form.name} onChange={e => update('name', e.target.value)} required maxLength={100} /></label>
      <label>Indirizzo<input value={form.address} onChange={e => update('address', e.target.value)} required maxLength={250} /></label>
      <div className="badge-row"><p>Indica il punto in cui si deve timbrare.</p><button type="button" className="badge-button" onClick={currentPosition} disabled={busy}>Usa la mia posizione</button></div>
      <div className="badge-form-grid">
        <label>Latitudine<input type="number" step="any" min={-90} max={90} value={form.latitude} onChange={e => update('latitude', e.target.value)} required /></label>
        <label>Longitudine<input type="number" step="any" min={-180} max={180} value={form.longitude} onChange={e => update('longitude', e.target.value)} required /></label>
        <label>Raggio consentito (metri)<input type="number" min={20} max={5000} value={form.radius_m} onChange={e => update('radius_m', e.target.value)} required /></label>
        <label>Errore GPS massimo (metri)<input type="number" min={5} max={1000} value={form.max_accuracy_m} onChange={e => update('max_accuracy_m', e.target.value)} required /></label>
      </div>
      <label>Timbratura fuori zona<select value={form.outside_policy} onChange={e => update('outside_policy', e.target.value)}><option value="block">Blocca e registra il tentativo respinto</option><option value="flag">Accetta e segnala un’anomalia</option></select></label>
      <p className="badge-help">Una posizione troppo imprecisa viene sempre respinta. Verifica il raggio sul posto prima di distribuire i QR.</p>
      <div className="badge-row"><button className="badge-button primary" disabled={busy}>{busy ? 'Salvataggio…' : 'Salva sede'}</button><button className="badge-button" type="button" disabled={busy} onClick={() => setShowForm(false)}>Annulla</button></div>
    </form>}
    {!active.length && <div className="badge-empty"><h3>Crea il primo QR</h3><p>Aggiungi un ufficio o un cantiere e imposta la zona in cui timbrare.</p></div>}
    <div className="badge-sites-grid">{active.map(site => <article className="badge-card" key={site.id}>
      <span className="badge-pill">QR attivo</span><h3>{site.name}</h3><p>{site.address}</p>
      <p className="badge-help">Raggio {site.radius_m} m · Errore GPS massimo {site.max_accuracy_m} m<br />Fuori zona: {site.outside_policy === 'block' ? 'blocco' : 'segnalazione'}</p>
      <div className="badge-actions"><button className="badge-button primary" onClick={() => setPrinting(site)}>QR e stampa</button><button className="badge-button" disabled={busy} onClick={() => edit(site)}>Modifica</button><button className="badge-button" disabled={busy} onClick={() => change(site, 'rotate')}>Rigenera QR</button><button className="badge-button danger" disabled={busy} onClick={() => change(site, 'archive')}>Elimina QR</button></div>
    </article>)}</div>
    {!!sites.filter(site => site.archived_at).length && <p className="badge-help">{sites.filter(site => site.archived_at).length} sedi archiviate: disponibili nei filtri dei report.</p>}
    {printing && <PrintableQR site={printing} onClose={() => setPrinting(null)} />}
  </section>;
}
