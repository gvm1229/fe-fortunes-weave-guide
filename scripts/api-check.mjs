// [U75] 진행 기록 API 시험(2026-11-28). 함수를 묶어 직접 부르고, 시험용 데이터베이스(DB_NAME, 기본 fefw_check)를 쓴다.
//   node scripts/api-check.mjs   (.env의 MONGODB_URI·AUTH_USER·AUTH_PASS_HASH·SESSION_SECRET, 비밀번호는 환경 변수 CHECK_PASSWORD)
import { readFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { MongoClient } from 'mongodb';
for (const l of readFileSync('.env', 'utf8').split(/\r?\n/)) { const i = l.indexOf('='); if (i > 0 && !process.env[l.slice(0, i)]) process.env[l.slice(0, i)] = l.slice(i + 1); }
process.env.DB_NAME ||= 'fefw_check';
assert.notEqual(process.env.DB_NAME, 'fefw', '실제 데이터베이스로 시험하지 않는다');
const password = process.env.CHECK_PASSWORD; assert.ok(password, 'CHECK_PASSWORD 환경 변수가 필요합니다');
mkdirSync('.tmp', { recursive: true });
const out = resolve('.tmp/api-check.mjs');
const b = spawnSync('npx', ['-y', 'esbuild@0.24.2', 'netlify/functions/api.ts', '--bundle', '--platform=node', '--format=esm', '--external:mongodb', `--outfile=${out}`], { stdio: 'inherit', shell: true });
assert.equal(b.status, 0, '묶기 실패');
const { default: handler } = await import(pathToFileURL(out).href);
const base = 'https://example.test';
const call = async (method, path, { body, cookie, header = true } = {}) => {
  const headers = { 'content-type': 'application/json' }; if (header && method !== 'GET') headers['x-fefw'] = '1'; if (cookie) headers.cookie = cookie;
  const res = await handler(new Request(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }));
  return { status: res.status, body: await res.json(), cookie: res.headers.get('set-cookie') };
};
const client = new MongoClient(process.env.MONGODB_URI); await client.connect();
const test = client.db(process.env.DB_NAME); await test.dropDatabase();
const state = (n) => ({ schemaVersion: 1, revision: n, checks: { 'a': true }, status: { boons: {}, gods: {} } });
try {
  let r = await call('GET', '/api/progress'); assert.equal(r.status, 200); assert.equal(r.body.revision, 0); assert.equal(r.body.data, null);
  r = await call('GET', '/api/session'); assert.equal(r.body.loggedIn, false);
  r = await call('PUT', '/api/progress', { body: { baseRevision: 0, data: state(1) } }); assert.equal(r.status, 401, '로그인 없이 저장 막기');
  r = await call('POST', '/api/login', { body: { username: 'gvm1229', password: 'wrong' } }); assert.equal(r.status, 401, '틀린 비밀번호');
  r = await call('POST', '/api/login', { body: { username: 'someone', password } }); assert.equal(r.status, 401, '틀린 아이디');
  r = await call('POST', '/api/login', { body: { username: 'gvm1229', password }, header: false }); assert.equal(r.status, 403, '머리 없는 요청 막기');
  r = await call('POST', '/api/login', { body: { username: 'gvm1229', password } }); assert.equal(r.status, 200, '로그인');
  assert.match(r.cookie, /HttpOnly/); assert.match(r.cookie, /Secure/); assert.match(r.cookie, /SameSite=Strict/);
  const cookie = r.cookie.split(';')[0];
  r = await call('GET', '/api/session', { cookie }); assert.equal(r.body.loggedIn, true);
  r = await call('GET', '/api/session', { cookie: cookie.slice(0, -2) + 'xx' }); assert.equal(r.body.loggedIn, false, '고친 쿠키 거절');
  r = await call('PUT', '/api/progress', { cookie, body: { baseRevision: 0, data: { nope: 1 } } }); assert.equal(r.status, 400, '틀린 형식');
  r = await call('PUT', '/api/progress', { cookie, body: { baseRevision: 0, data: state(1) } }); assert.equal(r.status, 200); assert.equal(r.body.revision, 1);
  r = await call('PUT', '/api/progress', { cookie, body: { baseRevision: 0, data: state(1) } }); assert.equal(r.status, 409, '충돌');
  r = await call('PUT', '/api/progress', { cookie, body: { baseRevision: 1, data: state(2) } }); assert.equal(r.status, 200); assert.equal(r.body.revision, 2);
  r = await call('GET', '/api/progress'); assert.equal(r.body.revision, 2); assert.equal(r.body.data.checks.a, true, '로그인 없이 보기');
  r = await call('POST', '/api/logout', { cookie }); assert.match(r.cookie, /Max-Age=0/);
  for (let i = 0; i < 8; i++) await call('POST', '/api/login', { body: { username: 'gvm1229', password: 'x' } });
  r = await call('POST', '/api/login', { body: { username: 'gvm1229', password } }); assert.equal(r.status, 429, '실패 10번 뒤 막기');
  console.log('통과: 진행 기록 API 시험 15개');
} finally { await test.dropDatabase(); await client.close(); process.exit(); }
