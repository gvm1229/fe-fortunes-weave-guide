// 2026-11-14 누조 네 루트 필수(12장, 투자 없음)·이오 축소·레다 명성10 서두르기·명성 따라가기(한 번만 실행).
// 근거: docs/fable-plan-recruit-feast.md 4판·5판. 실행 뒤: npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync as w0 } from 'node:fs';
import { execSync } from 'node:child_process';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const raw = {}; const load = p => { raw[p] = readFileSync(p, 'utf8'); return JSON.parse(raw[p]); };
const save = (p, v) => writeFileSync(p, (/^\{\r?\n|^\[\r?\n/.test(raw[p]) ? JSON.stringify(v, null, 2) : JSON.stringify(v)) + (raw[p].endsWith('\n') ? '\n' : ''));
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json', CK = 'content/check-ids.json', AL = 'content/action-links.json', DP = 'content/display-parity.json';
const pb = load(PB), rc = load(RC), ov = load(OV), ck = load(CK), al = load(AL), dp = load(DP);
const old = { rc: JSON.parse(execSync('git show 8098a79:content/source/react-content.json', { maxBuffer: 1 << 30 }).toString()), pb: JSON.parse(execSync('git show 8098a79:content/data/playbook.json', { maxBuffer: 1 << 28 }).toString()), al: JSON.parse(execSync('git show 8098a79:content/action-links.json', { maxBuffer: 1 << 28 }).toString()) };
const fail = m => { throw new Error(m); };
const routePath = { 'theodora-plan': '/theodora/1/', 'leda-plan': '/leda/1/', 'dietrich-plan': '/dietrich/1/', 'cai-plan': '/cai/1/', 'part3-plan': '/part3/3/' };
const group = id => pb.groups.find(g => g.id === id) || fail('no group ' + id);
const action = id => pb.groups.flatMap(g => g.actions).find(a => a.id === id) || fail('no action ' + id);
const stageOf = id => rc.stages.find(s => s.id === id) || fail('no stage ' + id);
const block = (stage, id) => stageOf(stage).blocks.find(b => b.id === id) || fail(`no block ${stage}/${id}`);
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const liRe = id => new RegExp(`<li class="action-item"(?:(?!<\\/li>).)*data-task-id="${id}"(?:(?!<\\/li>).)*<\\/li>`, 's');
const li = (gid, aid, cat, text) => `<li class="action-item" data-done="false"><input aria-label="${esc(text)}" data-inherit-legacy="false" data-parent-task="${gid}" data-task-id="${aid}" disabled="" id="${aid}" type="checkbox"/><div class="action-label"><span class="action-category">${esc(cat)}</span><span class="action-text">${esc(text)}</span></div></li>`;
const people = JSON.parse(readFileSync('content/data/people-display.json', 'utf8'));
const span = name => `<span class="task-person"><img alt="${name} 초상화" height="66" loading="lazy" src="${people[name].portrait}" width="56"/><b>${name}</b></span>`;
const log = []; const reason = '2026-11-14 영입 루트 재배정(누조 네 루트·이오 축소)으로 제외. 체크 이력은 보존.';
const groupOrderAt = (stage, id) => { const order = stageOf(stage).blocks.map(b => b.id); for (let k = order.indexOf(id) - 1; k >= 0; k--) { const gi = pb.groups.findIndex(g => g.id === order[k]); if (gi >= 0) return gi + 1; } return pb.groups.findIndex(g => g.stage === stage); };
const moveBlock = (stage, id, where, anchor) => { const s = stageOf(stage), i = s.blocks.findIndex(b => b.id === id); if (i < 0) fail('move ' + id); const [b] = s.blocks.splice(i, 1); const j = s.blocks.findIndex(x => x.id === anchor); if (j < 0) fail('anchor ' + anchor); s.blocks.splice(where === 'before' ? j : j + 1, 0, b); const gi = pb.groups.findIndex(g => g.id === id); if (gi >= 0) { const [g] = pb.groups.splice(gi, 1); pb.groups.splice(groupOrderAt(stage, id), 0, g); } log.push(`이동 ${id} ${where} ${anchor}`); };
const retitle = (stage, id, t) => { const b = block(stage, id); b.title = t; b.html = b.html.replace(/<h3>.*?<\/h3>/s, `<h3>${esc(t)}</h3>`); group(id).title = t; delete ov.groups[id]; };
const setCautions = (stage, id, notes) => { const b = block(stage, id); const html = `<ul class="chapter-cautions">${notes.map(n => `<li>${esc(n.text)}</li>`).join('')}</ul>`; b.html = /<ul class="chapter-cautions">.*?<\/ul>/s.test(b.html) ? b.html.replace(/<ul class="chapter-cautions">.*?<\/ul>/s, html) : b.html.replace(/<\/ol>/, '</ol>' + html); group(id).notes = notes; };
function retireGroup(stage, id) { const i = pb.groups.findIndex(g => g.id === id); if (i < 0) fail('retire ' + id); const [g] = pb.groups.splice(i, 1); pb.retiredGroups.push({ ...g, retiredReason: reason }); const s = stageOf(stage), bi = s.blocks.findIndex(b => b.id === id); if (bi < 0) fail('retire block ' + id); s.blocks.splice(bi, 1); delete al[id]; for (const a of g.actions) { delete al[a.id]; delete ov.actions[a.id]; } delete ov.groups[id]; log.push(`은퇴 묶음 ${id}`); }
function retireAction(stage, id) { const g = pb.groups.find(g => g.actions.some(a => a.id === id)) || fail('retire action ' + id); const i = g.actions.findIndex(a => a.id === id); const [a] = g.actions.splice(i, 1); pb.retiredActions.push({ ...a, parentTask: g.id, retiredReason: reason }); const b = block(stage, g.id); if (!liRe(id).test(b.html)) fail('retire li ' + id); b.html = b.html.replace(liRe(id), ''); delete al[id]; delete ov.actions[id]; log.push(`은퇴 행동 ${id}`); }
function addGroup({ id, stage, route, title, after, before, people: ppl = [], actions, notes = [] }) {
  const s = stageOf(stage), at = s.blocks.findIndex(b => b.id === (after || before)); if (at < 0) fail('anchor ' + (after || before));
  const html = `<section class="action-group" data-group-id="${id}" data-guide-phase="1" data-guide-route="${route}" id="${id}"><div class="group-heading"><h3>${esc(title)}</h3><div class="group-tools"><span class="group-count" data-group-count="${id}">—</span></div></div>${ppl.length ? `<div class="task-people">${ppl.map(span).join('')}</div>` : ''}<ol class="action-list">${actions.map(([suf, cat, text]) => li(id, id + suf, cat, text)).join('')}</ol>${notes.length ? `<ul class="chapter-cautions">${notes.map(n => `<li>${esc(n.text)}</li>`).join('')}</ul>` : ''}</section>`;
  s.blocks.splice(after ? at + 1 : at, 0, { id, html, title });
  pb.groups.splice(groupOrderAt(stage, id), 0, { id, stage, title, people: ppl, actions: actions.map(([suf, cat, text]) => ({ id: id + suf, category: cat, text, inheritLegacy: false })), figures: [], notes, curated: true, referenceLinks: [], route });
  for (const x of [id, ...actions.map(([suf]) => id + suf)]) { if (!ck.includes(x)) { ck.push(x); rc.allTaskIds.push(x); } al[x] = routePath[stage] + '#' + x; }
  log.push(`새 묶음 ${id}`);
}
const noInvest = '영입만 한다. 출격·시험·훈련에 쓰지 않는다.';
// ── 4.1 누조 되살리기(세오도라 묶음, 디트리히 행동 3) ──
{ const ri = pb.retiredGroups.findIndex(g => g.id === 'theo-recruit-nujo'); if (ri < 0) fail('retired theo-recruit-nujo'); const [g] = pb.retiredGroups.splice(ri, 1); delete g.retiredReason;
  const ob = old.rc.stages.find(s => s.id === 'theodora-plan').blocks.find(b => b.id === 'theo-recruit-nujo') || fail('old block');
  const s = stageOf('theodora-plan'), at = s.blocks.findIndex(b => b.id === 'team-theodora-recruit-audit'); s.blocks.splice(at, 0, { ...ob });
  pb.groups.splice(groupOrderAt('theodora-plan', 'theo-recruit-nujo'), 0, g);
  for (const x of ['theo-recruit-nujo', ...g.actions.map(a => a.id)]) al[x] = old.al[x] || routePath['theodora-plan'] + '#' + x;
  retitle('theodora-plan', 'theo-recruit-nujo', '12장 · 명성6·지원1 · 누조 영입(선더 소드 지참)');
  setCautions('theodora-plan', 'theo-recruit-nujo', [{ category: '지참품', text: '12장 무렵 영입하면 선더 소드를 들고 온다. 일찍 영입하면 없다. 영입 전에 지참품을 확인한다. ' + noInvest }]);
  log.push('되살림 theo-recruit-nujo'); }
for (const id of ['di-11--117e3abb0f', 'di-23--d20bb24be0', 'di-24--584da4ce13']) {
  const ri = pb.retiredActions.findIndex(a => a.id === id); if (ri < 0) fail('retired ' + id); const [a] = pb.retiredActions.splice(ri, 1); const gid = a.parentTask; delete a.parentTask; delete a.retiredReason;
  const og = old.pb.groups.find(x => x.id === gid); const order = og.actions.map(x => x.id); const g = group(gid);
  const prev = order.slice(0, order.indexOf(id)).reverse().find(x => g.actions.some(y => y.id === x)); const pos = prev ? g.actions.findIndex(y => y.id === prev) + 1 : 0; g.actions.splice(pos, 0, a);
  const ob = old.rc.stages.find(s => s.id === 'dietrich-plan').blocks.find(b => b.id === gid); const m = ob.html.match(liRe(id)) || fail('old li ' + id);
  const b = block('dietrich-plan', gid); if (prev) { const pm = b.html.match(liRe(prev)) || fail('prev li ' + prev); b.html = b.html.replace(pm[0], pm[0] + m[0]); } else b.html = b.html.replace(/<ol class="action-list">/, `<ol class="action-list">${m[0]}`);
  al[id] = old.al[id] || routePath['dietrich-plan'] + '#' + id; log.push('되살림 ' + id);
}
// ── 4.2 이오 은퇴 ──
retireGroup('theodora-plan', 'recruit-theodora-io');
retireAction('theodora-plan', 'prep-mount-recruits--9612b4af26');
retireAction('leda-plan', 'leda-02--d613a9a411');
retireAction('leda-plan', 'mount-prep-leda--io-class');
// ── 5.1 카이 누조: 육성 은퇴, 6장 단계 은퇴, 12장 영입 묶음 ──
for (const id of ['ready-cai-nuzzuo', 'ready-cai-nuzzuo-middle', 'ready-cai-nuzzuo-skills']) retireGroup('cai-plan', id);
retireAction('cai-plan', 'cai-04--nujo-20261114');
const nujoActions = (route, lord, fame, sup, bows, extraCond = '') => [['--cond', '조건 확인', `${lord}와 지원${sup}·명성${fame}를 확인한다.${extraCond} 지원은 공유 수치라 앞 루트에서 올린 만큼 이어진다.`], ['--need1', '영입 준비', `영입 전에 준비한다: 철의 활 ${bows}개(다그시온 무기점·행상인).`], ['--scout', '스카우트', '지참품에 선더 소드가 있는지 본 뒤 누조에게 말을 걸어 스카우트를 고르고 요구를 전달한다.'], ['--join', '합류 확인', '동료 목록에서 합류를 확인하고 선더 소드를 수송대에 보관한다.']];
const nujoNote = [{ category: '지참품', text: '12장 무렵 영입하면 선더 소드를 들고 온다. 일찍 영입하면 없다. 영입 전에 지참품을 확인한다. ' + noInvest }];
addGroup({ id: 'recruit-all-leda-nujo-20261114', stage: 'leda-plan', route: 'leda', after: 'recruit-all-leda-diego-20261112', title: '12장 · 명성9·지원3 · 누조 영입(선더 소드 지참)', people: ['누조'], notes: nujoNote, actions: nujoActions('leda', '레다', 9, 3, 3) });
addGroup({ id: 'recruit-all-cai-nujo-20261114', stage: 'cai-plan', route: 'cai', before: 'team-cai-recruit-audit', title: '12장 · 명성6·지원2 · 누조 영입(선더 소드 지참)', people: ['누조'], notes: nujoNote, actions: nujoActions('cai', '카이', 6, 2, 3, ' 12장 전에는 영입하지 않는다.') });
{ const g = group('team-cai-war'); g.people = (g.people || []).filter(n => n !== '누조'); const b = block('cai-war-plan', 'team-cai-war'); b.html = b.html.replace(/<span class="task-person"><img[^>]*alt="누조 초상화"[^>]*\/><b>누조<\/b><\/span>/, '').replace(/<img[^>]*alt="누조 초상화"[^>]*\/>/, ''); log.push('team-cai-war 누조 삭제'); }
// ── 5.3 레다 제스터·골라이어스 ──
{ const g = group('recruit-all-leda-jester-20261112'); const aid = 'recruit-all-leda-jester-20261112--renown10-20261114', cat = '명성 10', text = '9장이 끝날 때 명성을 본다. 10장에 들어가면 자동 완료되는 공통 의뢰의 명성을 받고, 모자라면 공연 의뢰(하나에 약 200)와 신 알현, 남은 의뢰를 10장 초에 끝내 명성 10을 만든다.';
  g.actions.unshift({ id: aid, category: cat, text, inheritLegacy: false }); const b = block('leda-plan', g.id); b.html = b.html.replace(/<ol class="action-list">/, `<ol class="action-list">${li(g.id, aid, cat, text)}`); ck.push(aid); rc.allTaskIds.push(aid); al[aid] = '/leda/1/#' + aid; log.push('새 행동 ' + aid);
  ov.groups['recruit-all-leda-jester-20261112'] = '10장 · 명성10·지원3 · 제스터 영입(10장 안에 필수)'; }
retitle('leda-plan', 'recruit-all-leda-goliath-20261112', '10장 무렵 · 명성10·지원3 뒤 골라이어스 영입(지원 대화)');
moveBlock('leda-plan', 'recruit-all-leda-goliath-20261112', 'after', 'recruit-all-leda-jester-20261112');
// ── 5.4 디트리히 7장 합류 육성 묶음 ──
let anchor = 'di-10';
for (const [id, name] of [['ready-dietrich-catania', '카타냐'], ['ready-dietrich-ninae', '리네'], ['ready-dietrich-dante', '단테'], ['ready-dietrich-alexandra', '알렉산드라']]) { retitle('dietrich-plan', id, `7장 실제 합류 뒤 · ${name} 육성 준비`); moveBlock('dietrich-plan', id, 'after', anchor); anchor = id; }
// ── 글 덮어쓰기 ──
const T = {
  'theo-recruit-nujo--join': '12장에 누조가 활동 명단에 있는지 확인한다. 명성6·세오도라와 지원1·철의 활3개를 갖추고, 지참품에 선더 소드가 있는지 본 뒤 스카우트해 합류를 확인한다. 다른 루트의 철의 활 수량을 가져오지 않는다.',
  'di-11--117e3abb0f': '두 번째 선더 소드는 12장 누조 영입의 지참품으로 계획한다.',
  'di-23--d20bb24be0': '디트리히 누조용 철의 활 2개를 준비한다.',
  'di-24--584da4ce13': '누조는 디트리히 기준 명성 9·지원 1·철의 활 2개를 준비합니다.',
  'di-24--c6621de22e': '누조·제스터를 아직 안 데려왔으면 조건을 맞춰 영입하고, 지참한 선더 소드를 확인합니다.',
  'prep-mount-recruits--c549be29a5': '현재 세오도라 동료 목록에 알렉산드라가 있는지 확인한다. 미영입이면 조건을 채워 영입한 뒤 아래 병종을 준비한다.',
  'prep-mount-recruits--ea4768f4f8': '알렉산드라는 비탑승 중급인 검사 등을 사용합니다.',
  'theo-13--94ab4351b8': '리네·단테·알렉산드라가 실제 동료 목록에 있는지 확인한다. 이미 영입한 동료에게 영입금을 다시 지급하지 않는다.',
  'theo-12--d0e88e4098': '알렉산드라, 전용 무기, 선더 소드, 회복 도구를 점검한다.',
  'theo-13--c29ea7ebf6': '최종전 출발 전에 알렉산드라를 비탑승 중급으로 바꾼다. 전용 페가수스가 장착 상태로 남지 않았는지 확인한다.',
  'theo-12--5ca8ac56bf': '비탑승 병종으로 바꾼 뒤 전용 페가수스가 실제 마구간에 보관됐는지 확인한다. 그 상태로 12장 최종전에 출발한다.',
  'leda-05--d73d94905a': '알렉산드라가 보이면 지원 3을 준비합니다.',
  'leda-13--d950ca7516': '알렉산드라를 영입하고 전용 페가수스를 마구간에 둔 상태를 만들며, 알렉산드라 상급 시험은 보류합니다.',
  'leda-13--f374f0481c': '알렉산드라 전용 탈것 보관, 레다 칼라의 활·무희, 두 자루 검, 회복 도구를 점검한다.',
  'mount-prep-leda--joined': '동료 목록에서 알렉산드라의 실제 합류를 확인한다. 미영입이면 이번 루트의 조건·기한 안에 먼저 영입한다.',
  'sequential-theodora-war-entry-20261108--1': '네 루트의 1부 완료 자료를 확인한다. 세오도라 1부에서 준비한 물품·고유 무기·알렉산드라의 보관 자격을 확인하고 새 2부 1장을 시작한다.',
  'sequential-theodora-war-entry-20261108--3': '2부4장까지 알렉산드라 비탑승 중급 자격 준비 · 이미 가진 자격이면 추가 시험 없음 · 알렉산드라 상급 합격 보류',
  'sequential-theodora-war06-preserve-20261108--1': '첫 완료 전 보존 상태 확인 · 마지막 출격 준비에서 알렉산드라를 비탑승 중급으로 변경 · 상급 자동 배정 가능성을 피하도록 알렉산드라 상급 합격 보류',
  'sequential-theodora-register-20261108--1': '스킵 해금을 확인한 뒤 세오도라2부1장을 다시 시작 · 알렉산드라를 천익병으로 변경해 전용 탈것 장착 확인',
  'leda-first-store-then-play-20261108--1': '세오도라 직접2부 완료로 스킵이 열린 상태 확인 · 레다1부 물품·알렉산드라 비탑승 보관 상태 확인',
  'leda-first-store-then-play-20261108--3': '같은 레다2부1장을 다시 시작 · 알렉산드라의 천익병과 전용 탈것 장착 후6장까지 직접 진행 · 이 직접 완료에서 장착 자료 등록',
  'sequential-leda-war06-preserve-20261108--2': '이번 직접 완료는 장착 자료 등록 · 알렉산드라와 실제 채택할 인물의 의도한 탈것 장착 확인 · 이미 공용 반입한 것을 또 해제해 중복 보관하려고 하지 않음',
  'war-clear-record--4433cdcbd2': '알렉산드라가 천익병이고 전용 페가수스를 갖는지 확인합니다.',
  'feast-loop-theodora-part1-20261114--recruit': '12장에 영입할 수 있는 동료(티아라·디에고·오르헬 외전·누조 등)를 먼저 영입한다. 장 다시 하기를 하면 풀리므로 회차마다 다시 한다.',
  'feast-loop-dietrich-part1-20261114--recruit': '12장에 영입할 수 있는 동료(게이츠·대도·누조 등)를 먼저 영입한다. 장 다시 하기를 하면 풀리므로 회차마다 다시 한다.',
  'feast-loop-cai-part1-20261114--recruit': '12장에 영입할 수 있는 동료(이오·누조 등)를 먼저 영입한다. 장 다시 하기를 하면 풀리므로 회차마다 다시 한다.',
  'feast-loop-leda-part1-20261114--recruit': '12장에 영입할 수 있는 동료(누조 등)를 먼저 영입한다. 명성 10을 12장에야 채웠다면 알렉산드라·골라이어스도 여기서 영입한다. 장 다시 하기를 하면 풀리므로 회차마다 다시 한다.',
  'cai-route-08--aef9711bb8': '열린 마차역을 이용해 다음 의뢰 장소로 이동 · 새 영입은 로레타 조건 충족부터',
  'p3-feast-loop-20261114--merge-after': '인과 융합은 2구간 연회 반복을 모두 끝낸 뒤에 한다. 융합한 그 구간을 다시 시작하면 융합은 사라지고 파편 300은 돌아오지 않는다. 뒤 구간을 다시 시작해도 앞 구간의 융합은 남는다.',
  'p3-merge-safety--restart-first': '이 구간의 연회 반복·기준판 재선택·구간 다시 하기를 모두 끝낸 뒤에 융합한다. 융합한 그 구간을 다시 시작하면 융합은 사라지고 파편은 돌아오지 않는다.',
  'p3-merge--1314dc2a2a': '융합한 그 구간을 다시 시작하면 융합 결과는 사라지고 파편은 돌아오지 않는다. 뒤 구간을 다시 시작해도 앞 구간의 융합은 남는다. 그 구간에서 다시 시작할 일을 끝낸 뒤 지출한다.',
  'p3-support-talks-20261112--feast': '5구간에 합류한 동료가 있으면 같은 방법을 한 번 더 한다(전투에서 마법 1회 → 연회 장소에서 고기만 써서 연회 → 구간 다시 하기). 2구간에 한 융합은 남는다. 5구간에서 새로 하는 융합만 이 반복 뒤에 한다.',
  'leda-09--2e0d9aac34': '공연으로 명성 9 이상을 만들고, 10장이 끝나기 전에 명성 10을 채웁니다. 10장 안에 제스터를 영입해야 제스터·레다 C를 볼 수 있습니다.',
  'leda-11--b6ec890700': '10장에 명성 10을 채웠다면 알렉산드라는 그때 영입합니다. 아직이면 명성 10이 되는 날 바로 영입합니다.',
  'recruit-all-leda-jester-20261112--cond': '레다와 지원3·명성10을 확인한다. 10장(9/28~10/15) 안에 전투 의뢰 3개와 영입까지 끝내야 하므로 명성 10은 10장 초에 채운다.',
};
const examText = 'Lv35 이상·필수 기능·시험100%인 실제 투입 후보의 미합격 자격에 상급 증서 최대5장 배분 · 티아라→리네→울턴드→로레타→세테스→카이→녹투라→피터르→그자람→미카엘라 · 이미 합격/조건 미달이면 다음 후보 · 인원 채우기용 시험 없음';
for (const n of [1, 2, 3, 4]) T[`army-cai-${n}--readiness-exams`] = examText;
const audit = (r, names, tail) => `1부 종료 전 실제 합류 확인(${names.length}명): ${names.join('·')} · ${tail}`;
const roster = JSON.parse(readFileSync('content/data/recruit-all-plan.json', 'utf8')).pairCoverage.routeRoster;
const newRoster = { theodora: roster.theodora.map(n => n === '이오' ? '누조' : n), leda: roster.leda.map(n => n === '이오' ? '누조' : n), dietrich: [...roster.dietrich, '누조'], cai: roster.cai };
T['team-theodora-recruit-audit--1'] = audit('theodora', newRoster.theodora, '외전 클리어: 베르트랑·타리문·오르헬 · 한 명이라도 없으면 1부를 끝내지 않는다');
T['team-leda-recruit-audit--1'] = audit('leda', newRoster.leda, '외전 클리어: 아나톨리아·오르헬 · 키릭 의뢰 「죽은 여동생의 장신구」 완료(키릭·네이선은 2부 합류) · 한 명이라도 없으면 1부를 끝내지 않는다');
T['team-dietrich-recruit-audit--1'] = audit('dietrich', newRoster.dietrich, '외전 클리어: 타리문·아나톨리아 · 최종 25명 육성판의 Lv20·중급 자격·필수 기능 준비 확인 · 한 명이라도 없으면 1부를 끝내지 않는다');
T['team-theodora-recruit-audit--2'] = (ov.actions['team-theodora-recruit-audit--2'] || action('team-theodora-recruit-audit--2').text) + ' · 게시판 공통 의뢰는 되도록 끝낸다(다음 루트에서 자동 완료돼 명성이 들어온다)';
for (const [id, t] of Object.entries(T)) { action(id); ov.actions[id] = t; }
ov.groups['prep-mount-recruits'] = '12장 · 알렉산드라 보관용 병종 준비';
log.push('글 ' + Object.keys(T).length);
// ── 주의 글(HTML·playbook 같이) ──
let rcS = JSON.stringify(rc), pbS = JSON.stringify(pb), dpS = JSON.stringify(dp);
const sub = (from, to, where = ['rc', 'pb']) => { let n = 0; for (const w of where) { const s = { rc: rcS, pb: pbS, dp: dpS }[w]; n += s.split(from).length - 1; const r = s.split(from).join(to); if (w === 'rc') rcS = r; else if (w === 'pb') pbS = r; else dpS = r; } log.push(`치환 ${n}: ${from.slice(0, 30)}`); return n; };
sub('누조는 카이 루트에서만 영입한다.', '누조는 12장 무렵 영입하면 선더 소드를 들고 온다. 반드시 영입한다. ' + noInvest);
sub('10장 안에 명성10이 안 되면 레다·제스터 대화는 놓친다.', '10장 안에 명성10을 채운다. 앞 루트에서 끝낸 공통 의뢰는 그 장에 들어가면 자동 완료돼 명성이 들어온다. 모자라면 공연 의뢰와 신 알현으로 채운다.');
sub('미지급 단테8,000G·이오800G와', '미지급 단테8,000G와'); sub('피아나 영입용3,000G·이오800G와', '피아나 영입용3,000G와');
sub('이오 지원 1을 끝내고, ', ''); sub(', 티아라–이오', ''); sub('이오 중 아직 미영입·지원 미달인 대상만 준비 · ', '');
writeFileSync(RC, rcS + (raw[RC].endsWith('\n') ? '\n' : '')); writeFileSync(PB, JSON.stringify(JSON.parse(pbS), null, 2) + '\n'); writeFileSync(DP, dpS + (raw[DP].endsWith('\n') ? '\n' : ''));
save(OV, ov); save(CK, ck); save(AL, al);
// ── 자료 ──
{ const p = 'content/cai-charioteer.json'; const r0 = readFileSync(p, 'utf8'), j = JSON.parse(r0); delete j.people['누조']; writeFileSync(p, JSON.stringify(j, null, 2) + (r0.endsWith('\n') ? '\n' : '')); }
{ const p = 'content/data/recruit-all-plan.json'; const r0 = readFileSync(p, 'utf8'), j = JSON.parse(r0); j.pairCoverage.routeRoster = newRoster;
  j.duplicates = j.duplicates.filter(d => d.name !== '누조' && d.name !== '이오'); j.duplicates.push({ name: '누조', routes: ['theodora', 'leda', 'dietrich', 'cai'], purpose: '선더 소드 지참(네 루트 12장 영입) · 투자 없음', ok: true }, { name: '이오', routes: ['dietrich', 'cai'], purpose: '디트리히 전용 탈것 보존 + 카이 전차병', ok: true });
  const ti = j.pairCoverage.pairs.find(p => p.pair === '티아라–이오'); if (ti) ti.routes = ['cai'];
  const nu = j.assignments.find(a => a.name === '누조'); if (nu) { nu.role = '수집'; nu.deadline = { ...(nu.deadline || {}), chapter: '12장' }; }
  writeFileSync(p, JSON.stringify(j, null, 2) + (r0.endsWith('\n') ? '\n' : '')); }
{ const p = 'content/data/final-roster.json'; const r0 = readFileSync(p, 'utf8'), j = JSON.parse(r0); for (const r of Object.keys(newRoster)) j.recruitByRoute[r] = newRoster[r]; writeFileSync(p, JSON.stringify(j, null, 2) + (r0.endsWith('\n') ? '\n' : '')); }
{ const p = 'content/data/roster-selection.json'; const r0 = readFileSync(p, 'utf8'), j = JSON.parse(r0); const n = j.routes?.cai?.people?.['누조']; if (n) { n.roles = { 1: '수집', 2: '수집', 3: '수집' }; n.reasons = { 1: '선더 소드 지참품 확보(12장 영입) · 투자 없음', 2: '선더 소드 지참품 확보(12장 영입) · 투자 없음', 3: '선더 소드 지참품 확보(12장 영입) · 투자 없음' }; n.recruitDecision = '12장 · 명성 6 · 지원 2 · 철의 활 3 · 지참품의 선더 소드 확인 뒤 영입'; if (n.investmentByPhase) for (const k of Object.keys(n.investmentByPhase)) n.investmentByPhase[k] = '투자 없음'; writeFileSync(p, JSON.stringify(j, null, 2) + (r0.endsWith('\n') ? '\n' : '')); log.push('roster-selection 누조'); } }
{ const p = 'content/data/phase-goals.json'; const r0 = readFileSync(p, 'utf8'), j = JSON.parse(r0); const n = j.routes?.cai?.['누조']; if (n) { for (const k of ['1', '2', '3']) if (n[k]) n[k].text = '영입만 · 육성 없음(선더 소드 지참품용)'; writeFileSync(p, JSON.stringify(j, null, 2) + (r0.endsWith('\n') ? '\n' : '')); log.push('phase-goals 누조'); } }
// 레다 12장 골드 추가 줄
{ const p = 'content/data/chapter-gold.json'; const r0 = readFileSync(p, 'utf8'), j = JSON.parse(r0); const c = j.routes.leda.find(c => c.chapter === 12); c.extras.unshift({ label: '누조 영입용 철의 활 3개', amount: 4500, note: 'Game8 다그시온 기본 1,500G×3개 예산. 이미 보유하면 제외.' }); writeFileSync(p, JSON.stringify(j, null, 2) + (r0.endsWith('\n') ? '\n' : ''));
  const rc2 = JSON.parse(readFileSync(RC, 'utf8')); const b = rc2.stages.find(s => s.id === 'leda-plan').blocks.find(b => b.id === 'gold-leda-12'); if (!/<ul class="gold-extras">/.test(b.html)) fail('gold-leda-12 extras'); b.html = b.html.replace('<ul class="gold-extras">', '<ul class="gold-extras"><li><span class="inline-person"><img alt="" height="26" loading="lazy" src="' + people['누조'].portrait + '" width="22"/><span>누조</span></span> 영입용 철의 활 3개 <b>+<span class="number-token money-token">4,500G</span></b><small>Game8 다그시온 기본 1,500G×3개 예산. 이미 보유하면 제외.</small></li>'); writeFileSync(RC, JSON.stringify(rc2) + (raw[RC].endsWith('\n') ? '\n' : '')); log.push('레다 12장 골드 누조'); }
console.log(log.join('\n'));
console.log('현역 행동', JSON.parse(readFileSync(PB, 'utf8')).groups.flatMap(g => g.actions).length, '체크 ID', new Set(JSON.parse(readFileSync(CK, 'utf8'))).size);
