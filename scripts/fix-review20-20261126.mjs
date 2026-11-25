// Fable 검토 20 지적 반영(한 번만 실행): U60(융합은 최종 25명만)과 어긋난 25명 밖 동료의 융합 글을 원본 자료·문서에서 정리.
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const fail = m => { throw new Error(m); };
const raw = {}; const get = f => (raw[f] ??= readFileSync(f, 'utf8'));
const log = [];
const J = t => JSON.stringify(t).slice(1, -1);
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const D = 'content/data/', N = 'content/notes/';
const SRC = [D + 'phase-goals.json', D + 'unit-readiness.json', D + 'roster-selection.json', D + 'training-priorities.json', D + 'roster-plan.json', D + 'playbook.json', 'content/source/react-content.json', 'content/display-parity.json', 'docs/character-copy-review.json',
  N + 'phase-goals-review.md', N + 'roster-build-review.md', N + 'training-priorities-review.md', N + 'chapter-route-plan.md', N + 'lilian-final25-apply-review.md', N + 'recruit-all-review.md'];
const forms = (f, t) => f.endsWith('.json') ? [...new Set([J(t), J(esc(t))])] : [t];
const sub = (a0, b0, min = 1) => { let n = 0; for (const f of SRC) { const s = get(f); for (const [a, b] of forms(f, a0).map((a, i) => [a, forms(f, b0)[i]])) { const c = s.split(a).length - 1; if (c) { raw[f] = get(f).split(a).join(b); n += c; } } } if (n < min) fail('없음: ' + a0.slice(0, 40)); log.push(`${n}\t${a0.slice(0, 30)}`); };

// 1·4. 하르빈
sub('다른 판 추가 융합은 실제 빈 능력이 필요할 때만', '융합하지 않음');
sub('시험·융합 기본 제외', '시험 기본 제외 · 융합하지 않음');
sub('보우 나이트 시험·기능 S·유료 융합을 기본 과제로 추가하지 않음', '보우 나이트 시험·기능 S를 기본 과제로 추가하지 않음 · 융합하지 않음');
sub('최상급 시험·300파편 융합 중단 · 실제 궁수 결원 때만 재개', '최상급 시험 중단 · 실제 궁수 결원 때만 재개 · 융합하지 않음(최종25명 밖)');
// 3. 카이 녹투라(같은 짧은 글을 최종 25명 11명도 쓰므로 녹투라만 앞 글까지 붙여 바꾼다)
sub('3부 합류 즉시 예비 · 3부 비교·융합용 자료로 사용', '3부 합류 즉시 예비 · 3부 기준판 비교용 자료로만 사용 · 융합하지 않음');
sub('실제 결원이 생긴 경우만 추가 투자 · 3부 비교·융합용 자료로 사용', '실제 결원이 생긴 경우만 추가 투자 · 3부 기준판 비교용 자료로만 사용 · 융합하지 않음');
{ const f = D + 'unit-readiness.json', u = JSON.parse(get(f)), v = u.routes.cai['녹투라'];
  if (!v.stops['3'].startsWith('3부 비교·융합용 자료로 사용')) fail('녹투라 stops'); v.stops['3'] = v.stops['3'].replace('3부 비교·융합용 자료로 사용', '3부 기준판 비교용 자료로만 사용 · 융합하지 않음');
  raw[f] = JSON.stringify(u); log.push('녹투라 stops'); }
// 6. 세오도라 녹투라
sub('카이판이 더 좋으면 같은 역할의 이 판까지 파편을 써 합치지 않음.', '최종 25명 밖이라 이 판은 융합하지 않는다.');
// 7. 옛 검토 문서
sub('시로코·녹투라(능력 융합·실전).', '시로코(능력 융합·실전), 녹투라(실전 예비, 융합 안 함, U60).');
// 8. 유료 융합 예산
sub('25명 전원을 일괄 융합하지 않기', '25명 전원을 일괄 융합하지 않기 · 최종 25명 밖은 0회');

// 2. 루루디아·사란(같은 글을 쓰는 이니오니는 최종 25명이라 그대로)
const OLD = '이 루트의 실전 자료. 같은 역할의 중복 융합은 필요할 때만.', NEW = '이 루트의 실전 자료. 최종 25명 밖이라 융합하지 않는다.';
{ const pg = JSON.parse(get(D + 'phase-goals.json'));
  for (const [r, n] of [['theodora', '루루디아'], ['leda', '사란']]) { if (pg.routes[r][n].fusion !== OLD) fail('fusion ' + n); pg.routes[r][n].fusion = NEW; }
  raw[D + 'phase-goals.json'] = JSON.stringify(pg); log.push('루루디아·사란 fusion'); }
// 화면 원본·대조본: 바로 앞 칸이 '최종 25명 밖 예비'인 곳만 바꾼다(이니오니는 '최종 25명 목표').
for (const f of ['content/source/react-content.json', 'content/display-parity.json']) {
  const k = J(OLD.slice(0, -1)); let s = get(f), i = -1, n = 0;
  while ((i = s.indexOf(k, i + 1)) >= 0) if (s.lastIndexOf('최종 25명 밖 예비', i) > s.lastIndexOf('최종 25명 목표', i)) { s = s.slice(0, i) + J(NEW.slice(0, -1)) + s.slice(i + k.length); n++; }
  if (n !== 2) fail(f + ' 루루디아·사란 ' + n); raw[f] = s; log.push(f + ' 루루디아·사란 2'); }
// 문서: 표 행은 이름 칸, 목록은 바로 앞 제목으로 사람을 찾는다.
{ const f = N + 'phase-goals-review.md'; raw[f] = get(f).split('\n').map(l => /^\| (세오도라 \| 루루디아|레다 \| 사란) \|/.test(l) ? l.split(OLD).join(NEW) : l).join('\n'); }
{ const f = N + 'roster-build-review.md'; let who = ''; let n = 0;
  raw[f] = get(f).split('\n').map(l => { const h = l.match(/^#{2,4} .*?([가-힣]+)\s*$/); if (h) who = l; if (l.includes(OLD) && /루루디아|사란/.test(who)) { n++; return l.split(OLD).join(NEW); } return l; }).join('\n'); log.push('roster-build-review 루루디아·사란 ' + n); }

for (const [f, s] of Object.entries(raw)) {
  const before = readFileSync(f, 'utf8'); if (before === s) continue;
  let out = s;
  if (f.endsWith('.json')) { const j = JSON.parse(s); out = (/^[[{]\r?\n/.test(before) ? JSON.stringify(j, null, 2) : JSON.stringify(j)) + (/\r?\n$/.test(before) ? '\n' : ''); }
  if (before.includes('\r\n')) out = out.replace(/\r?\n/g, '\r\n');
  writeFileSync(f, out);
}
console.log(log.join('\n'));
