import test from 'node:test';
import assert from 'node:assert/strict';
import { registration, siteInput, positionInput, reportFilters, csvCell } from './validation.js';

const profile = { first_name: 'Anna', last_name: "D'Amico", birth_date: '1990-02-28', job_role: 'Operaia', phone: '333 123 4567', password: 'una password lunga' };

test('registration normalizes Italian phone numbers and preserves human names', () => {
  assert.equal(registration(profile).phone, '+393331234567');
  assert.equal(registration({ ...profile, phone: '0039 3331234567' }).phone, '+393331234567');
  assert.equal(registration(profile).last_name, "D'Amico");
  assert.equal(registration({ ...profile, role: 'super_admin', status: 'active' }).status, undefined);
});

test('invalid birth dates, empty fields, invalid phones and long bcrypt inputs are rejected', () => {
  for (const change of [{ birth_date: '2020-02-30' }, { birth_date: '2999-01-01' }, { first_name: ' ' }, { phone: '123' }, { password: 'à'.repeat(40) }]) {
    assert.throws(() => registration({ ...profile, ...change }));
  }
});

test('location requires finite numeric coordinates and accuracy, including at the equator', () => {
  assert.deepEqual(positionInput({ latitude: 0, longitude: 0, accuracy: 10 }), { latitude: 0, longitude: 0, accuracy: 10 });
  for (const point of [{}, { latitude: null, longitude: 0, accuracy: 10 }, { latitude: '40', longitude: 10, accuracy: 10 }, { latitude: 91, longitude: 0, accuracy: 10 }, { latitude: 0, longitude: 0, accuracy: -1 }]) {
    assert.throws(() => positionInput(point));
  }
});

test('sites have mandatory geofences; updates cannot replace tokens or history', () => {
  const result = siteInput({ name: 'Cantiere A', address: 'Via Roma', latitude: 40, longitude: 14, radius_m: 200, max_accuracy_m: 100, outside_policy: 'block', qr_token: 'tampered' });
  assert.equal(result.qr_token, undefined);
  assert.throws(() => siteInput({ ...result, radius_m: 0 }));
  assert.throws(() => siteInput({ ...result, outside_policy: 'anything' }));
});

test('reports use complete Rome calendar days across summer and winter clock changes', () => {
  const spring = reportFilters({ from: '2026-03-29', to: '2026-03-29' });
  assert.equal(spring.from, '2026-03-28T23:00:00.000Z');
  assert.equal(spring.to, '2026-03-29T22:00:00.000Z');
  const autumn = reportFilters({ from: '2026-10-25', to: '2026-10-25' });
  assert.equal(autumn.from, '2026-10-24T22:00:00.000Z');
  assert.equal(autumn.to, '2026-10-25T23:00:00.000Z');
  for (const query of [{ from: '2026-02-30', to: '2026-03-01' }, { from: '2026-03-01', to: '2026-02-01' }, { from: '2025-01-01', to: '2026-01-01' }, { page: '-1' }, { flagged: 'maybe' }]) assert.throws(() => reportFilters(query));
});

test('CSV protects spreadsheet formula cells, separators and quotes', () => {
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell(' \t@SUM(1)'), '"\' \t@SUM(1)"');
  assert.equal(csvCell('A;"B"'), '"A;""B"""');
});
