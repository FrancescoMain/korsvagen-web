import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminBadge, messageOf } from './api';
import { BadgeSite, Employee } from './types';
import SitesPanel from './SitesPanel';
import EmployeesPanel from './EmployeesPanel';
import ReportsPanel from './ReportsPanel';
import './badging.css';

export default function BadgingManagement() {
  const { hasRole } = useAuth();
  const allowed = hasRole(['admin', 'super_admin']);
  const [tab, setTab] = useState('sites');
  const [sites, setSites] = useState<BadgeSite[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setError(''); setLoading(true);
    try {
      const [siteResult, employeeResult] = await Promise.all([
        adminBadge.get<{ data: BadgeSite[] }>('/sites'),
        adminBadge.get<{ data: Employee[] }>('/employees'),
      ]);
      setSites(siteResult.data); setEmployees(employeeResult.data);
    } catch (err) { setError(messageOf(err)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (allowed) void load(); }, [allowed, load]);
  if (!allowed) return <p>La gestione presenze è riservata agli amministratori.</p>;
  return <div className="badge-admin">
    <header className="badge-admin-heading">
      <div><span className="badge-eyebrow">PERSONE E SEDI</span><h1>Presenze</h1><p>QR per ogni sede, timbrature e controlli in un unico posto.</p></div>
      <button className="badge-button" disabled={loading} onClick={load}>Aggiorna dati</button>
    </header>
    <nav className="badge-tabs" aria-label="Gestione presenze">
      {[['sites', 'Sedi e QR'], ['employees', 'Dipendenti'], ['reports', 'Report presenze']].map(([id, title]) =>
        <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{title}{id === 'employees' && employees.some(e => e.status === 'pending') ? ' · ' + employees.filter(e => e.status === 'pending').length + ' da attivare' : ''}</button>)}
    </nav>
    {error && <div className="badge-alert error" role="alert">{error}</div>}
    {loading ? <p role="status">Caricamento dati…</p> : <>
      {tab === 'sites' && <SitesPanel sites={sites} onChange={load} />}
      {tab === 'employees' && <EmployeesPanel employees={employees} onChange={load} />}
      {tab === 'reports' && <ReportsPanel sites={sites} employees={employees} />}
    </>}
  </div>;
}
