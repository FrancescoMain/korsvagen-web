import { API_BASE_URL, apiClient } from '../../utils/api';

export const SESSION_KEY = 'korsvagen_badge_session';
const DEVICE_KEY = 'korsvagen_badge_browser';
export function newRequestId(): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) throw new Error('Apri il sito con una connessione HTTPS in Safari o Chrome.');
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}
export class BadgeApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function messageOf(error: unknown): string {
  const value = error as { response?: { data?: { message?: string } }; message?: string };
  return value.response?.data?.message || value.message || 'Operazione non riuscita. Riprova.';
}
export async function employeeRequest<T>(path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem(SESSION_KEY);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(API_BASE_URL + '/badging' + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store', signal: controller.signal, credentials: 'omit',
    });
    const data = await response.json();
    if (!response.ok) {
      if (['DEVICE_INVALID', 'DEVICE_REQUIRED'].includes(data.code)) localStorage.removeItem(DEVICE_KEY);
      throw new BadgeApiError(response.status, data.code, data.message || 'Operazione non riuscita.');
    }
    return data;
  } catch (error) {
    if (error instanceof BadgeApiError) throw error;
    throw new Error('Connessione non disponibile. Verifica il segnale e riprova; la timbratura non è confermata.');
  } finally { window.clearTimeout(timeout); }
}
let creatingDevice: Promise<string> | undefined;
export async function deviceToken(): Promise<string> {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  if (!creatingDevice) {
    creatingDevice = employeeRequest<{ deviceToken: string }>('/device', {}).then(result => {
      localStorage.setItem(DEVICE_KEY, result.deviceToken);
      return result.deviceToken;
    }).finally(() => { creatingDevice = undefined; });
  }
  return creatingDevice;
}
export function locate(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) return Promise.reject(new Error('Questo browser non supporta la posizione. Apri il QR con Safari o Chrome.'));
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, error => {
    reject(new Error(error.code === 1
      ? 'Consenti l’accesso alla posizione nelle impostazioni del browser, poi riprova. Senza posizione non puoi timbrare.'
      : error.code === 3
        ? 'La ricerca della posizione sta impiegando troppo tempo. Spostati vicino a un’apertura e riprova.'
        : 'Posizione non disponibile. Attiva la localizzazione del telefono e riprova.'));
  }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }));
}
export const adminBadge = {
  get: async <T,>(path: string, params?: object): Promise<T> => (await apiClient.get('/badging/admin' + path, { params })).data,
  post: async <T,>(path: string, body: unknown = {}): Promise<T> => (await apiClient.post('/badging/admin' + path, body)).data,
  put: async (path: string, body: unknown) => apiClient.put('/badging/admin' + path, body),
  patch: async (path: string, body: unknown) => apiClient.patch('/badging/admin' + path, body),
  remove: async (path: string, data?: unknown) => apiClient.delete('/badging/admin' + path, { data }),
  csv: async (params: object) => {
    try {
      const response = await apiClient.get('/badging/admin/reports.csv', { params, responseType: 'blob', timeout: 60000 });
      return response.data as Blob;
    } catch (error) {
      const blob = (error as { response?: { data?: Blob } }).response?.data;
      if (blob instanceof Blob) {
        const result = JSON.parse(await blob.text());
        throw new Error(result.message || 'Esportazione non riuscita.');
      }
      throw error;
    }
  },
};
