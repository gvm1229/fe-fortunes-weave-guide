// Fable 검토 23 지적 반영(한 번만 실행): U74(진행 중인 디트리히 2부 먼저 완료)와 어긋난 디트리히 첫 보관 절차 글 정리.
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const raw = {}; const load = p => { raw[p] = readFileSync(p, 'utf8'); return JSON.parse(raw[p]); };
const W = (p, v) => { const r = raw[p]; const nl = r.includes('\r\n') ? '\r\n' : '\n'; const ind = /^[[{]\r?\n/.test(r) ? 2 : 0; writeFileSync(p, JSON.stringify(v, null, ind).replace(/\n/g, nl) + (/\r?\n$/.test(r) ? nl : '')); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json', CK = 'content/check-ids.json', AL = 'content/action-links.json';
const pb = load(PB), rc = load(RC), ov = load(OV), ck = load(CK), al = load(AL);
const fail = m => { throw new Error(m); };
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const log = [];
const allActions = () => pb.groups.flatMap(g => g.actions);
const group = id => pb.groups.find(g => g.id === id) || fail('group ' + id);
const blockOf = id => rc.stages.flatMap(s => s.blocks).find(b => b.html.includes(`data-task-id="${id}"`)) || fail('rc ' + id);
const li = (gid, aid, cat, text) => `<li class="action-item" data-done="false"><input aria-label="${esc(text)}" data-inherit-legacy="false" data-parent-task="${gid}" data-task-id="${aid}" disabled="" id="${aid}" type="checkbox"/><div class="action-label"><span class="action-category">${esc(cat)}</span><span class="action-text">${esc(text)}</span></div></li>`;
function setText(id, text) {
  const a = allActions().find(x => x.id === id) || fail(id), b = blockOf(id);
  const s = b.html.lastIndexOf('<li', b.html.indexOf(`data-task-id="${id}"`)), e = b.html.indexOf('</li>', s), item = b.html.slice(s, e);
  if (!/<img/.test(item) && item.split(esc(a.text)).length - 1 === 2) { b.html = b.html.slice(0, s) + item.split(esc(a.text)).join(esc(text)) + b.html.slice(e); a.text = text; delete ov.actions[id]; log.push('원본 ' + id); }
  else { ov.actions[id] = text; log.push('덮어쓰기 ' + id); }
}
function setCategory(id, cat) {
  const a = allActions().find(x => x.id === id) || fail(id), b = blockOf(id);
  const s = b.html.lastIndexOf('<li', b.html.indexOf(`data-task-id="${id}"`)), e = b.html.indexOf('</li>', s), item = b.html.slice(s, e);
  const from = `<span class="action-category">${esc(a.category)}</span>`; if (!item.includes(from)) fail('category ' + id);
  b.html = b.html.slice(0, s) + item.replace(from, `<span class="action-category">${esc(cat)}</span>`) + b.html.slice(e); a.category = cat; log.push('칩 ' + id);
}
function addAction(gid, afterId, aid, cat, text) {
  const g = group(gid), i = g.actions.findIndex(a => a.id === afterId); if (i < 0) fail('after ' + afterId);
  g.actions.splice(i + 1, 0, { id: aid, category: cat, text, inheritLegacy: false });
  const b = blockOf(afterId), s = b.html.lastIndexOf('<li', b.html.indexOf(`data-task-id="${afterId}"`)), e = b.html.indexOf('</li>', s) + 5;
  b.html = b.html.slice(0, e) + li(gid, aid, cat, text) + b.html.slice(e);
  ck.push(aid); rc.allTaskIds.push(aid); al[aid] = '/dietrich/1/#' + aid; log.push('새 행동 ' + aid);
}
// 화면 메모: 덮어쓰기로 바꾼다(없앨 글은 빼고, 바꿀 글은 고친다).
function setNotes(gid, fn) { const g = group(gid); const before = ov.notes[gid] || g.notes; const after = fn(before.map(n => ({ ...n }))); if (JSON.stringify(after) === JSON.stringify(before)) fail('notes 그대로 ' + gid); ov.notes[gid] = after; log.push('메모 ' + gid); }

// 높음 1·2·3: 새 묶음
const G = 'old-dietrich-war-clear-20261128';
setText(G + '--mounts', '이오는 가진 최고 등급과 같은 비기병으로 바꾼다. 알렉산드라는 같은 등급의 비탑승 병종이 있을 때만 바꾼다. 완료 직전에 두 전용 탈것이 마구간에 있는지 확인하고, 부케팔라스가 없으면 다른 루트의 첫 완료에서 보관한다.');
addAction(G, G + '--mounts', G + '--timing', '시점', '필요한 비기병·비탑승 자격은 2부 4장까지 딴다. 6장 마지막 출격 준비에서 병종을 바꾸고 마구간을 확인한 뒤 완료한다.');
setText(G + '--ch12', '고정 뒤 그 저장의 1부 12장을 다시 시작해 능력치 아이템·두루마리를 쓰고 12장을 완료한다. 그다음 2부를 스킵으로 끝내면 효과는 완료 자료에 쌓이고 물건은 3부 물품에 남는다. 이 일은 디트리히 1부를 1장부터 다시 시작하기 전에만 할 수 있다.');
{ const g = group(G), b = rc.stages.flatMap(s => s.blocks).find(x => x.id === G) || fail('rc block ' + G);
  const map = [['근거', '이유', null], ['주의', '조건', '알렉산드라가 상급에 합격해 있으면 완료 자료가 상급 병종으로 들어갈 수 있다. 3부 기준판은 카이판이라 이 판에는 영향이 작다.'], ['참고', '참고', '이것이 첫 2부 완료이면 이후 2부 스킵이 열린다. 직접 완료 보상 무기 3개도 받는다.']];
  g.notes.forEach((n, i) => { const [from, to, text] = map[i]; if (n.category !== from) fail('note cat ' + i); if (text) { if (!b.html.includes(esc(n.text))) fail('rc note ' + i); b.html = b.html.replace(esc(n.text), esc(text)); n.text = text; } n.category = to; });
  log.push('새 묶음 메모'); }

// 높음 1 따라: '끝났다' 단정 낮추기
setText('di-26--0786e0be37', '이오·알렉산드라의 탈것은 먼저 완료한 디트리히 2부에서 보관했는지 마구간 기록을 확인한다. 원래 전투 병종을 유지한다.');
setText('war-di-new--c61f2d01d5', '탈것은 먼저 완료한 2부에서 보관했는지 마구간 기록을 확인한다. 첫 보관 스킵 없이 2부 1장부터 직접 진행한다.');
setText('sequential-dietrich-war06-preserve-20261108--1', '디트리히 루트의 첫 완료(먼저 한 2부)에서 이오·알렉산드라 탈것을 보관했는지 마구간 기록을 확인한다. 이번 완료는 다시 완료다.');

// 중간 4~8
ov.groups['mount-prep-dietrich'] = '12장 · 이오·알렉산드라 합류 확인';
setText('mount-prep-dietrich--io-class', '보관용 자격 준비는 하지 않는다. 이오는 전투 병종을 유지한다.');
setText('mount-prep-dietrich--alex-class', '보관용 자격 준비는 하지 않는다. 알렉산드라는 전투 병종을 유지한다.');
setText('finish-dietrich-part1--battle', '동료·장비 준비를 끝냈으면11/27 최종전에 들어가 디트리히1부를 완료한다. 같은 루트 재완료에 첫 보상5,000을 다시 더하지 않는다.');
setText('di-27--394e7fead1', '새 2부는 새 1부 자료로 1장부터 시작한다. 앞에서 한 2부 완료 자료는 그대로 남는다.');
setNotes('di-01', ns => ns.map(n => n.text === '디트리히 2부를 먼저 스킵하지 않는다.' ? { ...n, text: '새 1부를 끝내기 전에는 2부를 다시 시작하지 않는다.' } : n));
setText('di-08--f0187602fe', '디트리히 루트는 보관용 준비가 필요 없다. 알렉산드라는 전투 병종으로 키운다.');
setText('recruit-dietrich-alexandra--hold-advanced', '합류한 알렉산드라는 전투 병종으로 키운다. 디트리히 루트는 보관용 준비가 필요 없다.');
setNotes('di-11', ns => ns.filter(n => n.text !== '알렉산드라는 전용 페가수스 보관판이므로 상급 시험에 합격시키지 않는다.' && n.text !== '드래군이 전체 병종 목록에 열려 있어도 다른 문제다.'));
setText('war-di-play--b6f5c789f0', '디트리히 루트는 보관용 준비가 필요 없다. 알렉산드라는 전투 병종으로 키운다.');

// 낮음 12~16
setCategory('war-dietrich-first-transfer--inventory', '물품 확인');
ov.groups['war-di-play'] = '새 디트리히 2부 직접 육성';
setNotes('war-di-play', ns => ns.map(n => n.text === '이오를 기병, 알렉산드라를 천익병으로 되돌린 뒤 직접 플레이합니다.' ? { ...n, text: '이오가 기병, 알렉산드라가 천익병인지 확인하고 직접 플레이합니다.' } : n));
ov.groups['sequential-dietrich-war06-preserve-20261108'] = '디트리히2부6장 · 장착 자료 확인';
setText('leda-first-store-then-play-20261108--1', '2부 스킵이 열린 상태 확인 · 레다1부 물품·알렉산드라 비탑승 보관 상태 확인');
setText('theodora-first-manual-clear-20261108--1', '군단·전용 탈것 보관 상태로 세오도라2부6장을 직접 완료 · 전쟁편 스킵이 열렸는지·완료 자료·고유 보상 확인');
setText('sequential-theodora-register-20261108--1', '2부 스킵이 열린 상태를 확인한 뒤 세오도라2부1장을 다시 시작 · 알렉산드라를 천익병으로 변경해 전용 탈것 장착 확인');
setText('sequential-dietrich-war-reward-20261108--1', '해당 루트2부6장 직접 완료 직후 실제로 받은 보상만 확인하고 보관 · 다시 완료라 보상 무기를 또 받는지는 미확인 · 현재 파편·가호는 실제 결과만 기록');
setText('prep-no-old-skip--082f661242', '이전에 시작한 저장 기록과 이번 직접 진행을 구분한다. 이 루트의 완료 자료로만 진행한다.');
setText('support-talks-dietrich-part1-20261112--feast', '마지막 장 다시 하기 뒤에는 12장 할 일(영입·외전·시험·구매)을 처음부터 다시 끝낸다. 12장 체크는 지우지 않고 다시 했는지만 확인한다.');

W(PB, pb); W(RC, rc); W(OV, ov); W(CK, ck); W(AL, al);
console.log(log.join('\n'));
console.log('현역 행동', allActions().length, '체크 ID', new Set(ck).size);
