// Fable 검토 23 지적 10·17 반영(한 번만 실행): U74와 어긋난 문서 줄에 대체 표시, 순서 줄에 '진행 중인 디트리히 2부 먼저 완료'.
import { readFileSync, writeFileSync } from 'node:fs';
const N = 'content/notes/';
const fail = m => { throw new Error(m); };
const ORDER = '(진행 중인 디트리히 2부 먼저 완료) → 디트리히 재육성';
const REF = '[진행 중인 디트리히 2부 먼저 완료](dietrich-old-war-clear.md)';
const NOTE = `**2026-11-28 대체(U74):** 디트리히는 1부를 1장부터 다시 하기 전에 진행 중인 2부를 먼저 완료해 능력치를 남긴다. 새 디트리히 2부는 다시 완료라 첫 보관 스킵이 없다. ${REF}. 아래 '(이전)' 줄은 옛 기준이다.`;
function edit(file, fn) {
  const f = N + file, s = readFileSync(f, 'utf8'), crlf = s.includes('\r\n'); const t = s.replace(/\r\n/g, '\n');
  const L = t.split('\n'); fn(L); let o = L.join('\n'); if (o === t) fail('그대로 ' + file); if (crlf) o = o.replace(/\n/g, '\r\n'); writeFileSync(f, o); console.log('ok', file);
}
const mark = (L, n, must) => { const i = n - 1; if (!L[i].includes(must)) fail(`${n}: ${must} / ${L[i].slice(0, 40)}`); L[i] = L[i].replace(/^(\s*(?:\d+\.|-)\s+|)/, '$1(이전) '); };
const order = (L, n, from, to = null) => { const i = n - 1; if (!L[i].includes(from)) fail(`${n}: ${from}`); L[i] = L[i].replace(from, to ?? from.replace('디트리히 재육성', ORDER)); };

// 10. 정면으로 반대인 줄
edit('theodora-first-war-preservation.md', L => { mark(L, 29, '옛 미'); L.splice(28, 0, NOTE, ''); });
edit('carry-hard-review.md', L => { for (const n of [58, 59, 60, 61]) mark(L, n, n === 58 ? '완료 보류' : ''); mark(L, 65, '알렉산드라 상급 합격 보류'); L.splice(57, 0, NOTE, '');
  order(L, 5, '세오도라 → 레다 → 디트리히 재육성'); });
edit('chapter-route-plan.md', L => { mark(L, 2922, '전용 탈것 보관'); mark(L, 2920, '2부 중간 저장'); L.splice(2919, 0, NOTE, '');
  for (const n of [36, 37]) mark(L, n, '디트리히 2부'); L.splice(34, 0, NOTE, '');
  order(L, 3, '레다·디트리히 재육성', '레다·(진행 중인 디트리히 2부 먼저 완료)·디트리히 재육성'); });
edit('sequential-routes-apply-review.md', L => { mark(L, 41, '레다/디트리히/카이'); L.splice(40, 0, NOTE, ''); order(L, 5, '레다 → 디트리히 재육성'); });

// 17. 순서 줄
edit('plan.md', L => order(L, 43, '레다 → 디트리히 재육성'));
edit('final25-team-guide.md', L => order(L, 3, '레다 → 디트리히 재육성'));
edit('army-readiness-review.md', L => order(L, 5, '레다 → 디트리히 재육성'));
edit('inventory-mount-review.md', L => order(L, 19, '레다 → 디트리히 재육성'));
edit('react-canonical-review.md', L => order(L, 16, '레다 → 디트리히 재육성'));
edit('sequential-routes-training-review.md', L => order(L, 48, '레다1→2 → 디트리히 재육성1→2', '레다1→2 → (진행 중인 디트리히 2부는 디트리히 1부 재시작 전에 먼저 완료) → 디트리히 재육성1→2'));
