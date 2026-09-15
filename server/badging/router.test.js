import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { createBadgeRouter } from './router.js';
import { fixture, TEST_SECRET, TEST_ADMIN, TEST_EDITOR, TEST_EMPLOYEE, TEST_SITE, TEST_QR, TEST_PASSWORD, verifyAdmin, adminToken } from './test-support.js';

let harness, server, base, token, device, entryId;
async function call(path, options = {}) {
  const response = await fetch(base + path, {
    method: options.method || (options.body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: 'Bearer ' + options.token } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = response.headers.get('content-type').includes('text/csv') ? await response.text() : await response.json();
  return { status: response.status, data, headers: response.headers };
}
before(async () => {
  harness = await fixture();
  const app = express();
  app.use(express.json());
  app.use(createBadgeRouter({ db: harness.db, secret: TEST_SECRET, verifyAdminToken: verifyAdmin }));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => { await new Promise(resolve => server?.close(resolve)); await harness?.pg.close(); });

test('public site exposes only its name/address; staff data and CMS operations require a live admin account', async () => {
  const site = await call('/sites/' + TEST_QR);
  assert.equal(site.status, 200);
  assert.deepEqual(Object.keys(site.data).sort(), ['address', 'id', 'name']);
  assert.equal(site.headers.get('cache-control'), 'no-store');
  for (const path of ['/admin/sites', '/admin/employees', '/admin/reports', '/admin/reports.csv']) assert.equal((await call(path)).status, 401);
  assert.equal((await call('/admin/sites', { token: adminToken(randomUUID()) })).status, 403);
  assert.equal((await call('/admin/employees', { token: adminToken(TEST_EDITOR) })).status, 403);
});

test('registration cannot self-approve or grant CMS privileges and pending users cannot log in', async () => {
  device = (await call('/device', { body: {} })).data.deviceToken;
  const registered = await call('/register', { body: {
    qrToken: TEST_QR, deviceToken: device, first_name: 'Mario', last_name: 'Esempio', birth_date: '1991-02-01',
    phone: '+393331234568', job_role: 'Operaio', password: TEST_PASSWORD, status: 'active', role: 'super_admin',
  } });
  assert.equal(registered.status, 201);
  const result = await call('/login', { body: { phone: '+393331234568', password: TEST_PASSWORD, deviceToken: device } });
  assert.equal(result.status, 403);
  assert.equal(result.data.code, 'EMPLOYEE_PENDING');
  const employees = (await call('/admin/employees', { token: adminToken() })).data.data;
  const employee = employees.find(person => person.phone === '+393331234568');
  assert.equal(employee.status, 'pending');
  assert.equal(employee.password_hash, undefined);
  assert.equal(employee.session_version, undefined);
});

test('employee authentication is isolated; forged browser identifiers and admin tokens fail', async () => {
  assert.equal((await call('/me', { token: adminToken() })).status, 401);
  assert.equal((await call('/login', { body: { phone: '+393331234567', password: TEST_PASSWORD, deviceToken: 'fake' } })).status, 401);
  const login = await call('/login', { body: { phone: '333 1234567', password: TEST_PASSWORD, deviceToken: device } });
  assert.equal(login.status, 200);
  token = login.data.token;
  assert.equal((await call('/admin/employees', { token })).status, 401);
  assert.equal((await call('/me', { token })).data.employee.id, TEST_EMPLOYEE);
});

test('challenge binds account, action, QR and browser; GPS cannot be skipped and timestamps cannot be backdated', async () => {
  const requestId = randomUUID();
  entryId = requestId;
  const challenge = (await call('/challenge', { token, body: { qrToken: TEST_QR, deviceToken: device, action: 'in', requestId } })).data.challenge;
  assert.ok(challenge);
  assert.equal((await call('/punch', { token, body: { challenge, deviceToken: device } })).status, 400);
  const secondDevice = (await call('/device', { body: {} })).data.deviceToken;
  assert.equal((await call('/punch', { token, body: { challenge, deviceToken: secondDevice, latitude: 40, longitude: 14, accuracy: 10 } })).status, 401);
  const body = { challenge, deviceToken: device, latitude: 40, longitude: 14, accuracy: 10, occurred_at: '2000-01-01', employee_id: randomUUID(), action: 'out' };
  const stamp = await call('/punch', { token, body });
  assert.equal(stamp.status, 200);
  assert.equal(stamp.data.receipt.employee_id, TEST_EMPLOYEE);
  assert.equal(stamp.data.receipt.action, 'in');
  assert.equal(stamp.data.receipt.outcome, 'accepted');
  assert.ok(new Date(stamp.data.receipt.occurred_at).getTime() > Date.now() - 60000);
  assert.equal((await call('/punch', { token, body })).data.receipt.id, requestId);
  assert.equal((await call('/receipts/' + requestId, { token })).data.receipt.id, requestId);
  assert.equal((await call('/me', { token })).data.employee.current_site_id, TEST_SITE);
});

test('admin creates, updates, rotates and archives QR sites without affecting the existing site', async () => {
  const auth = adminToken();
  const created = await call('/admin/sites', { token: auth, body: { name: 'Ufficio test', address: 'Via Test', latitude: 41, longitude: 15, radius_m: 200, max_accuracy_m: 100, outside_policy: 'block' } });
  assert.equal(created.status, 201);
  const site = created.data.data;
  assert.equal((await call('/sites/' + site.qr_token)).status, 200);
  const changed = await call('/admin/sites/' + site.id, { token: auth, method: 'PUT', body: { ...site, name: 'Nuovo nome', qr_token: 'f'.repeat(64) } });
  assert.equal(changed.data.data.qr_token, site.qr_token);
  const rotated = await call('/admin/sites/' + site.id + '/rotate', { token: auth, body: {} });
  assert.notEqual(rotated.data.data.qr_token, site.qr_token);
  assert.equal((await call('/sites/' + site.qr_token)).status, 404);
  assert.equal((await call('/admin/sites/' + site.id, { token: auth, method: 'DELETE' })).status, 200);
  assert.equal((await call('/sites/' + TEST_QR)).status, 200);
});

test('reports and CSV respect filters, show authoritative records, and reject invalid input', async () => {
  const auth = adminToken();
  const report = await call('/admin/reports', { token: auth });
  assert.equal(report.status, 200);
  assert.equal(report.data.summary.entries, 1);
  assert.equal(report.data.present.length, 1);
  assert.equal(report.data.total, 1);
  const csv = await call('/admin/reports.csv', { token: auth });
  assert.equal(csv.status, 200);
  assert.match(csv.data, /Anna Esempio/);
  assert.match(csv.data, /Europe\/Rome/);
  assert.equal((await call('/admin/reports?from=2026-02-30', { token: auth })).status, 400);
  const filtered = await call('/admin/reports?outcome=rejected', { token: auth });
  assert.equal(filtered.data.total, 0);
  assert.equal(filtered.data.summary.entries, 0);
});

test('reports paginate and CSV exports every matching row beyond the Supabase response cap', async () => {
  await harness.pg.query("INSERT INTO badge_events SELECT gen_random_uuid(), employee_id, site_id, action, occurred_at, outcome, reason, latitude, longitude, accuracy_m, distance_m, device_hash, user_agent, flags, '=TEST FORMULA', birth_date, job_role, site_name, duration_seconds, entry_site_name FROM badge_events CROSS JOIN generate_series(1,1005) WHERE id=(SELECT id FROM badge_events LIMIT 1)");
  const report = await call('/admin/reports?page=2', { token: adminToken() });
  assert.equal(report.data.total, 1006);
  assert.equal(report.data.data.length, 50);
  assert.equal(report.data.summary.entries, 1006);
  const csv = await call('/admin/reports.csv', { token: adminToken() });
  assert.equal(csv.status, 200);
  assert.equal(csv.data.split('\r\n').length, 1007);
  assert.match(csv.data, /"'=TEST FORMULA"/);
});

test('password recovery revokes old sessions and requires a new password before another punch', async () => {
  const reset = await call('/admin/employees/' + TEST_EMPLOYEE + '/reset-password', { token: adminToken(), body: {} });
  assert.equal(reset.status, 200);
  assert.ok(reset.data.temporaryPassword.length >= 10);
  assert.equal((await call('/me', { token })).status, 401);
  const credentials = { phone: '+393331234567', password: reset.data.temporaryPassword, deviceToken: device };
  const temporarySession = (await call('/login', { body: credentials })).data.token;
  assert.ok(temporarySession);
  const blocked = await call('/challenge', { token: temporarySession, body: {
    qrToken: TEST_QR, deviceToken: device, action: 'out', requestId: randomUUID(),
  } });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.data.code, 'PASSWORD_CHANGE_REQUIRED');
  assert.equal((await call('/password', { token: temporarySession, body: {
    currentPassword: reset.data.temporaryPassword, password: 'NuovaPasswordSoloLocale42',
  } })).status, 200);
  assert.equal((await call('/me', { token: temporarySession })).status, 401);
  const newSession = (await call('/login', { body: { ...credentials, password: 'NuovaPasswordSoloLocale42' } })).data.token;
  assert.equal((await call('/me', { token: newSession })).data.employee.must_change_password, false);
});

test('manual closure requires an admin and a reason, keeps the original record, and never invents an exit or GPS', async () => {
  const path = '/admin/employees/' + TEST_EMPLOYEE + '/close-entry';
  assert.equal((await call(path, { token, body: { reason: 'Uscita dimenticata verificata' } })).status, 401);
  assert.equal((await call(path, { token: adminToken(), body: { reason: ' ' } })).status, 400);
  assert.equal((await call(path, { token: adminToken(), body: { reason: 'Uscita dimenticata verificata' } })).status, 200);
  const report = await call('/admin/reports?flagged=true', { token: adminToken() });
  assert.equal(report.data.total, 1);
  assert.equal(report.data.data[0].adjustment_note, 'Uscita dimenticata verificata');
  assert.equal(report.data.data[0].id, entryId);
  assert.ok(report.data.data[0].anomaly_flags.includes('entry_closed_manually'));
  assert.equal(report.data.data[0].action, 'in');
  assert.equal(report.data.present.length, 0);
  assert.equal(report.data.summary.completed_seconds, 0);
  assert.equal((await call(path, { token: adminToken(), body: { reason: 'Seconda chiusura da bloccare' } })).status, 409);
});

test('admin revocation takes effect without waiting for the JWT to expire', async () => {
  await harness.pg.exec('RESET ROLE');
  await harness.pg.query('UPDATE admin_users SET is_active=false WHERE id=$1', [TEST_ADMIN]);
  await harness.pg.exec('SET ROLE service_role');
  assert.equal((await call('/admin/reports', { token: adminToken() })).status, 403);
});
