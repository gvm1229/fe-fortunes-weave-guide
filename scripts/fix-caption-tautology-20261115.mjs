// 그림 설명의 "X가 X다" 오류(2026-11-15 사용자 지적: "반짝반짝어가 반짝반짝어 위치입니다").
// 그림은 영어판 Game8 지도라 원래 "목록의 (영어 이름)가 (한국어 이름)이다"였는데, 영어 이름까지 한국어로 바꾸면서 같은 말이 됐다.
// 영어 이름을 되살린다: Yuna Mei = 유나메이, Thry Fruit = 태양 열매, Paradise Fish = 반짝반짝어.
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const fail = m => { throw new Error(m); };
const raw = readFileSync('content/source/react-content.json', 'utf8'), rc = JSON.parse(raw);
const dp = JSON.parse(readFileSync('content/display-parity.json', 'utf8'));
const log = [];
const edit = (stage, id, pairs) => {
  const b = rc.stages.find(s => s.id === stage).blocks.find(b => b.id === id) || fail(id);
  if (dp.stages.find(s => s.id === stage)?.blocks.some(x => x.id === id)) fail('사본 트리에도 있음 ' + id);
  for (const [from, to] of pairs) { const n = b.html.split(from).length - 1; if (n < 1) fail(`${id}: 없음 ${from.slice(0, 60)}`); b.html = b.html.split(from).join(to); }
  log.push(id);
};
// 유나메이
edit('theodora-plan', 'theo-levin-yunamei', [
  ['alt="다마센 곶 채집 목록: 유나메이가 유나메이다.', 'alt="다마센 곶 채집 목록: 목록의 Yuna Mei가 유나메이다.'],
  ['<figcaption>다마센 곶 채집 목록: 유나메이가 <strong class="item-token">유나메이</strong>다.', '<figcaption>다마센 곶 채집 목록: 목록의 Yuna Mei가 <strong class="item-token">유나메이</strong>다.'],
]);
// 태양 열매
{
  const b = rc.stages.find(s => s.id === 'theodora-plan').blocks.find(b => b.id === 'theo-levin-thry');
  const cap = b.html.match(/<figcaption>발레리 협곡 채집 목록: 태양 열매가 (?:(?!<\/figcaption>).)*?다\./s)?.[0] || fail('thry caption');
  edit('theodora-plan', 'theo-levin-thry', [
    ['alt="발레리 협곡 채집 목록: 태양 열매가 태양 열매다.', 'alt="발레리 협곡 채집 목록: 목록의 Thry Fruit가 태양 열매다.'],
    [cap, cap.replace('발레리 협곡 채집 목록: 태양 열매가 ', '발레리 협곡 채집 목록: 목록의 Thry Fruit가 ')],
  ]);
}
// 반짝반짝어(4곳): 그림 설명은 버튼(위치)을 남기고 "목록의 Paradise Fish가 [반짝반짝어]입니다", 대체 글도 같은 뜻으로
for (const [stage, id] of [['theodora-plan', 'theo-06'], ['theodora-plan', 'theo-prep-ch08-fish'], ['theodora-plan', 'theo-prep-rine-fish'], ['dietrich-plan', 'di-08']]) {
  const b = rc.stages.find(s => s.id === stage).blocks.find(b => b.id === id);
  const alt = b.html.match(/alt="브론테스호 · 사베일론\. 표시된 물고기는 반짝반짝어입니다\./)?.[0] || fail('alt ' + id);
  const cap = b.html.match(/<figcaption>브론테스호 · 사베일론\. 반짝반짝어가 (<button[^>]*data-recruit-material="paradise-fish"(?:(?!<\/button>).)*<\/button>)입니다\./s) || fail('cap ' + id);
  const button = cap[1].replace(/<small class="recruit-material-hint">위치<\/small>/, '<small class="recruit-material-hint">위치</small>');
  edit(stage, id, [[alt, 'alt="브론테스호 · 사베일론. 목록의 Paradise Fish가 반짝반짝어입니다.'], [cap[0], `<figcaption>브론테스호 · 사베일론. 목록의 Paradise Fish가 ${button}입니다.`]]);
}
writeFileSync('content/source/react-content.json', JSON.stringify(rc) + (raw.endsWith('\n') ? '\n' : ''));
console.log('고침:', log.join(', '));
