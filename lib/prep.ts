import 'server-only';
import godPlan from '@/content/data/god-service-plan.json';
import boonCatalog from '@/content/data/boon-catalog.json';
import godManifest from '@/assets/gods/manifest.json';
import weekly from '@/content/data/weekly-support.json';
import peopleDisplay from '@/content/data/people-display.json';
import { personPortrait } from './portraits';
import { yuphasItem } from './yuphas';
import type { Tree } from './content';
import classData from '@/content/data/yuphas-classes.json';
/**
 * 준비 탭 다섯 묶음의 자료(2026-11-27 사용자 결정 Q2, U69): 가호 봉사 · 이번 주 식사 · 시험 단계 · 장을 넘기기 전 · 바로가기.
 * 화면이 표·문서 나무를 그리지 않도록 서버에서 필요한 값만 뽑는다. 뺀 공통 기준 글은 docs/reference/prep-common.md.
 */
export type PrepFace = { name: string; portrait: string };
export type PrepExam = { ko: string; item: string; en: string | null; slug: string | null; level: number; renown: number | null; part3?: boolean; note?: string };
export type PrepPanels = {
  chain: { god: string; level: number; effect: string }[];
  queue: string | null; end: string | null; boons: { name: string; price: number }[];
  gods: { name: string; file: string; max: number; target: number }[];
  meals: { kind: 'weekly'; rows: { label: string; people: PrepFace[]; note: string }[]; waiting: PrepFace[]; next: { lord: string; target: PrepFace; text: string } | null }
    | { kind: 'text'; title: string; lines: string[] };
  exams: PrepExam[];
  before: string[];
};
/** 시험 단계 값은 병종 고르기 창과 같은 표(content/data/yuphas-classes.json licenses, yuphastemple 창 머리 값)에서 읽는다. 증서 물품 이름은 우리 이름표 이름. */
const LICENSE_ITEM: Record<string, string> = { beginner: '초급 시험 증서', specialty: '중급 시험 증서', advanced: '상급 시험 증서', elephant: '코끼리병 시험 증서', master: '최상급 시험 증서', divine: '신장직 시험 증서' };
const EXAMS: PrepExam[] = (classData.licenses as { id: string; ko: string; level: number | null; renown: number | null; part3?: boolean; single?: boolean }[])
  .filter((l) => l.id !== 'default' && l.level != null)
  .map((l) => ({ ko: l.ko, item: LICENSE_ITEM[l.id], level: l.level!, renown: l.renown, part3: !!l.part3, ...(l.single ? { note: '한 번에 1명' } : {}), en: null, slug: null }));
const text = (n: Tree): string => (typeof n === 'string' ? n : n.children.map(text).join(''));
const kids = (n: Tree, tag: string) => (typeof n === 'string' ? [] : n.children.filter((c): c is Exclude<Tree, string> => typeof c !== 'string' && c.tag === tag));
function section(nodes: Tree[], title: (h: string) => boolean): Exclude<Tree, string> | undefined {
  for (const n of nodes) {
    if (typeof n === 'string') continue;
    if (n.tag === 'section' && kids(n, 'h3').some((h) => title(text(h).trim()))) return n;
    const inner = section(n.children, title); if (inner) return inner;
  }
}
const lis = (s: Exclude<Tree, string>) => [...kids(s, 'ul'), ...kids(s, 'ol')].flatMap((l) => kids(l, 'li')).map((li) => text(li).replace(/\s+/g, ' ').trim()).filter(Boolean);
const face = (name: string, part: string): PrepFace => ({ name, portrait: '/' + personPortrait((peopleDisplay as Record<string, { portrait?: string }>)[name]?.portrait || '', part, name) });
export function prepPanels(route: string, part: string, prepTree: Tree[]): PrepPanels {
  const plan = (godPlan.routes as unknown as Record<string, { queue?: string; end?: string; boons?: [string, number][] }>)[route];
  const target = (god: string) => Math.max(0, ...godPlan.priority.filter((p) => p.god === god).map((p) => p.level));
  const before = section(prepTree, (h) => h === '장을 넘기기 전');
  const lines = before ? lis(before) : [];
  // 나무에서 제목 글로 찾으므로 자료가 바뀌면 조용히 빈 묶음이 되지 않게 빌드를 멈춘다(Fable 검토 9).
  if (lines.length !== 3) throw new Error(`준비 탭 '장을 넘기기 전' 줄이 3개가 아닙니다(${route} ${part}부: ${lines.length}개). content/derived/presentation.json parity.prep을 확인하세요.`);
  let meals: PrepPanels['meals'];
  const w = part === '1' ? (weekly as unknown as Record<string, { lord: string; rows: [string, string, string, string][]; nextLord: string | null; nextTarget: string | null; nextText: string | null; recruitmentQueue?: { targets: string[] } }>)[route] : undefined;
  if (w) {
    const seen = new Set<string>(); const once = (n: string) => (seen.has(n) ? null : (seen.add(n), face(n, part)));
    const rows = w.rows.map(([label, a, b, note]) => ({ label, people: [a, b].map(once).filter((x): x is PrepFace => !!x), note }));
    const waiting = (w.recruitmentQueue?.targets || []).map(once).filter((x): x is PrepFace => !!x);
    meals = { kind: 'weekly', rows, waiting, next: w.nextLord && w.nextTarget ? { lord: w.nextLord, target: face(w.nextTarget, part), text: w.nextText || '' } : null };
  } else {
    const s = section(prepTree, (h) => /^(2부에는 주간 식사 없음|3부는 출격할 세 명만)/.test(h));
    meals = { kind: 'text', title: s ? text(kids(s, 'h3')[0]).trim() : (part === '2' ? '2부에는 주간 식사 없음' : '3부 준비'), lines: s ? [...kids(s, 'p').map((x) => text(x).replace(/\s+/g, ' ').trim()), ...lis(s)].filter(Boolean) : [] };
  }
  const withItem = (e: PrepExam): PrepExam => { const y = yuphasItem(e.item); return { ...e, en: y?.en || null, slug: y?.slug || null }; };
  return {
    chain: godPlan.priority,
    queue: part === '1' ? plan?.queue || null : null, end: part === '1' ? plan?.end || null : null,
    boons: part === '1' ? (plan?.boons || []).map(([name, price]) => ({ name, price })) : [],
    gods: boonCatalog.gods.map((g) => ({ name: g.name, file: '/' + (godManifest.portraits as Record<string, { file: string }>)[g.name].file, max: g.max, target: target(g.name) })),
    meals,
    exams: EXAMS.filter((e) => part === '3' || !e.part3).map(withItem),
    before: lines,
  };
}
