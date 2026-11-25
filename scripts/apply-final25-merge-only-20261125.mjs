// 2026-11-25 사용자 규칙 U60(한 번만 실행): 융합은 최종 25명만 한다. 25명 밖 동료는 예비로 쓰더라도 융합하지 않는다(인과의 파편 아끼기).
// 실행 뒤: node scripts/regen-parity-20261115.mjs → npm run derive:checklist → node scripts/refresh-manifest.mjs → npm run verify
import { readFileSync, writeFileSync } from 'node:fs';
const fail = m => { throw new Error(m); };
const raw = {}; const get = f => (raw[f] ??= readFileSync(f, 'utf8'));
const log = [];
const sub = (f, a, b) => { const s = get(f); const c = s.split(a).length - 1; if (c !== 1) fail(`${f} ${c}곳: ${a.slice(0, 40)}`); raw[f] = s.replace(a, b); log.push(`${f}\t${a.slice(0, 30)}`); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json';
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 1. 3부 할 일(그림 없는 행동은 원본 글을 바꾼다. 이오 행동은 이미 덮어쓰기)
{ const pb = JSON.parse(get(PB)), rc = JSON.parse(get(RC));
  const set = (id, text) => {
    const a = pb.groups.flatMap(g => g.actions).find(x => x.id === id) || fail(id); const old = a.text; a.text = text;
    const b = rc.stages.flatMap(s => s.blocks).find(x => x.html.includes(`data-task-id="${id}"`)) || fail('rc ' + id);
    const n = b.html.split(esc(old)).length - 1; if (n !== 2) fail(`rc ${id} ${n}`); b.html = b.html.split(esc(old)).join(esc(text)); log.push('행동 ' + id);
  };
  set('p3-import-base-safety--cai-merge', '융합은 최종 25명만 한다. 합칠 때는 다른 루트판을 카이판에 합친다(카이판이 기준). 다른 판을 기준으로 두고 카이판을 합치면 탈것 유대 레벨이 남지 않는다.');
  set('p3-merge--20261125-cai-base', '최종 25명 가운데 카이판이 있는 동료는 카이판을 기준으로 두고 다른 루트판을 합친다. 반대로 합치면 탈것 유대 레벨이 사라진다.');
  set('p3-merge--20261125-limited', '인과의 파편은 위업록으로만 얻고 모을 수 있는 양이 정해져 있다. 최종 25명 가운데 다른 루트판이 실제로 더 높은 동료만 합친다(altema·GameWith). 25명 밖 동료는 예비로 쓰더라도 융합하지 않는다.');
  raw[PB] = JSON.stringify(pb); raw[RC] = JSON.stringify(rc);
  const ov = JSON.parse(get(OV));
  ov.actions['p3-io-pick--b8ae039641'] = '카이판(전차병)을 기준판으로 고른다. 이오는 최종 25명 밖이라 디트리히판을 합치지 않는다.';
  raw[OV] = JSON.stringify(ov); log.push('이오 덮어쓰기'); }

// 2. 인물 카드: 25명 밖 하르빈
{ const f = 'content/data/unit-readiness.json'; const u = JSON.parse(get(f)); const h = u.routes.leda['하르빈'] || fail('하르빈');
  if (!h.merge.includes('다른 판 추가 융합은 실제 빈 능력이 필요할 때만')) fail('하르빈 글'); h.merge = '레다 단일 실전판 · 최종25명 밖 예비로 보존 · 융합하지 않음';
  raw[f] = JSON.stringify(u); log.push('하르빈 육성판'); }

// 3. 3부 문서
{ const f = 'content/notes/part3-gates-freetime.md';
  sub(f, '- 다른 루트판은 카이판에 합친다(카이판이 기준).', '- 융합은 최종 25명(★)만 한다. 합칠 때는 다른 루트판을 카이판에 합친다(카이판이 기준).');
  sub(f, '- 위 세 줄은 사용자가 알려 준 게임 규칙이다(2026-11-25).', '- 탈것 유대 레벨 두 줄은 사용자가 알려 준 게임 규칙이다(2026-11-25).\n- ★가 아닌 동료는 예비로 쓰더라도 융합하지 않는다. 쓰지 않을 동료에 인과의 파편을 쓰지 않기 위해서다(사용자 규칙, 2026-11-25).');
  sub(f, '합치기는 파편이 한정되어 있으니 실제로 더 높은 판이 있을 때만 한다.', '★도 파편이 한정되어 있으니 실제로 더 높은 판이 있을 때만 합친다.');
  sub(f, '| 동료 | 영입한 루트 | 3부 기준판 | 합칠 판(필요할 때만) |', '| 동료 | 영입한 루트 | 3부 기준판 | 합칠 판(★만, 필요할 때만) |');
  sub(f, '| 카이판 | 디트리히판을 카이판에. 로시난은 마구간 확인 |', '| 카이판 | 융합하지 않는다. 로시난은 마구간 확인 |');
  sub(f, '| 카이판 | 예비(4조) 동료. 4조로 쓸 때만 다른 판을 카이판에 |', '| 카이판 | 예비(4조) 동료. 융합하지 않는다 |');
  sub(f, '| 카이판 | 영입만 하는 동료라 합치지 않는다 |', '| 카이판 | 영입만 하는 동료. 융합하지 않는다 |');
  sub(f, '| 비교해 고름 | 예비(4·5조) 동료. 쓸 때만 고르지 않은 판을 합친다 |', '| 비교해 고름 | 예비(4·5조) 동료. 융합하지 않는다 |');
  sub(f, '| 비교해 고름 | 영입만 하는 동료라 합치지 않는다 |', '| 비교해 고름 | 영입만 하는 동료. 융합하지 않는다 |');
  sub(f, '「인과의 제단」에서 한다. 카이판이 있으면', '「인과의 제단」에서 한다. 최종 25명만 융합한다. 카이판이 있으면');
  sub(f, '최종 25명 가운데 다른 루트판이 실제로 높은 동료만 합친다.', '최종 25명 가운데 다른 루트판이 실제로 높은 동료만 합친다. 25명 밖 동료는 융합하지 않는다.'); }

// 4. 규칙 기록
sub('docs/user-rules.md', "| 11-25 | `scripts/rules-check.mjs` |\n", "| 11-25 | `scripts/rules-check.mjs` |\n| U60 | 융합은 최종 25명만 한다. 25명 밖 동료(예비 4·5조, 영입만 하는 동료, 이오 등)는 쓰더라도 융합하지 않는다(인과의 파편을 아낀다). U59의 '카이판에 합친다'는 최종 25명에만 해당한다 | 11-25 | `scripts/rules-check.mjs` |\n");
sub('content/notes/knowledge/preferences.md', '- 다른 루트판은 카이판에 합친다. 다른 판을 기준으로 두고 카이판을 합치면 탈것 유대 레벨이 남지 않는다(사용자가 알려 준 게임 규칙).\n', '- 다른 루트판은 카이판에 합친다. 다른 판을 기준으로 두고 카이판을 합치면 탈것 유대 레벨이 남지 않는다(사용자가 알려 준 게임 규칙).\n- 융합은 최종 25명만 한다. 전투에 쓰지 않을 동료에 인과의 파편을 쓰지 않는다. 25명 밖 동료는 예비로 쓰더라도 융합하지 않는다(U60).\n');
sub('HANDOFF.md', '알렉산드라·이오 탈것 보존보다 우선한다.', '알렉산드라·이오 탈것 보존보다 우선한다.\n  - 융합은 최종 25명만 한다. 25명 밖 동료는 쓰더라도 융합하지 않는다(U60, 2026-11-25).');
sub('content/notes/underworld-merge-safety.md', '필요한 추가판 수를 N으로 정한 뒤 **300×N**만 예산으로 계산 ·', '필요한 추가판 수를 N으로 정한 뒤 **300×N**만 예산으로 계산 · 최종 25명 밖 동료는 0회(2026-11-25 사용자 규칙) ·');

for (const [f, s] of Object.entries(raw)) {
  const before = readFileSync(f, 'utf8'); if (before === s) continue;
  let out = s;
  if (f.endsWith('.json')) { const j = JSON.parse(s); out = (/^[[{]\r?\n/.test(before) ? JSON.stringify(j, null, 2) : JSON.stringify(j)) + (/\r?\n$/.test(before) ? '\n' : ''); }
  if (before.includes('\r\n')) out = out.replace(/\r?\n/g, '\r\n');
  writeFileSync(f, out);
}
console.log(log.join('\n'));
