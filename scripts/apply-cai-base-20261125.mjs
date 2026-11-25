// 2026-11-25 사용자 규칙 U59(한 번만 실행): 3부에서는 카이판을 기준판으로 고르고 다른 루트판은 카이판에 합친다.
// 근거: 사용자 발화(카이 루트에만 탈것 유대 레벨이 있고, 카이판을 기준으로 합칠 때만 유지된다). 문서: content/notes/part3-gates-freetime.md
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const raw = {}; const load = p => { raw[p] = readFileSync(p, 'utf8'); return JSON.parse(raw[p]); };
const W = (p, v) => { const r = raw[p]; const nl = r.includes('\r\n') ? '\r\n' : '\n'; const ind = /^[[{]\r?\n/.test(r) ? 2 : 0; writeFileSync(p, JSON.stringify(v, null, ind).replace(/\n/g, nl) + (/\r?\n$/.test(r) ? nl : '')); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json', CK = 'content/check-ids.json', AL = 'content/action-links.json';
const pb = load(PB), rc = load(RC), ov = load(OV), ck = load(CK), al = load(AL);
const fail = m => { throw new Error(m); };
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const action = id => pb.groups.flatMap(g => g.actions).find(a => a.id === id) || fail('action ' + id);
const group = id => pb.groups.find(g => g.id === id) || fail('group ' + id);
const block = id => rc.stages.find(s => s.id === 'part3-plan').blocks.find(b => b.id === id) || fail('block ' + id);
const li = (gid, aid, cat, text) => `<li class="action-item" data-done="false"><input aria-label="${esc(text)}" data-inherit-legacy="false" data-parent-task="${gid}" data-task-id="${aid}" disabled="" id="${aid}" type="checkbox"/><div class="action-label"><span class="action-category">${esc(cat)}</span><span class="action-text">${esc(text)}</span></div></li>`;
const log = [];
function addAction(gid, afterId, aid, cat, text) {
  const g = group(gid), i = g.actions.findIndex(a => a.id === afterId); if (i < 0) fail('after ' + afterId);
  if (g.actions.some(a => a.id === aid)) fail('dup ' + aid);
  g.actions.splice(i + 1, 0, { id: aid, category: cat, text, inheritLegacy: false });
  const b = block(gid); const re = new RegExp(`(<li class="action-item"[^>]*>(?:(?!</li>).)*data-task-id="${afterId}"(?:(?!</li>).)*</li>)`, 's');
  if (!re.test(b.html)) fail('after li ' + afterId); b.html = b.html.replace(re, `$1${li(gid, aid, cat, text)}`);
  ck.push(aid); rc.allTaskIds.push(aid); al[aid] = '/part3/3/#' + aid; log.push('새 행동 ' + aid);
}
const CAI = ['무우', '에스메랄다', '미카엘라', '티아라', '피터르', '울턴드', '리네', '알렉산드라', '로레타', '그자람', '이오', '녹투라', '누조', '세테스', '양계', '골라이어스'];

// 기준판 고르기
ov.actions['p3-import-base-safety--compare-first'] = '카이 루트에서도 영입한 동료는 카이판을 기준판으로 고른다(탈것 유대 레벨은 카이 루트에만 있다). 카이판이 없는 동료만 루트별 능력·기능·병과를 비교해 고르고, 재영입 때 융합하지 않는다.';
addAction('p3-import-base-safety', 'p3-import-base-safety--compare-first', 'p3-import-base-safety--cai-list', '카이판 기준', `카이판을 기준판으로 고를 동료: ${CAI.join('·')}. 카이 루트에서만 영입한 페페·마지데는 카이판뿐이다.`);
addAction('p3-import-base-safety', 'p3-import-base-safety--cai-list', 'p3-import-base-safety--cai-merge', '합치는 방향', '다른 루트판은 카이판에 합친다(카이판이 기준). 다른 판을 기준으로 두고 카이판을 합치면 탈것 유대 레벨이 남지 않는다.');

// 알렉산드라·이오
ov.groups['p3-alex-pick'] = '알렉산드라는 카이판으로 영입(부케팔라스 확인)';
// 알렉산드라 행동 글은 원본 HTML의 천익병 그림을 지키려고 덮어쓰기 대신 원본 글을 바꿨다(같은 날 후속 수정).
ov.groups['p3-io-pick'] = '이오는 카이판으로 영입(로시난은 마구간 확인)';
ov.actions['p3-io-pick--b8ae039641'] = '카이판(전차병)을 기준판으로 고른다. 디트리히판을 기준으로 두고 카이판을 합치지 않는다.';
ov.actions['p3-io-pick--1645947f3c'] = '로시난과 추가 형제가 마구간에 들어왔는지 확인한다. 탈것을 쓰는 병종으로 바꿀 때 마구간에서 장착한다(장착 가능 여부는 게임에서 확인).';

// 연회 반복의 재영입·융합 순서
ov.actions['p3-feast-loop-20261114--rejoin'] = '다그시온에서 동료 전원에게 말을 걸어 다시 영입한다. 여러 루트판이 있으면 카이판을 먼저 고르고(카이판이 없으면 비교해 고른다), 융합은 하지 않는다.';
addAction('p3-merge', 'p3-merge--41c4cd9ffb', 'p3-merge--20261125-cai-base', '카이판 기준', '카이판이 있는 동료는 카이판을 기준으로 두고 다른 루트판을 합친다. 반대로 합치면 탈것 유대 레벨이 사라진다.');

W(PB, pb); W(RC, rc); W(OV, ov); W(CK, ck); W(AL, al);
console.log(log.join('\n'));
console.log('현역 행동', pb.groups.flatMap(g => g.actions).length, '체크 ID', new Set(ck).size);
