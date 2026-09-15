import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeApiError, deviceToken, employeeRequest, locate, messageOf, newRequestId, SESSION_KEY } from './api';
import { BadgeEvent, BadgeSite, EmployeeState, dateTime, rejectionLabels, todayInRome } from './types';
import './badging.css';

type Pending = { id: string; action: 'in' | 'out'; qrToken: string };
const pendingKey = (employee: string) => 'korsvagen_badge_pending_' + employee;

export default function BadgePage() {
  const { token = '' } = useParams();
  const [site, setSite] = useState<Pick<BadgeSite, 'id' | 'name' | 'address'> | null>(null);
  const [state, setState] = useState<EmployeeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [register, setRegister] = useState(false);
  const [receipt, setReceipt] = useState<BadgeEvent | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Presenze | KORSVAGEN';
    return () => { document.title = previousTitle; };
  }, []);

  const refresh = useCallback(async () => {
    const result = await employeeRequest<EmployeeState>('/me');
    setState(result);
    const saved = localStorage.getItem(pendingKey(result.employee.id));
    setPending(null);
    if (saved) {
      try { setPending(JSON.parse(saved)); }
      catch { localStorage.removeItem(pendingKey(result.employee.id)); }
    }
    return result;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSite(null);
    setError('');
    async function load() {
      try {
        const result = await employeeRequest<BadgeSite>('/sites/' + encodeURIComponent(token));
        if (cancelled) return;
        setSite(result);
        if (localStorage.getItem(SESSION_KEY)) {
          try { await refresh(); }
          catch (err) {
            if (err instanceof BadgeApiError && [401, 403].includes(err.status)) localStorage.removeItem(SESSION_KEY);
            if (!cancelled) { setState(null); setError(messageOf(err)); }
          }
        }
      } catch (err) { if (!cancelled) setError(messageOf(err)); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [token, reload, refresh]);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(register ? 'Invio registrazione…' : 'Accesso…');
    setError(''); setNotice('');
    try {
      const device = await deviceToken();
      if (register) {
        const result = await employeeRequest<{ message: string }>('/register', { ...values, deviceToken: device, qrToken: token });
        setNotice(result.message); setRegister(false);
      } else {
        const result = await employeeRequest<{ token: string }>('/login', { ...values, deviceToken: device });
        localStorage.setItem(SESSION_KEY, result.token);
        setReceipt(null);
        await refresh();
      }
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(''); }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setState(null); setPending(null); setReceipt(null); setError(''); setNotice('');
    // Keep this browser's identifier when another employee logs in.
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy('Aggiornamento password…'); setError('');
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      await employeeRequest('/password', values);
      logout(); setNotice('Password aggiornata. Accedi con la nuova password.');
    } catch (err) { setError(messageOf(err)); }
    finally { setBusy(''); }
  }

  function confirmReceipt(value: BadgeEvent, employeeId: string) {
    setReceipt(value);
    localStorage.removeItem(pendingKey(employeeId));
    setPending(null);
    setNotice('');
  }

  async function punch(action: 'in' | 'out', retry?: Pending) {
    if (!state || busy) return;
    const employeeId = state.employee.id;
    setBusy('Preparazione…'); setError(''); setReceipt(null); setNotice('');
    let submitted = false;
    try {
      const request = retry || { id: newRequestId(), action, qrToken: token };
      if (retry) {
        try {
          const existing = await employeeRequest<{ receipt: BadgeEvent }>('/receipts/' + retry.id);
          confirmReceipt(existing.receipt, employeeId);
          await refresh();
          return;
        } catch (err) {
          if (!(err instanceof BadgeApiError) || err.code !== 'RECEIPT_NOT_FOUND') throw err;
          if (retry.qrToken !== token) throw new Error('Scansiona il QR della sede della timbratura da verificare e riprova.');
        }
      }
      const device = await deviceToken();
      const challenge = await employeeRequest<{ challenge: string }>('/challenge', {
        requestId: request.id, action: request.action, qrToken: request.qrToken, deviceToken: device,
      });
      setBusy('Ricerca della posizione…');
      const position = await locate();
      localStorage.setItem(pendingKey(employeeId), JSON.stringify(request));
      setPending(request);
      submitted = true;
      setBusy('Registrazione in corso…');
      const result = await employeeRequest<{ receipt: BadgeEvent }>('/punch', {
        challenge: challenge.challenge, deviceToken: device,
        latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy,
      });
      confirmReceipt(result.receipt, employeeId);
      try { await refresh(); } catch { setNotice('Ricevuta salvata. Aggiorna lo stato prima della prossima timbratura.'); }
    } catch (err) {
      setError(messageOf(err));
      if (err instanceof BadgeApiError && err.code === 'QR_INACTIVE') {
        localStorage.removeItem(pendingKey(employeeId)); setPending(null);
      }
      if (err instanceof BadgeApiError && [401, 403].includes(err.status)) {
        localStorage.removeItem(SESSION_KEY); setState(null);
      }
      if (submitted) setNotice('Esito da verificare: usa il pulsante qui sotto. La verifica evita doppie timbrature.');
    } finally { setBusy(''); }
  }

  async function updateState() {
    setBusy('Aggiornamento…'); setError('');
    try { await refresh(); }
    catch (err) {
      setError(messageOf(err));
      if (err instanceof BadgeApiError && [401, 403].includes(err.status)) { localStorage.removeItem(SESSION_KEY); setState(null); }
    } finally { setBusy(''); }
  }

  return <main className="badge-mobile">
    <div className="badge-mobile-shell">
      <header className="badge-brand"><span className="badge-monogram">K</span><div><strong>KORSVAGEN</strong><span>Presenze · Uffici e cantieri</span></div></header>
      {loading ? <p role="status" className="badge-card">Caricamento della sede…</p> : <>
        {site && <section className="badge-location"><span className="badge-eyebrow">SEDE DI TIMBRATURA</span><h1>{site.name}</h1><p>{site.address}</p></section>}
        {error && <div role="alert" className="badge-alert error">{error}</div>}
        {notice && <div role="status" className="badge-alert">{notice}</div>}
        {!site ? <button className="badge-button" onClick={() => setReload(value => value + 1)}>Riprova</button> :
          !state ? <section className="badge-card">
            <h2>{register ? 'Crea il tuo account' : 'Accedi per timbrare'}</h2>
            <p>{register ? 'Compila i dati una volta. Il responsabile attiverà il tuo account.' : 'Usa il tuo cellulare e la password. Su questo browser ricorderemo l’accesso per 30 giorni.'}</p>
            <form onSubmit={authenticate} className="badge-form">
              {register && <>
                <label>Nome<input name="first_name" autoComplete="given-name" required maxLength={100} /></label>
                <label>Cognome<input name="last_name" autoComplete="family-name" required maxLength={100} /></label>
                <label>Data di nascita<input name="birth_date" type="date" autoComplete="bday" min="1900-01-01" max={todayInRome()} required /></label>
                <label>Mansione<input name="job_role" placeholder="Ad esempio operaio, capocantiere, impiegato" required maxLength={100} /></label>
              </>}
              <label>Numero di cellulare<input name="phone" type="tel" autoComplete="username" placeholder="+39 333 1234567" required maxLength={30} /></label>
              <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={10} maxLength={72} required /></label>
              {register && <small>Usa almeno 10 caratteri.</small>}
              <button className="badge-button primary" disabled={!!busy}>{busy || (register ? 'Invia registrazione' : 'Accedi')}</button>
            </form>
            <button className="badge-link" disabled={!!busy} onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Hai già un account? Accedi' : 'Primo accesso? Registrati'}</button>
            {!register && <p className="badge-help">Password dimenticata? Chiedi al responsabile una password temporanea.</p>}
          </section> :
          <section className="badge-card">
            <div className="badge-row"><h2>Ciao, {state.employee.first_name}</h2><button className="badge-link" disabled={!!busy} onClick={logout}>Esci dall’account</button></div>
            {state.employee.must_change_password ? <form className="badge-form" onSubmit={changePassword}>
              <p>Per continuare, sostituisci la password temporanea con una che conosci solo tu.</p>
              <label>Password temporanea<input type="password" name="currentPassword" autoComplete="current-password" required /></label>
              <label>Nuova password<input type="password" name="password" autoComplete="new-password" minLength={10} maxLength={72} required /></label>
              <button className="badge-button primary" disabled={!!busy}>Salva nuova password</button>
            </form> : <>
              <div className={'badge-presence ' + (state.employee.current_site_id ? 'inside' : '')}>
                <strong>{state.employee.current_site_id ? 'Ingresso aperto' : 'Nessun ingresso aperto'}</strong>
                {state.employee.current_entry_at && <span>{state.current_site_name} · {dateTime(state.employee.current_entry_at)}</span>}
              </div>
              <p>Premi il pulsante e consenti la posizione del telefono.</p>
              <div className="badge-punch-buttons">
                <button className="badge-button primary" disabled={!!busy || !!pending || !!state.employee.current_site_id} onClick={() => punch('in')}>↘ Ingresso</button>
                <button className="badge-button exit" disabled={!!busy || !!pending || !state.employee.current_site_id} onClick={() => punch('out')}>↗ Uscita</button>
              </div>
              {pending && <button className="badge-button" disabled={!!busy} onClick={() => punch(pending.action, pending)}>Verifica / riprova la timbratura</button>}
              {busy && <p role="status" aria-live="polite">{busy}</p>}
              {receipt && <div role="status" className={'badge-receipt ' + (receipt.outcome === 'accepted' ? 'success' : 'error')}>
                <strong>{receipt.outcome === 'accepted' ? (receipt.action === 'in' ? 'Ingresso registrato' : 'Uscita registrata') : 'Timbratura non registrata'}</strong>
                <span>{dateTime(receipt.occurred_at)} · {receipt.site_name}</span>
                {receipt.reason && <p>{rejectionLabels[receipt.reason] || receipt.reason}</p>}
              </div>}
              {state.last_event && !receipt && <p className="badge-help">Ultimo tentativo: {state.last_event.action === 'in' ? 'ingresso' : 'uscita'} {state.last_event.outcome === 'accepted' ? 'registrato' : 'respinto'} · {dateTime(state.last_event.occurred_at)} · {state.last_event.site_name}</p>}
              <button className="badge-link" disabled={!!busy} onClick={updateState}>Aggiorna stato</button>
            </>}
          </section>}
      </>}
      <footer className="badge-help">La posizione viene rilevata solo quando timbri. Salviamo sede, data, ora e un identificativo di questo browser per verificare le presenze. Usa sempre il tuo account.</footer>
    </div>
  </main>;
}
