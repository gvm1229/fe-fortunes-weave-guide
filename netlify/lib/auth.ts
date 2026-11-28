// 로그인 확인(2026-11-28 사용자 요청): 아이디·비밀번호는 저장소에 넣지 않고 Netlify 환경 변수에 둔다.
//   AUTH_USER       아이디
//   AUTH_PASS_HASH  scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>  (scripts/hash-password.mjs로 만든다)
//   SESSION_SECRET  로그인 쿠키 서명 열쇠(32바이트 이상 무작위)
import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

export const COOKIE = 'fefw_session';
export const SESSION_DAYS = 30;

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`환경 변수 ${name}이 없습니다.`);
  return v;
}

function same(a: Buffer, b: Buffer) { return a.length === b.length && timingSafeEqual(a, b); }

/** 아이디와 비밀번호가 맞는지. 아이디가 틀려도 같은 계산을 해서 걸리는 시간으로 구별되지 않게 한다. */
export function verifyLogin(user: string, pass: string): boolean {
  const [kind, N, r, p, salt, hash] = env('AUTH_PASS_HASH').split('$');
  if (kind !== 'scrypt') throw new Error('AUTH_PASS_HASH 형식이 아닙니다.');
  const want = Buffer.from(hash, 'base64');
  const got = scryptSync(pass.normalize('NFC'), Buffer.from(salt, 'base64'), want.length, { N: +N, r: +r, p: +p, maxmem: 256 * 1024 * 1024 });
  const userOk = same(Buffer.from(user), Buffer.from(env('AUTH_USER')));
  return same(got, want) && userOk;
}

const sign = (body: string) => createHmac('sha256', env('SESSION_SECRET')).update(body).digest('base64url');

export function makeSession(now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ u: env('AUTH_USER'), exp: now + SESSION_DAYS * 864e5 })).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function readSession(cookieHeader: string | null, now = Date.now()): boolean {
  const raw = (cookieHeader || '').split(/;\s*/).find(c => c.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [body, mac] = raw.split('.');
  if (!body || !mac || !same(Buffer.from(mac), Buffer.from(sign(body)))) return false;
  try { const s = JSON.parse(Buffer.from(body, 'base64url').toString()); return s.u === env('AUTH_USER') && typeof s.exp === 'number' && s.exp > now; }
  catch { return false; }
}

export function sessionCookie(value: string, secure: boolean): string {
  const maxAge = value ? SESSION_DAYS * 86400 : 0;
  return `${COOKIE}=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}
