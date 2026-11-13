import 'server-only';
import { json } from './content';
import manifest from '@/assets/classes/manifest.json';

/** 인물 카드에 쓰는 병종·기능·시험 자료. 원천은 content/data(이전 공략 정본 사본)이며 카이 루트만 사이트 자료로 덮어쓴다. */
export type SkillGoal = { skill: string; target: string; kind: string; when: string; why: string };
export type Exam = { tier: string; level: string; renown: string; required: string; choice: string; unlock: string; weapons: string[] };
export type CharacterData = { avoid: boolean; finalClasses: string[]; classes: string[]; next?: string; skills: SkillGoal[]; skillNote?: string; exams: Record<string, Exam>; steps: Record<string, string>; charioteer?: string; goalText?: string };

type Phase = { classes?: string[]; next?: string };
type Kai = { reason: string; source: string; excluded: string[]; skills: SkillGoal[]; people: Record<string, Record<string, Phase>> };
const classManifest = manifest.classes as Record<string, { weapons?: string[] }>;
let cache: ReturnType<typeof load> | undefined;
function load() {
  return {
    goals: json<{ routes: Record<string, Record<string, Record<string, Phase>>> }>('data/phase-goals').routes,
    priorities: json<{ routes: Record<string, Record<string, Record<string, { goals?: (SkillGoal & { priority?: number })[]; note?: string }>>> }>('data/training-priorities').routes,
    details: json<{ classes: Record<string, { tier: string; recommendedLevel: string; renown: string; required: string; choice: string; unlock: string }> }>('data/class-details').classes,
    reasons: json<{ routes: Record<string, Record<string, Record<string, { steps?: { class: string; reason?: string; compact?: { reason?: string } }[] }>>> }>('data/class-path-reasons').routes,
    avoid: json<{ avoidDefault: string[] }>('data/final-roster').avoidDefault,
    kai: json<Kai>('kai-charioteer'),
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
  const kai = route === 'kai' ? d.kai.people[name] : undefined;
  const phase = { ...goal[part], ...kai?.[part] };
  const finalClasses = goal['3']?.classes || [];
  const classes = phase.classes || [];
  let skills: SkillGoal[] = [...(d.priorities[route]?.[name]?.[part]?.goals || [])].sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9)).map(({ skill, target, kind, when, why }) => ({ skill, target, kind, when, why }));
  const ranks = ['E', 'D', 'C', 'B', 'A', 'S'], rank = (t: string) => ranks.indexOf(t.replace(/.*→\s*/, '').trim()[0]);
  // 카이 루트 전차병: 같은 기능이 이미 있으면 등급을 시험 조건 이상으로 맞추고 종류를 전차병 시험으로 바꾼다.
  if (kai && part !== '3') skills = [...skills.map(s => { const k = d.kai.skills.find(k => k.skill === s.skill); return k && (s.kind === '선택' || rank(s.target) < rank(k.target)) ? { ...s, target: rank(s.target) < rank(k.target) ? k.target : s.target, kind: k.kind, when: k.when, why: k.why } : s; }), ...d.kai.skills.filter(k => !skills.some(s => s.skill === k.skill))];
  const exams: Record<string, Exam> = {};
  for (const c of [...classes, ...finalClasses]) { const e = examFor(c); if (e) exams[c] = e; }
  const steps: Record<string, string> = {};
  for (const s of d.reasons[route]?.[name]?.[part]?.steps || []) { const r = s.compact?.reason || s.reason; if (r) steps[s.class] = r; }
  return { avoid, finalClasses, classes, next: phase.next, skills, skillNote: d.priorities[route]?.[name]?.[part]?.note, exams, steps, charioteer: kai && part !== '3' ? d.kai.reason : undefined, goalText: kai && part !== '3' ? charioteerGoal() : undefined };
}
