// 2026-11-14 전원 영입 필수 · 1부 만찬 반복 필수 적용 스크립트(한 번만 실행). 근거: docs/fable-plan-recruit-feast.md 3판.
// 실행 뒤: npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const W = (p, v, raw) => { const pretty = raw.trimStart().startsWith('{\n') || raw.trimStart().startsWith('[\n') || /^\{\r?\n/.test(raw); writeFileSync(p, (pretty ? JSON.stringify(v, null, 2) : JSON.stringify(v)) + (raw.endsWith('\n') ? '\n' : '')); };
const raw = {}; const load = p => { raw[p] = readFileSync(p, 'utf8'); return JSON.parse(raw[p]); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json', CK = 'content/check-ids.json', AL = 'content/action-links.json', DP = 'content/display-parity.json';
const pb = load(PB), rc = load(RC), ov = load(OV), ck = load(CK), al = load(AL), dp = load(DP);
const routeName = { theodora: '세오도라', leda: '레다', dietrich: '디트리히', cai: '카이' };
const routePath = { 'theodora-plan': '/theodora/1/', 'leda-plan': '/leda/1/', 'dietrich-plan': '/dietrich/1/', 'cai-plan': '/cai/1/', 'part3-plan': '/part3/3/' };
const fail = m => { throw new Error(m); };
const group = id => pb.groups.find(g => g.id === id) || fail('no group ' + id);
const action = id => pb.groups.flatMap(g => g.actions).find(a => a.id === id) || fail('no action ' + id);
const stageOf = id => rc.stages.find(s => s.id === id) || fail('no stage ' + id);
const block = (stage, id) => stageOf(stage).blocks.find(b => b.id === id) || fail(`no block ${stage}/${id}`);
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shown = id => Object.hasOwn(ov.actions, id) ? ov.actions[id] : action(id).text;
const log = [];

// ── M5 은퇴 ──
const reason = '2026-11-14 영입 루트 재배정으로 제외. 체크 이력은 보존.';
const keepHtml = {};
for (const [stage, id] of [['theodora-plan', 'theo-recruit-nujo'], ['theodora-plan', 'recruit-all-theodora-benditz-20261112'], ['leda-plan', 'team-leda-jasmine']]) {
  const i = pb.groups.findIndex(g => g.id === id); if (i < 0) fail('retire ' + id);
  const [g] = pb.groups.splice(i, 1); pb.retiredGroups.push({ ...g, retiredReason: reason });
  const s = stageOf(stage), bi = s.blocks.findIndex(b => b.id === id); if (bi < 0) fail('retire block ' + id);
  keepHtml[id] = s.blocks[bi].html; s.blocks.splice(bi, 1);
  delete al[id]; for (const a of g.actions) delete al[a.id];
  log.push(`은퇴 묶음 ${id} (${g.actions.length})`);
}
for (const id of ['di-11--117e3abb0f', 'di-23--d20bb24be0', 'di-24--584da4ce13']) {
  const g = pb.groups.find(g => g.actions.some(a => a.id === id)) || fail('retire action ' + id);
  const i = g.actions.findIndex(a => a.id === id); const [a] = g.actions.splice(i, 1);
  pb.retiredActions.push({ ...a, parentTask: g.id, retiredReason: reason });
  const b = block('dietrich-plan', g.id); const re = new RegExp(`<li class="action-item"[^>]*>(?:(?!</li>).)*data-task-id="${id}"(?:(?!</li>).)*</li>`, 's');
  if (!re.test(b.html)) fail('retire li ' + id); b.html = b.html.replace(re, '');
  delete al[id]; log.push(`은퇴 행동 ${id}`);
}

// ── M4 새 묶음·행동 ──
const li = (gid, aid, cat, text) => `<li class="action-item" data-done="false"><input aria-label="${esc(text)}" data-inherit-legacy="false" data-parent-task="${gid}" data-task-id="${aid}" disabled="" id="${aid}" type="checkbox"/><div class="action-label"><span class="action-category">${esc(cat)}</span><span class="action-text">${esc(text)}</span></div></li>`;
const peopleHtml = name => { for (const s of rc.stages) for (const b of s.blocks) { const m = b.html.match(new RegExp(`<span class="task-person"><img[^>]*alt="${name} 초상화"[^>]*/><b>${name}</b></span>`)); if (m) return m[0]; } for (const h of Object.values(keepHtml)) { const m = h.match(new RegExp(`<span class="task-person"><img[^>]*alt="${name} 초상화"[^>]*/><b>${name}</b></span>`)); if (m) return m[0]; } fail('portrait ' + name); };
const refBtn = (url, label) => `<button aria-haspopup="dialog" class="training-source" data-reference-doc="true" data-reference-url="${url.replace(/\.md$/, '.html')}" type="button">${esc(label)}</button>`;
function addGroup({ id, stage, route, title, after, people = [], actions, notes = [], refs = [] }) {
  const s = stageOf(stage), bi = s.blocks.findIndex(b => b.id === after); if (bi < 0) fail('anchor ' + after);
  const html = `<section class="action-group" data-group-id="${id}" data-guide-phase="${stage === 'part3-plan' ? 3 : 1}" data-guide-route="${route}" id="${id}"><div class="group-heading"><h3>${esc(title)}</h3><div class="group-tools"><span class="group-count" data-group-count="${id}">—</span></div></div>${people.length ? `<div class="task-people">${people.map(peopleHtml).join('')}</div>` : ''}<ol class="action-list">${actions.map(([suf, cat, text]) => li(id, id + suf, cat, text)).join('')}</ol>${notes.length ? `<ul class="chapter-cautions">${notes.map(n => `<li>${esc(n.text)}</li>`).join('')}</ul>` : ''}${refs.map(r => refBtn(r.url, r.label)).join('')}</section>`;
  s.blocks.splice(bi + 1, 0, { id, html, title });
  // playbook 순서: 앞 블록 가운데 마지막 playbook 묶음 뒤
  const order = s.blocks.map(b => b.id); let insertAt = -1;
  for (let k = order.indexOf(id) - 1; k >= 0 && insertAt < 0; k--) { const gi = pb.groups.findIndex(g => g.id === order[k]); if (gi >= 0) insertAt = gi + 1; }
  if (insertAt < 0) insertAt = pb.groups.findIndex(g => g.stage === stage);
  pb.groups.splice(insertAt, 0, { id, stage, title, people, actions: actions.map(([suf, cat, text]) => ({ id: id + suf, category: cat, text, inheritLegacy: false })), figures: [], notes, curated: true, referenceLinks: refs, route });
  for (const x of [id, ...actions.map(([suf]) => id + suf)]) { ck.push(x); rc.allTaskIds.push(x); al[x] = routePath[stage] + '#' + x; }
  log.push(`새 묶음 ${id} (${actions.length})`);
}
function addAction(gid, stage, afterId, aid, cat, text) {
  const g = group(gid), i = g.actions.findIndex(a => a.id === afterId); if (i < 0) fail('after ' + afterId);
  g.actions.splice(i + 1, 0, { id: aid, category: cat, text, inheritLegacy: false });
  const b = block(stage, gid); const re = new RegExp(`(<li class="action-item"[^>]*>(?:(?!</li>).)*data-task-id="${afterId}"(?:(?!</li>).)*</li>)`, 's');
  if (!re.test(b.html)) fail('after li ' + afterId); b.html = b.html.replace(re, `$1${li(gid, aid, cat, text)}`);
  ck.push(aid); rc.allTaskIds.push(aid); al[aid] = routePath[stage] + '#' + aid; log.push(`새 행동 ${aid}`);
}
addGroup({ id: 'recruit-all-leda-ultand-20261114', stage: 'leda-plan', route: 'leda', after: 'recruit-all-leda-jester-20261112', title: '10장 무렵 · 명성8·지원3 뒤 울턴드 영입(던전 회복)', people: ['울턴드'], actions: [
  ['--cond', '조건 확인', '레다와 지원3·명성8을 확인한다. 지원은 공유 수치라 앞 루트에서 올린 만큼 이어진다.'],
  ['--need1', '영입 준비', '영입 전에 준비한다: 선물 상자 1개(수주 뒤 콜로이오스 요새에서 입수 → 보고).'],
  ['--scout', '스카우트', '울턴드에게 말을 걸어 스카우트를 고르고 요구를 전달한다.'],
  ['--join', '합류 확인', '동료 목록에서 합류를 확인한다. 합류한 뒤 던전 반복에 데려간다.']] });
addGroup({ id: 'recruit-all-dietrich-benditz-20261114', stage: 'dietrich-plan', route: 'dietrich', after: 'recruit-all-dietrich-goliath-20261112', title: '9장 무렵 · 명성7·지원2 뒤 밴디츠 영입', people: ['밴디츠'], notes: [{ category: '지양 인물', text: '영입만 한다. 출격·막타·시험·훈련에 쓰지 않는다.' }], actions: [
  ['--cond', '조건 확인', '디트리히와 지원2·명성7을 확인한다.'],
  ['--scout', '스카우트', '밴디츠에게 말을 걸어 스카우트를 고르고 요구를 전달한다.'],
  ['--join', '합류 확인', '동료 목록에서 합류를 확인한다. 이미 영입했으면 반복하지 않는다.']] });
addAction('di-09', 'dietrich-plan', 'di-09--c2a006734b', 'di-09--catania-20261114', '영입', '명성 8·지원 1로 카타냐를 영입한다. 요구 물품과 영입금은 없다.');
addAction('cai-04', 'cai-plan', 'cai-04--readiness-rine-return', 'cai-04--nujo-20261114', '영입', '명성 6·지원 2·철의 활 3개로 누조를 영입하고 동료 목록을 확인한다.');

const feastNotes = route => [{ category: '주의', text: '장 다시 하기를 하면 지원은 남는다. 그 장의 골드·아이템·날짜·명성·영입·의뢰는 장 시작 상태로 돌아간다.' }, ...(route === 'cai' ? [{ category: '주의', text: '12장에서 탈것 포획·먹이를 하기 전에 끝낸다.' }] : [])];
const twelve = { theodora: '티아라·디에고·오르헬 외전·이오', leda: '알렉산드라·제스터·골라이어스', dietrich: '게이츠·대도', cai: '이오' };
const feastAnchor = { theodora: 'theo-12', leda: 'leda-13', dietrich: 'miss-di12-answerer', cai: 'cai-06' };
for (const route of ['theodora', 'leda', 'dietrich', 'cai']) addGroup({ id: `feast-loop-${route}-part1-20261114`, stage: `${route}-plan`, route, after: feastAnchor[route], title: '12장 자유행동 직후 · 만찬 반복으로 지원 올리기(필수)', notes: feastNotes(route),
  refs: [{ url: 'notes/support-pairs-by-route.md', label: '루트별 지원 대화' }, { url: 'notes/support-follow-along.md', label: '지원 루프 따라하기' }], actions: [
  ['--save', '저장', '12장 자유행동이 열리면 다른 일을 하기 전에 저장한다.'],
  ['--recruit', '12장 영입', `12장에 영입할 수 있는 동료(${twelve[route]} 등)를 먼저 영입한다. 장 다시 하기를 하면 풀리므로 회차마다 다시 한다.`],
  ['--gift', '선물', '이번 주 선물을 아직 안 준 동료에게 준다. 선물은 인물당 주 1회이고 군주와의 지원만 올린다. 장 다시 하기를 하면 선물이 돌아온다.'],
  ['--spell', '마법 1회', '전투에 들어가 아무 동료가 마법을 1회 쓴다.'],
  ['--feast', '만찬', '만찬 지점으로 가서 고기만 써서 만찬을 반복한다. 고기는 마법을 회복하지 않아 계속 할 수 있다. 영입한 동료 전원의 지원이 오른다.'],
  ['--reset', '장 다시 하기', '고기나 시간이 떨어지면 메뉴 → 시스템 → 장 다시 하기를 고른다. 지원이 남았는지 확인하고 처음부터 다시 한다.'],
  ['--target', '목표', `「루트별 지원 대화」 문서의 ${routeName[route]} 표에 있는 모든 쌍이, 그 줄에 1부·1·2부·2부로 적힌 가장 높은 단계까지 열릴 때까지 반복한다. 2부에는 만찬이 없다.`]] });
addGroup({ id: 'p3-feast-loop-20261114', stage: 'part3-plan', route: 'part3', after: 'p3-io-pick', title: '2구간 · 다그시온 재영입 뒤 · 만찬 반복(융합보다 먼저)', actions: [
  ['--rejoin', '재영입', '다그시온에서 동료 전원에게 말을 걸어 다시 영입한다. 여러 루트판이 있으면 기준판만 고른다. 융합은 하지 않는다.'],
  ['--gift', '선물', '이번 주 선물을 아직 안 준 동료에게 준다. 선물은 인물당 주 1회다.'],
  ['--feast', '만찬', '전투에서 마법을 1회 쓰고, 만찬 지점에서 고기만 써서 만찬을 반복한다. 영입한 동료 전원의 지원이 오른다.'],
  ['--reset', '구간 다시 하기', '고기나 시간이 떨어지면 구간을 다시 시작한다. 재영입부터 다시 한다.'],
  ['--inn', '여관 대화', '마지막 다시 하기 뒤 재영입을 끝내고 여관에서 볼 수 있는 대화를 모두 본다.'],
  ['--merge-after', '융합은 그 뒤', '인과 융합은 이 반복을 모두 끝낸 뒤에만 한다. 융합한 뒤 구간을 다시 시작하면 파편 300은 돌아오지 않는다.']] });

// ── M2 분류 칩 ──
let chips = 0;
for (const g of pb.groups) for (const a of g.actions) {
  if (a.category === '선택 영입') { a.category = '영입'; chips++; }
  if (/^support-talks-(theodora|leda|dietrich|cai)-part1-20261112--feast$/.test(a.id)) { a.category = '마지막 회차'; chips++; }
  if (/^support-talks-(theodora|leda|dietrich|cai)-part2-20261112--feast$/.test(a.id)) { a.category = '지원 확인'; chips++; }
}
if (chips !== 27) fail('chips ' + chips); log.push('칩 ' + chips);

// ── M1 글·제목 덮어쓰기 ──
const queue = '인물 탭의 지원2 이상 영입 대기열을 확인한다. 현재 로드와의 지원이 모자라고 지금 활동 명단에 있는 상위 두 명부터 식사한다. 이미 지원을 채운 사람은 넘긴다.';
const audit2 = '2부에서 실제 출격할 인물만 지급 증서·기능 훈련 · 지원 대화용 영입은 투자 없음 · 수집판은 탈것 보존만';
const join = '동료 목록에서 합류를 확인한다.';
const texts = {
  'theo-02--support-queue': '5장 스카우트 개방 뒤 인물 탭의 지원2 이상 영입 대기열을 확인한다. 첫 선물로 인연을 열고, 현재 로드와의 지원이 모자라며 식사 명단에 있는 상위 두 명부터 식사한다. 이미 지원을 채운 사람은 넘긴다.',
  'leda-02--support-queue': queue, 'di-02--support-queue': queue, 'cai-route-03--support-queue': queue,
  'theo-03--sirocco-support-renown': '시로코 영입을 위해 명성5·세오도라와의 지원1을 먼저 채운다. 스카우트 메뉴가 잠겨 있으면 첫 선물로 관계를 연다.',
  'theo-10--4aac85975e': '시로코가 아직 없으면 군비증강·외전 기한을 지키면서 10/24 제도 출발 전까지 영입을 끝냅니다.',
  'leda-02--17bf843f7f': '에스메랄다 영입을 위해 지원 3과 명성 6, 다마센 곶 토벌 조건을 준비하되 Lv28 토벌을 초반에 억지로 하지 않습니다.',
  'recruit-dietrich-gift-box--conditions': '울턴드 지원3·명성5를 확인한다. 본대 지원·영입금·시험비는 따로 남긴다. 영입은 필수다. 합류한 뒤 던전 반복에 데려간다.',
  'di-09--bd0994b00c': '지원 2와 8,000G로 단테를 영입한다. 세오도라판이 있어도 디트리히에서만 열리는 대화 때문에 영입한다. 출격은 선택이다.',
  'di-06--supply-5': '단테 교섭금 8,000G를 남긴다.',
  'di-08--33c0a516de': '리네 물고기를 먼저 확보한다. 단테 교섭금 8,000G도 확인한다.',
  'di-24--c6621de22e': '제스터를 아직 안 데려왔으면 조건을 맞춰 영입합니다.',
  'cai-route-03--4860180597': '명성2·지원1을 채우면 그자람을 영입하고 동료 목록을 확인한다. 울턴드의 기일 대화도 실제 인물 목록에서 확인한다.',
  'team-theodora-recruit-audit--1': '1부 종료 전 실제 합류 확인(27명): 세오도라·보나파르트·토비아스·라이선더·릴리안·소피아·녹투라·리네·단테·알렉산드라·시로코·우술라·로레타·루루디아·이오·자코네·누디누·대도·나타·울턴드·티아라·세테스·디에고·피아나·하르빈·자스민·버커니어 · 외전 클리어: 베르트랑·타리문·오르헬 · 한 명이라도 없으면 1부를 끝내지 않는다',
  'team-leda-recruit-audit--1': '1부 종료 전 실제 합류 확인(21명): 레다·시로코·무우·올림피아·버커니어·그자람·카타냐·피아나·에스메랄다·소피아·이니오니·하르빈·이오·알렉산드라·키로이카·사란·디에고·울턴드·제스터·골라이어스·로레타 · 외전 클리어: 아나톨리아·오르헬 · 키릭 의뢰 「죽은 여동생의 장신구」 완료(키릭·네이선은 2부 합류) · 한 명이라도 없으면 1부를 끝내지 않는다',
  'team-dietrich-recruit-audit--1': '1부 종료 전 실제 합류 확인(27명): 디트리히·파비오·에스메랄다·미카엘라·양계·이오·울턴드·피아나·우술라·리네·단테·알렉산드라·카타냐·소피아·게이츠·제스터·골라이어스·밴디츠·피터르·대도·릴리안·루루디아·녹투라·하르빈·라이선더·시몬·무우 · 외전 클리어: 타리문·아나톨리아 · 최종 25명 육성판의 Lv20·중급 자격·필수 기능 준비 확인 · 한 명이라도 없으면 1부를 끝내지 않는다',
  'team-cai-recruit-audit--1': '1부 종료 전 실제 합류 확인(19명): 카이·티아라·피터르·울턴드·그자람·미카엘라·리네·누조·세테스·로레타·알렉산드라·이오·마지데·녹투라·골라이어스·에스메랄다·무우·양계·페페 · 외전 클리어: 베르트랑 · 최종 25명·2부 예약의 Lv20·중급·필수 기능 확인 · 한 명이라도 없으면 1부를 끝내지 않는다',
  'team-theodora-recruit-audit--2': audit2, 'team-dietrich-recruit-audit--2': audit2, 'team-leda-recruit-audit--2': audit2, 'team-cai-recruit-audit--2': audit2,
  'recruit-all-leda-jester-20261112--join': `${join} 10장이 끝나기 전에 여관에서 제스터·레다 C를 본다(레다 4~10장에만 열린다). 지원이 모자라면 그 장에서 만찬 반복을 먼저 한다.`,
  'recruit-all-cai-mu-20261112--join': `${join} 카이·무우 대회 시합 전에 여관에서 카이·무우 C를 본다. 지원이 모자라면 그 장에서 만찬 반복을 먼저 한다.`,
  'recruit-all-theodora-fianna-20261112--join': `${join} 피아나 기억 회복 전에 여관에서 세오도라·피아나, 라이선더·피아나 C·B를 본다. 지원이 모자라면 그 장에서 만찬 반복을 먼저 한다.`,
  'recruit-all-dietrich-lysander-20261112--join': `${join} 피아나 기억 회복 전에 여관에서 라이선더·피아나 C·B를 본다.`,
  'di-23--4a40c4fa4c': '이름만 들어 봤다고 자동 합류했다고 기록하지 말고 실제 부대 명단에 있는지 봅니다. 게이츠 정체 공개 전에 여관에서 게이츠와 골라이어스·단테·루루디아의 C를 봅니다.',
  'leda-02--d613a9a411': '이오의 명성6·레다와의 지원1 조건을 확인하고, 스카우트를 제안하기 직전 영입금 1,500G를 남긴다(화면 요구금 우선). 피아나 비용은 이미 지급했다면 다시 남기지 않는다.',
  'leda-05--d73d94905a': '이오(명성 6·지원 1·1,500G, 화면 요구금 우선)를 영입하고, 알렉산드라가 보이면 지원 3을 준비합니다.',
  'recruit-cai-io--reserve-gold': '명성10·카이와의 지원3을 확인하고 이오 교섭 직전 4,000G를 남긴다. 800G는 교섭으로 그 금액이 실제 확정됐을 때만 적용한다. 이미 영입했다면 이 비용은 제외한다.',
  'cai-route-10--7e6ce53b58': '조건을 충족한 이오에게 화면 요구금(기본 4,000G)을 지급해 영입하고 동료 목록의 합류를 확인한다.',
  'support-talks-cai-part1-20261112--mount': '장 다시 하기는 그 장에서 한 탈것 포획·먹이도 되돌린다. 12장에서 포획·먹이를 한 뒤에는 장 다시 하기를 하지 않는다.',
  'p3-merge-safety--restart-first': '만찬 반복·기준판 재선택·구간 다시 하기가 필요한 일을 모두 끝낸 뒤에만 융합한다. 융합 뒤 구간을 다시 시작하면 융합 결과는 사라지고 파편은 돌아오지 않는다.',
  'p3-support-talks-20261112--feast': '5구간에 합류한 동료가 있으면 같은 방법을 한 번 더 한다(전투에서 마법 1회 → 만찬 지점에서 고기만 써서 만찬 → 구간 다시 하기). 이 구간에서 할 융합은 반복을 끝낸 뒤로 미룬다.',
};
for (const route of ['theodora', 'leda', 'dietrich', 'cai']) {
  texts[`support-talks-${route}-part1-20261112--feast`] = '마지막 장 다시 하기 뒤에는 12장 할 일(영입·외전·시험·탈것 보관·구매)을 처음부터 다시 끝낸다. 12장 체크는 지우지 않고 다시 했는지만 확인한다.';
  texts[`support-talks-${route}-part1-20261112--inn`] = `그 뒤 여관에서 ${routeName[route]} 루트 표의 대화를 모두 본다. 1부 단계는 지금이 마지막이다. 1·2부 단계도 열려 있으면 지금 본다. 목록은 「루트별 지원 대화」 문서.`;
  texts[`support-talks-${route}-part2-20261112--feast`] = `2부에는 만찬이 없다. 지원은 1부에서 올린 단계를 그대로 쓴다. 여관에서 지원 목록을 열어 ${routeName[route]} 표의 1·2부·2부 단계가 열려 있는지 확인한다.`;
  texts[`support-talks-${route}-part2-20261112--inn`] = `2부를 끝내기 전에 여관에서 ${routeName[route]} 루트의 1·2부·2부 단계 대화를 모두 본다. 앞 루트에서 본 대화는 이 루트 2부 완료(또는 스킵) 뒤 3부에 반영된다.${route === 'dietrich' ? ' 게이츠·릴리안 C는 2부 2장부터 열린다.' : ''}`;
}
texts['p3-import-base-safety--compare-first'] = shown('p3-import-base-safety--compare-first') + ' 재영입 때 융합할 필요는 없다. 융합은 나중에 인과의 제단에서 따로 한다.';
for (const [id, t] of Object.entries(texts)) { action(id); ov.actions[id] = t; }
log.push('글 덮어쓰기 ' + Object.keys(texts).length);
const titles = { 'recruit-dietrich-gift-box': '명성5·지원3 뒤 · 울턴드 영입(던전 회복)', 'recruit-all-theodora-ultand-20261112': '9장 무렵 · 명성6·지원3 뒤 울턴드 영입(던전 회복·지원 대화)' };
for (const r of ['theodora', 'leda', 'dietrich', 'cai']) titles[`support-talks-${r}-part1-20261112`] = '1부 완료 전 · 12장 다시 끝내고 지원 대화 보기(필수)';
for (const [id, t] of Object.entries(titles)) { group(id); ov.groups[id] = t; }

// ── M3 블록 이동·문장 치환 ──
const move = (stage, id, beforeOrAfter, anchor) => { const s = stageOf(stage); const i = s.blocks.findIndex(b => b.id === id); if (i < 0) fail('move ' + id); const [b] = s.blocks.splice(i, 1); const j = s.blocks.findIndex(x => x.id === anchor); if (j < 0) fail('anchor ' + anchor); s.blocks.splice(beforeOrAfter === 'before' ? j : j + 1, 0, b);
  const gi = pb.groups.findIndex(g => g.id === id); if (gi >= 0) { const [g] = pb.groups.splice(gi, 1); const order = s.blocks.map(x => x.id); let at = -1; for (let k = order.indexOf(id) - 1; k >= 0 && at < 0; k--) { const x = pb.groups.findIndex(g2 => g2.id === order[k]); if (x >= 0) at = x + 1; } pb.groups.splice(at < 0 ? pb.groups.findIndex(g2 => g2.stage === stage) : at, 0, g); } log.push(`이동 ${id}`); };
move('cai-plan', 'support-talks-cai-part1-20261112', 'before', 'reward-cai-part1');
{ const t = '2구간 · 만찬 반복을 끝낸 뒤 · 필요한 추가판만 1회 300파편 융합'; const b = block('part3-plan', 'p3-merge'); b.title = t; b.html = b.html.replace(/<h3>.*?<\/h3>/s, `<h3>${esc(t)}</h3>`); group('p3-merge').title = t; delete ov.groups['p3-merge']; }
move('part3-plan', 'p3-merge', 'after', 'p3-merge-safety');
// 같은 블록의 그 행동 글이 html·playbook 모두에 있는 곳만 바꾼다.
const sub = (where, from, to, expect) => { let n = 0; for (const w of where) { const before = w.get(); const after = before.split(from).join(to); n += before.split(from).length - 1; w.set(after); } if (expect !== undefined && n !== expect) fail(`sub "${from.slice(0, 20)}" ${n}≠${expect}`); log.push(`치환 ${n}: ${from.slice(0, 24)}`); };
const pbS = { get: () => JSON.stringify(pb), set: v => Object.assign(pb, JSON.parse(v)) };
{ const re = /<li><strong class="item-token">선더 소드<\/strong> 목표 2자루·여유 3자루가 부족할 때만 누조 지참품 확보(?:(?!<\/li>).)*<\/li>/s; const b23 = block('dietrich-plan', 'di-23'); const m = b23.html.match(re); if (!m) fail('di-23 caution li'); b23.html = b23.html.replace(re, '<li>누조는 카이 루트에서만 영입한다.</li>'); log.push('di-23 주의 글 html'); }
let rcText = JSON.stringify(rc), dpText = JSON.stringify(dp);
const rcS = { get: () => rcText, set: v => { rcText = v; } }, dpS = { get: () => dpText, set: v => { dpText = v; } };
sub([pbS, rcS], '선택 영입은 쓰기로 정한 경우만.', '영입 대상은 전원 준비한다.', 2);
sub([pbS, rcS], '세 번째·네 번째 영입 생략', '레다는 지원 대화용 영입 · 디트리히는 영입 없음', 2);
sub([pbS], '선더 소드 목표2자루·여유3자루가 부족할 때만 누조 지참품 확보 · 충분하면 철의 활 구입·영입·추가 육성 생략', '누조는 카이 루트에서만 영입한다.');
sub([rcS], '게이츠 교섭→누조·제스터의 남은 의뢰·영입', '게이츠 교섭→제스터의 남은 의뢰·영입');
sub([pbS], '게이츠 교섭→누조·제스터의 남은 의뢰·영입', '게이츠 교섭→제스터의 남은 의뢰·영입');
sub([rcS, dpS], '위쪽 본대부터 현재 로드와 식사하며 선택 영입은 쓰기로 정한 경우만 준비합니다.', '위쪽 본대부터 현재 로드와 식사하며 영입 대상 전원을 준비합니다.', 8);
sub([rcS, dpS], '선택 영입이며 이미 영입한 경우 제외.', '이미 영입한 경우 제외.', 12);
writeFileSync(PB, JSON.stringify(pb, null, 2) + '\n');
W(RC, JSON.parse(rcText), raw[RC]); W(DP, JSON.parse(dpText), raw[DP]);
W(OV, ov, raw[OV]); W(CK, ck, raw[CK]); W(AL, al, raw[AL]);
// 골드 표 원천
{ const p = 'content/data/chapter-gold.json'; let s = readFileSync(p, 'utf8'); const c0 = s; s = s.split('이 루트에서도 단테를 영입하면').join('단테가 아직 미영입이면').split('세오도라판만 쓰고 이번 영입을 생략하면0G. 이미 지급했으면 제외.').join('이미 지급했으면 제외.').split('피아나를 추가 영입하면').join('피아나가 아직 미영입이면').split('선택 영입이며 이미 영입한 경우 제외.').join('이미 영입한 경우 제외.'); if (s === c0) fail('chapter-gold'); writeFileSync(p, s); log.push('골드 표 문장'); }
// 지원 대기열
{ const p = 'content/data/weekly-support.json'; const r0 = readFileSync(p, 'utf8'); const w = JSON.parse(r0); if (w.dietrich?.recruitmentQueue) w.dietrich.recruitmentQueue.conditional = []; const t = w.leda?.recruitmentQueue?.targets; if (Array.isArray(t)) w.leda.recruitmentQueue.targets = t.filter(x => !(typeof x === 'string' ? x.includes('자스민') : JSON.stringify(x).includes('자스민'))); W(p, w, r0); log.push('지원 대기열'); }
console.log(log.join('\n'));
console.log('현역 행동', pb.groups.flatMap(g => g.actions).length, '체크 ID', new Set(ck).size);
