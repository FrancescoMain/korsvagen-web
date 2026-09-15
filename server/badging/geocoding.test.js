import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAddressSearch } from './geocoding.js';

const place = { type: 'Feature', geometry: { type: 'Point', coordinates: [14.5067, 40.7496] },
  properties: { osm_id: 123, osm_type: 'W', name: 'Ufficio', street: 'Via Roma', housenumber: '10', postcode: '80053', city: 'Castellammare di Stabia', country: 'Italia' } };
const response = features => ({ ok: true, json: async () => ({ type: 'FeatureCollection', features }) });

test('address search converts GeoJSON longitude/latitude and caches repeated normalized queries', async () => {
  const requests = [], slots = [];
  const search = createAddressSearch({ fetchImpl: async (url, options) => { requests.push({ url, options }); return response([place]); } });
  const result = await search('Via Roma 10, Castellammare', async () => { slots.push(true); });
  assert.equal(result[0].latitude, 40.7496);
  assert.equal(result[0].longitude, 14.5067);
  assert.match(result[0].label, /Via Roma 10/);
  assert.match(result[0].label, /Castellammare/);
  assert.equal(new URL(requests[0].url).searchParams.get('q'), 'Via Roma 10, Castellammare');
  assert.match(requests[0].options.headers['User-Agent'], /Korsvagen/);
  assert.equal(requests[0].options.redirect, 'error');
  assert.deepEqual(await search('  via  roma 10, castellammare  ', () => { throw Error('Cache miss'); }), result);
  assert.equal(requests.length, 1);
  assert.equal(slots.length, 1);
});

test('address search excludes malformed coordinates and duplicates, and bounds returned labels', async () => {
  const invalid = [null, { geometry: { type: 'Point', coordinates: [181, 40] } },
    { geometry: { type: 'Point', coordinates: {} } },
    { ...place, geometry: { type: 'Point', coordinates: ['14', 40] } },
    { ...place, geometry: { type: 'Polygon', coordinates: [14, 40] } }];
  const search = createAddressSearch({ fetchImpl: async () => response([...invalid, place, place,
    { ...place, geometry: { type: 'Point', coordinates: [0, 0] }, properties: { name: 'X'.repeat(300) } }]) });
  const results = await search('Via Roma', async () => {});
  assert.equal(results.length, 2);
  assert.equal(results[1].latitude, 0);
  assert.equal(results[1].longitude, 0);
  assert.equal(results[1].label.length, 250);
});

test('invalid queries never contact the provider or acquire a request slot', async () => {
  const search = createAddressSearch({ fetchImpl: () => { throw Error('Unexpected network request'); } });
  for (const query of ['', 'ab', ['Via Roma'], 'x'.repeat(251), 'Via\nRoma']) {
    await assert.rejects(search(query, () => { throw Error('Unexpected slot'); }), error => error.status === 400);
  }
});

test('simultaneous identical searches share the upstream request and failures remain retryable', async () => {
  let resolve, calls = 0;
  const pending = new Promise(done => { resolve = done; });
  const search = createAddressSearch({ fetchImpl: async () => { calls++; return pending; } });
  const first = search('Via Roma', async () => {});
  const second = search('Via Roma', () => { throw Error('Duplicate request slot'); });
  resolve(response([place]));
  assert.deepEqual(await first, await second);
  assert.equal(calls, 1);
  let fail = true;
  const retry = createAddressSearch({ fetchImpl: async () => fail ? { ok: false } : response([]) });
  await assert.rejects(retry('Via Test', async () => {}), error => error.code === 'GEOCODER_UNAVAILABLE');
  fail = false;
  assert.deepEqual(await retry('Via Test', async () => {}), []);
});

test('provider timeout and invalid configuration return a recoverable search error', async () => {
  const search = createAddressSearch({ timeoutMs: 5, fetchImpl: (url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(Error('aborted')), { once: true });
  }) });
  await assert.rejects(search('Via Roma', async () => {}), error => error.code === 'GEOCODER_UNAVAILABLE');
  const invalid = createAddressSearch({ endpoint: 'http://invalid.example/api' });
  await assert.rejects(invalid('Via Roma', async () => {}), error => error.code === 'GEOCODER_UNAVAILABLE');
});

test('expired cached results are refreshed and provider throttling errors are preserved', async () => {
  let now = 0, calls = 0;
  const search = createAddressSearch({ now: () => now, fetchImpl: async () => { calls++; return response([place]); } });
  await search('Via Roma', async () => {});
  now = 25 * 60 * 60 * 1000;
  await search('Via Roma', async () => {});
  assert.equal(calls, 2);
  const busy = Object.assign(new Error('Attendi un secondo'), { status: 429 });
  await assert.rejects(search('Via Milano', async () => { throw busy; }), error => error === busy);
});
