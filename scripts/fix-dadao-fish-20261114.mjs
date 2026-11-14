// 디트리히 대도 영입 물품(코샬루 가아 2마리)은 랜덤 낚시라 12장에 잡으면 연회 반복의 장 다시 하기 때마다 다시 잡아야 한다. 11장까지 잡아 둔다.
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const id = 'recruit-all-dietrich-dadao-20261112--need1', tail = ' 출현 어종이 랜덤이라 12장에 잡으면 장 다시 하기 때마다 다시 잡아야 하므로 11장까지 잡아 둔다.';
const rcRaw = readFileSync('content/source/react-content.json', 'utf8'), rc = JSON.parse(rcRaw);
const b = rc.stages.find(s => s.id === 'dietrich-plan').blocks.find(b => b.id === 'recruit-all-dietrich-dadao-20261112');
const n0 = b.html;
b.html = b.html.replace('aria-label="영입 전에 준비한다: 코샬루 가아 2마리."', `aria-label="영입 전에 준비한다: 코샬루 가아 2마리.${tail}"`).replace(/(<small class="recruit-material-hint">위치<\/small><\/button>\.)(<\/span><\/div><\/li>)/, `$1${tail}$2`);
if ((b.html.match(/11장까지 잡아 둔다/g) || []).length !== 2) throw new Error('대도 글 ' + (b.html === n0));
writeFileSync('content/source/react-content.json', JSON.stringify(rc) + (rcRaw.endsWith('\n') ? '\n' : ''));
const pbRaw = readFileSync('content/data/playbook.json', 'utf8'), pb = JSON.parse(pbRaw);
const a = pb.groups.flatMap(g => g.actions).find(a => a.id === id); a.text = a.text.replace(/\.$/, '.') + tail;
writeFileSync('content/data/playbook.json', JSON.stringify(pb, null, 2) + '\n');
console.log('대도 코샬루 가아 11장까지:', a.text);
