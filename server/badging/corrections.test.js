import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { createBadgeRouter } from './router.js';
import { correctionTime } from './validation.js';
import { fixture, TEST_SECRET, TEST_ADMIN, TEST_EDITOR, TEST_EMPLOYEE, TEST_SITE, verifyAdmin, adminToken } from './test-support.js';
let h, server, base;
async function call(path, method = 'GET', body, token = adminToken()) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, data: await response.json() };
}
async function event(action, at, seconds = null) {
  const id = randomUUID();
  await h.pg.query(`INSERT INTO badge_events (id,employee_id,site_id,action,occurred_at,outcome,latitude,longitude,accuracy_m,distance_m,device_hash,user_agent,employee_name,birth_date,job_role,site_name,duration_seconds)
    VALUES ($1,$2,$3,$4,$5,'accepted',40,14,10,0,$6,'Local test','Anna Esempio','1990-01-01','Operaia','Sede',$7)`, [id, TEST_EMPLOYEE, TEST_SITE, action, at, 'a'.repeat(64), seconds]);
  return id;
}
before(async () => {
  h = await fixture(); const app = express(); app.use(express.json()); app.use(createBadgeRouter({ db: h.db, secret: TEST_SECRET, verifyAdminToken: verifyAdmin }));
  server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve)); base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => { await new Promise(resolve => server?.close(resolve)); await h?.pg.close(); });

test('corrections recalculate reports, statistics and CSV without modifying original receipts; deletion removes the whole pair', async () => {
  const entry = await event('in','2026-01-05T08:00:00+01:00');
  const exit = await event('out','2026-01-05T17:00:00+01:00',9*3600);
  const path = '/admin/events/' + entry;
  const initial = await call(path); assert.equal(initial.status,200); assert.equal(initial.data.paired_exit.id,exit);
  const body = { revision: 0, local_time: '2026-01-05T09:00:00', reason: 'Correzione responsabile' };
  assert.equal((await call(path,'PATCH',body,adminToken(TEST_EDITOR))).status,403);
  assert.equal((await call(path,'PATCH',body,'invalid')).status,401);
  assert.equal((await call(path,'PATCH',body)).status,200);
  assert.equal((await call(path,'PATCH',body)).status,409); // stale edit
  assert.equal((await h.pg.query('SELECT occurred_at FROM badge_events WHERE id=$1',[entry])).rows[0].occurred_at.toISOString(),'2026-01-05T07:00:00.000Z');
  const detail = (await call(path)).data;
  assert.equal(detail.revision,1); assert.equal(detail.changes.length,1);
  const report = (await call('/admin/reports?from=2026-01-05&to=2026-01-05')).data;
  assert.equal(report.summary.completed_seconds,8*3600);
  assert.ok(report.data.find(e=>e.id===exit).anomaly_flags.includes('admin_correction'));
  const stats = (await call('/admin/statistics?year=2026&quarter=1&site='+TEST_SITE)).data;
  assert.equal(stats.summary.worked_seconds,8*3600);
  const csv = await fetch(base+'/admin/reports.csv?from=2026-01-05&to=2026-01-05',{headers:{Authorization:'Bearer '+adminToken()}});
  const text=await csv.text(); assert.ok(text.includes('09:00:00'));assert.ok(text.includes('28800'));
  assert.equal((await call(path,'PATCH',{...body,revision:1,local_time:'2026-01-05T18:00:00'})).status,409);
  assert.equal((await call(path,'DELETE',{revision:1,reason:body.reason,paired_exit:null})).status,409);
  assert.equal((await call(path,'DELETE',{revision:1,reason:body.reason,paired_exit:exit})).status,200);
  assert.equal((await call(path)).status,404);
  assert.equal((await call('/admin/reports?from=2026-01-05&to=2026-01-05')).data.summary.events,0);
  assert.equal((await call('/admin/statistics?year=2026&quarter=1&site='+TEST_SITE)).data.summary.worked_seconds,0);
  assert.equal((await h.pg.query('SELECT count(*)::int n FROM badge_events WHERE id=ANY($1::uuid[])',[[entry,exit]])).rows[0].n,2);
  assert.equal((await h.pg.query("SELECT count(*)::int n FROM badge_admin_audit WHERE resource_id=$1 AND action='entry_deleted'",[entry])).rows[0].n,1);
});

test('editing and deleting an open entry update live presence, and a newly punched exit requires renewed confirmation', async () => {
  const entry=await event('in','2026-01-06T08:00:00+01:00');
  await h.pg.query('UPDATE badge_employees SET current_entry_id=$1,current_entry_at=$2,current_site_id=$3 WHERE id=$4',[entry,'2026-01-06T08:00:00+01:00',TEST_SITE,TEST_EMPLOYEE]);
  const body={revision:0,local_time:'2026-01-06T08:30:00',reason:'Rettifica ingresso aperto'};
  assert.equal((await call('/admin/events/'+entry,'PATCH',body)).status,200);
  assert.equal((await h.pg.query('SELECT current_entry_at FROM badge_employees WHERE id=$1',[TEST_EMPLOYEE])).rows[0].current_entry_at.toISOString(),'2026-01-06T07:30:00.000Z');
  const exit=await event('out','2026-01-06T17:00:00+01:00',8.5*3600);
  assert.equal((await call('/admin/events/'+entry,'DELETE',{revision:1,paired_exit:null,reason:body.reason})).status,409);
  assert.equal((await call('/admin/events/'+entry,'DELETE',{revision:1,paired_exit:exit,reason:body.reason})).status,200);
  assert.equal((await h.pg.query('SELECT current_entry_at FROM badge_employees WHERE id=$1',[TEST_EMPLOYEE])).rows[0].current_entry_at,null);
  // Removing a still-open interval clears current state too.
  const open=await event('in','2026-01-07T08:00:00+01:00');
  await h.pg.query('UPDATE badge_employees SET current_entry_id=$1,current_entry_at=$2,current_site_id=$3 WHERE id=$4',[open,'2026-01-07T08:00:00+01:00',TEST_SITE,TEST_EMPLOYEE]);
  assert.equal((await call('/admin/events/'+open,'DELETE',{revision:0,paired_exit:null,reason:'Ingresso di prova errato'})).status,200);
  assert.equal((await h.pg.query('SELECT current_entry_id FROM badge_employees WHERE id=$1',[TEST_EMPLOYEE])).rows[0].current_entry_id,null);
});

test('correction ordering, invalid and future times are rejected; an exit can be edited but cannot be removed alone', async () => {
  const entry=await event('in','2026-01-08T08:00:00+01:00'), exit=await event('out','2026-01-08T17:00:00+01:00',9*3600);
  assert.equal((await call('/admin/events/'+exit,'PATCH',{revision:0,local_time:'2026-01-08T07:59:00',reason:'Orario precedente'})).status,409);
  assert.equal((await call('/admin/events/'+exit,'PATCH',{revision:0,local_time:'2099-01-01T17:00:00',reason:'Orario futuro'})).status,400);
  assert.equal((await call('/admin/events/'+entry,'PATCH',{revision:0,local_time:'2026-03-29T02:30:00',reason:'Ora inesistente'})).status,400);
  assert.equal((await call('/admin/events/'+exit,'DELETE',{revision:0,paired_exit:null,reason:'Elimina solo uscita'})).status,400);
  assert.equal((await call('/admin/events/'+exit,'PATCH',{revision:0,local_time:'2026-01-08T16:00:00',reason:'Uscita corretta'})).status,200);
  assert.equal((await call('/admin/reports?from=2026-01-08&to=2026-01-08')).data.summary.completed_seconds,8*3600);
});

test('Italian correction times are timezone-independent and preserve the autumn repeated hour', () => {
  assert.equal(correctionTime('2026-01-08T09:00:00','2026-01-08T07:00:00Z'),'2026-01-08T08:00:00.000Z');
  assert.equal(correctionTime('2025-10-26T02:35:00','2025-10-26T00:30:00.123Z'),'2025-10-26T00:35:00.000Z');
  assert.equal(correctionTime('2025-10-26T02:35:00','2025-10-26T01:30:00Z'),'2025-10-26T01:35:00.000Z');
  assert.throws(()=>correctionTime('2026-03-29T02:30:00','2026-03-29T00:30:00Z'),/non esiste/);
});

test('database privileges protect corrections, weekly schedules and raw receipts', async () => {
  await h.pg.exec('RESET ROLE; SET ROLE anon');
  for (const sql of ['SELECT * FROM badge_event_adjustments','SELECT * FROM badge_employee_schedules','SELECT * FROM badge_effective_events']) await assert.rejects(h.pg.query(sql),/permission denied/);
  await assert.rejects(h.pg.query('SELECT badge_set_employee_schedule($1,$2,$3)',[TEST_ADMIN,TEST_EMPLOYEE,'[]']),/permission denied/);
  await assert.rejects(h.pg.query('SELECT badge_adjust_event($1,$2,0,NULL,true,NULL,$3)',[TEST_ADMIN,randomUUID(),'Test accesso']),/permission denied/);
  await assert.rejects(h.pg.query("SELECT badge_employee_statistics('2026-01-01','2026-04-01',$1,NULL)",[TEST_SITE]),/permission denied/);
  await h.pg.exec('RESET ROLE; SET ROLE service_role');
  await assert.rejects(h.pg.query('DELETE FROM badge_events WHERE false'),/permission denied/);
  await assert.rejects(h.pg.query('UPDATE badge_events SET occurred_at=now() WHERE false'),/permission denied/);
  assert.equal((await h.db.rpc('badge_set_employee_schedule',{p_admin:TEST_EDITOR,p_employee:TEST_EMPLOYEE,p_days:[]})).error.message,'ADMIN_REQUIRED');
});
