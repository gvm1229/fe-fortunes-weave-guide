// 2026-11-25 사실 검사 반영 2단계: 숫자가 <span> 토큰으로 감싸인 표시 HTML의 같은 문장을 고친다(한 번만 실행).
import { readFileSync, writeFileSync } from 'node:fs';
const f = 'content/source/react-content.json'; const before = readFileSync(f, 'utf8'); let s = before;
const pairs = [
  ['이오에게 800G를', '이오에게 4,000G를', 'cai'],
  ['이오 교섭 직전 800G를', '이오 교섭 직전 4,000G를'],
  ['이오(명성 6·지원 1·800G)', '이오(명성 6·지원 1·1,500G)'],
  ['이오는 명성 10·지원 3·800G', '이오는 명성 10·지원 3·4,000G'],
  ['교환은 6장 이후 태양 열매', '교환은 8장부터 태양 열매'],
  ['선더 소드 교환은 6장부터 장마다 목록을 확인한다. 없으면 진행 후 다시 보고, 8장에 다시 점검한다.', '선더 소드 교환은 8장부터 열린다. 그 전에는 재료만 모으고 8장에 목록을 확인한다.'],
  ['실제 수락창 10/18~10/19과 완료 마감을 구분하고 마지막 날까지 미루지 않는다.', '수락은 10/20까지 열린다. 마지막 날까지 미루지 않는다.'],
  ['수락은 10/22 전, 완료는 11/1까지다.', '10/22 뒤에도 수락할 수 있지만 완료는 11/1까지다.'],
  ['10/22가 지난 뒤 새로 수락하려 하지 않는다.', '수락을 마지막 주까지 미루지 않는다.'],
  ['이 장은 4/7~4/10로 짧다.', '이 장 자유행동은 4/10까지로 짧다.'],
  ['영입금은 안전하게 6,000G를 남기되 실제 레다 교섭창을 우선한다. Game8은 레다 3,000G, 로컬 공통 표는 6,000G라 차이가 있다.', '영입금 3,000G를 남긴다(GameWith·RPG Site·한국어 도감).'],
  ['판매처: 칼리아네이라 항구 무기점', '1부에는 파는 곳이 없다. 8장부터 반다르 상회 교환, Lv29 이상 누조·제스터 영입 지참품으로 얻는다. 칼리아네이라 항구는 3부에 +2를 판다.'],
];
const esc = c => c.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
// 글자 사이에 태그가 끼어도 맞춘다. 공백은 있거나 없거나.
const tagged = p => [...p].map(ch => ch === ' ' ? '\\s*' : esc(ch)).join('(?:<[^<>]*>)*');
const rc = JSON.parse(s); const log = [];
const fix = (html, from, to) => html.replace(new RegExp(tagged(from), 'g'), to);
for (const [from, to, only] of pairs) {
  let n = 0;
  const visit = (stageId, obj, key) => { const h = obj[key]; if (typeof h !== 'string') return; const r = fix(h, from, to); if (r !== h) { n += (h.match(new RegExp(tagged(from), 'g')) || []).length; obj[key] = r; } };
  for (const st of rc.stages) { if (only && !st.id.startsWith(only)) continue; for (const b of st.blocks) visit(st.id, b, 'html'); }
  if (!only) { for (const p of rc.people) visit('people', p, 'html'); for (const k of ['prep', 'materials', 'exam']) visit(k, rc, k); }
  log.push(`${n}\t${from.slice(0, 30)}`);
}
writeFileSync(f, JSON.stringify(rc) + (before.endsWith('\n') ? '\n' : ''));
console.log(log.join('\n'));
