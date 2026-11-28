// 진행 기록 API(2026-11-28 사용자 요청): 보기는 누구나, 고치기는 로그인한 사람만.
//   GET  /api/progress   저장된 기록(체크·내 상태·인물 육성 기록)
//   PUT  /api/progress   { baseRevision, data } 로그인 필요. 서버 revision이 baseRevision과 다르면 409(두 기기가 서로 덮어쓰지 않게)
//   GET  /api/session    { loggedIn }
//   POST /api/login      { username, password } → 로그인 쿠키(HttpOnly, 30일)
//   POST /api/logout
import { validateChecks, type StatusLimits } from '../../lib/check-state';
import catalog from '../../content/data/boon-catalog.json';
import { makeSession, readSession, sessionCookie, verifyLogin } from '../lib/auth';
import { db, PROGRESS_ID, type ProgressDoc } from '../lib/db';

const limits: StatusLimits = {
  boons: Object.fromEntries(catalog.boons.map(b => [b.id, b.tiers.length])),
  gods: Object.fromEntries(catalog.gods.map(g => [g.name, g.max])),
};
const MAX_BODY = 512 * 1024;
const FAIL_WINDOW_MS = 15 * 60 * 1000, FAIL_LIMIT = 10;

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

async function readBody(req: Request): Promise<unknown> {
  const text = await req.text();
  if (text.length > MAX_BODY) throw Object.assign(new Error('기록이 너무 큽니다.'), { status: 413 });
  try { return JSON.parse(text); } catch { throw Object.assign(new Error('JSON이 아닙니다.'), { status: 400 }); }
}

async function getProgress() {
  const doc = await (await db()).collection<ProgressDoc>('progress').findOne({ _id: PROGRESS_ID });
  return json(200, doc ? { revision: doc.revision, updatedAt: doc.updatedAt, data: doc.data } : { revision: 0, data: null });
}

async function putProgress(req: Request) {
  const body = await readBody(req) as { baseRevision?: unknown; data?: unknown };
  const base = body?.baseRevision;
  if (!Number.isInteger(base) || (base as number) < 0) return json(400, { error: 'baseRevision이 없습니다.' });
  let data;
  try { data = validateChecks(body.data, limits, true); } catch (e) { return json(400, { error: e instanceof Error ? e.message : '기록 형식이 틀렸습니다.' }); }
  const revision = (base as number) + 1, updatedAt = new Date().toISOString();
  const doc = { ...data, revision, updatedAt };
  const col = (await db()).collection<ProgressDoc>('progress');
  if (base === 0) {
    try { await col.insertOne({ _id: PROGRESS_ID, revision, updatedAt, data: doc }); return json(200, { revision, updatedAt }); }
    catch { /* 이미 있음 → 아래 충돌 처리 */ }
  } else {
    const r = await col.updateOne({ _id: PROGRESS_ID, revision: base as number }, { $set: { revision, updatedAt, data: doc } });
    if (r.matchedCount === 1) return json(200, { revision, updatedAt });
  }
  const now = await col.findOne({ _id: PROGRESS_ID });
  return json(409, { error: '다른 기기에서 기록이 바뀌었습니다.', revision: now?.revision ?? 0 });
}

async function login(req: Request, secure: boolean) {
  const fails = (await db()).collection<{ at: Date }>('login_failures');
  await fails.createIndex({ at: 1 }, { expireAfterSeconds: FAIL_WINDOW_MS / 1000 });
  if (await fails.countDocuments({ at: { $gt: new Date(Date.now() - FAIL_WINDOW_MS) } }) >= FAIL_LIMIT)
    return json(429, { error: '로그인 실패가 많아 15분 동안 막았습니다. 잠시 뒤 다시 시도하세요.' });
  const body = await readBody(req) as { username?: unknown; password?: unknown };
  const ok = typeof body?.username === 'string' && typeof body?.password === 'string' && verifyLogin(body.username, body.password);
  if (!ok) { await fails.insertOne({ at: new Date() }); return json(401, { error: '아이디 또는 비밀번호가 틀렸습니다.' }); }
  return json(200, { loggedIn: true }, { 'set-cookie': sessionCookie(makeSession(), secure) });
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url), path = url.pathname.replace(/\/+$/, ''), secure = url.protocol === 'https:';
  const loggedIn = readSession(req.headers.get('cookie'));
  try {
    if (req.method !== 'GET' && req.headers.get('x-fefw') !== '1') return json(403, { error: '허용되지 않은 요청입니다.' });
    if (path === '/api/progress' && req.method === 'GET') return await getProgress();
    if (path === '/api/progress' && req.method === 'PUT') return loggedIn ? await putProgress(req) : json(401, { error: '로그인이 필요합니다.' });
    if (path === '/api/session' && req.method === 'GET') return json(200, { loggedIn });
    if (path === '/api/login' && req.method === 'POST') return await login(req, secure);
    if (path === '/api/logout' && req.method === 'POST') return json(200, { loggedIn: false }, { 'set-cookie': sessionCookie('', secure) });
    return json(404, { error: '없는 주소입니다.' });
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status) return json(status, { error: (e as Error).message });
    console.error('api error', e instanceof Error ? e.message : e);
    return json(503, { error: '기록 서버에 연결하지 못했습니다. 잠시 뒤 다시 시도하세요.' });
  }
}

export const config = { path: ['/api/progress', '/api/session', '/api/login', '/api/logout'] };
