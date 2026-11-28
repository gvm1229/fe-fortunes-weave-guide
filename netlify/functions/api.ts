// 진행 기록 API(2026-11-28 사용자 요청): 보기는 누구나, 고치기는 로그인한 사람만.
//   GET  /api/progress   저장된 기록(체크·내 상태·인물 육성 기록)
//   PUT  /api/progress   { baseRevision, data } 로그인 필요. 서버 revision이 baseRevision과 다르면 409(두 기기가 서로 덮어쓰지 않게)
//   GET  /api/session    { loggedIn }
//   POST /api/login      { username, password } → 로그인 쿠키(HttpOnly, 30일)
//   POST /api/logout
//   GET  /api/history    ?before=<revision>&limit=<1~50> 변경 기록(새것부터, 누구나 봄, U76)
import { validateChecks, type StatusLimits } from '../../lib/check-state';
import catalog from '../../content/data/boon-catalog.json';
import { makeSession, readSession, sessionCookie, verifyLogin } from '../lib/auth';
import { db, PROGRESS_ID, type ProgressDoc } from '../lib/db';
import { diff, entry, sameField, MERGE_MS, type HistoryEntry } from '../lib/history';

// 변경 기록 색인은 함수가 처음 쓸 때 한 번만 만든다. 실패해도 보기·저장은 계속한다(Fable 검토 지적 5).
let historyIndex: Promise<unknown> | undefined;
async function historyCol() {
  const col = (await db()).collection<HistoryEntry>('history');
  historyIndex ??= col.createIndex({ revision: -1 }).catch(() => { historyIndex = undefined; });
  await historyIndex;
  return col;
}

const limits: StatusLimits = {
  boons: Object.fromEntries(catalog.boons.map(b => [b.id, b.tiers.length])),
  gods: Object.fromEntries(catalog.gods.map(g => [g.name, g.max])),
};
const MAX_BODY = 512 * 1024, MAX_LOGIN_BODY = 4 * 1024;
// 로그인 실패 제한(Fable 검토 지적 4): 시도를 먼저 기록한 뒤 세어 동시 요청으로 뚫리지 않게 한다. IP별 10번, 전체 100번(다른 사람이 주인을 막기 어렵게).
const FAIL_WINDOW_MS = 15 * 60 * 1000, FAIL_LIMIT_IP = 10, FAIL_LIMIT_ALL = 100;

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

async function readBody(req: Request, max = MAX_BODY): Promise<unknown> {
  const tooBig = () => Object.assign(new Error('요청이 너무 큽니다.'), { status: 413 });
  if (Number(req.headers.get('content-length') || 0) > max) throw tooBig();
  const text = await req.text();
  if (Buffer.byteLength(text) > max) throw tooBig();
  try { return JSON.parse(text); } catch { throw Object.assign(new Error('JSON이 아닙니다.'), { status: 400 }); }
}

async function getProgress() {
  const doc = await (await db()).collection<ProgressDoc>('progress').findOne({ _id: PROGRESS_ID });
  return json(200, doc ? { revision: doc.revision, updatedAt: doc.updatedAt, data: doc.data } : { revision: 0, data: null });
}

async function putProgress(req: Request) {
  const body = await readBody(req) as { baseRevision?: unknown; data?: unknown; labels?: unknown };
  const labels = body?.labels && typeof body.labels === 'object' && !Array.isArray(body.labels) ? body.labels as Record<string, unknown> : {};
  const base = body?.baseRevision;
  if (!Number.isInteger(base) || (base as number) < 0) return json(400, { error: 'baseRevision이 없습니다.' });
  let data;
  try { data = validateChecks(body.data, limits, true); } catch (e) { return json(400, { error: e instanceof Error ? e.message : '기록 형식이 틀렸습니다.' }); }
  const revision = (base as number) + 1, updatedAt = new Date().toISOString();
  const doc = { ...data, revision, updatedAt };
  const col = (await db()).collection<ProgressDoc>('progress');
  // 바꾸기 직전 값을 같은 연산에서 받아 변경 기록을 만든다(그 사이 다른 저장이 끼어들 수 없다).
  let before: ProgressDoc | null | undefined;
  if (base === 0) {
    try { await col.insertOne({ _id: PROGRESS_ID, revision, updatedAt, data: doc }); before = null; }
    catch { /* 이미 있음 → 아래 충돌 처리 */ }
  } else {
    before = await col.findOneAndUpdate({ _id: PROGRESS_ID, revision: base as number }, { $set: { revision, updatedAt, data: doc } }, { returnDocument: 'before' });
  }
  if (before !== undefined && (base === 0 || before)) {
    const changes = diff(before?.data as Parameters<typeof diff>[0], doc, labels);
    // 기록 쓰기가 실패해도 저장은 이미 끝났으니 성공으로 답한다(기록은 보조).
    if (changes.length) await logChanges(revision, changes).catch(e => console.error('history', e instanceof Error ? e.message : e));
    return json(200, { revision, updatedAt });
  }
  const now = await col.findOne({ _id: PROGRESS_ID });
  return json(409, { error: '다른 기기에서 기록이 바뀌었습니다.', revision: now?.revision ?? 0 });
}

/** 변경 기록 쓰기. 바로 앞 기록(revision-1)이 같은 칸을 15초 안에 고친 것이면 새로 쓰지 않고 그 기록의 끝 값·시각·revision만 고친다. */
async function logChanges(revision: number, changes: ReturnType<typeof diff>) {
  const col = await historyCol(), now = new Date();
  const last = await col.findOne({ revision: revision - 1 });
  if (last && now.getTime() - new Date(last.at).getTime() < MERGE_MS && sameField(last.changes, changes)) {
    const [prev, next] = [last.changes[0], changes[0]];
    const merged = prev.type === 'status' && next.type === 'status' ? { ...prev, to: next.to }
      : prev.type === 'build' && next.type === 'build' ? { ...next, op: prev.op === 'add' && next.op !== 'remove' ? 'add' as const : next.op } : next;
    await col.updateOne({ _id: last._id }, { $set: { at: now, revision, changes: [merged], total: 1 } });
    return;
  }
  await col.insertOne(entry(revision, changes, now));
}

async function getHistory(url: URL) {
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 30));
  const raw = url.searchParams.get('before'), before = raw === null ? null : Number(raw);
  if (before !== null && (!Number.isInteger(before) || before < 0)) return json(400, { error: 'before는 revision 숫자여야 합니다.' });
  const col = await historyCol();
  // revision은 저장마다 하나씩 커지므로 겹치지 않는 커서가 된다(같은 시각 기록이 쪽 경계에서 빠지지 않게, Fable 검토 지적 4).
  const items = await col.find(before !== null ? { revision: { $lt: before } } : {}, { projection: { _id: 0 } }).sort({ revision: -1 }).limit(limit + 1).toArray();
  return json(200, { items: items.slice(0, limit), more: items.length > limit });
}

async function login(req: Request, secure: boolean) {
  const body = await readBody(req, MAX_LOGIN_BODY) as { username?: unknown; password?: unknown };
  const attempts = (await db()).collection<{ at: Date; ip: string }>('login_attempts');
  await attempts.createIndex({ at: 1 }, { expireAfterSeconds: FAIL_WINDOW_MS / 1000 });
  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const mine = await attempts.insertOne({ at: new Date(), ip });
  const since = { $gt: new Date(Date.now() - FAIL_WINDOW_MS) };
  const [byIp, all] = await Promise.all([attempts.countDocuments({ ip, at: since }), attempts.countDocuments({ at: since })]);
  if (byIp > FAIL_LIMIT_IP || all > FAIL_LIMIT_ALL) return json(429, { error: '로그인 실패가 많아 잠시 막았습니다. 15분 뒤 다시 시도하세요.' });
  const ok = typeof body?.username === 'string' && typeof body?.password === 'string' && verifyLogin(body.username, body.password);
  if (!ok) return json(401, { error: '아이디 또는 비밀번호가 틀렸습니다.' });
  await attempts.deleteOne({ _id: mine.insertedId });
  return json(200, { loggedIn: true }, { 'set-cookie': sessionCookie(makeSession(), secure) });
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url), path = url.pathname.replace(/\/+$/, ''), secure = url.protocol === 'https:';
  try {
    // 세션 확인도 try 안에서 한다: 환경 변수가 빠져도 보기(GET /api/progress)는 계속 된다(Fable 검토 지적 6).
    const session = () => readSession(req.headers.get('cookie'));
    if (req.method !== 'GET' && req.headers.get('x-fefw') !== '1') return json(403, { error: '허용되지 않은 요청입니다.' });
    if (path === '/api/progress' && req.method === 'GET') return await getProgress();
    if (path === '/api/progress' && req.method === 'PUT') return session() ? await putProgress(req) : json(401, { error: '로그인이 필요합니다.' });
    if (path === '/api/history' && req.method === 'GET') return await getHistory(url);
    if (path === '/api/session' && req.method === 'GET') return json(200, { loggedIn: session() });
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

export const config = { path: ['/api/progress', '/api/session', '/api/login', '/api/logout', '/api/history'] };
