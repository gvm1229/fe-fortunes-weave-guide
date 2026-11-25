// 2026-11-25 전수 사실 검사 반영(한 번만 실행). 근거: docs/fact-audit-2026-11-25.md
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const fail = m => { throw new Error(m); };
const files = ['content/data/playbook.json', 'content/source/react-content.json', 'content/display-overrides.json', 'content/data/chapter-route-plan.json', 'content/notes/chapter-route-plan.md', 'content/data/recruitment-gates.json', 'content/notes/recruit-all-review.md', 'content/data/chapter-progression.json'];
const raw = {};
for (const f of files) { try { raw[f] = readFileSync(f, 'utf8'); } catch { /* 없는 파일은 건너뜀 */ } }
const log = [];
// 붙여 쓴 숫자(예: "명성10")와 띄어 쓴 숫자 모두 바꾼다.
const variants = s => { const v = new Set([s]); v.add(s.replace(/ (?=\d)/g, '')); return [...v]; };
function sub(from, to, min = 1, only) {
  let n = 0;
  for (const f of Object.keys(raw)) {
    if (only && !only.includes(f)) continue;
    for (const [a, b] of variants(from).map((v, i) => [v, i === 0 ? to : to.replace(/ (?=\d)/g, '')])) {
      const c = raw[f].split(a).length - 1; if (c) { raw[f] = raw[f].split(a).join(b); n += c; }
    }
  }
  if (n < min) fail(`치환 0: ${from.slice(0, 40)}`);
  log.push(`치환 ${n}: ${from.slice(0, 30)}`);
}

// ── 이오 영입금: 카이 4,000G(지원 3·명성 10), 레다 1,500G(지원 1·명성 6). 한국어 도감·AppMedia·GameWith·RPG Site
sub('이오는 명성 10·지원 3·800G', '이오는 명성 10·지원 3·4,000G');
sub('이오 교섭 직전 800G를', '이오 교섭 직전 4,000G를');
sub('이오(명성 6·지원 1·800G)', '이오(명성 6·지원 1·1,500G)');
// "조건을 충족한 이오에게 800G" 는 카이 10장 묶음에만 고친다(디트리히 800G는 맞음).
{
  const f = 'content/source/react-content.json'; const rc = JSON.parse(raw[f]);
  const b = rc.stages.find(s => s.id === 'cai-plan').blocks.find(b => b.id === 'cai-route-10') || fail('cai-route-10');
  const n0 = b.html; b.html = b.html.split('조건을 충족한 이오에게 800G를').join('조건을 충족한 이오에게 4,000G를');
  if (b.html === n0) fail('cai-route-10 이오 800G'); raw[f] = JSON.stringify(rc);
  const p = 'content/data/playbook.json'; const pb = JSON.parse(raw[p]);
  const a = pb.groups.flatMap(g => g.actions).find(a => a.id === 'cai-route-10--7e6ce53b58') || fail('pb cai io');
  a.text = a.text.replace(/800G/, '4,000G'); raw[p] = JSON.stringify(pb, null, 2) + '\n';
  const o = 'content/display-overrides.json'; const ov = JSON.parse(raw[o]);
  if (ov.actions['cai-route-10--7e6ce53b58']) ov.actions['cai-route-10--7e6ce53b58'] = ov.actions['cai-route-10--7e6ce53b58'].replace(/800G/, '4,000G');
  raw[o] = JSON.stringify(ov, null, 2) + '\n'; log.push('카이 10장 이오 영입 4,000G');
}

// ── 선더 소드 반다르 상회 교환은 1부 8장부터(GameWith·한국어 도감)
sub('교환은 6장 이후 태양 열매', '교환은 8장부터 태양 열매');
sub('6장 이후 반다르 상회에서', '8장부터 반다르 상회에서');
sub('선더 소드 교환은 6장부터 장마다 목록을 확인한다. 없으면 진행 후 다시 보고, 8장에 다시 점검한다.', '선더 소드 교환은 8장부터 열린다. 그 전에는 재료만 모으고 8장에 목록을 확인한다.');
sub('6장 재고를 확정하지 않는다', '교환은 8장부터 연다(GameWith·한국어 도감)');
sub('6장 확보를 확정하지 않으며 없으면 재료를 보관하고 진행 뒤 또는 8장 이후에 다시 확인한다.', '교환은 8장부터 열리므로 그 전에는 재료만 보관하고 8장 이후에 확인한다.');
sub('6장 이후 · 선더 소드 교환 재료 계산', '6장 이후 · 선더 소드 교환 재료 계산(교환은 8장부터)');
// 1부 칼리아네이라 항구는 선더 소드를 팔지 않는다(3부 +2만). 한국어 도감 상점 목록·GameWith 입수처
sub('<b>상점 재고 확인</b><p>판매처: 칼리아네이라 항구 무기점</p>', '<b>교환·영입 지참</b><p>1부에는 파는 곳이 없다. 8장부터 반다르 상회 교환, Lv29 이상 누조·제스터 영입 지참품으로 얻는다. 칼리아네이라 항구는 3부에 +2를 판다.</p>', 1, ['content/source/react-content.json']);

// ── 카이 루트 오르헬 외전: 수락 10/18~10/20, 완료 10/21(한국어 도감·GameWith)
sub('실제 수락창 10/18~10/19과 완료 마감을 구분하고 마지막 날까지 미루지 않는다.', '수락은 10/20까지 열린다. 마지막 날까지 미루지 않는다.');

// ── 레다 루트 디트리히 외전: 10/22 뒤에도 수락 가능, 완료 11/1(한국어 도감·RPG Site)
sub('수락은 10/22 전, 완료는 11/1까지다.', '10/22 뒤에도 수락할 수 있지만 완료는 11/1까지다.');
sub('10/22가 지난 뒤 새로 수락하려 하지 않는다.', '수락을 마지막 주까지 미루지 않는다.');

// ── 디트리히 4장 자유행동은 3월에 시작(RPG Site 3/27~4/10, GameWith 4장 3월)
sub('이 장은 4/7~4/10로 짧다.', '이 장 자유행동은 4/10까지로 짧다.');

// ── 레다 루트 이니오니 영입금 3,000G(GameWith·RPG Site·한국어 도감)
sub('영입금은 안전하게 6,000G를 남기되 실제 레다 교섭창을 우선한다. Game8은 레다 3,000G, 로컬 공통 표는 6,000G라 차이가 있다.', '영입금 3,000G를 남긴다(GameWith·RPG Site·한국어 도감).');

// ── 3부: 전용 최상급은 2구간부터(신전 복구·신의 부탁). GameWith 3구간 "새로 열리는 것 없음"·RPG Site
sub('3부3구간 이후 · 릴리안 보우 나이트', '3부 2구간 이후 · 릴리안 보우 나이트');
sub('3부 3구간 이후 · 릴리안', '3부 2구간 이후 · 릴리안');
sub('신전 의뢰 뒤 하이 에피타프 등 전용 최상급 해금. 실제 개별 자격을 확인한다.', '새로 열리는 병종은 없다. 전용 최상급(하이 에피타프 등)은 2구간부터 신전 복구·신의 부탁으로 연다.');
{
  const f = 'content/source/react-content.json'; const rc = JSON.parse(raw[f]); let n = 0;
  for (const b of rc.stages.find(s => s.id === 'part3-plan').blocks) {
    const h0 = b.html;
    b.html = b.html.replace(/(data-(?:later-)?level-chapter="3"><th>3구간<\/th><td>권장 <span class="number-token level-token">Lv45<\/span> · )신전 의뢰 뒤 (?:(?!<\/td>).)*<\/td>/s, '$1새로 열리는 병종은 없다. 전용 최상급(하이 에피타프 등)은 2구간부터 신전 복구·신의 부탁으로 연다.</td>');
    if (b.html !== h0) n++;
  }
  if (!n) fail('3구간 병종 해금 칸'); raw[f] = JSON.stringify(rc); log.push(`3구간 병종 해금 칸 ${n}`);
}
sub('해금된 최상급과 실제 기능·합격률을 확인한다.', '해금된 최상급과 실제 기능·합격률을 확인한다. 신전을 복구하고 신의 부탁을 끝내면 전용 최상급(하이 에피타프·보우 나이트 등)이 열린다.');

// ── 3부 객원: 클라프카는 세오도라 2부 완료도 필요(altema·한국어 도감). 아스완·타호니아 조건은 자료가 엇갈림
sub('살리면 6구간에 합류한다(루트 조건 미확인).', '살리면 6구간에 합류한다. 세오도라 2부 완료도 필요하다(altema·한국어 도감).');
sub('2부 3장에서 살린 아스완·타호니아가 5구간에 합류했는지 본다. 어느 루트 2부 3장이 필요한지는 자료가 엇갈린다.', '아스완·타호니아가 5구간 시작에 합류했는지 본다. 필요한 루트(레다 또는 카이 2부)와 2부 생존 조건은 자료가 엇갈린다.');
sub('3부 5구간 게스트로 생존 → 6구간 자동 합류(Game8·RPG Site) · 루트 조건 미확인', '3부 5구간 게스트로 생존 → 6구간 자동 합류(Game8·RPG Site) · 세오도라 2부 완료 필요(altema·한국어 도감)');

// ── 골드 표: 카이 10장 이오 800→4,000G, 카이 11·12장 추가 줄, 레다 4~9장 이니오니 적립 6,000→3,000G
{
  const G = 'content/data/chapter-gold.json'; raw[G] = readFileSync(G, 'utf8'); const cg = JSON.parse(raw[G]);
  const f = 'content/source/react-content.json'; const rc = JSON.parse(raw[f]);
  const fmt = n => n.toLocaleString('en-US') + 'G';
  const blk = (route, ch) => rc.stages.find(s => s.id === route + '-plan').blocks.find(b => b.id === `gold-${route}-${String(ch).padStart(route === 'leda' ? 2 : 1, '0')}`) || rc.stages.find(s => s.id === route + '-plan').blocks.find(b => b.id === `gold-${route}-${ch}`) || fail(`gold ${route} ${ch}`);
  const must = (s, a, b) => { if (!s.includes(a)) fail('없음: ' + a.slice(0, 100)); return s.replace(a, b); };
  const heads = (b, T0, A0, T1, A1) => {
    b.html = must(b.html, `최소 <span class="number-token money-token">${fmt(T0)}</span>`, `최소 <span class="number-token money-token">${fmt(T1)}</span>`);
    if (A0 !== T0) b.html = must(b.html, `마치면 <span class="number-token money-token">${fmt(A0)}</span>`, `마치면 <span class="number-token money-token">${fmt(A1)}</span>`);
  };
  { // 카이 10장
    const ch = cg.routes.cai.find(c => c.chapter === 10), it = ch.items.find(i => i.label === '이오 영입용') || fail('cai10 io');
    const T0 = ch.target, A0 = ch.afterScheduledSpend; it.amount = 4000; ch.target += 3200;
    const b = blk('cai', 10); b.html = b.html.replace(/(<tr>(?:(?!<\/tr>).)*<span>이오<\/span><\/span> 영입용(?:(?!<\/tr>).)*?)800G(<\/span><\/td><\/tr>)/s, '$14,000G$2');
    if (!b.html.includes('영입용</span></td><td><span class="number-token money-token">4,000G')) fail('cai10 io row');
    heads(b, T0, A0, ch.target, ch.afterScheduledSpend); log.push(`카이 10장 골드 ${fmt(T0)}→${fmt(ch.target)}`);
  }
  for (const c of [11, 12]) { // 카이 11·12장 추가 줄
    const ch = cg.routes.cai.find(x => x.chapter === c), ex = ch.extras.find(e => e.label === '이번 표의 이오 영입비가 없는데 아직 미영입이면') || fail('cai extra ' + c);
    ex.amount = 4000; const b = blk('cai', c); const h0 = b.html;
    b.html = b.html.replace(/(<span>이오<\/span><\/span> 영입비가 없는데 아직 미영입이면 <b>\+<span class="number-token money-token">)800G/, '$14,000G');
    if (b.html === h0) fail('cai extra html ' + c); log.push(`카이 ${c}장 이오 추가 줄 +4,000G`);
  }
  for (const ch of cg.routes.leda) { // 레다 이니오니
    const it = ch.items.find(i => i.label === '이니오니 영입 적립'); if (!it) continue;
    const T0 = ch.target, A0 = ch.afterScheduledSpend; it.amount = 3000; ch.target -= 3000; ch.afterScheduledSpend -= 3000;
    const b = blk('leda', ch.chapter); const h0 = b.html;
    b.html = b.html.replace(/(<span>이니오니<\/span><\/span> 영입 적립(?:(?!<\/tr>).)*?)6,000G/s, '$13,000G'); if (b.html === h0) fail('leda inyoni ' + ch.chapter);
    heads(b, T0, A0, ch.target, ch.afterScheduledSpend); log.push(`레다 ${ch.chapter}장 이니오니 3,000G (${fmt(T0)}→${fmt(ch.target)})`);
  }
  raw[f] = JSON.stringify(rc); raw[G] = JSON.stringify(cg, null, 2) + '\n';
}

for (const [f, s] of Object.entries(raw)) {
  if (f.endsWith('.json')) JSON.parse(s);
  const before = readFileSync(f, 'utf8');
  if (before === s) continue;
  // react-content 는 한 줄 JSON, 나머지는 원래 들여쓰기를 유지한다.
  const out = f.endsWith('.json') ? (/^\{\r?\n/.test(before) ? JSON.stringify(JSON.parse(s), null, 2) : JSON.stringify(JSON.parse(s))) + (before.endsWith('\n') ? '\n' : '') : s;
  writeFileSync(f, out);
}
console.log(log.join('\n'));
