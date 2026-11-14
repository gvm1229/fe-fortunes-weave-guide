// 세오도라 연회 반복: 주 넘기기(자동 활동)를 연회 뒤로 옮긴다(영입 → 여관 짝 식사 → 선물 → 마법 → 연회 → 주 넘기기 → 다시 하기).
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const T = 'feast-loop-theodora-part1-20261114', S = T + '--skip-week', F = T + '--feast';
const pbRaw = readFileSync('content/data/playbook.json', 'utf8'), pb = JSON.parse(pbRaw), g = pb.groups.find(g => g.id === T);
const [sk] = g.actions.splice(g.actions.findIndex(a => a.id === S), 1); g.actions.splice(g.actions.findIndex(a => a.id === F) + 1, 0, sk);
writeFileSync('content/data/playbook.json', JSON.stringify(pb, null, 2) + '\n');
const rcRaw = readFileSync('content/source/react-content.json', 'utf8'), rc = JSON.parse(rcRaw), b = rc.stages.find(s => s.id === 'theodora-plan').blocks.find(b => b.id === T);
const liOf = id => b.html.match(new RegExp(`<li[^>]*>(?:(?!</li>).)*data-task-id="${id}"(?:(?!</li>).)*</li>`, 's'))[0];
const skLi = liOf(S); b.html = b.html.replace(skLi, ''); const fLi = liOf(F); b.html = b.html.replace(fLi, fLi + skLi);
writeFileSync('content/source/react-content.json', JSON.stringify(rc) + (rcRaw.endsWith('\n') ? '\n' : ''));
console.log(g.actions.map(a => a.id.split('--')[1]).join(' → '));
