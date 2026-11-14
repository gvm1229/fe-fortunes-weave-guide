import catalog from '@/content/data/boon-catalog.json';
import { autoChecks, type Status, type StatusLimits } from './check-state';
export type Boon = { id: string; name: string; original: string; tiers: { effect: string; price: number }[]; unverified?: boolean };
export type God = { name: string; original: string; max: number; unverified?: boolean };
export const boons = catalog.boons as Boon[];
export const gods = catalog.gods as God[];
export const steps = catalog.steps as unknown as Record<string, [string, number]>;
/** 조건이 맞을 때만 사는 구매(가호 레벨·실제 사용 조건). 요약에 '조건부 포함'으로 표시한다. */
export const conditionalSteps = new Set<string>(catalog.conditionalSteps);
export const limits: StatusLimits = { boons: Object.fromEntries(boons.map(b => [b.id, b.tiers.length])), gods: Object.fromEntries(gods.map(g => [g.name, g.max])) };
export const emptyStatus: Status = { boons: {}, gods: {} };
export const hasStatus = (s?: Status) => !!s && (Object.keys(s.boons).length > 0 || Object.keys(s.gods).length > 0 || s.shards !== undefined || s.gold !== undefined);
/** 저장된 체크에 가진 축복으로 끝난 구매 체크를 더한다. 저장 체크 자체는 바꾸지 않아 단계를 낮추면 다시 풀린다. */
export function effectiveChecks(checks: Record<string, boolean>, status?: Status) { return { ...checks, ...autoChecks(status, steps) }; }
export const autoChecked = (id: string, status?: Status) => Object.hasOwn(autoChecks(status, steps), id);
/** 추천 구매(steps, ids로 좁힘) 중 아직 없는 단계와 그 파편 합계. 축복마다 가진 단계부터 목표 단계까지의 가격을 더한다. */
export function remainingSteps(status?: Status, ids?: string[]) {
  const owned = status?.boons || {}, chosen = Object.entries(steps).filter(([id]) => !ids || ids.includes(id));
  const left = chosen.filter(([, [b, t]]) => (owned[b] || 0) < t).map(([id]) => id), target: Record<string, number> = {};
  for (const [, [b, t]] of chosen) if ((owned[b] || 0) < t) target[b] = Math.max(target[b] || 0, t);
  const cost = Object.entries(target).reduce((n, [b, t]) => n + boons.find(x => x.id === b)!.tiers.slice(owned[b] || 0, t).reduce((m, x) => m + x.price, 0), 0);
  return { left, cost };
}
/** 이 묶음에 축복 구매 체크가 있는지. */
export const groupSteps = (ids: string[]) => ids.filter(id => Object.hasOwn(steps, id));
