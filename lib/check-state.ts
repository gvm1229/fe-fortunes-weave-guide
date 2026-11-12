export type CheckState = { schemaVersion: 1; revision: number; updatedAt?: string; checks: Record<string, boolean> };
export function checked(action: {id:string;inheritLegacy?:boolean}, parent: string, checks: Record<string,boolean>) {
  return Object.hasOwn(checks,action.id) ? checks[action.id] : action.inheritLegacy === true && checks[parent] === true;
}
export function validateChecks(value: unknown): CheckState {
  if (!value || typeof value !== 'object') throw new Error('체크 파일이 객체가 아닙니다.');
  const d = value as CheckState;
  if(d.schemaVersion!==1 || !Number.isInteger(d.revision) || d.revision<0 || !d.checks || typeof d.checks!=='object' || Array.isArray(d.checks) || Object.values(d.checks).some(x=>typeof x!=='boolean') || (d.updatedAt!==undefined && typeof d.updatedAt!=='string')) throw new Error('기존 checklist.json 형식의 파일을 선택하세요.');
  return {schemaVersion:1,revision:d.revision,...(d.updatedAt?{updatedAt:d.updatedAt}:{}),checks:{...d.checks}};
}
