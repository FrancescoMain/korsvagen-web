// Local-only Postgres harness for API tests and the preview. Never imported by index.js.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const TEST_SECRET = 'local-badging-tests-only-not-a-production-secret';
export const TEST_ADMIN = '10000000-0000-4000-8000-000000000001';
export const TEST_EDITOR = '10000000-0000-4000-8000-000000000002';
export const TEST_EMPLOYEE = '20000000-0000-4000-8000-000000000001';
export const TEST_SITE = '30000000-0000-4000-8000-000000000001';
export const TEST_QR = 'a'.repeat(64);
export const TEST_PASSWORD = 'PasswordSoloLocale42';
export const verifyAdmin = token => jwt.verify(token, TEST_SECRET, { algorithms: ['HS256'], issuer: 'korsvagen-web', audience: 'korsvagen-users' });
export const adminToken = (id = TEST_ADMIN) => jwt.sign({ role: 'admin', username: 'preview', email: 'preview@example.invalid' }, TEST_SECRET,
  { subject: id, issuer: 'korsvagen-web', audience: 'korsvagen-users', expiresIn: '1h' });

const identifier = name => {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error('Unsafe SQL identifier in test adapter: ' + name);
  return '"' + name + '"';
};

class Query {
  constructor(pg, table) { this.pg = pg; this.table = table; this.columns = '*'; this.filters = []; this.orders = []; }
  select(columns = '*', options = {}) { this.columns = columns; this.counted = options?.count === 'exact'; return this; }
  insert(data) { this.operation = 'insert'; this.data = data; return this; }
  update(data) { this.operation = 'update'; this.data = data; return this; }
  eq(column, value) { this.filters.push([column, '=', value]); return this; }
  gte(column, value) { this.filters.push([column, '>=', value]); return this; }
  lt(column, value) { this.filters.push([column, '<', value]); return this; }
  is(column, value) { this.filters.push([column, 'IS', value]); return this; }
  not(column, operator, value) { this.filters.push([column, operator === 'is' ? 'IS NOT' : '<>', value]); return this; }
  order(column, options = {}) { this.orders.push(identifier(column) + (options.ascending === false ? ' DESC' : ' ASC')); return this; }
  range(from, to) { this.offset = from; this.rowLimit = to - from + 1; return this; }
  limit(limit) { this.rowLimit = limit; return this; }
  single() { this.singular = true; return this; }
  maybeSingle() { this.singular = true; this.optional = true; return this; }
  then(resolve, reject) { return this.execute().then(resolve, reject); }
  async execute() {
    try {
      const values = [];
      const parameter = value => { values.push(value); return '$' + values.length; };
      const fields = this.columns === '*' ? '*' : this.columns.split(',').map(identifier).join(',');
      const table = identifier(this.table);
      let sql;
      if (this.operation === 'insert') {
        const keys = Object.keys(this.data);
        sql = 'INSERT INTO ' + table + ' (' + keys.map(identifier).join(',') + ') VALUES (' + keys.map(key => parameter(this.data[key])).join(',') + ')';
      } else if (this.operation === 'update') {
        sql = 'UPDATE ' + table + ' SET ' + Object.entries(this.data).map(([key, value]) => identifier(key) + '=' + parameter(value)).join(',');
      } else sql = 'SELECT ' + fields + ' FROM ' + table;
      const where = this.filters.length ? ' WHERE ' + this.filters.map(([column, op, value]) =>
        identifier(column) + ' ' + op + ' ' + (value === null ? 'NULL' : parameter(value))).join(' AND ') : '';
      sql += where;
      let count;
      if (this.operation) sql += ' RETURNING ' + fields;
      else {
        if (this.counted) count = (await this.pg.query('SELECT count(*)::int AS count FROM ' + table + where, values)).rows[0].count;
        if (this.orders.length) sql += ' ORDER BY ' + this.orders.join(',');
        if (this.rowLimit !== undefined) sql += ' LIMIT ' + this.rowLimit;
        if (this.offset) sql += ' OFFSET ' + this.offset;
      }
      const wrapper = this.operation ? 'WITH rows AS (' + sql + ') SELECT to_jsonb(rows) AS value FROM rows'
        : 'SELECT to_jsonb(rows) AS value FROM (' + sql + ') rows';
      const rows = (await this.pg.query(wrapper, values)).rows.map(row => row.value);
      if (this.singular && (rows.length > 1 || (!this.optional && !rows.length))) return { data: null, error: { code: 'PGRST116', message: 'Unexpected row count' } };
      return { data: this.singular ? rows[0] || null : rows, count, error: null };
    } catch (error) { return { data: null, error: { code: error.code, message: error.message } }; }
  }
}

export async function fixture() {
  const pg = new PGlite();
  await pg.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE TABLE admin_users (id uuid PRIMARY KEY, role text, is_active boolean); GRANT SELECT ON admin_users TO service_role;');
  await pg.exec(await readFile(new URL('../../database/badging.sql', import.meta.url), 'utf8'));
  await pg.exec(await readFile(new URL('../../database/badging-statistics.sql', import.meta.url), 'utf8'));
  await pg.exec(await readFile(new URL('../../database/badging-personal-schedules.sql', import.meta.url), 'utf8'));
  await pg.query("INSERT INTO admin_users VALUES ($1,'admin',true)", [TEST_ADMIN]);
  await pg.query("INSERT INTO admin_users VALUES ($1,'editor',true)", [TEST_EDITOR]);
  await pg.query("INSERT INTO badge_sites (id,name,address,latitude,longitude,qr_token) VALUES ($1,'Cantiere dimostrativo','Dati di prova locali',40,14,$2)", [TEST_SITE, TEST_QR]);
  await pg.query("INSERT INTO badge_employees (id,first_name,last_name,birth_date,job_role,phone,password_hash,status) VALUES ($1,'Anna','Esempio','1990-01-01','Operaia','+393331234567',$2,'active')", [TEST_EMPLOYEE, await bcrypt.hash(TEST_PASSWORD, 12)]);
  await pg.exec('SET ROLE service_role');
  return {
    pg,
    db: {
      from: table => new Query(pg, table),
      rpc: async (name, params) => {
        try {
          const args = Object.keys(params).map((key, index) => identifier(key) + ' => $' + (index + 1)).join(',');
          const result = await pg.query('SELECT to_jsonb(' + identifier(name) + '(' + args + ')) AS value', Object.values(params));
          // PostgREST returns row-valued RPCs as arrays, even for one row.
          const value = result.rows[0].value;
          return { data: ['badge_punch', 'badge_manage_site', 'badge_set_site_schedule'].includes(name) ? [value] : value, error: null };
        } catch (error) { return { data: null, error: { code: error.code, message: error.message } }; }
      },
    },
  };
}
