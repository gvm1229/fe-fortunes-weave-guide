// Fable 검토 18 지적 16건 반영(한 번만 실행). 기록: docs/fable-review-18.md
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const fail = m => { throw new Error(m); };
const raw = {}; const get = f => (raw[f] ??= readFileSync(f, 'utf8'));
const log = [];
const J = t => JSON.stringify(t).slice(1, -1); // JSON 파일 안에서는 따옴표가 이스케이프돼 있다
const sub = (files, from0, to0, min = 1) => { let n = 0; for (const f of files) { const s = get(f); const [from, to] = f.endsWith('.json') ? [J(from0), J(to0)] : [from0, to0]; const c = s.split(from).length - 1; if (c) { raw[f] = s.split(from).join(to); n += c; } } const from = from0; if (n < min) fail('없음: ' + from.slice(0, 50)); log.push(`${n}\t${from.slice(0, 36)}`); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', MD = 'content/notes/chapter-route-plan.md', P3 = 'content/notes/part3-gates-freetime.md';

// 1. 레다 5장 골드 문장
sub([RC], '<span class="number-token money-token">13,400G</span>부터 유지하면', '<span class="number-token money-token">10,400G</span>부터 유지하면');
// 2·3. 이오·이니오니 옛 금액
sub([PB, 'content/notes/missables-shopping-review.md'], '미지급 미카엘라3,000G·이오800G와 다음 시험비·말 먹이 준비가 우선.', '미지급 미카엘라3,000G·이오4,000G와 다음 시험비·말 먹이 준비가 우선.');
sub([RC], '이오</span></span> <span class="number-token money-token">800G</span>와 다음 시험비·말 먹이', '이오</span></span> <span class="number-token money-token">4,000G</span>와 다음 시험비·말 먹이', 0);
sub([MD], '5. 조건을 충족한 이오에게800G를 지급해 영입하고 동료 목록의 합류를 확인한다.', '5. 조건을 충족한 이오에게4,000G를 지급해 영입하고 동료 목록의 합류를 확인한다.');
sub(['content/data/purchase-plan.json'], '이니오니 안전6,000G', '이니오니3,000G');
sub(['content/notes/missables-shopping-review.md'], '미지급 피아나3,000G·미카엘라3,000G·이오800G와', '미지급 피아나3,000G·미카엘라3,000G·이오1,500G와');
// 5. 골드 검토 문서
{ const f = 'content/notes/chapter-gold-review.md'; const s = get(f).split('\n');
  const i3 = s.findIndex(l => l.startsWith('실제 진행 조건이 아니라 지출 전의 추천 보유액이다. 이오800G는')); if (i3 < 0) fail('gold-review 3');
  s[i3] = s[i3].replace(/이오800G는 [^.]*\. 명성·지원이 먼저 충족됐으면 그날 교섭 직전에800G를 확보하면 되며,/, '이오 영입금은 루트마다 다르다(디트리히 800G·레다 1,500G·카이 4,000G). 명성·지원이 먼저 충족됐으면 그날 교섭 직전에 그 금액을 확보하면 되며,');
  if (!s[i3].includes('카이 4,000G')) fail('gold-review 3 replace');
  const i75 = s.findIndex(l => l.startsWith('| 10장 | 14,300G | 7,500G | 상급 시험 증서 2장용 6,000G / 이오 영입용 800G')); if (i75 < 0) fail('gold-review 75');
  s[i75] = s[i75].replace('| 10장 | 14,300G |', '| 10장 | 17,500G |').replace('이오 영입용 800G', '이오 영입용 4,000G');
  const i104 = s.findIndex(l => l.startsWith('이니오니 레다 영입금은 Game8 3,000G와 로컬 공통6,000G가 달라')); if (i104 < 0) fail('gold-review 104');
  s[i104] = '이니오니 레다 영입금은 3,000G다(GameWith·RPG Site·한국어 도감). 이미 영입했으면 전액 해제한다.';
  raw[f] = s.join('\n'); log.push('골드 검토 문서 3줄'); }
// 4. 병종 문서·주석
sub(['content/notes/classes/bau-lord.md'], '| 전투 기술 장비 +1 | 장비 가능한 전투 기술 수 +1. |', '| 전투 기술 장비 +2 | 장비 가능한 전투 기술 수 +2. |');
sub(['content/notes/classes/battlemaster.md'], '| 전투 기술 장비 +2 | 장비 가능한 전투 기술 수 +2. |', '| 전투 기술 장비 +3 | 장비 가능한 전투 기술 수 +3. |');
for (const f of ['content/notes/classes/bau-lord.md', 'content/notes/classes/battlemaster.md']) { const before = get(f); raw[f] = before.replace(/\r?\n\*\*자료 차이:\*\* 전투 기술 장비 수:[^\n]*\r?\n/, '\n'); if (raw[f] === before) fail('자료 차이 ' + f); }
sub(['content/notes/classes/great-knight.md'], '| 타기 내리기 | 타기·내리기 명령을 사용할 수 있습니다. |', '| 타기 내리기 | 타기·내리기 명령을 사용할 수 있습니다. |\n| 후공 수비 +5 | 후공 전투 시 물리 내성 +5. |');
sub(['content/notes/classes/valkyrium.md'], '| 마법 회복 +10 | 마법으로 아군을 회복할 때 회복량 +10. |', '| 마법 회복 +10 | 마법으로 아군을 회복할 때 회복량 +10. |\n| 마법 명중 +5 | 마법 장비 시 명중 +5. |');
{ const f = 'content/notes/classes/caladrius.md'; const before = get(f); let s = before.replace(/\| 필수 기능 · 모두 \| 기마술 D, 흑마술 B [^|\n]*\|/, '| 필수 기능 · 모두 | 기마술 D, 흑마술 B |').replace(/\r?\n\*\*조건 확인:\*\* 필수 기술이 기마술 D가 아니라[^\n]*\r?\n/, '\n'); if (s === before || s.includes('기마술 B')) fail('caladrius'); raw[f] = s; log.push('칼라드리오스 문서'); }
{ const f = 'content/data/class-details.json'; const j = JSON.parse(get(f)); j.conflicts = (j.conflicts || []).filter(c => !['드래곤 마스터', '배틀 마스터'].includes(c.class)); raw[f] = JSON.stringify(j, null, 2) + '\n'; log.push('class-details conflicts 2건 삭제'); }
// 6. 오르헬 외전 수락 기간
sub(['content/data/recruitment-gates.json'], '카이편 수주 기간은 10/18~10/19 또는 10/18~10/27로 알려져 있다. 카이편에서는 짧은 쪽을 기준으로 서두르는 편이 안전하다.', '카이편은 10/18~10/20에 수락하고 10/21까지 끝낸다(한국어 도감·GameWith).', 4);
sub(['content/notes/personalized-fact-check.md'], '도감의 수락창10/18~10/19에 맞춰 **10/18 수락, 10/21 완료**', '도감의 수락창 10/18~10/20(2026-11-25 재확인)에 맞춰 **10/18 수락, 10/21 완료**');
// 7. 선더 소드 노트
sub([PB], '재료 교환 비율은 확인됐지만6장 선더 소드 재고는 확정하지 않았다.8장부터라는 자료도 있어 현재 교환창 표시를 우선한다.', '교환은 8장부터 열린다(GameWith·한국어 도감).');
sub([RC], '6장 선더 소드 재고는 확정하지 않았다. 8장부터라는 자료도 있어 현재 교환창 표시를 우선한다.', '교환은 8장부터 열린다(GameWith·한국어 도감).', 0);
sub([MD], '재료 교환 비율은 확인됐지만6장 선더 소드 재고는 확정하지 않았다.8장부터라는 자료도 있어 현재 교환창 표시를 우선한다.', '교환은 8장부터 열린다(GameWith·한국어 도감).', 0);
// 9·10·12·13. 새 3부 글(태그 없는 글이라 원본·할 일 자료를 함께 바꾼다)
const T = [
  ['1조는 문 공략조다. 문 주변 정화가 끝나면 문 위나 옆 칸에 모은다. 멀리 있는 동료는 전투에 부르지 못한다.', '1조는 문 공략조다. 정화가 끝나면 문 위나 옆 칸에 모은다(멀리 있는 동료는 전투에 못 부른다고 본다, 1곳).'],
  ['2조는 다그시온으로 오는 적을 길에서 막는다. 적이 다그시온에 닿으면 아주 어려운 방위전이 열린다. 옛 관문 요새에 「방위 파병」을 두면 지나가는 적을 정해진 횟수만큼 쓰러뜨린다(1곳).', '2조는 다그시온으로 오는 적을 길에서 막는다(닿으면 아주 어려운 방위전이 열린다). 옛 관문 요새에 「방위 파병」을 두면 지나가는 적을 정해진 횟수만큼 쓰러뜨린다(1곳).'],
  ['에일 산지 문은 1조+2조로 간다. 안개로 1칸 앞까지만 보이고, 비행이 유리하며 기병은 힘들다. 크레르의 가호가 돕는다.', '에일 산지 문은 1조+2조로 간다. 안개로 1칸 앞까지만 보여 비행이 유리하고 기병은 힘들며, 크레르의 가호가 돕는다.'],
  ['다이모스 고원 문은 3조와, 보충을 마친 1조·2조 중 레벨이 높은 쪽으로 간다. 레벨이 낮은 적을 칠 때 명중이 절반이 되므로 레벨 높은 인원을 쓴다. 북동쪽 회복 적을 먼저 쓰러뜨린다.', '다이모스 고원 문은 3조와, 보충을 마친 1조·2조 중 레벨이 높은 쪽으로 간다(레벨 낮은 적을 치면 명중이 절반). 북동쪽 회복 적을 먼저 쓰러뜨린다.'],
  ['사막 골짜기 문(17인)은 1조+2조로 간다. 사막이라 기병을 빼고 비행·마법을 쓴다. 해적왕의 보물을 주우면 지도 효과가 사라진다.', '사막 골짜기 문(17인)은 1조+2조로 가고, 사막이라 기병을 빼고 비행·마법을 쓴다. 해적왕의 보물을 주우면 지도 효과가 사라진다.'],
  ['헤카톤케일 요새 문(17인)은 3조와 회복한 1조나 2조로 간다. 동쪽과 남쪽으로 한 조씩 나눠 가고, 양쪽에 활 쓰는 적이 있다. 책·대장간 상자를 든 적이 달아난다.', '헤카톤케일 요새 문(17인)은 3조와 회복한 1조나 2조로 가서 동쪽과 남쪽으로 한 조씩 나눈다(양쪽에 활 쓰는 적). 책·대장간 상자를 든 적이 달아난다.'],
  ['쿠르델린데 유적 문(1부대)은 창 부대를 새로 짠다:', '쿠르델린데 유적 문(1부대, 1곳)은 17인 문 두 곳을 끝낸 뒤 다그시온에서 창 부대를 새로 짜서 간다(추천 순서):'],
  ['마지막 자유행동이다. 육성·탐색·부탁을 모두 끝낸다. 모든 부탁은 6/6에 끝난다.', '마지막 자유행동이라 육성·탐색·부탁을 모두 끝낸다. 모든 부탁은 6/6에 끝난다.'],
  ['재영입·상점·시험·병종 변경처럼 턴이 들지 않는 일부터 한다.', '재영입·상점·병종 변경처럼 턴이 들지 않는 일부터 한다. 최상급 시험은 융합 뒤에 본다.'],
  ['. 기병·비행·마법·회복 3명·레다 춤. 2구간에는', '(기병·비행·마법·회복 3명·레다 춤). 2구간에는'],
  ['. 비행·활 2명·회복 2명·티아라 춤.', '(비행·활 2명·회복 2명·티아라 춤).'],
  ['. 활 2명·리브로 2명.', '(활 2명·리브로 2명).'],
];
for (const [a, b] of T) sub([PB, RC], a, b, 1);
// 문서: 4구간 표, 2문장 넘는 문단
sub([P3], '| 2곳(둘 다 17인) |', '| 2곳(17인, 다이모스 고원은 1곳만 적음) |');
sub([P3], '조사: 2026-11-25. 출처는 GameWith(일본어)·altema(일본어)·RPG Site·allthings.how·한국어 도감(turam.dev)이다. 게임 화면에서 직접 재현하지 않았다. 출처 2곳 이상이 같으면 그대로 적고, 1곳뿐이면 "(1곳)"을 붙였다.', '- 조사: 2026-11-25. 출처는 GameWith(일본어)·altema(일본어)·RPG Site·allthings.how·한국어 도감(turam.dev)이다.\n- 게임 화면에서 직접 재현하지 않았다.\n- 출처 2곳 이상이 같으면 그대로 적고, 1곳뿐이면 "(1곳)"을 붙였다.');
sub([P3], '최종 25명 가운데 이스마르를 뺀 24명을 8명씩 셋으로 나눈다. 레다와 티아라의 춤은 다른 부대에 둔다. 실제 가진 병종·레벨에 맞춰 같은 역할끼리 바꾼다.', '- 최종 25명 가운데 이스마르를 뺀 24명을 8명씩 셋으로 나눈다.\n- 레다와 티아라의 춤은 다른 부대에 둔다.\n- 실제 가진 병종·레벨에 맞춰 같은 역할끼리 바꾼다.');
sub([P3], '| 쿠르델린데 유적 | 1부대(1곳).', '| 쿠르델린데 유적 | 1부대(1곳). 17인 문 두 곳 뒤 다그시온에서 새로 짠다(추천 순서).');

// 8·11. 5구간 묶음 얼굴, 릴리안 묶음 위치
{
  const pb = JSON.parse(get(PB)), rc = JSON.parse(get(RC));
  const g = pb.groups.find(x => x.id === 'p3-gate05-preflight') || fail('g05'); g.people = g.people.map(n => n === '단테' ? '티아라' : n);
  const st = rc.stages.find(s => s.id === 'part3-plan'); const b = st.blocks.find(x => x.id === 'p3-gate05-preflight');
  const tia = (() => { for (const s of rc.stages) for (const bb of s.blocks) { const m = bb.html.match(/<span class="task-person"><img[^>]*alt="티아라 초상화"[^>]*\/><b>티아라<\/b><\/span>/); if (m) return m[0]; } fail('tiara portrait'); })();
  const h0 = b.html; b.html = b.html.replace(/<span class="task-person"><img[^>]*alt="단테 초상화"[^>]*\/><b>단테<\/b><\/span>/, tia); if (b.html === h0) fail('g05 dante portrait');
  // 릴리안 묶음을 p3-merge 뒤로
  const li = st.blocks.findIndex(x => x.id === 'team-p3-lilian-bow-knight-20261107'); const [lb] = st.blocks.splice(li, 1);
  st.blocks.splice(st.blocks.findIndex(x => x.id === 'p3-merge') + 1, 0, lb);
  const gi = pb.groups.findIndex(x => x.id === 'team-p3-lilian-bow-knight-20261107'); const [lg] = pb.groups.splice(gi, 1);
  pb.groups.splice(pb.groups.findIndex(x => x.id === 'p3-merge') + 1, 0, lg);
  raw[PB] = JSON.stringify(pb, null, 2) + '\n'; raw[RC] = JSON.stringify(rc); log.push('5구간 얼굴 단테→티아라 · 릴리안 묶음 p3-merge 뒤로');
}
// 14. 레다 5장 이오 골드 줄은 넣지 않는다: 세오도라·레다 화면에는 이오를 쓰지 않는 규칙(verify.mjs)이 우선한다.
// 15. 매니페스트 숫자
{ const f = 'content/transfer-manifest.json'; const j = JSON.parse(get(f)); let n = 0;
  const walk = o => { if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k === 'activeActions' && o[k] === 1899) { o[k] = 1950; n++; } else if (k === 'checkIds' && o[k] === 2881) { o[k] = 2942; n++; } else walk(o[k]); } };
  walk(j); if (n !== 2) fail('manifest counts ' + n); raw[f] = JSON.stringify(j, null, 2) + '\n'; log.push('매니페스트 1950·2942'); }

for (const [f, s] of Object.entries(raw)) {
  const before = readFileSync(f, 'utf8'); if (before === s) continue;
  let out = s;
  if (f.endsWith('.json')) { const j = JSON.parse(s); out = (/^[[{]\r?\n/.test(before) ? JSON.stringify(j, null, 2) : JSON.stringify(j)) + (/\r?\n$/.test(before) ? '\n' : ''); }
  if (before.includes('\r\n')) out = out.replace(/\r?\n/g, '\r\n');
  writeFileSync(f, out);
}
console.log(log.join('\n'));
