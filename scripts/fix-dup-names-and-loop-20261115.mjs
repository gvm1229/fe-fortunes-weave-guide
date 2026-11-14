// 1) 영어(일본어) 원래 이름을 한국어로 바꾸면서 생긴 "X(X)"·"X X"·그림 표 이름 불일치를 고친다(2026-11-15 사용자 지적과 같은 종류).
// 2) Fable 검토 10 M1~M3: 연회 반복의 마지막 회차에 연회 한 번 더(오르헬·티아라·디에고 쌍), 여관 짝 식사 확인·대안, 디트리히 제스터(전투 의뢰 3개)는 마지막 회차.
import { readFileSync, writeFileSync as w0, readdirSync } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const fail = m => { throw new Error(m); };
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${d}/${e.name}`) : e.name.endsWith('.md') ? [`${d}/${e.name}`] : []);
const files = ['content/source/react-content.json', 'content/display-parity.json', 'content/data/playbook.json', 'content/display-overrides.json', ...walk('content/notes').filter(f => !/backups/.test(f))];
const terms = ['탐색 파견', '야시로 요새', '탈보스 남도', '도시 여관', '페잔 관문', '재계의 제단', '차축 부품', '전투 예고', '남쪽 통로', '디오네 요새', '이데아의 활'];
const swaps = [
  ...terms.map(t => [`${t}(${t})`, t]),
  ['페잔 관문 페잔 관문.', '페잔 관문.'],
  ['발레리 협곡 · 아말테아. 태양 열매를 확인하고', '발레리 협곡 · 아말테아. 지도 채집 표의 Thry Fruit(태양 열매)를 확인하고'],
  ['지도 채집 표의 유나메이를 확인합니다', '지도 채집 표의 Yuna Mei(유나메이)를 확인합니다'],
];
const count = {};
for (const f of files) {
  let s = readFileSync(f, 'utf8'); const s0 = s;
  for (const [a, b] of swaps) { const n = s.split(a).length - 1; if (n) { s = s.split(a).join(b); count[a] = (count[a] || 0) + n; } }
  if (s !== s0) writeFileSync(f, s);
}
for (const [a] of swaps) if (!count[a]) fail('바꿀 곳 없음: ' + a);
console.log(Object.entries(count).map(([a, n]) => `${a} ×${n}`).join('\n'));

// 연회 반복 글(덮어쓰기). 이 행동들은 원본에 버튼·그림이 없다.
const ovRaw = readFileSync('content/display-overrides.json', 'utf8'), ov = JSON.parse(ovRaw);
const pbRaw = readFileSync('content/data/playbook.json', 'utf8'), pb = JSON.parse(pbRaw);
const rc = JSON.parse(readFileSync('content/source/react-content.json', 'utf8'));
const all = rc.stages.flatMap(s => s.blocks.map(b => b.html)).join('');
const set = (id, text) => { const li = all.match(new RegExp(`data-task-id="${id}"(?:(?!</li>).)*</li>`, 's'))?.[0] || fail('li ' + id); if (/<button|<img/.test(li)) fail('마크업 있음 ' + id); ov.actions[id] = text; const a = pb.groups.flatMap(g => g.actions).find(a => a.id === id) || fail(id); a.text = text; };
const T = 'feast-loop-theodora-part1-20261114';
set(T + '--inn-pair', '여관에서 티아라·디에고를 지원을 올릴 상대 두 명과 함께 식사한다(예: 디에고·세테스·하르빈, 티아라·보나파르트·울턴드, 티아라·세테스·루루디아). 세오도라와의 영입 지원(티아라 지원 3·디에고 지원 2)도 선물·식사로 채운다. 첫 회차에 식사 뒤 지원 목록에서 실제로 올랐는지 확인하고, 오르지 않으면 이 식사는 그만두고 마지막 회차의 연회로 올린다.');
set(T + '--target', '「루트별 지원 대화」 문서의 세오도라 표에 있는 모든 쌍이, 그 줄에 1부·1·2부·2부로 적힌 가장 높은 단계까지 열릴 때까지 반복한다. 오르헬(외전으로만 합류 준비)·티아라·디에고의 쌍은 마지막 회차에서 채운다. 2부에는 연회가 없다.');
set(T + '--final-pass', '나머지 쌍이 목표 단계에 닿으면 마지막 회차에서만 카이 외전 → 오르헬 외전 → 티아라·디에고 영입 순서로 끝낸다. 그 뒤 다시 하기 없이 연회를 한 번 더 해 오르헬·티아라·디에고의 쌍을 올리고, 여관에서 대화를 본다.');
set('feast-loop-dietrich-part1-20261114--recruit', '12장에 영입할 수 있는 동료(게이츠·대도·누조 등)를 먼저 영입한다. 장 다시 하기를 하면 풀리므로 회차마다 다시 한다. 제스터는 전투 의뢰 3개가 조건이라 반복 회차에는 하지 않고, 마지막 회차에서 영입한 뒤 다시 하기 없이 연회를 한 번 더 해 제스터의 쌍을 올린다.');
writeFileSync('content/display-overrides.json', JSON.stringify(ov, null, 2) + (ovRaw.endsWith('\n') ? '\n' : ''));
writeFileSync('content/data/playbook.json', JSON.stringify(pb, null, 2) + '\n');
// 안내 문서
const nf = 'content/notes/support-follow-along.md'; let md = readFileSync(nf, 'utf8'); const nl = md.includes('\r\n') ? '\r\n' : '\n'; md = md.replace(/\r\n/g, '\n');
const anchor = '   - 외전을 12장 전에 끝내는 루트(레다의 오르헬 외전은 11장)는 다시 하기 뒤에도 외전이 남으므로 스카우트만 다시 한다.';
if (!md.includes(anchor)) fail('md anchor');
md = md.replace(anchor, anchor + '\n   - 여관 짝 식사는 첫 회차에 지원 목록으로 실제로 오르는지 확인한다. 오르지 않으면 마지막 회차의 연회로 올린다.\n   - 마지막 회차에서 외전·영입을 끝낸 뒤에는 다시 하기 없이 연회를 한 번 더 해 그 인물(세오도라: 오르헬·티아라·디에고, 디트리히: 제스터)의 쌍을 올린다. 전투 의뢰 여러 개가 조건인 영입(디트리히 제스터)도 같은 방법이다.');
writeFileSync(nf, md.replace(/\n/g, nl));
console.log('연회 반복 글 4개·안내 문서 갱신');
