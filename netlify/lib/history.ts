// 변경 기록(2026-11-28 사용자 요청, U76): 저장할 때마다 '무엇이 바뀌었는지'만 남긴다(전체 사본이 아니라 바뀐 칸만).
// 한 건은 보통 200~600바이트(체크 이름 포함)라 512MB 무료 데이터베이스에 백만 건쯤 들어간다. 한 번에 바뀐 칸이 아주 많으면(가져오기) 앞의 MAX_CHANGES개만 적고 나머지는 개수로 센다.
// 육성 기록은 값(메모 글 등)을 남기지 않고 추가·삭제·수정만 남긴다: 지운 메모가 공개 변경 기록에 남지 않게(Fable 검토 지적 2·3).
import type { CheckState } from '../../lib/check-state';

export type Change =
  | { type: 'check'; id: string; from: boolean | null; to: boolean | null; label?: string }
  | { type: 'status'; key: string; from: number | null; to: number | null }
  | { type: 'build'; route: string; slug: string; op: 'add' | 'remove' | 'edit'; label?: string };
export type HistoryEntry = { at: Date; revision: number; changes: Change[]; total: number };

export const MAX_CHANGES = 50;
const LABEL_MAX = 160;

const val = <T>(x: T | undefined): T | null => (x === undefined ? null : x);
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** 옛 기록과 새 기록의 차이. labels는 화면이 보낸 체크 이름(바뀐 체크에만 붙인다). */
export function diff(before: Partial<CheckState> | null | undefined, after: CheckState, labels: Record<string, unknown> = {}): Change[] {
  const out: Change[] = [];
  const a = before?.checks || {}, b = after.checks || {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (a[id] === b[id]) continue;
    const label = typeof labels[id] === 'string' ? (labels[id] as string).trim().slice(0, LABEL_MAX) : '';
    out.push({ type: 'check', id, from: val(a[id]), to: val(b[id]), ...(label ? { label } : {}) });
  }
  const sa = before?.status, sb = after.status;
  for (const k of ['shards', 'gold'] as const) if (!same(sa?.[k], sb?.[k])) out.push({ type: 'status', key: k, from: val(sa?.[k]), to: val(sb?.[k]) });
  for (const group of ['boons', 'gods'] as const) {
    const x = sa?.[group] || {}, y = sb?.[group] || {};
    for (const id of new Set([...Object.keys(x), ...Object.keys(y)])) if ((x[id] || 0) !== (y[id] || 0)) out.push({ type: 'status', key: `${group}.${id}`, from: x[id] || 0, to: y[id] || 0 });
  }
  const ba = before?.builds || {}, bb = after.builds || {};
  for (const route of new Set([...Object.keys(ba), ...Object.keys(bb)])) {
    const ra = (ba as Record<string, Record<string, unknown>>)[route] || {}, rb = (bb as Record<string, Record<string, unknown>>)[route] || {};
    for (const slug of new Set([...Object.keys(ra), ...Object.keys(rb)])) {
      if (same(ra[slug], rb[slug])) continue;
      const key = `build:${route}/${slug}`, label = typeof labels[key] === 'string' ? (labels[key] as string).trim().slice(0, LABEL_MAX) : '';
      out.push({ type: 'build', route, slug, op: ra[slug] === undefined ? 'add' : rb[slug] === undefined ? 'remove' : 'edit', ...(label ? { label } : {}) });
    }
  }
  return out;
}

/** 같은 칸을 이어서 고친 것인가(숫자 칸을 한 글자씩 치거나 메모를 쓰는 중). 그러면 새 기록 대신 앞 기록을 고친다(Fable 검토 지적 1). */
export const MERGE_MS = 15_000;
export function sameField(a: Change[], b: Change[]): boolean {
  if (a.length !== 1 || b.length !== 1) return false;
  const [x, y] = [a[0], b[0]];
  if (x.type === 'status' && y.type === 'status') return x.key === y.key;
  if (x.type === 'build' && y.type === 'build') return x.route === y.route && x.slug === y.slug;
  return false;
}

export function entry(revision: number, changes: Change[], at = new Date()): HistoryEntry {
  return { at, revision, changes: changes.slice(0, MAX_CHANGES), total: changes.length };
}
