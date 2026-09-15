import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { BadgeError } from './validation.js';

export const digest = value => createHash('sha256').update(value).digest('hex');

export function badgeSecurity(secret) {
  const signature = id => createHmac('sha256', secret).update('badge-device:' + id).digest('hex');
  return {
    device() {
      const id = randomBytes(32).toString('hex');
      return id + '.' + signature(id);
    },
    deviceHash(value) {
      if (typeof value !== 'string' || !/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(value)) throw new BadgeError(401, 'DEVICE_REQUIRED', 'Riapri la pagina e accedi da questo telefono.');
      const [id, supplied] = value.split('.');
      if (!timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(signature(id), 'hex'))) throw new BadgeError(401, 'DEVICE_INVALID', 'Identificativo del browser non valido. Accedi nuovamente.');
      return digest(id);
    },
    sign(payload, audience, expiresIn, subject) {
      return jwt.sign(payload, secret, { algorithm: 'HS256', issuer: 'korsvagen-web', audience, expiresIn, subject });
    },
    verify(token, audience) {
      try {
        return jwt.verify(token, secret, { algorithms: ['HS256'], issuer: 'korsvagen-web', audience });
      } catch {
        throw new BadgeError(401, 'SESSION_EXPIRED', 'La sessione è scaduta. Accedi nuovamente.');
      }
    },
    rateKey(value) {
      return createHmac('sha256', secret).update('badge-rate:' + value).digest('hex');
    },
  };
}
