import express from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { badgeSecurity } from './security.js';
import { createAddressSearch } from './geocoding.js';
import { BadgeError, invalid, uuid, textField, phoneNumber, passwordInput, registration, siteInput, positionInput, reportFilters, statisticsFilters, employeeScheduleInput, correctionTime, csvCell } from './validation.js';

const EMPLOYEE_FIELDS = 'id,first_name,last_name,birth_date,job_role,phone,status,must_change_password,current_site_id,current_entry_at,created_at';
const SESSION_AUDIENCE = 'korsvagen-badging';
const CHALLENGE_AUDIENCE = 'korsvagen-badge-punch';
const DATABASE_ERRORS = {
  EMPLOYEE_NOT_ACTIVE: [403, 'Account non attivo o sessione terminata. Accedi nuovamente.'],
  EMPLOYEE_NOT_FOUND: [404, 'Dipendente non trovato.'],
  SITE_NOT_FOUND: [404, 'Sede non trovata.'],
  QR_INACTIVE: [404, 'QR non valido o disattivato. Chiedi il nuovo QR al responsabile.'],
  ADMIN_REQUIRED: [403, 'Operazione riservata agli amministratori.'],
  SITE_OCCUPIED: [409, 'Ci sono ingressi ancora aperti in questa sede. Registrare prima le uscite.'],
  REQUEST_CONFLICT: [409, 'Richiesta già utilizzata. Aggiorna lo stato prima di timbrare.'],
  INVALID_INPUT: [400, 'Dati della richiesta non validi.'],
  EVENT_NOT_FOUND: [404, 'Timbratura non trovata.'],
  EVENT_CHANGED: [409, 'La timbratura è cambiata. Chiudi e riapri la modifica.'],
  EVENT_OVERLAP: [409, 'L’orario deve restare tra la timbratura precedente e quella successiva.'],
  NO_OPEN_ENTRY: [409, 'Non risulta un ingresso aperto. Aggiorna i dati.'],
};

function checked(result) {
  if (result.error) {
    const known = DATABASE_ERRORS[result.error.message];
    if (known) throw new BadgeError(known[0], result.error.message, known[1]);
    if (result.error.code === '23505') throw new BadgeError(409, 'ALREADY_EXISTS', 'Dati già registrati. Se hai già un account, accedi o rivolgiti al responsabile.');
    throw new BadgeError(503, 'DATABASE_UNAVAILABLE', 'Il servizio presenze non è disponibile. Riprova tra poco.');
  }
  return result.data;
}

// Supabase caps individual responses. Never silently truncate lists or exports.
async function allRows(query, limit = 20000) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const page = checked(await query().range(offset, offset + 499));
    if (rows.length + page.length > limit) throw new BadgeError(422, 'TOO_MANY_ROWS', 'Troppi risultati. Riduci l’intervallo o applica un filtro.');
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}

export function createBadgeRouter({ db, secret, verifyAdminToken, searchAddresses = createAddressSearch() }) {
  const router = express.Router();
  const security = secret && badgeSecurity(secret);
  const run = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('Referrer-Policy', 'no-referrer');
    if (!db || !secret || secret.length < 32) return res.status(503).json({ code: 'BADGING_NOT_CONFIGURED', message: 'Il servizio presenze non è ancora disponibile.' });
    next();
  });

  const rpc = async (name, params) => checked(await db.rpc(name, params));
  async function rpcRecord(name, params) {
    const result = await rpc(name, params);
    // A composite PostgreSQL return type is a one-element array in PostgREST.
    const record = Array.isArray(result) && result.length === 1 ? result[0] : result;
    if (!record || Array.isArray(record) || typeof record.id !== 'string') {
      throw new BadgeError(503, 'DATABASE_UNAVAILABLE', 'Risposta non confermata. Verifica l’esito prima di riprovare.');
    }
    return record;
  }
  async function throttle(key, limit, seconds = 900) {
    const allowed = await rpc('badge_rate_limit', { p_key: security.rateKey(key), p_limit: limit, p_seconds: seconds });
    if (!allowed) throw new BadgeError(429, 'RATE_LIMIT', 'Troppi tentativi. Attendi qualche minuto prima di riprovare.');
  }
  async function siteByQR(token) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) invalid('QR non valido.');
    const site = checked(await db.from('badge_sites').select('*').eq('qr_token', token).is('archived_at', null).maybeSingle());
    if (!site) throw new BadgeError(404, 'QR_INACTIVE', DATABASE_ERRORS.QR_INACTIVE[1]);
    return site;
  }
  const requireEmployee = run(async (req, res, next) => {
    const payload = security.verify(req.headers.authorization?.replace(/^Bearer /, ''), SESSION_AUDIENCE);
    uuid(payload.sub);
    const employee = checked(await db.from('badge_employees').select(EMPLOYEE_FIELDS + ',session_version').eq('id', payload.sub).maybeSingle());
    if (!employee || employee.status !== 'active' || employee.session_version !== payload.version) throw new BadgeError(401, 'SESSION_EXPIRED', 'Accedi nuovamente. Se l’account è sospeso, contatta il responsabile.');
    req.employee = employee;
    req.badgeSession = payload;
    next();
  });
  const requireAdmin = run(async (req, res, next) => {
      let payload;
      try {
        payload = verifyAdminToken(req.headers.authorization?.replace(/^Bearer /, ''));
        if (payload.type === 'refresh') throw new Error('refresh token');
        uuid(payload.sub);
      } catch {
        throw new BadgeError(401, 'ADMIN_REQUIRED', 'Accedi alla dashboard per continuare.');
      }
      const admin = checked(await db.from('admin_users').select('id,role,is_active').eq('id', payload.sub).maybeSingle());
      if (!admin?.is_active || !['admin', 'super_admin'].includes(admin.role)) throw new BadgeError(403, 'ADMIN_REQUIRED', DATABASE_ERRORS.ADMIN_REQUIRED[1]);
      req.admin = admin;
      next();
  });

  router.post('/device', run(async (req, res) => {
    await throttle('device:' + req.ip, 150, 3600);
    res.json({ deviceToken: security.device() });
  }));

  router.get('/sites/:token', run(async (req, res) => {
    await throttle('site:' + req.ip, 1500);
    const site = await siteByQR(req.params.token);
    res.json({ id: site.id, name: site.name, address: site.address });
  }));

  router.post('/register', run(async (req, res) => {
    await throttle('register:' + req.ip, 60, 3600);
    await siteByQR(req.body.qrToken);
    security.deviceHash(req.body.deviceToken);
    const { password, ...profile } = registration(req.body);
    await throttle('register-phone:' + profile.phone, 5, 3600);
    checked(await db.from('badge_employees').insert({ ...profile, password_hash: await bcrypt.hash(password, 12), status: 'pending' }));
    res.status(201).json({ message: 'Registrazione inviata. Il responsabile deve attivare il tuo account; poi potrai accedere con cellulare e password.' });
  }));

  router.post('/login', run(async (req, res) => {
    await throttle('login-ip:' + req.ip, 300);
    const phone = phoneNumber(req.body.phone);
    await throttle('login-phone:' + phone, 10);
    const password = passwordInput(req.body.password);
    const device = security.deviceHash(req.body.deviceToken);
    const employee = checked(await db.from('badge_employees').select(EMPLOYEE_FIELDS + ',password_hash,session_version').eq('phone', phone).maybeSingle());
    // A fixed valid bcrypt hash keeps unknown-account attempts expensive too.
    const valid = await bcrypt.compare(password, employee?.password_hash || '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW');
    if (!employee || !valid) throw new BadgeError(401, 'INVALID_CREDENTIALS', 'Cellulare o password non corretti.');
    if (employee.status !== 'active') throw new BadgeError(403, 'EMPLOYEE_PENDING', employee.status === 'pending' ? 'Account in attesa di attivazione da parte del responsabile.' : 'Account sospeso. Contatta il responsabile.');
    const token = security.sign({ version: employee.session_version, device }, SESSION_AUDIENCE, '30d', employee.id);
    res.json({ token });
  }));

  router.get('/me', requireEmployee, run(async (req, res) => {
    const last = checked(await db.from('badge_effective_events').select('id,action,occurred_at,site_name,outcome,reason').eq('employee_id', req.employee.id).order('occurred_at', { ascending: false }).limit(1));
    const current = req.employee.current_site_id
      ? checked(await db.from('badge_sites').select('name').eq('id', req.employee.current_site_id).maybeSingle()) : null;
    const { session_version, ...employee } = req.employee;
    res.json({ employee, last_event: last[0] || null, current_site_name: current?.name || null });
  }));

  router.post('/password', requireEmployee, run(async (req, res) => {
    await throttle('password:' + req.employee.id, 10);
    const password = passwordInput(req.body.password);
    const stored = checked(await db.from('badge_employees').select('password_hash').eq('id', req.employee.id).single());
    if (!(await bcrypt.compare(passwordInput(req.body.currentPassword), stored.password_hash))) throw new BadgeError(400, 'INVALID_PASSWORD', 'La password attuale non è corretta.');
    if (password === req.body.currentPassword) invalid('Scegli una password diversa da quella temporanea.');
    const updated = checked(await db.from('badge_employees').update({
      password_hash: await bcrypt.hash(password, 12), must_change_password: false, session_version: req.employee.session_version + 1,
    }).eq('id', req.employee.id).eq('session_version', req.employee.session_version).select('id'));
    if (!updated.length) throw new BadgeError(409, 'SESSION_EXPIRED', 'La sessione è cambiata. Accedi nuovamente.');
    res.json({ message: 'Password aggiornata. Accedi con la nuova password.' });
  }));

  router.post('/challenge', requireEmployee, run(async (req, res) => {
    await throttle('challenge:' + req.employee.id, 30, 60);
    if (req.employee.must_change_password) throw new BadgeError(403, 'PASSWORD_CHANGE_REQUIRED', 'Scegli prima la tua nuova password.');
    await siteByQR(req.body.qrToken);
    const id = uuid(req.body.requestId);
    if (!['in', 'out'].includes(req.body.action)) invalid('Seleziona ingresso o uscita.');
    const device = security.deviceHash(req.body.deviceToken);
    if (device !== req.badgeSession.device) throw new BadgeError(401, 'DEVICE_CHANGED', 'Accedi nuovamente da questo browser.');
    res.json({ challenge: security.sign({
      jti: id, qr: req.body.qrToken, action: req.body.action, device, version: req.employee.session_version,
    }, CHALLENGE_AUDIENCE, '2m', req.employee.id) });
  }));

  router.post('/punch', requireEmployee, run(async (req, res) => {
    await throttle('punch:' + req.employee.id, 30, 60);
    let challenge;
    try { challenge = security.verify(req.body.challenge, CHALLENGE_AUDIENCE); }
    catch { throw new BadgeError(409, 'CHALLENGE_EXPIRED', 'Richiesta scaduta. Aggiorna lo stato e riprova.'); }
    const device = security.deviceHash(req.body.deviceToken);
    if (challenge.sub !== req.employee.id || challenge.device !== device || device !== req.badgeSession.device || challenge.version !== req.employee.session_version) throw new BadgeError(401, 'DEVICE_CHANGED', 'Accedi nuovamente da questo browser.');
    const position = positionInput(req.body);
    const receipt = await rpcRecord('badge_punch', {
      p_id: uuid(challenge.jti), p_employee: req.employee.id, p_session_version: req.employee.session_version,
      p_qr: challenge.qr, p_action: challenge.action, p_latitude: position.latitude, p_longitude: position.longitude,
      p_accuracy: position.accuracy, p_device: device, p_user_agent: (req.get('user-agent') || '').slice(0, 250),
    });
    res.json({ receipt });
  }));

  router.get('/receipts/:id', requireEmployee, run(async (req, res) => {
    const receipt = checked(await db.from('badge_events').select('*').eq('id', uuid(req.params.id)).eq('employee_id', req.employee.id).maybeSingle());
    if (!receipt) throw new BadgeError(404, 'RECEIPT_NOT_FOUND', 'Timbratura non trovata.');
    res.json({ receipt });
  }));

  router.use('/admin', requireAdmin);

  router.get('/admin/geocode', run(async (req, res) => {
    const query = textField(req.query.q, 'Indirizzo da cercare', 4, 250);
    await throttle('geocode-admin:' + req.admin.id, 30, 60);
    const results = await searchAddresses(query, async () => {
      const allowed = await rpc('badge_rate_limit', { p_key: security.rateKey('geocode-provider'), p_limit: 1, p_seconds: 1 });
      if (!allowed) throw new BadgeError(429, 'GEOCODER_BUSY', 'Attendi un secondo e riprova la ricerca.');
    });
    res.json({ data: results });
  }));

  router.get('/admin/sites', run(async (req, res) => {
    res.json({ data: await allRows(() => db.from('badge_sites').select('*').order('created_at').order('id')) });
  }));
  router.patch('/admin/sites/:id/schedule', run(async () => {
    throw new BadgeError(410, 'EMPLOYEE_SCHEDULE_REQUIRED', 'Imposta giorni e orari sul singolo dipendente in Dipendenti → Giorni e orari.');
  }));
  router.get('/admin/statistics', run(async (req, res) => {
    const filters = statisticsFilters(req.query);
    const data = await rpc('badge_employee_statistics', {
      p_from: filters.from, p_to: filters.to, p_site: filters.site, p_employee: filters.employee,
    });
    res.json({ ...data, period: { year: filters.year, quarter: filters.quarter, from: filters.from, to: filters.to } });
  }));
  for (const [method, path, action] of [
    ['post', '/admin/sites', 'create'], ['put', '/admin/sites/:id', 'update'],
    ['post', '/admin/sites/:id/rotate', 'rotate'], ['delete', '/admin/sites/:id', 'archive'],
  ]) {
    router[method](path, run(async (req, res) => {
      const data = ['create', 'update'].includes(action) ? siteInput(req.body) : {};
      const site = await rpcRecord('badge_manage_site', { p_admin: req.admin.id, p_action: action, p_id: req.params.id ? uuid(req.params.id) : null, p_data: data });
      res.status(action === 'create' ? 201 : 200).json({ data: site });
    }));
  }

  router.get('/admin/employees', run(async (req, res) => {
    const employees = await allRows(() => db.from('badge_employees').select(EMPLOYEE_FIELDS + ',first_device_hash').order('last_name').order('id'));
    const schedules = await allRows(() => db.from('badge_employee_schedules').select('*').order('employee_id').order('weekday'));
    const devices = await allRows(() => db.from('badge_devices').select('*').order('device_hash').order('employee_id'));
    const deviceUsers = new Map();
    for (const device of devices) {
      if (!deviceUsers.has(device.device_hash)) deviceUsers.set(device.device_hash, new Set());
      deviceUsers.get(device.device_hash).add(device.employee_id);
    }
    res.json({ data: employees.map(employee => {
      const ownDevices = devices.filter(device => device.employee_id === employee.id);
      const sharedIds = new Set(ownDevices.flatMap(device => [...deviceUsers.get(device.device_hash)]));
      return {
        ...employee, device_count: ownDevices.length,
        schedule: schedules.filter(day => day.employee_id === employee.id).map(day => ({
          weekday: day.weekday, expected_start: day.expected_start.slice(0, 5), expected_end: day.expected_end.slice(0, 5),
          break_start: day.break_start?.slice(0, 5) || null, break_end: day.break_end?.slice(0, 5) || null,
        })),
        shared_with: employees.filter(other => other.id !== employee.id && sharedIds.has(other.id)).map(other => other.first_name + ' ' + other.last_name),
      };
    }) });
  }));

  router.patch('/admin/employees/:id/schedule', run(async (req, res) => {
    const data = await rpc('badge_set_employee_schedule', { p_admin: req.admin.id, p_employee: uuid(req.params.id), p_days: employeeScheduleInput(req.body) });
    res.json({ data });
  }));

  router.get('/admin/events/:id', run(async (req, res) => {
    const data = await rpc('badge_event_detail', { p_event: uuid(req.params.id) });
    if (!data) throw new BadgeError(404, 'EVENT_NOT_FOUND', DATABASE_ERRORS.EVENT_NOT_FOUND[1]);
    res.json(data);
  }));
  for (const method of ['patch', 'delete']) router[method]('/admin/events/:id', run(async (req, res) => {
    const id = uuid(req.params.id);
    if (!Number.isSafeInteger(req.body.revision) || req.body.revision < 0) invalid('Versione della timbratura non valida.');
    const original = await rpc('badge_event_detail', { p_event: id });
    if (!original) throw new BadgeError(404, 'EVENT_NOT_FOUND', DATABASE_ERRORS.EVENT_NOT_FOUND[1]);
    const data = await rpc('badge_adjust_event', { p_admin: req.admin.id, p_event: id, p_revision: req.body.revision,
      p_at: method === 'patch' ? correctionTime(req.body.local_time, original.occurred_at) : null,
      p_delete: method === 'delete', p_paired_exit: req.body.paired_exit ? uuid(req.body.paired_exit) : null,
      p_reason: textField(req.body.reason, 'Motivo della modifica', 5, 500) });
    res.json(data);
  }));

  router.patch('/admin/employees/:id', run(async (req, res) => {
    if (!['active', 'suspended'].includes(req.body.status)) invalid('Stato non valido.');
    await rpc('badge_manage_employee', { p_admin: req.admin.id, p_id: uuid(req.params.id), p_status: req.body.status, p_password_hash: null });
    res.json({ success: true });
  }));

  router.post('/admin/employees/:id/reset-password', run(async (req, res) => {
    const temporaryPassword = randomBytes(12).toString('base64url');
    await rpc('badge_manage_employee', { p_admin: req.admin.id, p_id: uuid(req.params.id), p_status: null, p_password_hash: await bcrypt.hash(temporaryPassword, 12) });
    res.json({ temporaryPassword });
  }));

  router.post('/admin/employees/:id/close-entry', run(async (req, res) => {
    await rpc('badge_close_entry', { p_admin: req.admin.id, p_employee: uuid(req.params.id),
      p_reason: textField(req.body.reason, 'Motivo della chiusura', 5, 500) });
    res.json({ success: true });
  }));

  function reportQuery(filters, count) {
    let query = db.from('badge_event_report').select('*', count ? { count: 'exact' } : undefined)
      .gte('occurred_at', filters.from).lt('occurred_at', filters.to)
      .order('occurred_at', { ascending: false }).order('id');
    if (filters.site) query = query.eq('site_id', filters.site);
    if (filters.employee) query = query.eq('employee_id', filters.employee);
    if (filters.outcome) query = query.eq('outcome', filters.outcome);
    if (filters.flagged) query = query.not('anomaly_flags', 'eq', '{}');
    return query;
  }

  router.get('/admin/reports', run(async (req, res) => {
    const filters = reportFilters(req.query);
    const result = await reportQuery(filters, true).range((filters.page - 1) * 50, filters.page * 50 - 1);
    const events = checked(result);
    const summary = await rpc('badge_report_summary', {
      p_from: filters.from, p_to: filters.to, p_site: filters.site, p_employee: filters.employee,
      p_outcome: filters.outcome, p_flagged: filters.flagged,
    });
    const present = await allRows(() => {
      let query = db.from('badge_employees').select('id,first_name,last_name,job_role,current_entry_at,current_site_id')
        .not('current_site_id', 'is', null).order('current_entry_at').order('id');
      if (filters.site) query = query.eq('current_site_id', filters.site);
      if (filters.employee) query = query.eq('id', filters.employee);
      return query;
    });
    res.json({ data: events, total: result.count, page: filters.page, pageSize: 50, summary, present });
  }));

  router.get('/admin/reports.csv', run(async (req, res) => {
    const filters = reportFilters(req.query);
    // Freeze the upper time bound while paging a report for the current day.
    filters.to = new Date(Math.min(new Date(filters.to).getTime(), Date.now())).toISOString();
    const rows = await allRows(() => reportQuery(filters, false));
    const date = value => new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value));
    const headers = ['ID', 'Dipendente', 'Data nascita', 'Mansione', 'Sede', 'Azione', 'Data e ora Europe/Rome', 'Data e ora UTC', 'Esito', 'Motivo', 'Latitudine', 'Longitudine', 'Precisione m', 'Distanza m', 'ID browser', 'Browser', 'Anomalie', 'Durata secondi', 'Sede ingresso', 'Nota chiusura amministrativa'];
    const contents = [headers, ...rows.map(row => [
      row.id, row.employee_name, row.birth_date, row.job_role, row.site_name, row.action === 'in' ? 'Ingresso' : 'Uscita',
      date(row.occurred_at), row.occurred_at, row.outcome === 'accepted' ? 'Accettata' : 'Respinta',
      row.reason, row.latitude, row.longitude, row.accuracy_m, Math.round(row.distance_m), row.device_hash,
      row.user_agent, row.anomaly_flags.join(', '), row.duration_seconds, row.entry_site_name, row.adjustment_note,
    ])].map(row => row.map(csvCell).join(';')).join('\r\n');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="presenze.csv"');
    res.send('\ufeff' + contents);
  }));

  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(error instanceof BadgeError ? error.status : 500).json({
      code: error instanceof BadgeError ? error.code : 'BADGING_ERROR',
      message: error instanceof BadgeError ? error.message : 'Operazione non riuscita. Riprova tra poco.',
    });
  });
  return router;
}
