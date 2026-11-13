export type CheckState = { schemaVersion: 1; revision: number; updatedAt?: string; checks: Record<string, boolean> };
export function checked(action: {id:string;inheritLegacy?:boolean}, parent: string, checks: Record<string,boolean>) {
  return Object.hasOwn(checks,action.id) ? checks[action.id] : action.inheritLegacy === true && checks[parent] === true;
}
export function validateChecks(value: unknown): CheckState {
  if (!value || typeof value !== 'object') throw new Error('체크 파일이 객체가 아닙니다.');
  const d = value as CheckState;
  if(d.schemaVersion!==1 || !Number.isInteger(d.revision) || d.revision<0 || !d.checks || typeof d.checks!=='object' || Array.isArray(d.checks) || Object.values(d.checks).some(x=>typeof x!=='boolean') || (d.updatedAt!==undefined && typeof d.updatedAt!=='string')) throw new Error('기존 checklist.json 형식의 파일을 선택하세요.');
  return {schemaVersion:1,revision:d.revision,...(d.updatedAt?{updatedAt:d.updatedAt}:{}),checks:migrateRouteIds(d.checks)};
}
/** 2026-11-14 루트 ID를 kai에서 cai로 바꿨다. 예전 저장·내보내기 파일의 kai 체크도 그대로 이어 쓴다(같은 cai 값이 이미 있으면 그것을 우선). */
export function migrateRouteIds(checks: Record<string,boolean>): Record<string,boolean> {
  const out: Record<string,boolean> = {};
  for (const [id, value] of Object.entries(checks)) { const next = id.replace(/(?<![A-Za-z])kai/g, 'cai'); if (next === id || !Object.hasOwn(checks, next)) out[next] = value; }
  return out;
}
