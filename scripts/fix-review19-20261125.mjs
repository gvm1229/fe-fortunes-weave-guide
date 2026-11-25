// Fable 검토 19 지적 6건 반영(한 번만 실행): U59(3부 기준판은 카이판)와 어긋난 옛 글 정리.
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const fail = m => { throw new Error(m); };
const raw = {}; const get = f => (raw[f] ??= readFileSync(f, 'utf8'));
const log = [];
const J = t => JSON.stringify(t).slice(1, -1);
const sub = (files, a0, b0, min = 1) => { let n = 0; for (const f of files) { const s = get(f); const [a, b] = f.endsWith('.json') ? [J(a0), J(b0)] : [a0, b0]; const c = s.split(a).length - 1; if (c) { raw[f] = s.split(a).join(b); n += c; } } if (n < min) fail('없음: ' + a0.slice(0, 40)); log.push(`${n}\t${a0.slice(0, 30)}`); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json', MD = 'content/notes/chapter-route-plan.md';
const CAI = ['무우', '에스메랄다', '미카엘라', '티아라', '피터르', '울턴드', '리네', '알렉산드라', '로레타', '그자람', '이오', '녹투라', '누조', '세테스', '양계', '골라이어스', '페페', '마지데'];

// 1. 인물 카드 「육성판」 글
{ const f = 'content/data/unit-readiness.json'; const u = JSON.parse(get(f)); let n = 0;
  for (const [route, people] of Object.entries(u.routes)) for (const [name, v] of Object.entries(people)) {
    if (!CAI.includes(name) || typeof v.merge !== 'string') continue;
    const m0 = v.merge;
    if (route === 'cai') v.merge = v.merge.replace(/^기준 (세오도라|레다|디트리히)판 · /, '3부 기준판 · ').replace(/^최종 성장 자료 아님 · 탈것·지참품 보존$/, '3부 기준판 · 탈것 유대 레벨 · 탈것·지참품 보존');
    else v.merge = v.merge.replace(/^현재 루트 기준판$/, '3부 기준은 카이판 · 이 판은 필요할 때만 카이판에 합침').replace(/^기준 (세오도라|레다|디트리히)판 · /, '3부 기준은 카이판 · ');
    if (v.merge !== m0) n++;
  }
  raw[f] = JSON.stringify(u, null, 2) + '\n'; log.push('육성판 글 ' + n); }

// 2·3. 로레타 3부 할 일, 알렉산드라 묶음 메모
{ const ov = JSON.parse(get(OV)); const pb = JSON.parse(get(PB));
  // 로레타 행동 글은 원본 HTML의 전차병·궁술 그림을 지키려고 원본 글을 바꿨다(같은 날 후속 수정).
  const g = pb.groups.find(x => x.id === 'p3-alex-pick') || fail('alex'); if (g.notes.length !== 2) fail('alex notes');
  ov.notes['p3-alex-pick'] = [g.notes[0], { ...g.notes[1], text: '융합은 탈것을 옮겨 주지 않는다. 부케팔라스는 마구간에서 확인한다.' }];
  raw[OV] = JSON.stringify(ov, null, 2) + '\n'; log.push('로레타 덮어쓰기 · 알렉산드라 메모'); }

// 4. 1·2부의 알렉산드라 '기준판' → '보관판'
for (const [a, b] of [
  ['전용 페가수스 기준판', '전용 페가수스 보관판'],
  ['의 기준판은 중급까지만', '의 보관판은 중급까지만'],
  ['기준판의 상급 시험 보류', '보관판의 상급 시험 보류'],
  ['기준판으로 삼는 동안', '보관판으로 삼는 동안'],
  ['받을 기준판에서는', '받을 보관판에서는'],
  ['기준판의 탈것이 3부', '보관판의 탈것이 3부'],
]) sub([PB, RC, MD, 'content/display-parity.json'], a, b);
sub(['HANDOFF.md'], '  - 알렉산드라 기준판은 상급 시험 합격 자체를 보류한다.', '  - 알렉산드라 보관판은 상급 시험 합격 자체를 보류한다(3부 기준판은 카이판, U59).');

// 6. 옛 문서 두 곳
sub(['content/notes/support-follow-along.md'], '여러 루트판이 있으면 기준판만 고른다.', '여러 루트판이 있으면 기준판만 고른다. 카이판이 있으면 카이판이다.');
sub(['content/notes/underworld-merge-safety-review.md'], '| 루트별 기준판의 능력·기능·병과·탈것 비교 · 레벨만으로 선택하지 않음 |', '| 카이판이 있으면 카이판(U59) · 없으면 루트별 능력·기능·병과 비교 · 레벨만으로 선택하지 않음 |');

for (const [f, s] of Object.entries(raw)) {
  const before = readFileSync(f, 'utf8'); if (before === s) continue;
  let out = s;
  if (f.endsWith('.json')) { const j = JSON.parse(s); out = (/^[[{]\r?\n/.test(before) ? JSON.stringify(j, null, 2) : JSON.stringify(j)) + (/\r?\n$/.test(before) ? '\n' : ''); }
  if (before.includes('\r\n')) out = out.replace(/\r?\n/g, '\r\n');
  writeFileSync(f, out);
}
console.log(log.join('\n'));
