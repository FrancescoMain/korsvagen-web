export class BadgeError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function invalid(message) {
  throw new BadgeError(400, 'INVALID_INPUT', message);
}

export function uuid(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) invalid('Identificativo non valido.');
  return value;
}

export function textField(value, label, min = 1, max = 100) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max || /[\u0000-\u001f]/.test(value)) invalid(label + ' non valido.');
  return value.trim();
}

export function phoneNumber(value) {
  let phone = textField(value, 'Cellulare', 8, 30).replace(/[\s().-]/g, '');
  if (phone.startsWith('00')) phone = '+' + phone.slice(2);
  if (/^3\d{8,9}$/.test(phone)) phone = '+39' + phone;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) invalid('Inserisci il cellulare con prefisso internazionale, ad esempio +39.');
  return phone;
}

export function passwordInput(value) {
  if (typeof value !== 'string' || value.length < 10 || Buffer.byteLength(value, 'utf8') > 72) invalid('La password deve avere almeno 10 caratteri e al massimo 72 byte.');
  return value;
}

function dateInput(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid('Data non valida.');
  const date = new Date(value + 'T00:00:00.000Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) invalid('Data non valida.');
  return date;
}

export function registration(body) {
  const birth = dateInput(body.birth_date);
  if (birth.getTime() >= Date.now() || birth.getUTCFullYear() < 1900) invalid('Data di nascita non valida.');
  return {
    first_name: textField(body.first_name, 'Nome'),
    last_name: textField(body.last_name, 'Cognome'),
    birth_date: body.birth_date,
    job_role: textField(body.job_role, 'Mansione'),
    phone: phoneNumber(body.phone),
    password: passwordInput(body.password),
  };
}

function numberIn(value, label, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) invalid(label + ' non valido.');
  return value;
}

export function positionInput(body) {
  return {
    latitude: numberIn(body.latitude, 'Latitudine', -90, 90),
    longitude: numberIn(body.longitude, 'Longitudine', -180, 180),
    accuracy: numberIn(body.accuracy, 'Precisione della posizione', 0, 10000),
  };
}

export function siteInput(body) {
  if (!['block', 'flag'].includes(body.outside_policy)) invalid('Scegli come gestire le timbrature fuori zona.');
  return {
    name: textField(body.name, 'Nome sede'),
    address: textField(body.address, 'Indirizzo', 1, 250),
    latitude: numberIn(body.latitude, 'Latitudine', -90, 90),
    longitude: numberIn(body.longitude, 'Longitudine', -180, 180),
    radius_m: numberIn(body.radius_m, 'Raggio in metri', 20, 5000),
    max_accuracy_m: numberIn(body.max_accuracy_m, 'Precisione massima in metri', 5, 1000),
    outside_policy: body.outside_policy,
  };
}

function romeMidnight(value) {
  const target = dateInput(value).getTime();
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  let result = target;
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(format.formatToParts(result).map(part => [part.type, part.value]));
    const local = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    result += target - local;
  }
  return new Date(result).toISOString();
}

export function reportFilters(query) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
  const fromDay = query.from || today;
  const toDay = query.to || today;
  const span = dateInput(toDay) - dateInput(fromDay);
  if (span < 0 || span > 92 * 86400000) invalid('Scegli un intervallo di massimo 93 giorni.');
  const page = query.page === undefined ? 1 : Number(query.page);
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) invalid('Pagina non valida.');
  if (query.outcome && !['accepted', 'rejected'].includes(query.outcome)) invalid('Esito non valido.');
  if (query.flagged !== undefined && !['true', 'false'].includes(query.flagged)) invalid('Filtro anomalie non valido.');
  return {
    from: romeMidnight(fromDay),
    to: romeMidnight(new Date(dateInput(toDay).getTime() + 86400000).toISOString().slice(0, 10)),
    site: query.site ? uuid(query.site) : null,
    employee: query.employee ? uuid(query.employee) : null,
    outcome: query.outcome || null,
    flagged: query.flagged === 'true',
    page,
  };
}

export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export function statisticsFilters(query) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
  const year = query.year ?? today.slice(0, 4);
  const quarter = query.quarter ?? String(Math.ceil(Number(today.slice(5, 7)) / 3));
  if (typeof year !== 'string' || !/^\d{4}$/.test(year) || Number(year) < 2000 || Number(year) > 2100) invalid('Anno non valido.');
  if (typeof quarter !== 'string' || !/^[1-4]$/.test(quarter)) invalid('Trimestre non valido.');
  const month = (Number(quarter) - 1) * 3;
  return {
    year: Number(year), quarter: Number(quarter), site: uuid(query.site),
    employee: query.employee === undefined ? null : uuid(query.employee),
    from: new Date(Date.UTC(Number(year), month, 1)).toISOString().slice(0, 10),
    to: new Date(Date.UTC(Number(year), month + 3, 1)).toISOString().slice(0, 10),
  };
}

export function scheduleInput(body) {
  const { expected_start: start, expected_end: end } = body;
  if (start === null && end === null) return { start, end };
  const valid = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  if (!valid(start) || !valid(end) || start === end) invalid('Inserisci entrambi gli orari, diversi tra loro, oppure disattiva l’orario previsto.');
  return { start, end };
}

export function employeeScheduleInput(body) {
  if (!Array.isArray(body.days) || body.days.length > 7) invalid('Seleziona i giorni previsti.');
  const seen = new Set();
  const valid = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  return body.days.map(day => {
    if (!day || !Number.isInteger(day.weekday) || day.weekday < 1 || day.weekday > 7 || seen.has(day.weekday)) invalid('Giorni previsti non validi o duplicati.');
    seen.add(day.weekday);
    const { expected_start: start, expected_end: end } = day;
    if (!valid(start) || !valid(end) || start === end) invalid('Inserisci ingresso e uscita diversi per ogni giorno previsto.');
    const breakStart = day.break_start ?? null, breakEnd = day.break_end ?? null;
    if (breakStart !== null || breakEnd !== null) {
      if (!valid(breakStart) || !valid(breakEnd) || breakStart === breakEnd) invalid('Inserisci inizio e fine della pausa pranzo.');
      const span = (minutes(end) - minutes(start) + 1440) % 1440;
      const offset = (minutes(breakStart) - minutes(start) + 1440) % 1440;
      const length = (minutes(breakEnd) - minutes(breakStart) + 1440) % 1440;
      if (offset >= span || offset + length > span) invalid('La pausa pranzo deve essere compresa nell’orario previsto.');
    }
    return { weekday: day.weekday, expected_start: start, expected_end: end, break_start: breakStart, break_end: breakEnd };
  }).sort((a, b) => a.weekday - b.weekday);
}

// Interpret the editor in Italian time even when the admin's browser is abroad.
// During the repeated autumn hour preserve the original UTC offset where possible.
export function correctionTime(local, original) {
  if (typeof local !== 'string' || !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(local)) invalid('Data e ora italiane non valide.');
  dateInput(local.slice(0, 10));
  const format = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const render = date => format.format(date).replace(' ', 'T');
  const candidates = [1, 2].map(hours => new Date(new Date(local + 'Z').getTime() - hours * 3600000)).filter(date => render(date) === local);
  if (!candidates.length) invalid('Quest’ora non esiste in Italia per il cambio dell’ora legale.');
  const source = new Date(original);
  const offset = Math.round((new Date(render(source) + 'Z').getTime() - source.getTime()) / 60000) * 60000;
  return (candidates.find(date => new Date(local + 'Z').getTime() - date.getTime() === offset) || candidates[0]).toISOString();
}
