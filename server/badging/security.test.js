import test from 'node:test';
import assert from 'node:assert/strict';
import { badgeSecurity } from './security.js';

const security = badgeSecurity('independent-local-security-test-secret-42');
test('browser identifiers are signed, non-interchangeable and rejected after tampering', () => {
  const first = security.device();
  const second = security.device();
  assert.notEqual(first, second);
  assert.equal(security.deviceHash(first), security.deviceHash(first));
  assert.notEqual(security.deviceHash(first), security.deviceHash(second));
  const tampered = first.slice(0, -1) + (first.endsWith('a') ? 'b' : 'a');
  assert.throws(() => security.deviceHash(tampered), error => error.status === 401);
});
test('sessions cannot be used as punch challenges; expired challenges fail', () => {
  const session = security.sign({ device: 'test' }, 'korsvagen-badging', '1h', 'employee');
  assert.throws(() => security.verify(session, 'korsvagen-badge-punch'), error => error.status === 401);
  const expired = security.sign({}, 'korsvagen-badge-punch', -1, 'employee');
  assert.throws(() => security.verify(expired, 'korsvagen-badge-punch'), error => error.status === 401);
});
