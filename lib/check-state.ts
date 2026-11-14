/** 내 상태(2026-11-15 사용자 요청): 축복 단계·가호 레벨·파편·골드. 사이트에는 넣지 않고 브라우저 저장소와 JSON 백업에만 있다. */
export type Status = { boons: Record<string, number>; gods: Record<string, number>; shards?: number; gold?: number };
export type CheckState = { schemaVersion: 1; revision: number; updatedAt?: string; checks: Record<string, boolean>; status?: Status };
/** 축복·가호의 최대 단계. 주면 그 밖의 이름과 단계를 거절한다. */
export type StatusLimits = { boons: Record<string, number>; gods: Record<string, number> };
export function checked(action: {id:string;inheritLegacy?:boolean}, parent: string, checks: Record<string,boolean>) {
  return Object.hasOwn(checks,action.id) ? checks[action.id] : action.inheritLegacy === true && checks[parent] === true;
}
export function validateChecks(value: unknown, limits?: StatusLimits): CheckState {
  if (!value || typeof value !== 'object') throw new Error('체크 파일이 객체가 아닙니다.');
  const d = value as CheckState;
  if(d.schemaVersion!==1 || !Number.isInteger(d.revision) || d.revision<0 || !d.checks || typeof d.checks!=='object' || Array.isArray(d.checks) || Object.values(d.checks).some(x=>typeof x!=='boolean') || (d.updatedAt!==undefined && typeof d.updatedAt!=='string')) throw new Error('기존 checklist.json 형식의 파일을 선택하세요.');
  const status = d.status === undefined ? undefined : validateStatus(d.status, limits);
  return {schemaVersion:1,revision:d.revision,...(d.updatedAt?{updatedAt:d.updatedAt}:{}),checks:migrateRouteIds(d.checks),...(status?{status}:{})};
}
const count = (x: unknown) => Number.isInteger(x) && (x as number) >= 0;
function levels(value: unknown, max: Record<string, number> | undefined, kind: string): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`내 상태의 ${kind}이 객체가 아닙니다.`);
  const out: Record<string, number> = {};
  for (const [id, level] of Object.entries(value)) {
    if (!count(level)) throw new Error(`내 상태의 ${kind} ${id} 단계는 0 이상의 정수여야 합니다.`);
    if (max && !Object.hasOwn(max, id)) throw new Error(`내 상태에 모르는 ${kind} ${id}이 있습니다.`);
    if (max && level > max[id]) throw new Error(`내 상태의 ${kind} ${id} 단계가 최대 ${max[id]}를 넘습니다.`);
    if (level > 0) out[id] = level;
  }
  return out;
}
export function validateStatus(value: unknown, limits?: StatusLimits): Status {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('내 상태(status)가 객체가 아닙니다.');
  const s = value as Status;
  for (const k of ['shards', 'gold'] as const) if (s[k] !== undefined && !count(s[k])) throw new Error(`내 상태의 ${k === 'shards' ? '파편' : '골드'}는 0 이상의 정수여야 합니다.`);
  return { boons: levels(s.boons ?? {}, limits?.boons, '축복'), gods: levels(s.gods ?? {}, limits?.gods, '가호'), ...(s.shards !== undefined ? { shards: s.shards } : {}), ...(s.gold !== undefined ? { gold: s.gold } : {}) };
}
/** 저장소에서 읽을 때: 목록에서 빠진 축복·가호는 버리고 최대를 넘는 단계는 최대로 줄인다. 자료가 바뀌어도 체크 기록 전체가 막히지 않게 한다. */
export function sanitizeStatus(status: Status, limits: StatusLimits): Status {
  const fit = (v: Record<string, number>, max: Record<string, number>) => Object.fromEntries(Object.entries(v).filter(([id]) => Object.hasOwn(max, id)).map(([id, n]) => [id, Math.min(n, max[id])]));
  return { ...status, boons: fit(status.boons, limits.boons), gods: fit(status.gods, limits.gods) };
}
/** 가진 축복 단계로 끝난 구매 체크. steps: 체크 ID → [축복 ID, 단계]. */
export function autoChecks(status: Status | undefined, steps: Record<string, [string, number]>): Record<string, true> {
  const out: Record<string, true> = {};
  if (status) for (const [id, [boon, tier]] of Object.entries(steps)) if ((status.boons[boon] || 0) >= tier) out[id] = true;
  return out;
}
/** 2026-11-14 루트 ID를 kai에서 cai로 바꿨다. 예전 저장·내보내기 파일의 kai 체크도 그대로 이어 쓴다(같은 cai 값이 이미 있으면 그것을 우선). */
export function migrateRouteIds(checks: Record<string,boolean>): Record<string,boolean> {
  const out: Record<string,boolean> = {};
  for (const [id, value] of Object.entries(checks)) { const next = id.replace(/(?<![A-Za-z])kai/g, 'cai'); if (next === id || !Object.hasOwn(checks, next)) out[next] = value; }
  return out;
}
