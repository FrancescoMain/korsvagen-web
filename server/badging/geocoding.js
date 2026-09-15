import { BadgeError, textField } from './validation.js';

const DAY = 24 * 60 * 60 * 1000;
const unavailable = () => new BadgeError(503, 'GEOCODER_UNAVAILABLE',
  'La ricerca indirizzi non è disponibile. Riprova oppure usa la tua posizione o il punto sulla mappa.');

function places(payload) {
  if (!Array.isArray(payload?.features)) throw unavailable();
  const seen = new Set();
  const results = [];
  for (const feature of payload.features.slice(0, 50)) {
    if (!Array.isArray(feature?.geometry?.coordinates)) continue;
    const [longitude, latitude] = feature.geometry.coordinates;
    if (feature?.geometry?.type !== 'Point' || !Number.isFinite(latitude) || !Number.isFinite(longitude)
      || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) continue;
    const props = feature.properties || {};
    const field = key => typeof props[key] === 'string' ? props[key].replace(/[\u0000-\u001f]/g, ' ').trim() : '';
    const label = [...new Set([
      field('name'), [field('street'), field('housenumber')].filter(Boolean).join(' '),
      [field('postcode'), field('city') || field('district')].filter(Boolean).join(' '), field('state'), field('country'),
    ].filter(Boolean))].join(', ').slice(0, 250);
    const id = latitude + ':' + longitude + ':' + label;
    if (!label || seen.has(id)) continue;
    seen.add(id);
    results.push({ id, label, latitude, longitude });
    if (results.length === 5) break;
  }
  return results;
}

// Small bounded cache per warm server instance; the router reserves request slots
// in PostgreSQL so the provider limit also applies across Vercel instances.
export function createAddressSearch({ fetchImpl = globalThis.fetch, now = Date.now, timeoutMs = 8000,
  endpoint = process.env.BADGING_GEOCODER_URL || 'https://photon.komoot.io/api/' } = {}) {
  const cache = new Map();
  const pending = new Map();
  return async function search(query, reserveSlot) {
    const term = textField(query, 'Indirizzo da cercare', 4, 250).replace(/\s+/g, ' ');
    const key = term.toLocaleLowerCase('it');
    const cached = cache.get(key);
    if (cached && cached.expires > now()) {
      cache.delete(key); cache.set(key, cached);
      return cached.results;
    }
    cache.delete(key);
    if (pending.has(key)) return pending.get(key);
    const request = (async () => {
      let url;
      try {
        url = new URL(endpoint);
        if (url.protocol !== 'https:' || url.username || url.password || url.hash) throw unavailable();
        url.searchParams.set('q', term);
        url.searchParams.set('limit', '5');
      } catch { throw unavailable(); }
      await reserveSlot();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(url.toString(), { signal: controller.signal, redirect: 'error',
          headers: { Accept: 'application/json', 'User-Agent': 'KorsvagenPresenze/1.0 (+https://www.korsvagen.it)' } });
        if (!response.ok) throw unavailable();
        const results = places(await response.json());
        cache.set(key, { results, expires: now() + (results.length ? DAY : 10 * 60 * 1000) });
        if (cache.size > 100) cache.delete(cache.keys().next().value);
        return results;
      } catch { throw unavailable(); }
      finally { clearTimeout(timer); }
    })();
    pending.set(key, request);
    try { return await request; }
    finally { pending.delete(key); }
  };
}
