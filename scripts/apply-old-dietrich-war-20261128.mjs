// 주의: 실행 뒤 글을 손으로 고침(진행 중인 2부 표현, 근거 단추 삭제, Fable 검토 23 반영). 다시 실행 금지.
// 2026-11-28 사용자 규칙 U74(한 번만 실행): 디트리히 1부를 1장부터 다시 하기 전에 지금 저장의 옛 디트리히 2부를 먼저 완료해
// 운 좋은 능력치를 완료 자료로 남긴다. 새 디트리히 2부는 '다시 완료'라 자료가 쌓인다. 근거 문서: content/notes/dietrich-old-war-clear.md
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const raw = {}; const load = p => { raw[p] = readFileSync(p, 'utf8'); return JSON.parse(raw[p]); };
const W = (p, v) => { const r = raw[p]; const nl = r.includes('\r\n') ? '\r\n' : '\n'; const ind = /^[[{]\r?\n/.test(r) ? 2 : 0; writeFileSync(p, JSON.stringify(v, null, ind).replace(/\n/g, nl) + (/\r?\n$/.test(r) ? nl : '')); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json', CK = 'content/check-ids.json', AL = 'content/action-links.json';
const pb = load(PB), rc = load(RC), ov = load(OV), ck = load(CK), al = load(AL);
const fail = m => { throw new Error(m); };
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const log = [];
const li = (gid, aid, cat, text) => `<li class="action-item" data-done="false"><input aria-label="${esc(text)}" data-inherit-legacy="false" data-parent-task="${gid}" data-task-id="${aid}" disabled="" id="${aid}" type="checkbox"/><div class="action-label"><span class="action-category">${esc(cat)}</span><span class="action-text">${esc(text)}</span></div></li>`;
const DOC = { url: 'notes/dietrich-old-war-clear.md', label: '옛 디트리히 2부 먼저 완료' };
const refBtn = ({ url, label }) => `<button aria-haspopup="dialog" class="training-source" data-reference-doc="true" data-reference-url="${url.replace(/\.md$/, '.html')}" type="button">${esc(label)}</button>`;
const ids = new Set(pb.groups.flatMap(g => [g.id, ...g.actions.map(a => a.id)]));
const allActions = () => pb.groups.flatMap(g => g.actions);
const blockOf = id => rc.stages.flatMap(s => s.blocks).find(b => b.html.includes(`data-task-id="${id}"`)) || fail('rc ' + id);

// 그림 없는 행동 글 바꾸기: 원본 글이 HTML과 같으면 원본을, 다르면(숫자 표시 등) 덮어쓰기를 쓴다.
function setText(id, text) {
  const a = allActions().find(x => x.id === id) || fail(id), b = blockOf(id);
  const s = b.html.lastIndexOf('<li', b.html.indexOf(`data-task-id="${id}"`)), e = b.html.indexOf('</li>', s), item = b.html.slice(s, e);
  if (/<img/.test(item)) fail('그림 있음 ' + id);
  if (item.split(esc(a.text)).length - 1 === 2) { b.html = b.html.slice(0, s) + item.split(esc(a.text)).join(esc(text)) + b.html.slice(e); a.text = text; log.push('원본 ' + id); }
  else { ov.actions[id] = text; log.push('덮어쓰기 ' + id); }
}
function addGroup({ id, stage, phase, route, part, title, after, actions, notes = [] }) {
  const s = rc.stages.find(x => x.id === stage) || fail(stage), bi = s.blocks.findIndex(b => b.id === after); if (bi < 0) fail('anchor ' + after);
  if (ids.has(id)) fail('dup ' + id);
  const html = `<section class="action-group" data-group-id="${id}" data-guide-phase="${phase}" id="${id}"><div class="group-heading"><h3>${esc(title)}</h3><div class="group-tools"><span class="group-count" data-group-count="${id}">—</span></div></div><ol class="action-list">${actions.map(([suf, cat, text]) => li(id, id + suf, cat, text)).join('')}</ol>${notes.length ? `<ul class="chapter-cautions">${notes.map(n => `<li>${esc(n.text)}</li>`).join('')}</ul>` : ''}${refBtn(DOC)}</section>`;
  s.blocks.splice(bi + 1, 0, { id, html, title });
  const gi = pb.groups.findIndex(g => g.id === after); if (gi < 0) fail('playbook anchor ' + after);
  pb.groups.splice(gi + 1, 0, { id, stage, title, people: [], actions: actions.map(([suf, cat, text]) => ({ id: id + suf, category: cat, text, inheritLegacy: false })), notes, figures: [], showMap: false, curated: true, referenceLinks: [DOC] });
  for (const x of [id, ...actions.map(([suf]) => id + suf)]) { ck.push(x); rc.allTaskIds.push(x); al[x] = `/${route}/${part}/#${x}`; }
  log.push(`새 묶음 ${id} (${actions.length})`);
}
function addAction(gid, afterId, aid, cat, text, route, part) {
  const g = pb.groups.find(x => x.id === gid) || fail(gid), i = g.actions.findIndex(a => a.id === afterId); if (i < 0) fail('after ' + afterId);
  g.actions.splice(i + 1, 0, { id: aid, category: cat, text, inheritLegacy: false });
  const b = blockOf(afterId), s = b.html.lastIndexOf('<li', b.html.indexOf(`data-task-id="${afterId}"`)), e = b.html.indexOf('</li>', s) + 5;
  b.html = b.html.slice(0, e) + li(gid, aid, cat, text) + b.html.slice(e);
  ck.push(aid); rc.allTaskIds.push(aid); al[aid] = `/${route}/${part}/#${aid}`; log.push('새 행동 ' + aid);
}

// 1. 옛 디트리히 2부 먼저 완료(새 묶음, 디트리히 1장 새로 시작 바로 앞)
addGroup({ id: 'old-dietrich-war-clear-20261128', stage: 'dietrich-plan', phase: 1, route: 'dietrich', part: 1, after: 'entry-dietrich-boons',
  title: '1장 새로 시작 전 · 옛 디트리히 2부 먼저 완료(능력치 보존)', actions: [
  ['--why', '먼저 완료', '지금 디트리히 저장의 2부(2부 1장 첫 전투 전)를 이어서 직접 완료한다. 1부를 1장부터 다시 시작하면 이 2부 진행이 덮어써지므로 그 전에 끝낸다.'],
  ['--mounts', '탈것 보관', '첫 전투 전 거점에서 이오는 비기병, 알렉산드라는 비탑승 병종으로 바꾼다. 이 루트의 첫 완료라 로시난·부케팔라스가 3부 마구간으로 넘어간다.'],
  ['--items', '물품 고정', '이 완료로 디트리히 루트의 3부 물품이 지금 저장의 1부 끝 소지품으로 고정된다. 판 물건은 빠지고 앤서러는 지금 강화 단계 그대로다. 새 1부에서 얻는 물건은 떠도는 성궤에서 파편으로 산다.'],
  ['--boosters', '아이템 보존', '능력치 아이템·마법 두루마리는 2부에서 쓸 수 없다. 쓰지 않은 채 두면 3부 물품으로 넘어간다.'],
  ['--check', '자료 확인', '완료 뒤 방첨탑의 완료 자료에서 디트리히·에스메랄다 등의 능력치가 남았는지 확인한다.'],
  ['--ch12', '선택', '고정 뒤 옛 저장의 1부 12장을 다시 시작해 능력치 아이템·두루마리를 쓰고 12장을 완료한다. 그다음 2부를 스킵으로 끝내면 효과는 완료 자료에 쌓이고 물건은 3부 물품에 남는다.'],
], notes: [
  { text: '같은 루트를 다시 완료하면 레벨·능력치·기능·병종·전투 기술·두루마리 흑마법이 높은 값으로 쌓인다. 일반 동료도 3부에서 아직 영입하지 않았으면 파편이 들지 않는다(Serenes Forest·GameFAQs 이용자 실험, 게임에서 직접 재현하지 않음).' },
  { text: '알렉산드라는 이미 상급에 합격해 완료 자료가 상급 병종으로 바뀔 수 있다. 3부 기준판은 카이판(U59)이라 이 판에는 영향이 작다.' },
  { text: '이 완료가 전체 첫 2부 완료이므로 이후 2부 스킵이 열린다. 직접 완료 보상 무기 3개도 받는다.' },
] });

// 2. 레다 뒤 이동 줄, 디트리히 12장
setText('leda-post-clear-boons-20261110--start-dietrich-part1', '구매를 마치면 옛 디트리히 2부를 먼저 완료한 뒤, 방첨탑에서 새 디트리히 1부를 1장부터 시작한다.');
setText('di-26--0786e0be37', '이오·알렉산드라의 탈것 보관은 옛 디트리히 2부 완료에서 끝났다. 원래 전투 병종을 유지한다.');
setText('di-26--3067643235', '다시 보관하려고 비탑승 병종으로 바꾸지 않는다.');
{ const g = pb.groups.find(x => x.id === 'di-26'); ov.notes['di-26'] = g.notes.filter(n => (n.text || n).includes('무거운 장비')); if (ov.notes['di-26'].length !== 1) fail('di-26 notes'); log.push('di-26 메모'); }
addAction('di-27', 'di-27--save-hard-casual', 'di-27--use-items-20261128', '아이템', '이번 1부에서 얻은 능력치 아이템·마법 두루마리는 써도 된다. 디트리히 루트 3부 물품은 옛 2부 완료로 이미 고정되어 있다.', 'dietrich', 1);

// 3. 새 디트리히 2부는 다시 완료
ov.groups['war-di-new'] = '새 디트리히 2부를 처음부터 시작(다시 완료)';
setText('war-dietrich-first-transfer--inventory', '디트리히 루트 3부 물품은 옛 2부 완료로 이미 고정됐다. 새 1부의 강화 앤서러·새 물건은 다시 완료해도 3부 물품에 더해지지 않고 떠도는 성궤에 들어간다.');
setText('war-di-new--c61f2d01d5', '탈것 보관은 옛 2부 완료에서 끝났다. 첫 보관 스킵 없이 2부 1장부터 직접 진행한다.');
setText('war-di-new--9957d94d2b', '이번 완료는 다시 완료라 인물 자료가 옛 완료 자료 위에 쌓인다(높은 값 유지, 파편 없음). 3부에서 그 동료를 영입하기 전에 끝낸다.');
setText('war-dietrich-restart--mounts', '새 디트리히 2부 1장부터 시작한다. 이오는 의도한 기병, 알렉산드라는 천익병으로 두고 각각 전용 탈것 장착을 확인한다.');
setText('sequential-dietrich-war06-preserve-20261108--1', '디트리히 루트의 첫 완료(옛 2부)와 마구간 보관을 끝냈는지 확인한다. 이번 완료는 다시 완료다.');

W(PB, pb); W(RC, rc); W(OV, ov); W(CK, ck); W(AL, al);
console.log(log.join('\n'));
console.log('현역 행동', allActions().length, '체크 ID', new Set(ck).size);
