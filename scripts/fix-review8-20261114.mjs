// Fable 검토 8: 레다 자스민 카드·지원 집중·주간 준비 정리(자스민은 세오도라에서 영입), 레다 누조 원문 기록의 육성 글, 누조 묶음 머리 인물 링크.
import { readFileSync, writeFileSync as w0 } from 'node:fs';
import { load } from 'cheerio';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const load2 = p => { const raw = readFileSync(p, 'utf8'); return { p, raw, j: JSON.parse(raw) }; };
const save = ({ p, raw, j }) => { const nl = raw.includes('\r\n') ? '\r\n' : '\n', ind = raw.match(/\n( +)"/)?.[1].length || 0; writeFileSync(p, JSON.stringify(j, null, ind).replace(/\n/g, nl) + (raw.endsWith('\n') ? nl : '')); };
const edit = (path, fn) => { const F = load2(path); fn(F.j); save(F); };
const fail = m => { throw new Error(m); };
const sub = (s, re, to, label) => { const n = s.replace(re, to); if (n === s) fail('바뀐 것 없음: ' + label); return n; };
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
const rc = RC.j, dp = DP.j, log = [];
const block = (st, id) => rc.stages.find(s => s.id === st).blocks.find(b => b.id === id) || fail(id);

// M1: 레다 자스민 카드와 자료 제거
for (const F of [RC, DP]) { const i = F.j.people.findIndex(p => p.id === 'person-leda-jasmine'); if (i < 0) fail('jasmine card'); F.j.people.splice(i, 1); }
for (const [path, people] of [['content/data/unit-readiness.json'], ['content/data/training-priorities.json'], ['content/data/roster-selection.json', true], ['content/data/phase-goals.json'], ['content/data/class-path-reasons.json']])
  edit(path, j => { const o = people ? j.routes.leda.people : j.routes.leda; delete o['자스민']; });
MF.j.peopleByRoute.leda -= 1; for (const s of ['leda-plan', 'leda-war-plan', 'part3-plan']) MF.j.peopleByStage[s] -= 1;
log.push('레다 자스민 카드·자료 제거');
// 레다 2장 지원 집중의 자스민
{ const b = block('leda-plan', 'leda-02'); b.html = sub(b.html, /<a class="support-person" href="#person-leda-jasmine">(?:(?!<\/a>).)*<\/a>/s, '', 'leda-02 자스민'); log.push('leda-02 지원 집중 자스민 제거'); }
// 레다 주간 준비(원본 HTML을 고치고 사본은 다시 만든다)
{ let h = rc.prep;
  h = sub(h, /<a class="weekly-person" href="#person-leda-jasmine">(?:(?!<\/a>).)*<\/a>/s, '', '주간 얼굴 자스민');
  h = sub(h, /(<strong>탈것 보존<\/strong><div class="weekly-faces">(?:(?!<\/li>).)*?<p>)둘 다 (<span class="number-token support-token support-req">지원 3<\/span>)/s, '$1$2', '둘 다');
  h = sub(h, /<span class="weekly-gift-choice"><b><span class="reading-person">(?:<img[^>]*\/>)?<b>자스민<\/b><\/span><\/b>(?:(?!<\/span><\/span>|<span class="weekly-gift-choice">).)*?<\/a><\/span>/s, '', '자스민 선물');
  h = sub(h, /<li><a class="weekly-person" href="#person-leda-jasmine">(?:(?!<\/li>).)*<\/li>/s, '', '자스민 대기열');
  if (h.includes('person-leda-jasmine')) fail('prep 자스민 남음');
  rc.prep = h; dp.prep = semantic(h); log.push('레다 주간 준비 자스민 제거');
}
if (JSON.stringify(rc).includes('#person-leda-jasmine')) fail('자스민 링크 남음');

// L1: 레다 누조 카드 원문 기록의 육성 글
{ const p = rc.people.find(p => p.id === 'person-leda-nuzzuo'); let h = p.html;
  h = sub(h, /<tr><th scope="row">레벨업 병과<\/th>.*?<\/tr>/s, '', '레벨업 병과');
  h = sub(h, /<tr data-goal-phase="2"><th scope="row">실전 병과<\/th>.*?<\/tr>/s, '', '실전 병과');
  h = sub(h, /<tr data-goal-phase="2"><th scope="row">병과 교체 이유<\/th>.*?<\/tr>/s, '', '병과 교체 이유');
  h = sub(h, /<div class="training-phase" data-goal-phase="3"><ol class="training-goals">.*?<\/ol><p class="training-note">[^<]*<\/p><\/div>/s, '<div class="training-phase" data-goal-phase="3"><p class="training-note">영입만 한다. 경험치·훈련·시험에 투자하지 않는다.</p></div>', '3부 기능');
  h = h.replace(/<p class="training-note">본대 경험치·훈련을 나누지 않음\. 표시한 기능은 실제로 전투에 쓰기로 골랐을 때만 준비\.<\/p>/g, '<p class="training-note">영입만 한다. 경험치·훈련·시험에 투자하지 않는다.</p>');
  h = sub(h, /<tr data-goal-phase="1"><th scope="row">시험 예산<\/th>.*?<\/tr>/s, '', '시험 예산');
  p.html = h; dp.people.find(x => x.id === p.id).tree = semantic(h); log.push('레다 누조 원문 기록 육성 글 제거');
}
// L3: 레다·카이 누조 묶음 머리 이름을 인물 링크로
for (const [st, id, card] of [['leda-plan', 'recruit-all-leda-nujo-20261114', 'person-leda-nuzzuo'], ['cai-plan', 'recruit-all-cai-nujo-20261114', 'person-cai-nuzzuo']]) {
  const b = block(st, id); b.html = sub(b.html, /<span class="task-person">(<img alt="누조 초상화"[^>]*\/><b>누조<\/b>)<\/span>/, `<a class="task-person" href="#${card}">$1</a>`, id + ' 머리');
  log.push('누조 머리 링크 ' + id);
}
save(RC); save(DP); save(MF);
console.log(log.join('\n'), JSON.stringify(MF.j.peopleByStage));
