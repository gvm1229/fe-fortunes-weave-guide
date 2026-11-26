// 사용자 규칙(docs/user-rules.md) 중 자료로 검사할 수 있는 것. verify.mjs가 불러온다.
// 각 검사 앞의 [Uxx]·[Pxx]는 규칙 문서의 번호다. 규칙 문서의 '검사' 칸에 적힌 파일에는 그 번호가 반드시 있어야 한다(맨 아래 검사).
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const read = f => JSON.parse(readFileSync(f, 'utf8'));
const walk = (d, ext) => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name), ext) : ext.some(x => e.name.endsWith(x)) ? [join(d, e.name).replaceAll('\\', '/')] : []);

// [U01] 이름은 Cai(카이)다. 'Kai' 이름과 'kai' 루트 ID를 쓰지 않는다. 예외: 옛 기록을 옮기는 lib/check-state.ts, 'Kai 아님'이라는 설명.
for (const f of [...walk('app', ['.ts', '.tsx', '.css']), ...walk('components', ['.ts', '.tsx']), ...walk('lib', ['.ts', '.tsx']), ...walk('content/data', ['.json']), 'content/derived/checklist.json', 'content/derived/presentation.json']) {
  if (f === 'lib/check-state.ts') continue;
  const t = readFileSync(f, 'utf8').replace(/\(Kai 아님\)/g, '');
  const m = t.match(/.{0,30}(?:\bKai\b|["'/]kai["'/-]|\bkai-(?:plan|part|route)).{0,30}/);
  assert.ok(!m, `[U01] ${f}: Kai/kai 남음 «${m?.[0]}»`);
}

// [U03] 세오도라 최종 병종 홀리 랜서, 그 앞은 가디언. 두 병종 모두 백마술 숙련이 필요하다고 적혀 있다.
{ const manifest = read('assets/classes/manifest.json').classes;
  for (const c of ['홀리 랜서', '가디언']) assert.ok(manifest[c]?.weapons?.includes('백마술'), `[U03] ${c} 무기에 백마술`);
  const paths = JSON.stringify(read('content/source/react-content.json').people.filter(p => p.name === '세오도라'));
  assert.ok(paths.includes('가디언') && paths.includes('홀리 랜서'), '[U03] 세오도라 경로에 가디언·홀리 랜서'); }

// [U07] 팀 화면 탭은 정확히 이 넷, 이 순서다.
{ const t = readFileSync('components/team.tsx', 'utf8').match(/const tabs=\[(.*?)\] as const/)?.[1] || '';
  assert.deepEqual([...t.matchAll(/'([^']+)'\]/g)].map(m => m[1]), ['최종 25인', '백마술', '루트 편성', '비교 근거'], '[U07] 팀 화면 탭'); }

// [U13] 카이 루트 알렉산드라는 전차병이 아니다(고유 탈것은 비행 병종에서만).
{ const c = read('content/cai-charioteer.json'); assert.ok(!Object.keys(c.people).includes('알렉산드라'), '[U13] 알렉산드라 전차병 아님'); }

// [U14] 그림이 있는 말은 공식 게임 그림을 쓴다. 공식 그림을 못 찾은 11개만 일반 그림이다(새로 늘지 않는다).
{ const items = Object.entries(read('assets/items/manifest.json').items), noArt = items.filter(([, v]) => !v.file).map(([k]) => k).sort();
  assert.deepEqual(noArt, ['코끼리병 시험 증표', '무사의 목걸이', '대제의 복대', '요도의 코등이', '신철의 안장', '어둠의 결정', '삼차의 창', '전생의 연화', '심판의 천칭', '환상의 긴지', '차축 부품'].sort(), '[U14] 공식 그림 없는 물품 목록이 바뀜');
  for (const [k, v] of items) if (v.file) { assert.ok(existsSync(v.file), `[U14] ${k} 그림 파일`); assert.ok(/^https?:\/\//.test(v.source || ''), `[U14] ${k} 그림 출처`); } }

// [U20] 인물은 조건이 쉬운 루트에서 영입한다. 디에고는 세오도라(지원 2, 레다는 3).
{ const p = read('content/data/recruit-all-plan.json'), rr = p.pairCoverage?.routeRoster || p.routeRoster;
  assert.ok(rr.theodora.includes('디에고'), '[U20] 디에고 세오도라 영입');
// [U23] 알렉산드라는 스탯 융합을 위해 두 루트 이상에서 영입한다. 이오는 탈것을 보존할 수 있는 루트에만(verify.mjs '이오 없음').
  assert.ok(Object.values(rr).filter(l => l.includes('알렉산드라')).length >= 2, '[U23] 알렉산드라 두 루트 이상');
// [U22] 누조는 네 루트 모두 영입한다(레빈 소드).
  for (const r of ['theodora', 'leda', 'dietrich', 'cai']) assert.ok(rr[r].includes('누조'), `[U22] ${r} 누조 영입`); }

// [U22] 게임 용어는 고기·연회다(만찬·식사 연회·meat·feast 금지).
{ const text = t => Array.isArray(t) ? t.map(text).join(' ') : typeof t === 'string' ? t : t && typeof t === 'object' ? ('tag' in t ? text(t.children) : Object.entries(t).filter(([k]) => !/^(id|ref|key|src|href|kind)$/.test(k)).map(([, v]) => text(v)).join(' ')) : '';
  const t = text(read('content/derived/checklist.json')); for (const w of ['만찬', '식사 연회', '\\bmeat\\b', '\\bfeast\\b']) { const m = t.match(new RegExp('.{0,30}' + w + '.{0,30}', 'i')); assert.ok(!m, `[U22] 할 일에 '${w}': ${m?.[0]}`); } }

// [U30] 공유 미리보기 그림은 시간 경과 전 초상화만. 메타 정보는 /og.png 하나만 가리킨다.
{ const lay = readFileSync('app/layout.tsx', 'utf8'), gen = readFileSync('scripts/make-og-image.mjs', 'utf8');
  assert.ok(/url: '\/og\.png'/.test(lay) && !/post-timeskip/.test(lay), '[U30] 공유 그림 = /og.png');
  assert.ok(existsSync('public/og.png') && statSync('public/og.png').size > 10000, '[U30] public/og.png 있음');
  assert.ok(!/post-timeskip/.test(gen.replace(/\/post-timeskip\/\.test\(p\)/, '')) && /pre-timeskip/.test(gen), '[U30] 생성기는 시간 경과 전 그림만'); }

// [U31] "X가 X 위치입니다"·"X(X)" 같은 말 되풀이 금지. 할 일·표시·덮어쓰기·문서 전부.
{ const text = t => Array.isArray(t) ? t.map(text).join(' ') : typeof t === 'string' ? t : t && typeof t === 'object' ? ('tag' in t ? text(t.children) : Object.values(t).map(text).join(' ¦ ')) : '';
  const places = { 할일: read('content/derived/checklist.json'), 표시: read('content/derived/presentation.json'), 덮어쓰기: read('content/display-overrides.json'), 문서: Object.values(read('content/derived/documents.json')).map(v => v.body) };
  for (const [k, v] of Object.entries(places)) { const t = text(v);
    const a = t.match(/([가-힣][가-힣 ]{0,15}[가-힣])\(\1\)/), b = t.match(/(?<![가-힣])([가-힣][가-힣 ]{1,12}?)(?:가|이|는|은) \1(?:이?다|입니다)/);
    assert.ok(!a, `[U31] ${k} 같은 말 괄호: ${a?.[0]}`); assert.ok(!b, `[U31] ${k} 같은 말 되풀이: ${b?.[0]}`); } }

// [U36] 지원 대화 순서 잠금은 줄마다 근거(확인 여부 표시)가 있고, 출처 목록에 주소가 있다.
{ const md = readFileSync('content/notes/support-pairs-by-route.md', 'utf8'), sec = md.split('## 순서 잠금')[1].split('\n## ')[0];
  const rows = sec.split('\n').filter(l => l.startsWith('| ') && !l.startsWith('| 순서') && !l.startsWith('|---'));
  assert.ok(rows.length >= 8, '[U36] 순서 잠금 줄 수');
  for (const r of rows) { const c = r.split('|').map(s => s.trim()); assert.ok(/^(확인|공동체 자료|초안)/.test(c[3]), `[U36] 근거 표시 없음: ${c[1]}`); }
  assert.ok((sec.match(/\]\(https:\/\//g) || []).length >= 4, '[U36] 출처 주소'); }

// [U20] 영입 루트는 조건(명성·지원)이 가장 쉬운 곳. 더 쉬운 루트가 있는데 다른 루트에 둔 인물은 이유(대화 상대·융합·지참품 등)를 적는다.
{ const p = read('content/data/recruit-all-plan.json'), g = read('content/data/recruitment-gates.json').characters, cost = x => (+x.fame || 0) * 10 + (+x.sup || 0);
  for (const a of p.assignments) { const gr = g[a.name]?.routes; if (!gr?.[a.route]) continue; const min = Math.min(...Object.values(gr).map(cost));
    if (cost(gr[a.route]) > min) assert.ok((a.reason || '').length >= 20 && /대화|융합|능력|지참|선더|실전|동석|보완|외전|상대|한정|보려면/.test(a.reason), `[U20] ${a.name}: 더 쉬운 루트가 있는데 이유 없음`); }
// [U41] 한 인물은 한 루트. 여러 루트 영입은 중복 목록(목적 적음)이나 지원 대화 추가 영입(extraRecruits, 대화 이름 적음)에 있어야 한다. 울턴드는 던전 반복 루트 전부(verify.mjs).
  const rr = p.pairCoverage.routeRoster, dup = new Set(p.duplicates.filter(d => d.purpose).map(d => d.name)), extra = new Set(Object.values(p.pairCoverage.extraRecruits).flat().filter(e => e.for?.length).map(e => e.name));
  const count = {}; for (const l of Object.values(rr)) for (const n of new Set(l)) count[n] = (count[n] || 0) + 1;
  for (const [n, c] of Object.entries(count)) if (c > 1 && !['울턴드', '누조'].includes(n)) assert.ok(dup.has(n) || extra.has(n), `[U41] ${n}: ${c}개 루트 영입인데 이유 없음`); }

// [U42] 최종 25인 밖 지양 10명은 영입만 한다. 훈련·준비·육성 자료에 넣지 않는다.
{ const av = read('content/data/final-roster.json').avoidDefault; for (const n of ['weekly-training', 'training-priorities', 'unit-readiness']) { const s = readFileSync(`content/data/${n}.json`, 'utf8'); for (const a of av) assert.ok(!s.includes(a), `[U42] ${n}에 지양 인물 ${a}`); }
// 이야기 주력 8명(최종 25인 밖)은 육성을 유지한다. 누조는 선더 소드만 보고 투자하지 않는다(주간 훈련 후보에 없음).
  const all = ['weekly-training', 'training-priorities', 'unit-readiness'].map(n => readFileSync(`content/data/${n}.json`, 'utf8')).join(' ');
  for (const n of ['토비아스', '보나파르트', '라이선더', '녹투라', '루루디아', '세테스', '게이츠', '하르빈']) assert.ok(all.includes(n), `[U42] 이야기 주력 ${n} 육성 자료 없음`);
  assert.ok(!JSON.stringify(read('content/data/weekly-training.json')).includes('누조'), '[U42] 주간 훈련에 누조');
  // 화면에 나가는 자료(파생 표시·문서)에도 카이 누조를 전력으로 적지 않는다. 카드 화면은 rules-browser-check.mjs.
  for (const n of ['presentation', 'documents', 'checklist']) assert.ok(!readFileSync(`content/derived/${n}.json`, 'utf8').includes('카이의 실제 활 전력'), `[U42] ${n}: 카이 누조를 전력으로 적음`); }

// [U46] 사용자가 확인한 사실은 사실로(여관 식사는 영입 전 두 사람끼리도 지원이 오른다), 한 곳에서만 나온 사실은 '확인되지 않음'을 붙인다(누조 선더 소드 지참·제스터–레다 명성 10).
{ const p = JSON.stringify(read('content/data/playbook.json')), txt = id => (p.match(new RegExp('"id":"' + id + '"[^{}]*?"text":"([^"]*)"')) || [])[1] || '';
  const inn = txt('feast-loop-theodora-part1-20261114--inn-pair'); assert.ok(/아직 영입하지 않은 두 사람도 함께 식사하면 서로 지원이 오른다/.test(inn) && !/확인되지|미확인|추정/.test(inn), '[U46] 여관 식사 지원은 사실로');
  for (const id of ['theo-recruit-nujo--join', 'recruit-all-leda-nujo-20261114--scout', 'recruit-all-cai-nujo-20261114--scout']) assert.ok(/한 곳에서만 확인/.test(txt(id)), `[U46] ${id} 선더 소드 미확인 표시`);
  assert.ok(/아직 확인되지 않았다/.test(txt('recruit-all-leda-jester-20261112--renown10-20261114')), '[U46] 제스터–레다 명성 10 미확인 표시'); }

// [U47] 2026-11-13 요청 화면 기능: 반응형·카드·스크롤 맞춤·작은 움직임·화면 전환(View Transition)·고정·스크롤 연동 움직임. 색종이는 U10.
{ const css = readFileSync('app/redesign.css', 'utf8') + readFileSync('app/globals.css', 'utf8'), code = [...walk('components', ['.tsx']), ...walk('lib', ['.ts'])].map(f => readFileSync(f, 'utf8')).join(' ');
  for (const [k, re, s] of [['스크롤 맞춤', /scroll-snap-type/, css], ['고정', /position:\s*sticky/, css], ['스크롤 연동', /animation-timeline|scroll-timeline/, css], ['반응형', /@media\s*\(\s*(?:max|min)-width/, css], ['작은 움직임', /transition:/, css], ['화면 전환', /startViewTransition/, code], ['공유 요소 전환', /<ViewTransition[^>]*name=[^>]*share=/, code], ['색종이', /canvas-confetti/, code]]) assert.ok(re.test(s), `[U47] ${k} 없음`); }

// [U45] 영입 단계는 명성 조건이 맞는 장에 둔다(2026-11-14 답 '명성을 따른다'): 디트리히 카타냐는 명성 8이 되는 7장에 영입·육성 준비, 카이 누조는 선더 소드 때문에 12장.
{ const ch = read('content/derived/checklist.json'), at = (stage, id) => ch.stages.find(s => s.id === stage)?.chapters.find(c => c.blocks.some(b => b.id === id))?.title;
  assert.equal(at('dietrich-plan', 'di-09'), '7장', '[U45] 디트리히 명성 8(카타냐 영입) 7장'); assert.equal(at('dietrich-plan', 'ready-dietrich-catania'), '7장', '[U45] 카타냐 육성 준비는 영입한 7장');
  assert.equal(at('cai-plan', 'recruit-all-cai-nujo-20261114'), '12장', '[U45] 카이 누조 12장'); }

// [U52] 레다는 세오도라 다음(추가 명성)이라 제스터 명성 10을 10장까지 서둘러 채우는 단계가 레다 10장 묶음에 있다. 1부 순서는 세오도라 → 레다 → 디트리히 → 카이.
{ const ch = read('content/derived/checklist.json'), blk = ch.stages.find(s => s.id === 'leda-plan')?.chapters.find(c => c.blocks.some(b => b.id === 'recruit-all-leda-jester-20261112'));
  assert.ok(blk && Number.parseInt(blk.title) <= 10 && JSON.stringify(blk).includes('renown10-20261114'), '[U52] 레다 제스터 명성 10 서두르기 단계(10장까지)');
  assert.ok(readFileSync('HANDOFF.md', 'utf8').includes('세오도라 → 레다 → 디트리히(재육성, 1장부터) → 카이'), '[U52] 1부 진행 순서'); }

// [U44] 팀 루트 편성 탭의 작동하지 않던 '3부' 선택과 '변경 인물만'은 없앤다.
{ const s = readFileSync('components/team-routes.tsx', 'utf8') + readFileSync('components/team.tsx', 'utf8'); assert.ok(!/변경 인물만/.test(s), '[U44] 변경 인물만');
  assert.ok(s.includes(`aria-label="편성 부">{['1','2'].map`), '[U44] 편성 부 선택은 1·2부만'); }

// [U49] 선물 이름은 한 이름(홍소·창소)으로, 같은 물건을 두 번 적지 않는다.
{ const items = Object.values(read('content/data/affordable-gifts.json').items).map(i => i.korean); assert.equal(new Set(items).size, items.length, '[U49] 선물 이름 중복'); assert.ok(!items.some(n => /고슈/.test(n)), '[U49] 고슈 표기'); }

// [U39] 루트별 지원 대화에 빠진 쌍이 하나도 없다. 전체 목록(content/data/support-pairs-source.json, 190쌍)의 모든 쌍이 표·목록에 정확히 한 번 있고,
// 목록에 없는 쌍은 없으며, 쌍마다 단계(C·B·A) 값이 출처와 같다. 계획 자료(recruit-all-plan.json pairCoverage)도 같은 190쌍이다.
{ const src = read('content/data/support-pairs-source.json'), ko = src.names, key = (a, b) => [a, b].sort().join('|');
  const LABEL = { P1: '1부', 'P1-2': '1·2부', P2: '2부', P3: '3부', any: '어느 부', 'P2-3': '2부부터', 'P1|P3': '1부 또는 3부', none: '없음' };
  const full = new Map(src.pairs.map(p => [key(p.a, p.b), p])); assert.equal(full.size, 190, '[U39] 전체 목록 190쌍');
  const md = readFileSync('content/notes/support-pairs-by-route.md', 'utf8'), body = md.split('## 세오도라 1·2부')[1].split('\n## 근거')[0], seen = new Map();
  for (const m of body.matchAll(/([가-힣]+)–([가-힣]+)/g)) { assert.ok(ko[m[1]] && ko[m[2]], `[U39] 모르는 이름 ${m[0]}`); const k = key(ko[m[1]], ko[m[2]]); assert.ok(full.has(k), `[U39] 전체 목록에 없는 쌍 ${m[0]}`); assert.ok(!seen.has(k), `[U39] 두 번 적힌 쌍 ${m[0]}`); seen.set(k, m[0]); }
  for (const [k, p] of full) assert.ok(seen.has(k), `[U39] 빠진 쌍 ${p.a}–${p.b} (${p.raw})`);
  for (const l of body.split('\n').filter(l => l.startsWith('| '))) { const c = l.split('|').map(s => s.trim()).slice(1, -1), i = c.findIndex(x => /^[가-힣]+–[가-힣]+$/.test(x)); if (i < 0) continue;
    const [a, b] = c[i].split('–'), p = full.get(key(ko[a], ko[b]));
    for (const [r, j] of [['C', 1], ['B', 2], ['A', 3]]) assert.equal(c[i + j], LABEL[p[r]], `[U39] ${c[i]} ${r} 단계: 표 ${c[i + j]}, 출처 ${p[r]}`); }
  const pc = read('content/data/recruit-all-plan.json').pairCoverage;
  assert.deepEqual(new Set(pc.pairs.map(p => { const [a, b] = p.pair.split('–'); return key(ko[a], ko[b]); })), new Set(full.keys()), '[U39] 계획 자료 쌍 = 전체 목록');
  assert.equal(pc.counts.total, 190, '[U39] 계획 자료 전체 수');
  for (const q of pc.pairs) { const [a, b] = q.pair.split('–'), p = full.get(key(ko[a], ko[b])); for (const r of ['C', 'B', 'A']) assert.equal(q[r], LABEL[p[r]], `[U39] 계획 자료 ${q.pair} ${r}: ${q[r]}, 출처 ${p[r]}`); }
  const st = {}; for (const q of pc.pairs) st[q.status] = (st[q.status] || 0) + 1;
  assert.equal(st['해결'] + st['위험'], pc.counts.covered, '[U39] 해결 수'); assert.equal(st['해결'] + st['위험'] + st['불가'], pc.counts.prePart3, '[U39] 1·2부 한정 수');
  assert.ok(md.includes(`전체 190쌍 중 ${pc.counts.prePart3}쌍은 1·2부에만 열리는 단계가 있다. ${pc.counts.covered}쌍은`), '[U39] 문서 첫머리 수');
  // 자료·할 일 글에 나오는 모든 'A–B' 쌍 이름도('주인공–X·Y의 지원'처럼 가운뎃점으로 이어지는 인물 목록은 뺀다) 190쌍 안에 있다(지운 쌍이 글에 남지 않게). 검토 기록(checkedAgainst)은 뺀다.
  const texts = { 'recruit-all-plan': JSON.stringify({ ...read('content/data/recruit-all-plan.json'), pairCoverage: { ...pc, checkedAgainst: null } }) };
  for (const n of ['playbook', 'multi-route-audit', 'recruit-only-cards', 'roster-plan', 'recruitment-build-audit']) if (existsSync(`content/data/${n}.json`)) texts[n] = readFileSync(`content/data/${n}.json`, 'utf8');
  texts['display-overrides'] = readFileSync('content/display-overrides.json', 'utf8'); texts.checklist = readFileSync('content/derived/checklist.json', 'utf8');
  for (const [n, s] of Object.entries(texts)) { for (const m of s.matchAll(/([가-힣]+)–([가-힣]+)(?!·)/g)) if (ko[m[1]] && ko[m[2]] && m[1] !== m[2]) assert.ok(full.has(key(ko[m[1]], ko[m[2]])), `[U39] ${n}: 없는 지원 쌍 ${m[0]}`);
    // 'A·B C·B'처럼 가운뎃점 쌍 뒤에 바로 단계(C·B·A)가 오는 꼴도 쌍이다(지웠던 '세오도라·피아나 C·B' 꼴).
    for (const m of s.matchAll(/([가-힣]+)·([가-힣]+) [CBA](?![a-zA-Z])/g)) if (ko[m[1]] && ko[m[2]] && m[1] !== m[2]) assert.ok(full.has(key(ko[m[1]], ko[m[2]])), `[U39] ${n}: 없는 지원 쌍 ${m[0]}`); } }

// [U57] 아나톨리아 최종 병종은 드루이드이고 샐러맨더를 든다(공략 자료 기준). 그자람 최종 병종은 소드 마스터(드래군 검토 뒤 유지).
{ for (const f of ['content/source/react-content.json', 'content/display-parity.json']) { const u = read(f).team.units;
    assert.equal(u['아나톨리아'].class, '드루이드', `[U57] ${f} 아나톨리아 드루이드`); assert.ok(u['아나톨리아'].signatureWeapons.some(w => w.name === '샐러맨더'), `[U57] ${f} 아나톨리아 샐러맨더`);
    assert.equal(u['그자람'].class, '소드 마스터', `[U57] ${f} 그자람 소드 마스터`); } }

// [U59] 3부 기준판은 카이판이 먼저다. 다른 루트판은 카이판에 합친다(할 일·덮어쓰기·3부 문서).
{ const pb = read('content/data/playbook.json'), ov = read('content/display-overrides.json'), ids = pb.groups.flatMap(g => g.actions.map(a => a.id));
  for (const id of ['p3-import-base-safety--cai-list', 'p3-import-base-safety--cai-merge', 'p3-merge--20261125-cai-base']) assert.ok(ids.includes(id), '[U59] ' + id);
  assert.ok(ov.actions['p3-import-base-safety--compare-first'].includes('카이판을 기준판'), '[U59] 기준판 고르기 글');
  assert.ok(readFileSync('content/notes/part3-gates-freetime.md', 'utf8').includes('카이판이 있으면 언제나 카이판을 고른다'), '[U59] 3부 문서');
  const plan = read('content/data/recruit-all-plan.json'), routes = {}; for (const x of plan.assignments) (routes[x.name] ??= new Set()).add(x.route); for (const d of plan.duplicates) for (const r of d.routes) (routes[d.name] ??= new Set()).add(r);
  const cai = Object.keys(routes).filter(n => routes[n].has('cai') && !['카이', '세오도라', '레다', '디트리히'].includes(n));
  const listed = pb.groups.flatMap(g => g.actions).find(x => x.id === 'p3-import-base-safety--cai-list').text;
  for (const n of cai) assert.ok(listed.includes(n), '[U59] 카이판 목록에 ' + n);
  for (const [route, people] of Object.entries(read('content/data/unit-readiness.json').routes)) for (const [n, v] of Object.entries(people)) if (cai.includes(n) && route !== 'cai') assert.ok(!/^(현재 루트 기준판|기준 (세오도라|레다|디트리히)판)/.test(v.merge || ''), '[U59] 육성판 글 ' + route + ' ' + n); }

// [U60] 융합은 최종 25명만 한다. 25명 밖 동료에게 융합을 권하지 않는다(할 일·인물 카드·3부 문서 표).
{ const pb = read('content/data/playbook.json'), ov = read('content/display-overrides.json'), text = id => ov.actions[id] || pb.groups.flatMap(g => g.actions).find(a => a.id === id)?.text || '';
  for (const id of ['p3-import-base-safety--cai-merge', 'p3-merge--20261125-cai-base', 'p3-merge--20261125-limited']) assert.ok(text(id).includes('최종 25명'), '[U60] ' + id);
  assert.ok(text('p3-io-pick--b8ae039641').includes('합치지 않는다'), '[U60] 이오 기준판 글');
  const final = new Set(read('content/data/final-roster.json').final25Example.map(x => x.name));
  // 25명 밖 인물의 모든 글(인물 카드·목표·선발·훈련 자료): 융합 말이 있으면 '융합하지 않'·'융합 없음'·'융합 대상으로 삼지 않' 같은 부정이 같이 있어야 한다.
  const okNeg = /융합하지 않|융합 없음|대상으로 삼지 않|합치지 않/, strs = o => typeof o === 'string' ? [o] : o && typeof o === 'object' ? Object.values(o).flatMap(strs) : [];
  for (const f of ['unit-readiness', 'phase-goals', 'roster-selection', 'training-priorities']) for (const [route, r] of Object.entries(read(`content/data/${f}.json`).routes)) for (const [n, v] of Object.entries(r.people || r)) if (!final.has(n) && /^[가-힣]+$/.test(n))
    for (const s of strs(v)) if (/융합|합침|합친다|합치/.test(s)) assert.ok(okNeg.test(s), `[U60] 25명 밖 ${f} ${route} ${n}: ${s.slice(0, 40)}`);
  const doc = readFileSync('content/notes/part3-gates-freetime.md', 'utf8').replace(/\r/g, ''), sec = doc.split('## 3부 기준판')[1].split('\n## ')[0], rows = sec.split('\n').filter(l => /^\| [^-동]/.test(l));
  assert.ok(rows.length > 20, '[U60] 3부 문서 표 행 수');
  for (const row of rows) { const c = row.split('|').map(s => s.trim()), names = c[1].replace('★', '').trim().split('·');
    for (const n of names) assert.equal(final.has(n), c[1].includes('★'), '[U60] 3부 문서 표 ★와 최종 25명 ' + n);
    if (!c[1].includes('★')) assert.ok(/융합하지 않는다|^없음$/.test(c[4]), '[U60] 3부 문서 표 ' + c[1]); } }

// [U58] 사이트 아이콘은 네 오벨리스크 하나: 진한 바탕 #16272D, 기둥 색은 카이·디트리히·세오도라·레다 순서. 탭(icon.svg)·홈 화면(apple-icon.png)·/favicon.ico 파일 셋, 다른 아이콘 지정 없음.
{ const svg = readFileSync('app/icon.svg', 'utf8'), fills = [...svg.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].map(m => m[1].toUpperCase());
  assert.deepEqual(fills, ['#16272D', '#7AA5F7', '#F5F5F2', '#F2C230', '#F06292'], '[U58] 아이콘 바탕·기둥 색 순서');
  for (const f of ['app/apple-icon.png', 'app/favicon.ico']) assert.ok(existsSync(f) && statSync(f).size > 100, `[U58] ${f} 있음`);
  assert.ok(!/icons:/.test(readFileSync('app/layout.tsx', 'utf8')), '[U58] layout에 다른 아이콘 지정 없음'); }

// [U61] 첫 화면 루트 진행 순서는 부마다 따로 1~4로 센다(2부를 5~8로 잇지 않는다).
{ const po = readFileSync('components/home.tsx', 'utf8').match(/const playOrder[^;]*;/)?.[0] || '';
  for (const o of ['1st', '2nd', '3rd', '4th']) assert.ok(po.includes('2부 ' + o), '[U61] playOrder에 2부 ' + o);
  for (const o of ['5th', '6th', '7th', '8th']) assert.ok(!po.includes('2부 ' + o), '[U61] playOrder에 2부 ' + o + ' 없음'); }

// [U62] 3부 띠의 네 군주 초상화는 같은 칸을 같은 방식(cover, 위 기준)으로 채운다.
{ const css = readFileSync('app/redesign.css', 'utf8') + readFileSync('app/globals.css', 'utf8'), rules = [...css.matchAll(/([^{}]*\.third-band \.lord-faces img[^{}]*)\{([^}]*)\}/g)].map(m => m[2]);
  assert.ok(rules.some(r => /object-fit:\s*cover/.test(r)), '[U62] 3부 띠 초상화 object-fit:cover');
  assert.ok(rules.every(r => !/object-fit:\s*contain/.test(r)), '[U62] 3부 띠 초상화에 object-fit:contain 없음');
  assert.ok(!/\.lord-faces img\{[^}]*object-fit:\s*contain/.test(css), '[U62] lord-faces img에 contain 없음'); }

// [U63] 표 칸이 '배지(얼굴 칩·그림 포함) + ·'보다 좁으면 "·"는 칸 안에서 다음 줄로 내려가도 된다(칸 밖 넘침은 안 됨). 표 칸 안 요소+"·" 묶음은 줄 넘김을 허용하는 줄 안 상자로, 상자는 줄 폭을 넘지 않고 안의 요소는 줄어들 수 있다.
{ const css = readFileSync('app/redesign.css', 'utf8'), rule = sel => [...css.matchAll(/([^{}]*)\{([^}]*)\}/g)].filter(m => m[1].includes(':is(td,th) .dot-glue:has(') && m[1].includes('img') && sel(m[1])).map(m => m[2]).join(';');
  const box = rule(s => !s.includes('>'));
  assert.ok(/display:\s*inline-flex/.test(box) && /flex-wrap:\s*wrap/.test(box) && /white-space:\s*normal/.test(box) && /max-inline-size:\s*100%/.test(box), '[U63] 표 칸 안 "·" 묶음 상자: inline-flex·줄 넘김·줄 폭 안');
  assert.ok(/min-inline-size:\s*0/.test(rule(s => s.includes('>:not(.dot-lead)'))), '[U63] 표 칸 안 묶음 속 요소는 줄어들 수 있음'); }

// 규칙 문서: 모든 규칙 줄은 '검사' 칸에 하나 이상의 파일을 적고, 그 파일에는 규칙 번호가 있다.
{ const doc = readFileSync('docs/user-rules.md', 'utf8'), rows = doc.split('\n').filter(l => /^\| [UP]\d\d \|/.test(l)), ids = new Set();
  assert.ok(rows.length >= 40, '규칙 줄 수');
  for (const r of rows) { const id = r.match(/^\| ([UP]\d\d)/)[1]; assert.ok(!ids.has(id), '규칙 번호 중복 ' + id); ids.add(id);
    const files = [...r.split('|').at(-2).matchAll(/`([^`]+\.(?:mjs|md|ts|tsx))`/g)].map(m => m[1]);
    assert.ok(files.length, `${id}: 검사 칸에 파일 없음`);
    for (const f of files) { assert.ok(existsSync(f), `${id}: ${f} 없음`); assert.ok(readFileSync(f, 'utf8').includes(`[${id}]`), `${id}: ${f}에 [${id}] 표시 없음`); } } }
console.log('통과: 사용자 규칙 자료 검사');
