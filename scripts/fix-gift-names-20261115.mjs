// Fable 검토 11 M2(2026-11-15 사용자 결정: 홍소·창소로 통일): 같은 물품이 "고슈/소슈"와 "홍소/창소"로 갈리던 것을 홍소·창소로 맞춘다.
import { readFileSync, writeFileSync as w0, readdirSync } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${d}/${e.name}`) : /\.(json|md)$/.test(e.name) ? [`${d}/${e.name}`] : []);
const files = ['content/source/react-content.json', 'content/display-parity.json', 'content/display-overrides.json', 'content/character-copy.json', ...walk('content/data').filter(f => !/checklist\.json$/.test(f)), ...walk('content/notes'), ...walk('content/routes')];
// 한국어 이름은 turam.dev 도감(이미 싼 선물에 쓰는 이름)을 따른다.
const map = [['진홍 고슈', '진홍 홍소'], ['화산 고슈', '화산 홍소'], ['원기 고슈', '자극적인 홍소'], ['향긋한 소슈', '향긋한 창소']];
const count = {};
for (const f of files) { let s = readFileSync(f, 'utf8'); const s0 = s; for (const [a, b] of map) { const n = s.split(a).length - 1; if (n) { count[a] = (count[a] || 0) + n; s = s.split(a).join(b); } } if (s !== s0) writeFileSync(f, s); }
console.log(count);
const left = files.flatMap(f => (readFileSync(f, 'utf8').match(/[가-힣]+ (?:고슈|소슈)/g) || []).map(m => f + ': ' + m));
if (left.length) { console.log('남은 고슈/소슈:\n' + left.join('\n')); process.exit(1); }
