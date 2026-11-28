// 변경 기록(2026-11-28 사용자 요청, U76): 저장할 때마다 '무엇이 바뀌었는지'만 남긴다(전체 사본이 아니라 바뀐 칸만).
// 한 건은 보통 150~300바이트라 512MB 무료 데이터베이스에 수백만 건이 들어간다. 한 번에 바뀐 칸이 아주 많으면(가져오기) 앞의 MAX_CHANGES개만 적고 나머지는 개수로 센다.
import type { CheckState } from '../../lib/check-state';

export type Change =
  | { type: 'check'; id: string; from: boolean | null; to: boolean | null; label?: string }
  | { type: 'status'; key: string; from: number | null; to: number | null }
  | { type: 'build'; route: string; slug: string; from: unknown; to: unknown };
export type HistoryEntry = { at: Date; revision: number; changes: Change[]; total: number };

export const MAX_CHANGES = 300;
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
    for (const slug of new Set([...Object.keys(ra), ...Object.keys(rb)])) if (!same(ra[slug], rb[slug])) out.push({ type: 'build', route, slug, from: val(ra[slug]), to: val(rb[slug]) });
  }
  return out;
}

export function entry(revision: number, changes: Change[], at = new Date()): HistoryEntry {
  return { at, revision, changes: changes.slice(0, MAX_CHANGES), total: changes.length };
}
