import 'server-only';
import characters from '@/content/data/yuphas-characters.json';
import moves from '@/content/data/yuphas-class-moves.json';
import classManifest from '@/assets/classes/manifest.json';
import type { Rank, SkillId } from './check-state';
/** 인물 머리·선호 선물·지원 표에 쓰는 yuphastemple 자료(content/data/yuphas-characters.json)를 화면에 필요한 만큼만 줄인다. 서버에서만 읽어 브라우저가 큰 파일을 받지 않게 한다. */
export type YName = { ko: string | null; en: string; slug: string };
export type YGift = YName & { value: number };
export type YSkill = { skill: string; id: SkillId; icon: string; state: 'boon' | 'bane' | 'plain' };
export type YSupport = { partner: YName; face: string | null; ranks: { rank: 'C' | 'B' | 'A'; part: string }[]; paired?: boolean };
export type YuphasProfile = {
  en: string; slug: string; emblem: string | null; portrait: string; face: string;
  /** 병종 그림 폴더(성별)와 육성 기록의 기본 숙련 등급(yuphastemple 가입 시 등급, 2026-11-27 U72). */
  gender: 'male' | 'female'; ranks: Partial<Record<SkillId, Rank>>;
  cls: { ko: string; en: string; slug: string; icon: string | null; moves: string[] } | null;
  skills: YSkill[];
  gifts: { part: string; loved: YGift[]; liked: YGift[] }[];
  meals: { loved: YName[]; liked: YName[]; disliked: YName[] };
  supports: YSupport[];
};
type Raw = {
  en: string; slug: string; gender: string; faction?: { emblem?: string | null };
  classes: { start?: { en: string; ko: string | null; slug: string } };
  skills: Record<string, { rank: string; affinity?: 'Boon' | 'Bane' }>;
  gifts: { part?: string; loved: YGift[]; liked: YGift[] }[];
  meals: { loved: YName[]; liked: YName[]; disliked: YName[] };
  supports: { partner: YName; ranks: Partial<Record<'C' | 'B' | 'A', string>>; paired?: boolean }[];
  images: { portrait: string; face: string; thumb: string };
};
const all = (characters as unknown as { characters: Record<string, Raw> }).characters;
/** 숙련 아이콘 순서: yuphastemple 머리 카드와 같은 6×2(docs/yuphas-pages-teardown.md §1.8). */
const ORDER = ['Sword', 'Spear', 'Axe', 'Bow', 'Gauntlet', 'Black Magic', 'White Magic', 'Authority', 'Infantry', 'Riding', 'Armor', 'Flying'];
const file = (skill: string) => skill.toLowerCase().replace(/ /g, '_');
const partKo: Record<string, string> = { 'Part 1': '1부', 'Part 2': '2부', 'Part 3': '3부' };
/** "Support level 3, Part 1, see after …" → 쉼표 뒤 글. 1·2·3부는 한국어로. */
const partOf = (s: string) => s.split(',').slice(1).join(',').trim().replace(/^Part [123]$/, (m) => partKo[m]);
const faces = new Map(Object.values(all).map((c) => [c.slug, c.images.face]));
const classFiles = classManifest.classes as Record<string, { file: string }>;
export function yuphasProfile(ko: string): YuphasProfile | undefined {
  const c = all[ko];
  if (!c) return undefined;
  const start = c.classes.start;
  const moveList = start ? ((moves.classes as Record<string, string[]>)[start.slug] || []) : [];
  return {
    en: c.en, slug: c.slug, emblem: c.faction?.emblem || null, portrait: c.images.portrait, face: c.images.face,
    gender: c.gender === 'male' ? 'male' : 'female', ranks: Object.fromEntries(ORDER.filter((s) => c.skills[s]?.rank).map((s) => [file(s), c.skills[s].rank])) as Partial<Record<SkillId, Rank>>,
    cls: start ? { ko: start.ko || start.en, en: start.en, slug: start.slug, icon: start.ko && classFiles[start.ko] ? '/' + classFiles[start.ko].file : `/yuphas/classes/${c.gender === 'male' ? 'male' : 'female'}/${start.slug}.webp`, moves: moveList } : null,
    skills: ORDER.map((skill) => { const a = c.skills[skill]?.affinity; const state = a === 'Boon' ? 'boon' : a === 'Bane' ? 'bane' : 'plain'; return { skill, id: file(skill) as SkillId, state, icon: `/yuphas/icons/skills/${file(skill)}${state === 'plain' ? '' : '_' + state}.png` }; }),
    gifts: c.gifts.map((g) => ({ part: g.part === 'III' ? '3부' : g.part === 'I-II' ? '1·2부' : '', loved: g.loved, liked: g.liked })),
    meals: c.meals,
    supports: c.supports.map((s) => ({ partner: s.partner, face: faces.get(s.partner.slug) || null, paired: s.paired, ranks: (['C', 'B', 'A'] as const).filter((r) => s.ranks[r]).map((r) => ({ rank: r, part: partOf(s.ranks[r]!) })) })),
  };
}
