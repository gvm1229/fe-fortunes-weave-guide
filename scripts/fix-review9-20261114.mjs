// Fable 검토 9 M2: 숨김 속성이 렌더에서 빠져 체크 0개에도 "모두 체크했습니다"가 보이던 원본 문단을 지운다.
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const text = n => typeof n === 'string' ? n : n.children.map(text).join('');
const para = '<p class="empty-stage" hidden="">이 루트의 행동을 모두 체크했습니다.</p>';
let n = 0, m = 0;
const rcRaw = readFileSync('content/source/react-content.json', 'utf8'), rc = JSON.parse(rcRaw);
for (const s of rc.stages) for (const b of s.blocks) if (b.html.includes(para)) { b.html = b.html.split(para).join(''); n++; }
writeFileSync('content/source/react-content.json', JSON.stringify(rc) + (rcRaw.endsWith('\n') ? '\n' : ''));
const dpRaw = readFileSync('content/display-parity.json', 'utf8'), dp = JSON.parse(dpRaw);
const walk = node => { if (typeof node === 'string') return node; node.children = node.children.filter(c => !(typeof c !== 'string' && c.tag === 'p' && text(c) === '이 루트의 행동을 모두 체크했습니다.' && ++m)).map(walk); return node; };
for (const s of dp.stages) for (const b of s.blocks) if (b.tree) b.tree = b.tree.map(walk);
writeFileSync('content/display-parity.json', JSON.stringify(dp) + (dpRaw.endsWith('\n') ? '\n' : ''));
console.log('원본', n, '사본', m);
