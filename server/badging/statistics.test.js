import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { createBadgeRouter } from './router.js';
import { fixture, TEST_SECRET, TEST_ADMIN, TEST_EDITOR, TEST_EMPLOYEE, TEST_SITE, verifyAdmin, adminToken } from './test-support.js';

let harness, server, base;
const otherSite = '30000000-0000-4000-8000-000000000002';
const otherEmployee = '20000000-0000-4000-8000-000000000002';
const quarter = '?site=' + TEST_SITE + '&year=2026&quarter=1';
async function call(path, options = {}) {
  const response = await fetch(base + path, {
    method: options.body ? 'PATCH' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: 'Bearer ' + options.token } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { status: response.status, data: await response.json(), cache: response.headers.get('cache-control') };
}
async function event(employee, site, action, at, duration = null, flags = [], outcome = 'accepted') {
  const id = randomUUID();
  await harness.pg.query(`INSERT INTO badge_events
    (id,employee_id,site_id,action,occurred_at,outcome,reason,latitude,longitude,accuracy_m,distance_m,device_hash,user_agent,employee_name,birth_date,job_role,site_name,duration_seconds,flags)
    VALUES ($1,$2,$3,$4,$5,$6,$7,40,14,10,0,$8,'Test statistiche','Nome storico','1990-01-01','Ruolo storico','Sede storica',$9,$10)`,
  [id, employee, site, action, at, outcome, outcome === 'rejected' ? 'outside_zone' : null, 'a'.repeat(64), duration, flags]);
  return id;
}
async function shift(employee, site, start, end, exitSite = site) {
  await event(employee, site, 'in', start);
  await event(employee, exitSite, 'out', end, Math.floor((new Date(end) - new Date(start)) / 1000), exitSite !== site ? ['different_exit_site'] : []);
}
before(async () => {
  harness = await fixture();
  await harness.pg.query("INSERT INTO badge_sites (id,name,address,latitude,longitude) VALUES ($1,'Ufficio separato','Dati locali',40,14)", [otherSite]);
  await harness.pg.query("INSERT INTO badge_employees (id,first_name,last_name,birth_date,job_role,phone,password_hash,status) VALUES ($1,'Bruno','Esempio','1990-01-01','Operaio','+393331234568','hash-locale','active')", [otherEmployee]);
  // Anna: 2 days, 15 hours. Split shifts must not overweight daily clock averages.
  await shift(TEST_EMPLOYEE, TEST_SITE, '2026-01-05T08:00:00+01:00', '2026-01-05T12:00:00+01:00');
  await shift(TEST_EMPLOYEE, TEST_SITE, '2026-01-05T13:00:00+01:00', '2026-01-05T17:00:00+01:00');
  await shift(TEST_EMPLOYEE, TEST_SITE, '2026-01-06T09:00:00+01:00', '2026-01-06T16:00:00+01:00');
  await event(TEST_EMPLOYEE, TEST_SITE, 'in', '2026-01-06T07:00:00+01:00', null, [], 'rejected');
  await shift(TEST_EMPLOYEE, otherSite, '2026-01-07T08:00:00+01:00', '2026-01-07T18:00:00+01:00');
  await shift(otherEmployee, TEST_SITE, '2026-01-05T08:00:00+01:00', '2026-01-05T12:00:00+01:00');
  const app = express(); app.use(express.json()); app.use(createBadgeRouter({ db: harness.db, secret: TEST_SECRET, verifyAdminToken: verifyAdmin }));
  server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => { await new Promise(resolve => server?.close(resolve)); await harness?.pg.close(); });

test('quarter statistics and schedule settings require a live admin; filters are strict', async () => {
  assert.equal((await call('/admin/statistics' + quarter)).status, 401);
  assert.equal((await call('/admin/statistics' + quarter, { token: adminToken(TEST_EDITOR) })).status, 403);
  for (const query of ['?year=2026&quarter=1', quarter + '&quarter=2', quarter.replace('quarter=1', 'quarter=5'), quarter.replace('year=2026', 'year=invalid')]) {
    assert.equal((await call('/admin/statistics' + query, { token: adminToken() })).status, 400);
  }
  assert.equal((await call('/admin/sites/' + TEST_SITE + '/schedule', { body: { expected_start: '08:00', expected_end: '17:00' } })).status, 401);
});

test('whole-quarter totals, first/last daily averages, monthly sums and employee history remain separated by QR', async () => {
  const result = await call('/admin/statistics' + quarter, { token: adminToken() });
  assert.equal(result.status, 200); assert.equal(result.cache, 'no-store');
  assert.equal(result.data.summary.worked_seconds, 19 * 3600);
  assert.equal(result.data.summary.presence_days, 3);
  assert.equal(result.data.months.length, 3);
  assert.equal(result.data.months[0].worked_seconds, 19 * 3600);
  const anna = result.data.employees.find(e => e.employee_id === TEST_EMPLOYEE);
  assert.equal(anna.presence_days, 2); assert.equal(anna.worked_seconds, 15 * 3600);
  assert.equal(Math.round(anna.average_entry_seconds), 8.5 * 3600);
  assert.equal(Math.round(anna.average_exit_seconds), 16.5 * 3600);
  assert.equal(anna.late_days, null); assert.equal(anna.early_days, null);
  assert.equal(result.data.days, null);
  const detail = await call('/admin/statistics' + quarter + '&employee=' + TEST_EMPLOYEE, { token: adminToken() });
  assert.equal(detail.data.days.length, 2);
  assert.equal(detail.data.days.find(d => d.date === '2026-01-05').intervals.length, 2);
  const office = await call('/admin/statistics' + quarter.replace(TEST_SITE, otherSite), { token: adminToken() });
  assert.equal(office.data.summary.worked_seconds, 10 * 3600);
});

test('personal weekdays and lunch persist, avoid double deductions, and never configure colleagues', async () => {
  const path = '/admin/employees/' + TEST_EMPLOYEE + '/schedule';
  const days = [1,2].map(weekday => ({ weekday, expected_start: '08:00', expected_end: '17:00', break_start: '12:00', break_end: '13:00' }));
  const saved = await call(path, { token: adminToken(), body: { days } });
  assert.equal(saved.status, 200);
  const result = (await call('/admin/statistics' + quarter, { token: adminToken() })).data;
  const anna = result.employees.find(e => e.employee_id === TEST_EMPLOYEE);
  const bruno = result.employees.find(e => e.employee_id === otherEmployee);
  assert.equal(anna.worked_seconds, 14 * 3600); // Monday already punched out for lunch.
  assert.equal(anna.break_seconds, 3600);
  assert.equal(anna.late_days, 1); assert.equal(anna.early_days, 1);
  assert.equal(bruno.late_days, null); assert.equal(bruno.worked_seconds, 4 * 3600);
  const detail = (await call('/admin/statistics' + quarter + '&employee=' + TEST_EMPLOYEE, { token: adminToken() })).data;
  assert.deepEqual(detail.employee_schedule, days);
  const people = (await call('/admin/employees', { token: adminToken() })).data.data;
  assert.deepEqual(people.find(e => e.id === TEST_EMPLOYEE).schedule, days);
  for (const invalidDays of [[...days, days[0]], [{...days[0],weekday:8}], [{...days[0],break_end:null}], [{...days[0],break_start:'07:00'}]]) {
    assert.equal((await call(path, { token: adminToken(), body: { days: invalidDays } })).status, 400);
  }
  assert.equal((await call(path, { token: adminToken(TEST_EDITOR), body: { days: [] } })).status, 403);
  assert.equal((await call(path, { token: adminToken(), body: { days: [] } })).status, 200);
  const unset = (await call('/admin/statistics' + quarter, { token: adminToken() })).data;
  assert.equal(unset.employees[0].late_days, null);
  assert.equal(unset.summary.worked_seconds, 19 * 3600);
});

test('cross-site exits, long intervals, open and manually closed entries are visible without inflating worked hours', async () => {
  const employee = randomUUID();
  await harness.pg.query("INSERT INTO badge_employees (id,first_name,last_name,birth_date,job_role,phone,password_hash,status) VALUES ($1,'Casi','Limite','1990-01-01','Operaio','+393331234569','hash-locale','active')", [employee]);
  await shift(employee, TEST_SITE, '2026-02-02T08:00:00+01:00', '2026-02-02T16:00:00+01:00', otherSite);
  await shift(employee, TEST_SITE, '2026-02-03T08:00:00+01:00', '2026-02-04T09:00:00+01:00');
  const manual = await event(employee, TEST_SITE, 'in', '2026-02-05T08:00:00+01:00');
  await harness.pg.query("INSERT INTO badge_admin_audit (admin_id,action,resource_id,details) VALUES ($1,'entry_closed_manually',$2,'{}')", [TEST_ADMIN, manual]);
  await shift(employee, TEST_SITE, '2026-02-06T08:00:00+01:00', '2026-02-06T16:00:00+01:00');
  const open = await event(employee, TEST_SITE, 'in', '2026-02-07T08:00:00+01:00');
  await harness.pg.query('UPDATE badge_employees SET current_entry_id=$2,current_site_id=$3,current_entry_at=$4 WHERE id=$1', [employee, open, TEST_SITE, '2026-02-07T08:00:00+01:00']);
  const result = (await call('/admin/statistics' + quarter + '&employee=' + employee, { token: adminToken() })).data;
  assert.equal(result.summary.worked_seconds, 8 * 3600);
  assert.equal(result.summary.review_seconds, 33 * 3600);
  assert.equal(result.summary.review_intervals, 2);
  assert.equal(result.summary.incomplete_intervals, 2);
  assert.equal(result.summary.open_intervals, 1);
  assert.equal(result.employees[0].complete_days, 1);
  assert.deepEqual(result.days.flatMap(day => day.intervals.map(interval => interval.status)).sort(),
    ['closed_manually', 'complete', 'different_site', 'long_shift', 'open']);
  assert.equal(result.days.find(day => day.date === '2026-02-05').intervals[0].exit_at, null);
  const office = (await call('/admin/statistics' + quarter.replace(TEST_SITE, otherSite) + '&employee=' + employee, { token: adminToken() })).data;
  assert.equal(office.summary.worked_seconds, 0);
  assert.equal(office.employees.length, 0);
});

test('Rome daylight saving, overnight schedules and quarter boundaries use elapsed durations and entry work dates', async () => {
  const employee = randomUUID();
  await harness.pg.query("INSERT INTO badge_employees (id,first_name,last_name,birth_date,job_role,phone,password_hash,status) VALUES ($1,'Turno','Notturno','1990-01-01','Operaio','+393331234570','hash-locale','active')", [employee]);
  await call('/admin/employees/' + employee + '/schedule', { token: adminToken(), body: { days: [1,2,3,4,5,6,7].map(weekday => ({ weekday, expected_start: '22:00', expected_end: '06:00' })) } });
  // DST starts during this night: seven elapsed hours despite eight clock hours.
  await shift(employee, otherSite, '2026-03-28T22:00:00+01:00', '2026-03-29T06:00:00+02:00');
  await shift(employee, otherSite, '2026-03-31T22:00:00+02:00', '2026-04-01T06:00:00+02:00');
  // Late after midnight belongs to the previous evening's work date.
  await shift(employee, otherSite, '2026-04-02T00:10:00+02:00', '2026-04-02T06:00:00+02:00');
  const q1 = (await call('/admin/statistics' + quarter.replace(TEST_SITE, otherSite) + '&employee=' + employee, { token: adminToken() })).data;
  assert.equal(q1.summary.worked_seconds, 15 * 3600);
  assert.equal(q1.employees[0].late_days, 0); assert.equal(q1.employees[0].early_days, 0);
  assert.deepEqual(q1.days.map(day => day.date), ['2026-03-31', '2026-03-28']);
  const q2 = (await call('/admin/statistics' + quarter.replace(TEST_SITE, otherSite).replace('quarter=1', 'quarter=2') + '&employee=' + employee, { token: adminToken() })).data;
  assert.equal(q2.days[0].date, '2026-04-01');
  assert.equal(q2.employees[0].late_minutes, 130);
  assert.equal(q2.summary.presence_days, 1);
});

test('clock averages wrap midnight and do not invent a noon average', async () => {
  const employee = randomUUID();
  await harness.pg.query("INSERT INTO badge_employees (id,first_name,last_name,birth_date,job_role,phone,password_hash,status) VALUES ($1,'Media','Notte','1990-01-01','Operaio','+393331234571','hash-locale','active')", [employee]);
  await shift(employee, TEST_SITE, '2026-02-10T23:50:00+01:00', '2026-02-11T07:50:00+01:00');
  await shift(employee, TEST_SITE, '2026-02-12T00:10:00+01:00', '2026-02-12T08:10:00+01:00');
  const result = (await call('/admin/statistics' + quarter + '&employee=' + employee, { token: adminToken() })).data;
  assert.equal(Math.round(result.employees[0].average_entry_seconds) % 86400, 0);
  assert.equal(Math.round(result.employees[0].average_exit_seconds), 8 * 3600);
});

test('quarter aggregates cover more than 1000 events and remain available for an archived QR', async () => {
  const employee = randomUUID(), site = randomUUID();
  await harness.pg.query("INSERT INTO badge_sites (id,name,address,latitude,longitude,archived_at) VALUES ($1,'QR storico','Dati locali',40,14,now())", [site]);
  await harness.pg.query("INSERT INTO badge_employees (id,first_name,last_name,birth_date,job_role,phone,password_hash,status) VALUES ($1,'Molte','Timbrature','1990-01-01','Operaio','+393331234572','hash-locale','suspended')", [employee]);
  await harness.pg.query([
    'INSERT INTO badge_events',
    '(id,employee_id,site_id,action,occurred_at,outcome,latitude,longitude,accuracy_m,distance_m,device_hash,user_agent,employee_name,birth_date,job_role,site_name,duration_seconds)',
    "SELECT gen_random_uuid(),$1,$2,CASE WHEN n%2=0 THEN 'in' ELSE 'out' END,",
    "'2026-01-01 08:00:00+01'::timestamptz+make_interval(mins=>n),'accepted',40,14,10,0,$3,'Test','Test','1990-01-01','Operaio','QR storico',",
    'CASE WHEN n%2=1 THEN 60 END FROM generate_series(0,1201) n',
  ].join(' '), [employee, site, 'b'.repeat(64)]);
  const result = (await call('/admin/statistics' + quarter.replace(TEST_SITE, site), { token: adminToken() })).data;
  assert.equal(result.summary.worked_seconds, 601 * 60);
  assert.equal(result.site.id, site); assert.ok(result.site.archived_at);
  const empty = (await call('/admin/statistics' + quarter.replace(TEST_SITE, site).replace('year=2026', 'year=2025'), { token: adminToken() })).data;
  assert.equal(empty.summary.worked_seconds, 0); assert.deepEqual(empty.employees, []);
  assert.equal(empty.months.length, 3);
});

test('statistics and schedule functions deny anonymous execution at the database boundary', async () => {
  await harness.pg.exec('RESET ROLE; SET ROLE anon');
  await assert.rejects(harness.pg.query("SELECT badge_statistics('2026-01-01','2026-04-01',$1,NULL)", [TEST_SITE]), /permission denied/);
  await assert.rejects(harness.pg.query("SELECT badge_set_site_schedule($1,$2,'08:00','17:00')", [TEST_ADMIN, TEST_SITE]), /permission denied/);
  await harness.pg.exec('RESET ROLE; SET ROLE service_role');
  const result = await harness.db.rpc('badge_set_site_schedule', { p_admin: TEST_EDITOR, p_site: TEST_SITE, p_start: '08:00', p_end: '17:00' });
  assert.equal(result.error.message, 'ADMIN_REQUIRED');
});

test('early-exit alerts wait for the expected end, minute boundaries are stable and autumn DST uses real elapsed time', async () => {
  const employee = randomUUID(), site = randomUUID();
  await harness.pg.query("INSERT INTO badge_sites (id,name,address,latitude,longitude) VALUES ($1,'Orari da verificare','Dati locali',40,14)", [site]);
  await harness.pg.query("INSERT INTO badge_employees (id,first_name,last_name,birth_date,job_role,phone,password_hash,status) VALUES ($1,'Confronto','Orario','1990-01-01','Operaio','+393331234573','hash-locale','active')", [employee]);
  await call('/admin/employees/' + employee + '/schedule', { token: adminToken(), body: { days: [1,2,3,4,5,6,7].map(weekday => ({ weekday, expected_start: '08:00', expected_end: '17:00' })) } });
  await shift(employee, site, '2026-01-08T08:00:59+01:00', '2026-01-08T17:00:00+01:00');
  const past = (await call('/admin/statistics' + quarter.replace(TEST_SITE, site), { token: adminToken() })).data;
  assert.equal(past.employees[0].late_days, 0);
  assert.equal(past.employees[0].early_days, 0);
  // A future fixture makes the cutoff test deterministic, independent of the wall clock.
  await shift(employee, site, '2099-01-05T08:00:00+01:00', '2099-01-05T12:00:00+01:00');
  const future = (await call('/admin/statistics' + quarter.replace(TEST_SITE, site).replace('year=2026', 'year=2099') + '&employee=' + employee, { token: adminToken() })).data;
  assert.equal(future.employees[0].evaluated_exit_days, 0);
  assert.equal(future.days[0].early_minutes, null);
  await call('/admin/employees/' + employee + '/schedule', { token: adminToken(), body: { days: [1,2,3,4,5,6,7].map(weekday => ({ weekday, expected_start: '22:00', expected_end: '06:00' })) } });
  await shift(employee, site, '2025-10-25T22:00:00+02:00', '2025-10-26T06:00:00+01:00');
  const autumn = (await call('/admin/statistics' + quarter.replace(TEST_SITE, site).replace('year=2026', 'year=2025').replace('quarter=1', 'quarter=4'), { token: adminToken() })).data;
  assert.equal(autumn.summary.worked_seconds, 9 * 3600);
  assert.equal(autumn.employees[0].late_days, 0); assert.equal(autumn.employees[0].early_days, 0);
});

test('personal weekdays and all-QR day boundaries prevent false alerts on split-site and unscheduled days', async () => {
  const employee=randomUUID();
  await harness.pg.query("INSERT INTO badge_employees (id,first_name,last_name,birth_date,job_role,phone,password_hash,status) VALUES ($1,'Cambio','Sede','1990-01-01','Operaio','+393331234599','local','active')",[employee]);
  const days=[{weekday:1,expected_start:'08:00',expected_end:'17:00',break_start:'12:00',break_end:'13:00'}];
  assert.equal((await call('/admin/employees/'+employee+'/schedule',{token:adminToken(),body:{days}})).status,200);
  await shift(employee,TEST_SITE,'2026-01-05T08:00:00+01:00','2026-01-05T12:30:00+01:00');
  await shift(employee,otherSite,'2026-01-05T12:30:00+01:00','2026-01-05T17:00:00+01:00');
  await shift(employee,TEST_SITE,'2026-01-06T10:00:00+01:00','2026-01-06T16:00:00+01:00'); // Tuesday not configured
  const a=(await call('/admin/statistics'+quarter+'&employee='+employee,{token:adminToken()})).data;
  const b=(await call('/admin/statistics'+quarter.replace(TEST_SITE,otherSite)+'&employee='+employee,{token:adminToken()})).data;
  assert.equal(a.summary.break_seconds,1800);assert.equal(b.summary.break_seconds,1800);
  assert.equal(a.summary.worked_seconds,10*3600);assert.equal(b.summary.worked_seconds,4*3600);
  assert.equal(a.days.find(d=>d.date==='2026-01-06').late_minutes,null);
  assert.equal(a.days.find(d=>d.date==='2026-01-05').early_minutes,null);
  assert.equal(b.days[0].late_minutes,null);assert.equal(b.days[0].early_minutes,0);
});
