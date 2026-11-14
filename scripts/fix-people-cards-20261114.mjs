// 인물 화면: 세오도라·레다 이오 카드 제거(이오는 디트리히·카이만), 레다 누조 카드 추가(네 루트 12장 영입, 선더 소드 지참품).
import { readFileSync, writeFileSync as w0 } from 'node:fs';
import { load } from 'cheerio';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const load2 = p => { const raw = readFileSync(p, 'utf8'); return { p, raw, j: JSON.parse(raw) }; };
const save = ({ p, raw, j }) => { const nl = raw.includes('\r\n') ? '\r\n' : '\n', ind = raw.match(/\n( +)"/)?.[1].length || 0; writeFileSync(p, JSON.stringify(j, null, ind).replace(/\n/g, nl) + (raw.endsWith('\n') ? nl : '')); };
const fail = m => { throw new Error(m); };
const must = (s, a, b) => { if (!s.includes(a)) fail('없음: ' + a.slice(0, 100)); return s.split(a).join(b); };
// transfer.mjs의 semantic()과 같은 변환
function semantic(html) {
  const $ = load(html, null, false);
  function visit(n) {
    if (n.type === 'text') return n.data;
    if (!n.tagName || ['script', 'style', 'svg', 'path', 'input', 'iframe', 'object', 'embed'].includes(n.tagName)) return null;
    const attrs = Object.fromEntries(Object.entries(n.attribs || {}).filter(([k, v]) => /^(href|src|alt|title|id|colspan|rowspan|scope|data-[\w-]+|aria-label)$/.test(k) && !(/^(href|src|data-reference-url)$/.test(k) && /^(?:\s*(?:javascript|data|vbscript):|\/\/)/i.test(v))));
    return { tag: n.tagName, attrs, children: (n.children || []).map(visit).filter(x => x !== null) };
  }
  return $.root().contents().toArray().map(visit).filter(x => x !== null);
}
const RC = load2('content/source/react-content.json'), DP = load2('content/display-parity.json'), MF = load2('content/transfer-manifest.json');
const log = [];
// 1) 이오 카드 제거
for (const id of ['person-theodora-io', 'person-leda-io']) {
  for (const F of [RC, DP]) { const i = F.j.people.findIndex(p => p.id === id); if (i < 0) fail(id); F.j.people.splice(i, 1); }
  log.push('카드 제거 ' + id);
}
// 2) 레다 누조 카드: 세오도라 누조 카드에서 루트·조건·글을 바꾼다
const src = RC.j.people.find(p => p.id === 'person-theodora-nuzzuo') || fail('theodora nuzzuo');
const ledaPortrait = RC.j.people.find(p => p.route === 'leda').html.match(/data-route-origin="leda"[^>]*>(<img[^>]*\/>)/)?.[1] || fail('leda portrait');
let h = src.html;
h = must(h, 'id="person-theodora-nuzzuo"', 'id="person-leda-nuzzuo"');
h = must(h, 'data-recruit-order="2-6-13"', 'data-recruit-order="2-6-10"');
h = must(h, 'data-role3="보완"', 'data-role3="수집"');
h = must(h, '<strong class="unit-role role-보완" data-goal-phase="3">보완</strong>', '<strong class="unit-role role-수집" data-goal-phase="3">수집</strong>');
h = h.replace(/(<span class="unit-route-origin" data-route-origin=")theodora(" hidden="">)<img[^>]*\/>/, `$1leda$2${ledaPortrait}`);
h = must(h, '<b>세오도라 루트</b>', '<b>레다 루트</b>');
h = must(h, 'data-path-route="theodora"', 'data-path-route="leda"');
{ const n0 = h; h = h.replace(/(<div class="scout-requirement support-req">(?:(?!<\/div>).)*<b>)LV 1(<\/b>)/s, '$1LV 3$2').replace(/(<div class="scout-requirement renown-req">(?:(?!<\/div>).)*<b>)LV 6(<\/b>)/s, '$1LV 9$2'); if ((h.match(/LV [39]<\/b>/g) || []).length !== 2 || h === n0) fail('scout LV'); }
const reason = '<strong class="item-token">선더 소드</strong> 지참품 확보(12장 영입) · 투자 없음';
h = h.replace(/카이의 실제 활 전력 · 다른 판은 부족한 <strong class="item-token">선더 소드<\/strong> 지참품만 확보/g, reason);
h = h.replace(/<p class="selection-note">별도 전투 육성·시험은 생략합니다\.<\/p>/g, '<p class="selection-note">출격·시험·훈련에 쓰지 않습니다.</p>');
h = must(h, '<div data-goal-phase="1">권장 10장 실제 합류 뒤 · 현재 자격·기능 확인 · 보존·수집</div>', '<div data-goal-phase="1">12장 영입 뒤 지참품의 <strong class="item-token">선더 소드</strong> 확인</div>');
h = h.replace(/<tr data-goal-phase="1"><th scope="row">1부 준비 마감<\/th>.*?<\/tr>/s, '');
h = h.replace(/(<th scope="row">영입 계획<\/th><td><ul class="goal-lines">).*?(<\/ul>)/s, `$1<li>앞 루트에서 올린 레다와의 지원을 이어 <span class="number-token support-token support-req">지원 3</span>까지 준비</li><li>12장에 <span class="number-token renown-token renown-req">명성 9</span>·<span class="number-token support-token support-req">지원 3</span>·철의 활 3개를 갖추고 지참품의 <strong class="item-token">선더 소드</strong>를 확인한 뒤 스카우트</li><li>12장 전에 영입하면 <strong class="item-token">선더 소드</strong>가 없다 · 철의 활은 11장까지 사 둔다</li>$2`);
h = must(h, '<b>1부</b> · 9장 이후 · <span class="number-token renown-token renown-req">명성 6</span> · <span class="number-token support-token support-req">지원 1</span> · ', '<b>1부</b> · 12장 · <span class="number-token renown-token renown-req">명성 9</span> · <span class="number-token support-token support-req">지원 3</span> · ');
h = must(h, '<td>최종 25명 밖의 실전 예비. 1·2부에서 키운 전력을 전투에 맞춰 교대.</td>', '<td>영입만 한다. 출격·시험·훈련에 쓰지 않는다.</td>');
if (/세오도라|theodora|권장 10장/.test(h.replace(/https?:[^"]+/g, ''))) fail('세오도라 흔적: ' + h.match(/.{0,60}(세오도라|theodora|권장 10장).{0,60}/)[0]);
const card = { ...src, id: 'person-leda-nuzzuo', route: 'leda', roles: { 1: '수집', 2: '수집', 3: '수집' }, kind: '보존·수집', order: '2-6-10', html: h };
const at = RC.j.people.findIndex(p => p.route === 'leda' && p.name === '사란'); if (at < 0) fail('사란');
RC.j.people.splice(at, 0, card);
const { html, ...rest } = card; DP.j.people.splice(DP.j.people.findIndex(p => p.id === 'person-leda-sha-lan'), 0, { ...rest, tree: semantic(html) });
log.push('카드 추가 person-leda-nuzzuo');
// 3) 자료: 레다 누조(세오도라 누조 자료를 레다 조건으로)
const cond = '명성 9 · 지원 3 · 철의 활 3', plan = `12장 · ${cond} · 지참품의 선더 소드 확인 뒤 영입`;
const clone = o => JSON.parse(JSON.stringify(o));
const edit = (path, fn) => { const F = load2(path); fn(F.j); save(F); };
edit('content/data/unit-readiness.json', j => { const u = clone(j.routes.theodora['누조']); Object.assign(u, { joinPlan: plan, joinSteps: [`12장에 ${cond}을 갖추고 지참품의 선더 소드를 확인한 뒤 스카우트`, '12장 전에 영입하면 선더 소드가 없다 · 일찍 영입하지 않는다'], supportStartChapter: 1 }); j.routes.leda['누조'] = u; });
edit('content/data/training-priorities.json', j => { j.routes.leda['누조'] = clone(j.routes.theodora['누조']); });
edit('content/data/roster-selection.json', j => { const r = clone(j.routes.theodora.people['누조']); r.recruitDecision = plan; j.routes.leda.people['누조'] = r; });
edit('content/data/phase-goals.json', j => { j.routes.leda['누조'] = clone(j.routes.theodora['누조']); });
edit('content/data/class-path-reasons.json', j => { j.routes.leda['누조'] = clone(j.routes.theodora['누조']); });
// 4) 인물 수
const m = MF.j; m.peopleByRoute.theodora -= 1;
for (const s of ['theodora-plan', 'theodora-war-plan']) m.peopleByStage[s] -= 1;
m.peopleByStage['part3-plan'] -= 1; // 이오 2 빼고 레다 누조 1 더함
save(RC); save(DP); save(MF);
console.log(log.join('\n'), JSON.stringify(m.peopleByRoute), JSON.stringify(m.peopleByStage));
// 5) 세오도라·레다 이오 자료도 뺀다(카드와 자료 인물 수를 맞춘다: 60명 × 3부 = 180).
for (const [path, people] of [['content/data/unit-readiness.json'], ['content/data/training-priorities.json'], ['content/data/roster-selection.json', true], ['content/data/phase-goals.json'], ['content/data/class-path-reasons.json']]) {
  edit(path, j => { for (const r of ['theodora', 'leda']) { const o = people ? j.routes[r].people : j.routes[r]; if (o['이오']) delete o['이오']; } });
}
console.log('세오도라·레다 이오 자료 제거');
