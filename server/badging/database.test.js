import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

let db;
const admin = randomUUID();
const employee = randomUUID();
const other = randomUUID();
const siteId = randomUUID();
const qr = 'a'.repeat(64);
const device = 'b'.repeat(64);
const query = (sql, params = []) => db.query(sql, params);
const one = async (sql, params) => (await query(sql, params)).rows[0];

before(async () => {
  db = new PGlite();
  await db.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE TABLE admin_users (id uuid PRIMARY KEY, role text, is_active boolean); GRANT SELECT ON admin_users TO service_role;");
  await db.exec(await readFile(new URL('../../database/badging.sql', import.meta.url), 'utf8'));
  // Applying the schema again must preserve data and remain valid.
  await db.exec(await readFile(new URL('../../database/badging.sql', import.meta.url), 'utf8'));
  await query("INSERT INTO admin_users VALUES ($1, 'admin', true)", [admin]);
  await query("INSERT INTO badge_sites (id, name, address, latitude, longitude, qr_token) VALUES ($1, 'Cantiere A', 'Via A', 40, 14, $2)", [siteId, qr]);
  for (const [id, phone] of [[employee, '+393331234567'], [other, '+393331234568']]) {
    await query("INSERT INTO badge_employees (id, first_name, last_name, birth_date, job_role, phone, password_hash, status) VALUES ($1, 'Test', 'Dipendente', '1990-01-01', 'Operaio', $2, 'test-only', 'active')", [id, phone]);
  }
});
after(async () => { await db?.close(); });

async function punch(options = {}) {
  const values = { id: randomUUID(), employee, version: 0, qr, action: 'in', lat: 40, lon: 14, accuracy: 10, device, ...options };
  return one('SELECT * FROM badge_punch($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [values.id, values.employee, values.version, values.qr, values.action, values.lat, values.lon, values.accuracy, values.device, 'Test browser']);
}

test('unauthenticated Supabase roles cannot read PII or call attendance functions', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec('SET ROLE ' + role);
    try {
      await assert.rejects(() => query('SELECT * FROM badge_employees'), /permission denied/);
      await assert.rejects(() => query('SELECT * FROM badge_event_report'), /permission denied/);
      await assert.rejects(() => punch(), /permission denied/);
    } finally { await db.exec('RESET ROLE'); }
  }
  await db.exec('SET ROLE service_role');
  try {
    await query('SELECT * FROM badge_event_report');
    await assert.rejects(() => query('UPDATE badge_events SET outcome = outcome'), /permission denied/);
    await assert.rejects(() => query('DELETE FROM badge_admin_audit'), /permission denied/);
  } finally { await db.exec('RESET ROLE'); }
});

test('missing/invalid GPS, inactive QR, pending account and stale sessions cannot stamp', async () => {
  await assert.rejects(() => punch({ lat: null }), /INVALID_INPUT/);
  await assert.rejects(() => punch({ lat: NaN }), /INVALID_INPUT/);
  await assert.rejects(() => punch({ qr: '0'.repeat(64) }), /QR_INACTIVE/);
  await assert.rejects(() => punch({ version: 9 }), /EMPLOYEE_NOT_ACTIVE/);
  await query("UPDATE badge_employees SET status = 'pending' WHERE id = $1", [employee]);
  await assert.rejects(() => punch(), /EMPLOYEE_NOT_ACTIVE/);
  await query("UPDATE badge_employees SET status = 'active' WHERE id = $1", [employee]);
  const inaccurate = await punch({ accuracy: 101 });
  assert.equal(inaccurate.outcome, 'rejected');
  assert.equal(inaccurate.reason, 'low_accuracy');
  const remote = await punch({ lat: 41 });
  assert.equal(remote.reason, 'outside_zone');
  assert.equal((await one('SELECT current_site_id FROM badge_employees WHERE id=$1', [employee])).current_site_id, null);
});

test('entry/exit are sequenced, server-timed and duplicate request IDs return the original receipt', async () => {
  const id = randomUUID();
  const before = Date.now();
  const entry = await punch({ id });
  assert.equal(entry.outcome, 'accepted');
  assert.ok(new Date(entry.occurred_at).getTime() >= before - 1000);
  assert.equal((await punch({ id })).id, id);
  assert.equal((await one('SELECT count(*)::int AS n FROM badge_events WHERE id=$1', [id])).n, 1);
  assert.equal((await punch()).reason, 'already_in');
  await assert.rejects(() => punch({ id, employee: other }), /REQUEST_CONFLICT/);
  const exit = await punch({ action: 'out' });
  assert.equal(exit.outcome, 'accepted');
  assert.ok(exit.duration_seconds >= 0);
  assert.equal((await punch({ action: 'out' })).reason, 'not_in');
});

test('sharing a browser flags both accounts retrospectively; a new browser is flagged', async () => {
  await punch({ employee: other });
  const reports = (await query('SELECT * FROM badge_event_report WHERE employee_id=$1', [employee])).rows;
  assert.ok(reports.length > 0 && reports.every(row => row.anomaly_flags.includes('shared_device')));
  const changed = await punch({ device: 'c'.repeat(64) });
  assert.ok(changed.flags.includes('new_device'));
  await punch({ action: 'out', device: 'c'.repeat(64) });
  await punch({ employee: other, action: 'out' });
});

test('flag mode keeps outside-zone stamps visible and separate from blocked attempts', async () => {
  await query("UPDATE badge_sites SET outside_policy='flag' WHERE id=$1", [siteId]);
  const entry = await punch({ lat: 40.01 });
  assert.equal(entry.outcome, 'accepted');
  assert.ok(entry.flags.includes('outside_zone'));
  await punch({ action: 'out' });
  await query("UPDATE badge_sites SET outside_policy='block' WHERE id=$1", [siteId]);
});

test('late exits at a different site remain possible and carry explicit anomaly flags', async () => {
  const secondQR = 'd'.repeat(64);
  await query("INSERT INTO badge_sites (name,address,latitude,longitude,qr_token) VALUES ('Cantiere B','Via B',40.1,14,$1)", [secondQR]);
  await punch();
  await query("UPDATE badge_employees SET current_entry_at=clock_timestamp()-interval '17 hours' WHERE id=$1", [employee]);
  const exit = await punch({ action: 'out', qr: secondQR, lat: 40.1 });
  assert.equal(exit.outcome, 'accepted');
  assert.equal(exit.entry_site_name, 'Cantiere A');
  for (const flag of ['long_shift', 'different_exit_site', 'rapid_site_change']) assert.ok(exit.flags.includes(flag));
  assert.ok(exit.duration_seconds >= 17 * 3600);
  assert.equal((await one('SELECT current_site_id FROM badge_employees WHERE id=$1', [employee])).current_site_id, null);
});

test('management is audited; rotating invalidates old QR, archiving keeps history and requires no open presence', async () => {
  await assert.rejects(() => query("SELECT * FROM badge_manage_site($1,'rotate',$2,'{}')", [randomUUID(), siteId]), /ADMIN_REQUIRED/);
  await punch();
  await assert.rejects(() => query("SELECT * FROM badge_manage_site($1,'archive',$2,'{}')", [admin, siteId]), /SITE_OCCUPIED/);
  await punch({ action: 'out' });
  const rotated = await one("SELECT * FROM badge_manage_site($1,'rotate',$2,'{}')", [admin, siteId]);
  assert.notEqual(rotated.qr_token, qr);
  await assert.rejects(() => punch(), /QR_INACTIVE/);
  await query("SELECT * FROM badge_manage_site($1,'archive',$2,'{}')", [admin, siteId]);
  await assert.rejects(() => punch({ qr: rotated.qr_token }), /QR_INACTIVE/);
  assert.ok((await one('SELECT count(*)::int AS n FROM badge_events')).n > 0);
  assert.equal((await one('SELECT count(*)::int AS n FROM badge_admin_audit')).n, 2);
});

test('report summaries count the whole filter set and exclude rejected attempts from hours', async () => {
  const summary = (await one("SELECT badge_report_summary('2000-01-01','2100-01-01',NULL,NULL,NULL,false) AS result")).result;
  const counts = await one("SELECT count(*)::int AS events, count(*) FILTER(WHERE outcome='rejected')::int AS rejected, sum(duration_seconds) FILTER(WHERE outcome='accepted') AS seconds FROM badge_events");
  assert.equal(summary.events, counts.events);
  assert.equal(summary.rejected, counts.rejected);
  assert.equal(Number(summary.completed_seconds), Number(counts.seconds));
  const filtered = (await one("SELECT badge_report_summary('2000-01-01','2100-01-01',$1,$2,'rejected',false) AS result", [siteId, employee])).result;
  assert.equal(filtered.entries, 0);
  assert.equal(filtered.exits, 0);
  assert.equal(filtered.completed_seconds, 0);
});

test('persistent throttling blocks attempts across calls, and status/password changes revoke sessions', async () => {
  assert.equal((await one("SELECT badge_rate_limit('test',2,900) AS allowed")).allowed, true);
  assert.equal((await one("SELECT badge_rate_limit('test',2,900) AS allowed")).allowed, true);
  assert.equal((await one("SELECT badge_rate_limit('test',2,900) AS allowed")).allowed, false);
  await query('SELECT badge_manage_employee($1,$2,$3,NULL)', [admin, employee, 'suspended']);
  const emp = await one('SELECT status,session_version FROM badge_employees WHERE id=$1', [employee]);
  assert.equal(emp.status, 'suspended');
  assert.equal(emp.session_version, 1);
  await query('SELECT badge_manage_employee($1,$2,NULL,$3)', [admin, employee, '$2b$12$test']);
  assert.equal((await one('SELECT must_change_password FROM badge_employees WHERE id=$1', [employee])).must_change_password, true);
});
