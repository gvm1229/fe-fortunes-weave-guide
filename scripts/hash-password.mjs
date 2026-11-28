// 로그인 비밀번호 해시 만들기(2026-11-28). 비밀번호는 저장소·명령 기록에 남기지 않으려고 환경 변수로 받는다.
//   PowerShell: $env:NEW_PASSWORD='...'; node scripts/hash-password.mjs
// 출력(scrypt$N$r$p$salt$hash)을 Netlify 환경 변수 AUTH_PASS_HASH에 넣는다.
import { randomBytes, scryptSync } from 'node:crypto';
const pass = process.env.NEW_PASSWORD;
if (!pass) { console.error('NEW_PASSWORD 환경 변수가 없습니다.'); process.exit(1); }
const N = 16384, r = 8, p = 1, salt = randomBytes(16);
const hash = scryptSync(pass.normalize('NFC'), salt, 32, { N, r, p });
process.stdout.write(['scrypt', N, r, p, salt.toString('base64'), hash.toString('base64')].join('$'));
