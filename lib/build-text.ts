/**
 * 인물 육성 기록을 AI에게 물을 때 붙여 넣는 글(2026-11-27 사용자 요청, U72). 영어 이름을 먼저(게임 자료와 맞추기 쉽게), 한국어를 괄호로 함께.
 * 기록하지 않은 숙련은 쓰지 않는다. 가져오기 없는 순수 함수라 검사(scripts/builds-check.mjs)도 Node로 부른다.
 */
export type BuildTextRow = { en: string; ko: string; level?: number; cls?: { en: string; ko: string | null }; skills: [string, string][]; boons: string[]; banes: string[]; finalClasses: string[]; needs: string[]; note?: string };
const RANK_LINE = 'Skill ranks: E < E+ < D < D+ < C < C+ < B < B+ < A < A+ < S < S+';
export function buildText({ routeEn, routeKo, date, rows }: { routeEn: string; routeKo: string; date: string; rows: BuildTextRow[] }): string {
  const out = [`Fire Emblem: Fortune's Weave — ${routeEn} (${routeKo}) builds, exported ${date}`, RANK_LINE, ''];
  for (const r of rows) {
    out.push([`${r.en} (${r.ko})`, r.level ? `Lv ${r.level}` : '', r.cls ? `${r.cls.en}${r.cls.ko ? ` (${r.cls.ko})` : ''}` : ''].filter(Boolean).join(' | '));
    const skillLine = [r.skills.length ? `skills: ${r.skills.map(([s, k]) => `${s} ${k}`).join(', ')}` : '', r.boons.length ? `boon: ${r.boons.join(', ')}` : '', r.banes.length ? `bane: ${r.banes.join(', ')}` : ''].filter(Boolean).join(' | ');
    if (skillLine) out.push('  ' + skillLine);
    const plan = [r.finalClasses.length ? `plan: final class ${r.finalClasses.join(' / ')}` : '', r.needs.length ? `needs: ${r.needs.join(', ')}` : ''].filter(Boolean).join(' | ');
    if (plan) out.push('  ' + plan);
    if (r.note) out.push('  note: ' + r.note);
    out.push('');
  }
  return out.join('\n').trimEnd() + '\n';
}
