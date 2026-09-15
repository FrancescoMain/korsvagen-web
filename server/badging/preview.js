// Disposable local preview, with fictional employees and an in-memory database.
import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createBadgeRouter } from './router.js';
import { fixture, TEST_SECRET, TEST_ADMIN, TEST_QR, TEST_PASSWORD, verifyAdmin, adminToken } from './test-support.js';

const { db, pg } = await fixture();
const app = express();
app.use(express.json());
app.use('/api/badging', createBadgeRouter({ db, secret: TEST_SECRET, verifyAdminToken: verifyAdmin }));
const user = { id: TEST_ADMIN, username: 'preview', email: 'preview@example.invalid', role: 'admin', profile_data: { first_name: 'Admin', last_name: 'Locale' } };
app.post('/api/auth/login', (req, res) => {
  if (req.body.username !== 'preview' || req.body.password !== TEST_PASSWORD) return res.status(401).json({ success: false });
  res.json({ success: true, data: { user, tokens: { access: adminToken(), refresh: adminToken() } } });
});
app.get('/api/auth/me', (req, res) => res.json({ success: true, data: { user } }));
app.get('/api/settings/public', (req, res) => res.json({ success: true, data: { flat: {}, last_updated: new Date().toISOString() } }));
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint non previsto nell’anteprima locale.' }));
const client = fileURLToPath(new URL('../../client/build/', import.meta.url));
app.use(express.static(client));
app.get('*', (req, res) => res.sendFile(path.join(client, 'index.html')));
const port = Number(process.env.BADGING_PREVIEW_PORT || 4100);
const server = app.listen(port, '127.0.0.1', () => {
  console.log('Anteprima locale: http://127.0.0.1:' + port + '/badge/' + TEST_QR);
  console.log('Dipendente: +393331234567 | Password di prova: ' + TEST_PASSWORD);
  console.log('Dashboard: /login | Utente: preview | Stessa password di prova.');
  console.log('Sede di prova: latitudine 40, longitudine 14. Database isolato; mappe e ricerca indirizzi usano servizi pubblici.');
});
async function close() {
  await new Promise(resolve => server.close(resolve));
  await pg.close();
}
process.on('SIGTERM', () => { void close(); });
process.on('SIGINT', () => { void close(); });
