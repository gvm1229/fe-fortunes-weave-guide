import 'server-only';
import { json } from './content';
import manifest from '@/assets/classes/manifest.json';

/** 인물 카드에 쓰는 병종·기능·시험 자료. 원천은 content/data(이전 공략 정본 사본)이며 카이 루트만 사이트 자료로 덮어쓴다. */
export type SkillGoal = { skill: string; target: string; kind: string; when: string; why: string };
export type Exam = { tier: string; level: string; renown: string; required: string; choice: string; unlock: string; weapons: string[] };
export type CharacterData = { avoid: boolean; finalClasses: string[]; classes: string[]; next?: string; skills: SkillGoal[]; skillNote?: string; exams: Record<string, Exam>; steps: Record<string, string>; charioteer?: string; goalText?: string; caiAdvice?: { dip: string; part3: string; rule: string; weapon: string } };

type Phase = { classes?: string[]; next?: string };
type CaiPlan = { reason: string; source: string; part3: string; weaponNote: string; excluded: string[]; skills: SkillGoal[]; people: Record<string, Record<string, Phase> & { advice?: { dip: string; part3: string } }> };
const classManifest = manifest.classes as Record<string, { weapons?: string[] }>;
let cache: ReturnType<typeof load> | undefined;
function load() {
  return {
    goals: json<{ routes: Record<string, Record<string, Record<string, Phase>>> }>('data/phase-goals').routes,
    priorities: json<{ routes: Record<string, Record<string, Record<string, { goals?: (SkillGoal & { priority?: number })[]; note?: string }>>> }>('data/training-priorities').routes,
    details: json<{ classes: Record<string, { tier: string; recommendedLevel: string; renown: string; required: string; choice: string; unlock: string }> }>('data/class-details').classes,
    reasons: json<{ routes: Record<string, Record<string, Record<string, { steps?: { class: string; reason?: string; compact?: { reason?: string } }[] }>>> }>('data/class-path-reasons').routes,
    avoid: json<{ avoidDefault: string[] }>('data/final-roster').avoidDefault,
    cai: json<CaiPlan>('cai-charioteer'),
  };
}
const empty = (v?: string) => !v || v === '–' || v === '-';
export function examFor(name: string): Exam | undefined {
  const d = (cache ??= load()).details[name];
  if (!d) return undefined;
  return { tier: d.tier, level: d.recommendedLevel, renown: d.renown, required: empty(d.required) ? '' : d.required, choice: empty(d.choice) ? '' : d.choice, unlock: empty(d.unlock) ? '' : d.unlock, weapons: classManifest[name]?.weapons || [] };
}
/** 전차병 시험 조건을 목표 글로 쓴다(원천 class-details). */
export function charioteerGoal(): string { const e = examFor('전차병')!; return ['전차병', `권장 Lv${e.level}`, `명성 ${e.renown}`, e.required.replace(', ', ' · ')].join(' · '); }
export function characterData(route: string, name: string, part: string): CharacterData {
  const d = (cache ??= load());
  const avoid = d.avoid.includes(name);
  const goal = d.goals[route]?.[name] || {};
  const cai = route === 'cai' ? d.cai.people[name] : undefined;
  const phase = { ...goal[part], ...cai?.[part] };
  const finalClasses = goal['3']?.classes || [];
  const classes = phase.classes || [];
  let skills: SkillGoal[] = [...(d.priorities[route]?.[name]?.[part]?.goals || [])].sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9)).map(({ skill, target, kind, when, why }) => ({ skill, target, kind, when, why }));
  const ranks = ['E', 'D', 'C', 'B', 'A', 'S'], rank = (t: string) => ranks.indexOf(t.replace(/.*→\s*/, '').trim()[0]);
  // 카이 루트 전차병(2026-11-14 사용자 결정: 옛 상급 병종 준비는 버린다).
  // 1부: 전차병 시험 기능은 시험 조건으로 바꾸고(주력은 등급 유지), 나머지 주력·함께 준비는 3부 최종 병종용으로 쓴다.
  // 2부: 이미 전차병이므로 시험 기능을 더하지 않고, 선택이 아닌 기능은 모두 3부 최종 병종용이다.
  if (cai && part !== '3') {
    // 이유는 카드의 '무기 등급' 쌍(weaponNote)이 한 번 설명한다.
    const later = { when: '3부 최종 병종 시험 전', why: '' };
    skills = skills.map(s => {
      const k = part === '1' ? d.cai.skills.find(k => k.skill === s.skill) : undefined;
      if (k) return s.kind === '주력' ? { ...s, target: rank(s.target) < rank(k.target) ? k.target : s.target, when: k.when, why: k.why } : k;
      return s.kind === '선택' ? s : { ...s, ...later };
    });
    if (part === '1') skills.push(...d.cai.skills.filter(k => !skills.some(s => s.skill === k.skill)));
  }
  // 카이 루트 전차병: 옛 계획 경로에만 있던 병종(바딩거 등)을 말하는 문장은 기능 설명에서 뺀다. 모든 부에 적용.
  if (cai) {
    const allowed = new Set([...['1', '2'].flatMap(p => cai[p]?.classes || []), ...finalClasses]);
    const stale = [...new Set(['1', '2', '3'].flatMap(p => [...(goal[p]?.classes || []), ...(d.reasons[route]?.[name]?.[p]?.steps || []).map(s => s.class)]))].filter(c => !allowed.has(c));
    const drop = (t: string) => t.split(/(?<=\.)\s+/).filter(x => !stale.some(c => x.includes(c))).join(' ');
    skills = skills.map(s => ({ ...s, when: drop(s.when) || `${finalClasses.at(-1) || '다음 병종'} 시험 전`, why: drop(s.why) }));
  }
  const exams: Record<string, Exam> = {};
  for (const c of [...classes, ...finalClasses]) { const e = examFor(c); if (e) exams[c] = e; }
  const steps: Record<string, string> = {};
  for (const s of d.reasons[route]?.[name]?.[part]?.steps || []) { const r = s.compact?.reason || s.reason; if (r) steps[s.class] = r; }
  return { avoid, finalClasses, classes, next: phase.next, skills, skillNote: d.priorities[route]?.[name]?.[part]?.note, exams, steps, charioteer: cai && part !== '3' ? d.cai.reason : undefined, goalText: cai && part !== '3' ? charioteerGoal() : undefined, caiAdvice: cai?.advice ? { ...cai.advice, rule: d.cai.part3, weapon: d.cai.weaponNote } : undefined };
}
