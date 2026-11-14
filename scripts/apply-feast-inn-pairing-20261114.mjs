// 2026-11-14 사용자 지시: 12장 연회 반복에서 외전을 회차마다 다시 하지 않는다.
// 세오도라 12장은 카이 외전(10/16~10/22)·오르헬 외전(10/18~10/24)이 장 안에 있어 장 다시 하기 때마다 풀린다.
// 반복 회차에는 두 외전과 티아라·디에고 영입을 하지 않고, 여관에서 티아라·디에고를 상대 두 명과 짝지어 식사해 지원을 올린다.
// 주는 자동 활동으로 넘기고, 목표 지원에 닿으면 마지막 회차에서만 외전 → 영입한다.
// 레다는 오르헬 외전을 11장에 끝내 장 다시 하기 뒤에도 남으므로 디에고는 스카우트만 다시 한다(재영입 목록에 디에고가 빠져 있었다).
// 루트 배정 사유 글 정정(자스민·밴디츠·디에고·하르빈).
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const load = p => { const raw = readFileSync(p, 'utf8'); return { p, raw, j: JSON.parse(raw) }; };
const save = ({ p, raw, j }) => { const nl = raw.includes('\r\n') ? '\r\n' : '\n', ind = raw.match(/\n( +)"/)?.[1].length || 0; writeFileSync(p, JSON.stringify(j, null, ind).replace(/\n/g, nl) + (raw.endsWith('\n') ? nl : '')); };
const fail = m => { throw new Error(m); };
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const RC = load('content/source/react-content.json'), PB = load('content/data/playbook.json'), OV = load('content/display-overrides.json'), CK = load('content/check-ids.json'), AL = load('content/action-links.json'), PL = load('content/data/recruit-all-plan.json'), DP = load('content/display-parity.json');
const rc = RC.j, pb = PB.j, ov = OV.j, ck = CK.j, al = AL.j, plan = PL.j, log = [];
const block = (st, id) => rc.stages.find(s => s.id === st).blocks.find(b => b.id === id) || fail('block ' + id);
const group = id => pb.groups.find(g => g.id === id) || fail('group ' + id);
const action = id => pb.groups.flatMap(g => g.actions).find(a => a.id === id) || fail('action ' + id);
if (DP.j.stages.some(s => s.blocks.some(b => /^(feast-loop-|recruit-all-theodora-(orchel-side|tialla-plan))/.test(b.id)))) fail('사본 트리에 묶음이 있음');
const li = (gid, aid, cat, text) => `<li class="action-item" data-done="false"><input aria-label="${esc(text)}" data-inherit-legacy="false" data-parent-task="${gid}" data-task-id="${aid}" disabled="" id="${aid}" type="checkbox"/><div class="action-label"><span class="action-category">${esc(cat)}</span><span class="action-text">${esc(text)}</span></div></li>`;
// 글자만 있는 행동: 원본 HTML의 aria-label·글과 플레이북 글을 함께 바꾼다
const tok = t => esc(t).replace(/(\d{1,2}\/\d{1,2})/g, '<span class="number-token date-token">$1</span>');
const setPlain = (st, gid, aid, text) => {
  const b = block(st, gid), re = new RegExp(`(<input aria-label=")[^"]*("[^>]*data-task-id="${aid}"[^>]*/><div class="action-label"><span class="action-category">[^<]*</span><span class="action-text">)(?:(?!</li>).)*?(</span></div></li>)`, 's');
  if (!re.test(b.html)) fail('plain ' + aid); b.html = b.html.replace(re, (m, x, y, z) => x + esc(text) + y + tok(text) + z); action(aid).text = text; delete ov.actions[aid]; log.push('글 ' + aid);
};
const setOverride = (aid, text) => { if (!(aid in ov.actions)) fail('override ' + aid); ov.actions[aid] = text; action(aid).text = text; log.push('덮어쓰기 ' + aid); };
const addAfter = (st, gid, afterSuf, items) => {
  const g = group(gid), b = block(st, gid); let at = g.actions.findIndex(a => a.id === gid + afterSuf); if (at < 0) fail('after ' + afterSuf);
  let anchor = b.html.match(new RegExp(`<li[^>]*>(?:(?!</li>).)*data-task-id="${gid}${afterSuf}"(?:(?!</li>).)*</li>`, 's'))?.[0] || fail('anchor li ' + afterSuf);
  for (const [suf, cat, text] of items) {
    const aid = gid + suf; if (ck.includes(aid)) fail('exists ' + aid);
    g.actions.splice(++at, 0, { id: aid, category: cat, text, inheritLegacy: false });
    const html = li(gid, aid, cat, text); b.html = b.html.replace(anchor, anchor + html); anchor = html;
    ck.push(aid); rc.allTaskIds.push(aid); al[aid] = '/theodora/1/#' + aid; log.push('추가 ' + aid);
  }
};

// 1) 세오도라 12장 연회 반복
const T = 'feast-loop-theodora-part1-20261114';
setOverride(T + '--recruit', '12장에 영입할 수 있는 동료(누조 등)를 먼저 영입한다. 장 다시 하기를 하면 풀리므로 회차마다 다시 한다. 티아라(카이 외전)·디에고(오르헬 외전)는 외전이 이 장 안에 있어 반복 회차에는 외전도 영입도 하지 않는다.');
addAfter('theodora-plan', T, '--recruit', [
  ['--inn-pair', '여관 짝 식사', '여관에서 티아라·디에고를 지원을 올릴 상대 두 명과 함께 식사한다(예: 디에고·세테스·하르빈, 티아라·보나파르트·울턴드, 티아라·세테스·루루디아). 세오도라와의 영입 지원(티아라 지원 3·디에고 지원 2)도 선물·식사로 채운다.'],
  ['--skip-week', '주 넘기기', '다음 주로 넘길 때는 자동 활동을 쓴다. 어차피 장을 다시 하므로 다른 할 일은 하지 않는다.'],
]);
addAfter('theodora-plan', T, '--target', [
  ['--final-pass', '마지막 회차', '모든 쌍이 목표 단계에 닿으면 마지막 회차에서만 카이 외전 → 오르헬 외전 → 티아라·디에고 영입 순서로 끝내고, 그 뒤 여관에서 대화를 본다.'],
]);
// 세오도라 외전·티아라 일정 묶음: 반복 회차에는 하지 않는다
setPlain('theodora-plan', 'recruit-all-theodora-orchel-side-20261112', 'recruit-all-theodora-orchel-side-20261112--order', '카이 외전(10/16~10/22)과 겹친다. 12장 연회 반복 회차에는 두 외전을 하지 않는다. 마지막 회차에서 카이 외전 → 오르헬 외전 → 티아라·디에고 영입 순서로 날짜를 잡는다.');
setPlain('theodora-plan', 'recruit-all-theodora-tialla-plan-20261112', 'recruit-all-theodora-tialla-plan-20261112--side', '10/16 카이 외전을 바로 수락해 클리어한다(마감 10/22). 12장 연회 반복 회차에는 하지 않고 마지막 회차에서 한다.');
// 2) 레다: 재영입 목록에 디에고
setOverride('feast-loop-leda-part1-20261114--recruit', '12장에 영입할 수 있는 동료(디에고·누조 등)를 먼저 영입한다. 오르헬 외전은 11장에 끝내 장 다시 하기 뒤에도 남으므로 디에고는 스카우트만 다시 한다. 명성 10을 12장에야 채웠다면 알렉산드라·골라이어스도 여기서 영입한다. 장 다시 하기를 하면 풀리므로 회차마다 다시 한다.');
// 3) 루트 배정 사유 정정
const asg = n => plan.assignments.find(a => a.name === n) || fail('asg ' + n);
asg('디에고').reason = '레다: 1부 한정 디에고–사란 C는 사란이 레다·디트리히에만 있어 레다에서 본다. 오르헬 외전을 11장에 끝내 12장 장 다시 하기 뒤에도 남는다. 세오도라(지원2)에서도 영입해 디에고–세테스 C를 본다.';
asg('자스민').reason = '우술라–자스민(1부 한정)을 보려면 우술라가 있는 세오도라·디트리히여야 한다. 그중 세오도라가 조건이 가장 낮다(명성8·지원3·5,000G). 레다(지원2·500G)는 우술라가 없다.';
asg('밴디츠').reason = '디트리히 명성7·지원2. 세오도라는 지원1이지만 명성8이라 늦다. 한정 대화(루루디아–밴디츠)는 3부에서도 볼 수 있다.';
asg('하르빈').reason = '레다 1부 한정 대화(사란–하르빈, 제스터–하르빈, 디에고–하르빈)와 레다 실전. 세오도라·디트리히에서도 영입해 그 루트 한정 대화를 본다.';
log.push('배정 사유 4명 정정');
for (const F of [RC, PB, OV, CK, AL, PL]) save(F);
console.log(log.join('\n'));
