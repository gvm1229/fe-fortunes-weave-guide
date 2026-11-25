// 2026-11-25 3부 공략 보강(한 번만 실행): 구간별 자유행동·부대 나누기·융합 시기. 근거 문서: content/notes/part3-gates-freetime.md
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const raw = {}; const load = p => { raw[p] = readFileSync(p, 'utf8'); return JSON.parse(raw[p]); };
const W = (p, v) => { const r = raw[p]; const nl = r.includes('\r\n') ? '\r\n' : '\n'; const ind = /^[[{]\r?\n/.test(r) ? 2 : 0; writeFileSync(p, JSON.stringify(v, null, ind).replace(/\n/g, nl) + (/\r?\n$/.test(r) ? nl : '')); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json', CK = 'content/check-ids.json', AL = 'content/action-links.json';
const pb = load(PB), rc = load(RC), ov = load(OV), ck = load(CK), al = load(AL);
const fail = m => { throw new Error(m); };
const stageOf = id => rc.stages.find(s => s.id === id) || fail('no stage ' + id);
const block = (stage, id) => stageOf(stage).blocks.find(b => b.id === id) || fail(`no block ${stage}/${id}`);
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const log = [];
const li = (gid, aid, cat, text) => `<li class="action-item" data-done="false"><input aria-label="${esc(text)}" data-inherit-legacy="false" data-parent-task="${gid}" data-task-id="${aid}" disabled="" id="${aid}" type="checkbox"/><div class="action-label"><span class="action-category">${esc(cat)}</span><span class="action-text">${esc(text)}</span></div></li>`;
const peopleHtml = name => { for (const s of rc.stages) for (const b of s.blocks) { const m = b.html.match(new RegExp(`<span class="task-person"><img[^>]*alt="${name} 초상화"[^>]*/><b>${name}</b></span>`)); if (m) return m[0]; } fail('portrait ' + name); };
const DOC = { url: 'notes/part3-gates-freetime.md', label: '3부 구간별 문·자유행동' };
const refBtn = ({ url, label }) => `<button aria-haspopup="dialog" class="training-source" data-reference-doc="true" data-reference-url="${url.replace(/\.md$/, '.html')}" type="button">${esc(label)}</button>`;
const ids = new Set(pb.groups.flatMap(g => [g.id, ...g.actions.map(a => a.id)]));
function addGroup({ id, title, after, people = [], actions, notes = [] }) {
  const stage = 'part3-plan', s = stageOf(stage), bi = s.blocks.findIndex(b => b.id === after); if (bi < 0) fail('anchor ' + after);
  if (ids.has(id)) fail('dup ' + id);
  const html = `<section class="action-group" data-group-id="${id}" data-guide-phase="3" data-guide-route="part3" id="${id}"><div class="group-heading"><h3>${esc(title)}</h3><div class="group-tools"><span class="group-count" data-group-count="${id}">—</span></div></div>${people.length ? `<div class="task-people">${people.map(peopleHtml).join('')}</div>` : ''}<ol class="action-list">${actions.map(([suf, cat, text]) => li(id, id + suf, cat, text)).join('')}</ol>${notes.length ? `<ul class="chapter-cautions">${notes.map(n => `<li>${esc(n.text)}</li>`).join('')}</ul>` : ''}${refBtn(DOC)}</section>`;
  s.blocks.splice(bi + 1, 0, { id, html, title });
  const order = s.blocks.map(b => b.id); let insertAt = -1;
  for (let k = order.indexOf(id) - 1; k >= 0 && insertAt < 0; k--) { const gi = pb.groups.findIndex(g => g.id === order[k]); if (gi >= 0) insertAt = gi + 1; }
  if (insertAt < 0) fail('playbook anchor ' + id);
  pb.groups.splice(insertAt, 0, { id, stage, title, people, actions: actions.map(([suf, cat, text]) => ({ id: id + suf, category: cat, text, inheritLegacy: false })), figures: [], notes, curated: true, referenceLinks: [DOC], route: 'part3' });
  for (const x of [id, ...actions.map(([suf]) => id + suf)]) { ck.push(x); rc.allTaskIds.push(x); al[x] = '/part3/3/#' + x; }
  log.push(`새 묶음 ${id} (${actions.length})`);
}
function addAction(gid, afterId, aid, cat, text) {
  const g = pb.groups.find(g => g.id === gid) || fail('group ' + gid), i = g.actions.findIndex(a => a.id === afterId); if (i < 0) fail('after ' + afterId);
  g.actions.splice(i + 1, 0, { id: aid, category: cat, text, inheritLegacy: false });
  const b = block('part3-plan', gid); const re = new RegExp(`(<li class="action-item"[^>]*>(?:(?!</li>).)*data-task-id="${afterId}"(?:(?!</li>).)*</li>)`, 's');
  if (!re.test(b.html)) fail('after li ' + afterId); b.html = b.html.replace(re, `$1${li(gid, aid, cat, text)}`);
  ck.push(aid); rc.allTaskIds.push(aid); al[aid] = '/part3/3/#' + aid; log.push(`새 행동 ${aid}`);
}
const S1 = ['디트리히', '에스메랄다', '미카엘라', '시로코', '우술라', '피터르', '소피아', '리네'];
const S2 = ['세오도라', '올림피아', '이니오니', '로레타', '알렉산드라', '무우', '그자람', '티아라'];
const S3 = ['카이', '레다', '카타냐', '파비오', '단테', '울턴드', '릴리안', '피아나'];
const LANCE = ['세오도라', '에스메랄다', '리네', '울턴드', '카타냐', '알렉산드라', '카이', '소피아'];
const weekly = ['--weekly', '주 1회', '주 1회 일을 한다: 선물, 훈련(토·일 반값), 식사(일요일 반값), 봉사, 극장, 테르마이.'];

addGroup({ id: 'p3-free02-20261125', after: 'p3-io-pick', title: '2구간 자유행동 36턴(2/10까지) · 할 일 순서', actions: [
  ['--zero', '턴 안 드는 일', '재영입·상점·시험·병종 변경처럼 턴이 들지 않는 일부터 한다.'],
  ['--rebuild', '복구 순서', '복구는 역참 → 신전 → 마을 순서로 한다. 재건 자재는 복구한 마을에서 1개 500G에 사고, 탐색 파견·재배로도 모은다.'],
  ['--temple', '전용 최상급', '신전을 복구하고 그 신의 부탁을 끝내 전용 최상급을 연다: 스미르노스 하이 에피타프, 칼라 보우 나이트, 크레르 그레이트 나이트, 오로라 배틀 몽크, 마르스 소드 마스터, 쥬라 발키리움.'],
  ['--dagsion', '다그시온 시설', '다그시온 투기장(재건 자재 3개)과 여관(재건 자재 2개)을 복구해 훈련과 식사를 연다.'],
  weekly,
  ['--lord-scenes', '선택 장면', '아래 네 주인공 선택 장면은 그 주인공의 2부를 스킵하지 않고 끝냈을 때만 나온다(GameWith).'],
  ['--leftover', '남는 턴', '남는 턴은 던전·탐색으로 레벨·기능·재건 자재를 모은다. 부대에 넣지 않은 동료도 턴이 끝날 때 경험치를 받는다.']] });

addGroup({ id: 'p3-squads-20261125', after: 'p3-gate-squad-first', title: '2구간 · 3부 부대 세 개 미리 짜기(춤 둘은 다른 부대)', people: [...S2, ...S3].filter((n, i, a) => a.indexOf(n) === i), actions: [
  ['--s1', '1조', `1조(문 공략): ${S1.join('·')}. 활 2명·리브로 2명.`],
  ['--s2', '2조', `2조: ${S2.join('·')}. 비행·활 2명·회복 2명·티아라 춤.`],
  ['--s3', '3조', `3조: ${S3.join('·')}. 기병·비행·마법·회복 3명·레다 춤. 2구간에는 부대가 2개라 3조는 부대 밖에서 턴 끝 경험치를 받는다.`],
  ['--rule', '부대 원칙', '부대마다 앞줄 2명·회복 1명 이상을 둔다. 한 부대가 정화와 방위를 같이 하지 못하므로 강한 인원을 한 부대에 몰지 않는다.'],
  ['--lords', '주인공 행동', '카이 동물 포획·세오도라 군단·레다 공연 같은 지도 행동은 그 주인공이 부대에 있을 때만 쓴다(1곳).']] });

addAction('p3-merge', 'p3-merge--1314dc2a2a', 'p3-merge--20261125-before-exam', '가장 좋은 때', '연회 반복의 마지막 회차가 끝난 직후, 최상급 시험을 보기 전에 융합한다. 기능 레벨은 높은 값이 남으므로 다른 판에서 올린 기능으로 바로 시험 조건을 채운다.');
addAction('p3-merge', 'p3-merge--20261125-before-exam', 'p3-merge--20261125-limited', '파편 한정', '인과의 파편은 위업록으로만 얻고 모을 수 있는 양이 정해져 있다. 최종 25명 가운데 다른 루트판이 실제로 더 높은 동료만 합친다(altema·GameWith).');
addAction('p3-merge', 'p3-merge--20261125-limited', 'p3-merge--20261125-remerge', '다시 융합', '한 번 융합한 동료도 다시 융합할 수 있다. 더할 루트의 1부 12장과 2부를 다시 끝내야 한다(altema).');

addGroup({ id: 'p3-gate02-split-20261125', after: 'p3-gate02-route', title: '2구간 문 작전(2/15까지 16턴) · 1조 문 공략, 2조 정화', people: ['디트리히', '세오도라'], actions: [
  ['--s1', '1조', '1조는 문 공략조다. 문 주변 정화가 끝나면 문 위나 옆 칸에 모은다. 멀리 있는 동료는 전투에 부르지 못한다.'],
  ['--s2', '2조', '2조는 정화조다. 3단계 숲을 맡아 3턴 머물고, 남은 장기는 1조와 나눠 없앤다.'],
  ['--blaze', '지도 장기', '지도 위 장기 칸은 방어를 0으로 만들고 다음 턴에 HP를 절반으로 깎는다. 블레이즈 아츠로 지울 수 있다(1곳).'],
  ['--early', '남은 턴', '문 전투를 이긴 뒤 「문 파괴」를 바로 누르지 않는다. 기한이 되면 저절로 부서지므로 남은 턴을 탐색·복구에 쓴다.']] });

addGroup({ id: 'p3-free03-20261125', after: 'miss-p3-03-fortuna', title: '3구간 자유행동 36턴(2/25까지) · 방위 준비', actions: [
  ['--none', '병종', '3구간에 새로 열리는 병종은 없다. 남은 신전 부탁과 최상급 시험을 마친다.'],
  weekly,
  ['--arena', '다그시온', '다그시온 투기장 다음 부탁에는 재건 자재 20개가 든다(1곳). 자재는 복구한 마을에서 산다.'],
  ['--forts', '방위 준비', '다그시온으로 오는 길목과 옛 관문 요새 위치를 미리 본다. 작전 때 2조가 지킬 곳이다.']] });

addGroup({ id: 'p3-gate03-split-20261125', after: 'p3-gate03-preflight', title: '3구간 문 작전(3/6까지 36턴) · 공격·방위·정화 3부대', people: ['디트리히', '세오도라', '카이'], actions: [
  ['--s1', '1조 공격', '1조는 활과 가장 강한 인원으로 문을 친다. 날개 달린 적이 많다.'],
  ['--s2', '2조 방위', '2조는 다그시온으로 오는 적을 길에서 막는다. 적이 다그시온에 닿으면 아주 어려운 방위전이 열린다. 옛 관문 요새에 「방위 파병」을 두면 지나가는 적을 정해진 횟수만큼 쓰러뜨린다(1곳).'],
  ['--s3', '3조 정화', '3조는 문과 같은 주의 장기를 모두 없앤 뒤 1조 옆으로 온다.'],
  ['--durability', '내구', '지도 위 장기는 무기 내구를 깎는다. 1조에 예비 무기를 챙긴다.'],
  ['--thief', '달아나는 적', '상자를 든 적은 북서쪽으로 달아난다. 물품을 지키려면 먼저 쓰러뜨린다(1곳).']] });

addGroup({ id: 'p3-free04-20261125', after: 'miss-p3-04-fortuna', title: '4구간 자유행동 56턴(3/21까지) · 천관의 열쇠 5개', actions: [
  ['--keys', '열쇠', '신장직에 필요한 천관의 열쇠 5개를 던전 5곳에서 하나씩 모은다: 이교도의 동굴, 모래 그림자 요새, 쿠거 대삼림, 거인의 발자국 요새, 아누 섬(일본어 공략 이름을 옮김).'],
  ['--divine', '신장직', '천관의 신전에서 신장직에 오른다. 레벨 45가 필요하고 한 병종에 한 명만 오른다.'],
  ['--s4', '4조', '부대가 4개가 된다. 4조는 예비 동료(게이츠·녹투라·누조·라이선더·루루디아·하르빈·보나파르트·세테스·토비아스 등)로 정화·방위를 맡긴다.'],
  weekly] });

addGroup({ id: 'p3-gate04-split-20261125', after: 'p3-gate04-preflight', title: '4구간 문 작전(4/5까지 56턴) · 17인 문 2곳 부대 나누기', actions: [
  ['--same-tile', '두 부대', '두 문 모두 두 부대를 같은 칸에 모아 시작한다. 한 문씩 차례로 깬다.'],
  ['--ere', '에일 산지', '에일 산지 문은 1조+2조로 간다. 안개로 1칸 앞까지만 보이고, 비행이 유리하며 기병은 힘들다. 크레르의 가호가 돕는다.'],
  ['--daimos', '다이모스 고원', '다이모스 고원 문은 3조와, 보충을 마친 1조·2조 중 레벨이 높은 쪽으로 간다. 레벨이 낮은 적을 칠 때 명중이 절반이 되므로 레벨 높은 인원을 쓴다. 북동쪽 회복 적을 먼저 쓰러뜨린다.'],
  ['--others', '나머지 부대', '첫 문을 치는 동안 3조는 둘째 문 주의 장기를 정화하고 4조는 다그시온 길목을 지킨다.'],
  ['--cap', '출격 수', '다이모스 고원의 17인은 공략 한 곳만 적었다. 배치창 숫자를 먼저 본다.']] });

addGroup({ id: 'p3-free05-20261125', after: 'miss-p3-05-fortuna', title: '5구간 자유행동 76턴(4/25까지) · 5부대 채우기', actions: [
  ['--s5', '5조', '부대가 5개가 된다. 4조·5조를 남은 동료와 새로 합류한 동료로 채워 정화·방위를 맡긴다.'],
  ['--rest', '남은 일', '남은 열쇠·복구·신전 부탁을 끝낸다.'],
  weekly] });

addGroup({ id: 'p3-gate05-split-20261125', after: 'p3-gate05-preflight', title: '5구간 문 작전(5/15까지 77턴) · 문마다 보낼 부대', people: LANCE, actions: [
  ['--desert', '사막 골짜기', '사막 골짜기 문(17인)은 1조+2조로 간다. 사막이라 기병을 빼고 비행·마법을 쓴다. 해적왕의 보물을 주우면 지도 효과가 사라진다.'],
  ['--fort', '헤카톤케일 요새', '헤카톤케일 요새 문(17인)은 3조와 회복한 1조나 2조로 간다. 동쪽과 남쪽으로 한 조씩 나눠 가고, 양쪽에 활 쓰는 적이 있다. 책·대장간 상자를 든 적이 달아난다.'],
  ['--ruins', '쿠르델린데 유적', `쿠르델린데 유적 문(1부대)은 창 부대를 새로 짠다: ${LANCE.join('·')}. 덤불은 회피 +30~40이다.`],
  ['--klafka', '클라프카', '쿠르델린데 유적에서 같이 싸우는 클라프카를 살린다. 살아서 5구간을 끝내면 6구간에 합류한다.'],
  ['--defense', '나머지 부대', '4조·5조는 정화와 다그시온 방위를 맡는다.']] });

addGroup({ id: 'p3-free06-20261125', after: 'gold-part3-06', title: '6구간 자유행동 84턴(6/6까지) · 마지막 준비', actions: [
  ['--last', '마지막 자유행동', '마지막 자유행동이다. 육성·탐색·부탁을 모두 끝낸다. 모든 부탁은 6/6에 끝난다.'],
  ['--no-return', '돌아올 수 없음', '마지막 신전 던전에 들어가면 마을로 돌아오지 못한다(1곳). 들어가기 전에 모든 일을 끝내고 저장한다.'],
  ['--aurora', '지름길', '오로라 신전을 복구했다면 다그시온에서 마지막 신전까지 약 6턴에 가는 길을 쓴다(1곳).'],
  ['--leda-arts', '레다 강화', '레다 2부를 끝냈다면 주점 주인의 특별 부탁으로 레다의 블레이즈 아츠를 강화한다. 마을 복구도 필요하다(altema).'],
  ['--final', '마지막 전투', '마지막 전투는 25명이 나간다. 문을 부술 비행 인원(알렉산드라·카타냐)을 따로 둔다.'],
  ['--after', '끝난 뒤', '3부를 끝내면 저장이 마지막 전투 전 상태로 돌아간다. 마지막 전투에서 오른 성장은 남지 않는다(altema).']] });

// 5구간 두 번째 8명 예시를 2조와 맞춘다(레다·티아라 춤 분리).
ov.actions['p3-gate05-preflight--second-eight'] = `17인 전투에 보낼 두 번째 8명은 2조(${S2.join('·')})를 쓴다. 첫 문 원정조와 중복 배치하지 않는다.`;
log.push('5구간 두 번째 8명 = 2조');

W(PB, pb); W(RC, rc); W(OV, ov); W(CK, ck); W(AL, al);
console.log(log.join('\n'));
console.log('현역 행동', pb.groups.flatMap(g => g.actions).length, '체크 ID', new Set(ck).size);
