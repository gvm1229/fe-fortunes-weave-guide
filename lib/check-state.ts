/** 내 상태(2026-11-15 사용자 요청): 축복 단계·가호 레벨·파편·골드. 사이트에는 넣지 않고 브라우저 저장소와 JSON 백업에만 있다. */
export type Status = { boons: Record<string, number>; gods: Record<string, number>; shards?: number; gold?: number };
export type CheckState = { schemaVersion: 1; revision: number; updatedAt?: string; checks: Record<string, boolean>; status?: Status; builds?: Builds };
/**
 * 인물 육성 기록(2026-11-27 사용자 요청, U72): 루트마다(1·2부는 같은 회차라 한 기록, 3부는 part3) 인물 슬러그 → 레벨·병종·숙련 등급·메모.
 * 내보내기 파일에서는 체크 기록과 같은 파일의 선택 필드다(필드가 없어도 유효하므로 schemaVersion은 1 그대로). 브라우저 저장소에서는 체크 기록과 다른 열쇠에 둔다
 * (components/checks.tsx: 육성 기록을 모르는 옛 탭이 체크 열쇠를 덮어써도 육성 기록이 지워지지 않게, Fable 검토 21 지적 4).
 */
export const BUILD_ROUTES = ['theodora', 'leda', 'dietrich', 'cai', 'part3'] as const;
export const SKILL_IDS = ['sword', 'spear', 'axe', 'bow', 'gauntlet', 'black_magic', 'white_magic', 'authority', 'infantry', 'riding', 'armor', 'flying'] as const;
export const RANKS = ['E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+'] as const;
export const NOTE_MAX = 200;
export type BuildRoute = typeof BUILD_ROUTES[number];
export type SkillId = typeof SKILL_IDS[number];
export type Rank = typeof RANKS[number];
export type Build = { level?: number; classId?: string; skills?: Partial<Record<SkillId, Rank>>; note?: string };
export type Builds = Partial<Record<BuildRoute, Record<string, Build>>>;
/** 축복·가호의 최대 단계. 주면 그 밖의 이름과 단계를 거절한다. */
export type StatusLimits = { boons: Record<string, number>; gods: Record<string, number> };
export function checked(action: {id:string;inheritLegacy?:boolean}, parent: string, checks: Record<string,boolean>) {
  return Object.hasOwn(checks,action.id) ? checks[action.id] : action.inheritLegacy === true && checks[parent] === true;
}
/**
 * strict(가져오기)면 육성 기록 모양을 엄격하게 검사하고, 아니면(저장소 읽기) 모양만 고친다. 둘 다 모르는 인물·병종 슬러그는 버리지도 거절하지도 않고 보관한다:
 * 자료가 바뀐 날 기록이 지워지거나 내가 내보낸 파일을 다시 가져올 수 없게 되지 않도록(2026-11-27 Fable 검토 2, 검토 21 지적 6).
 * 루트가 하나도 없는 builds({})는 "없음"으로 본다: 가져오기에서 지금 기록을 지우지 않는다(Fable 검토 3).
 */
export function validateChecks(value: unknown, limits?: StatusLimits, strict = false): CheckState {
  if (!value || typeof value !== 'object') throw new Error('체크 파일이 객체가 아닙니다.');
  const d = value as CheckState;
  if(d.schemaVersion!==1 || !Number.isInteger(d.revision) || d.revision<0 || !d.checks || typeof d.checks!=='object' || Array.isArray(d.checks) || Object.values(d.checks).some(x=>typeof x!=='boolean') || (d.updatedAt!==undefined && typeof d.updatedAt!=='string')) throw new Error('기존 checklist.json 형식의 파일을 선택하세요.');
  const status = d.status === undefined ? undefined : validateStatus(d.status, limits);
  const builds = d.builds === undefined ? undefined : strict ? validateBuilds(d.builds) : sanitizeBuilds(d.builds);
  return {schemaVersion:1,revision:d.revision,...(d.updatedAt?{updatedAt:d.updatedAt}:{}),checks:migrateRouteIds(d.checks),...(status?{status}:{}),...(builds&&Object.keys(builds).length?{builds}:{})};
}
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
/** 가져오기 파일의 육성 기록 엄격 검사(모양만: 루트·칸 이름, 레벨 범위, 숙련·등급 값, 메모 길이). 틀리면 이유를 말하는 오류(파일 전체 거절, 지금 기록은 그대로). 빈 인물·루트는 결과에서 뺀다. */
export function validateBuilds(value: unknown): Builds {
  if (!isObj(value)) throw new Error('육성 기록(builds)이 객체가 아닙니다.');
  const out: Builds = {};
  for (const [route, list] of Object.entries(value)) {
    if (!(BUILD_ROUTES as readonly string[]).includes(route)) throw new Error(`육성 기록에 모르는 루트 "${route}"가 있습니다.`);
    if (!isObj(list)) throw new Error(`육성 기록 ${route}이 객체가 아닙니다.`);
    const rows: Record<string, Build> = {};
    for (const [slug, raw] of Object.entries(list)) {
      const at = `육성 기록 ${route} › ${slug}`;
      if (!isObj(raw)) throw new Error(`${at}이 객체가 아닙니다.`);
      const b = raw as Build, row: Build = {};
      for (const k of Object.keys(raw)) if (!['level', 'classId', 'skills', 'note'].includes(k)) throw new Error(`${at}에 모르는 칸 "${k}"가 있습니다.`);
      if (b.level !== undefined) { if (!Number.isInteger(b.level) || b.level < 1 || b.level > 99) throw new Error(`${at}의 레벨은 1~99 정수여야 합니다.`); row.level = b.level; }
      if (b.classId !== undefined) { if (typeof b.classId !== 'string' || !b.classId) throw new Error(`${at}의 병종은 글이어야 합니다.`); row.classId = b.classId; }
      if (b.skills !== undefined) {
        if (!isObj(b.skills)) throw new Error(`${at}의 숙련 등급이 객체가 아닙니다.`);
        const skills: Partial<Record<SkillId, Rank>> = {};
        for (const [s, r] of Object.entries(b.skills)) {
          if (!(SKILL_IDS as readonly string[]).includes(s)) throw new Error(`${at}에 모르는 숙련 "${s}"가 있습니다.`);
          if (!(RANKS as readonly unknown[]).includes(r)) throw new Error(`${at}의 ${s} 등급 "${String(r)}"는 E~S+가 아닙니다.`);
          skills[s as SkillId] = r as Rank;
        }
        if (Object.keys(skills).length) row.skills = skills;
      }
      if (b.note !== undefined) { if (typeof b.note !== 'string' || b.note.length > NOTE_MAX) throw new Error(`${at}의 메모는 ${NOTE_MAX}자 이하 글이어야 합니다.`); if (b.note) row.note = b.note; }
      if (Object.keys(row).length) rows[slug] = row;
    }
    if (Object.keys(rows).length) out[route as BuildRoute] = rows;
  }
  return out;
}
/** 저장소 값 읽기: 모양이 틀린 칸만 버린다. 모르는 루트·인물·병종·숙련 이름은 그대로 보관한다(오류를 던지지 않음). */
export function sanitizeBuilds(value: unknown): Builds | undefined {
  if (!isObj(value)) return undefined;
  const out: Record<string, Record<string, Build>> = {};
  for (const [route, list] of Object.entries(value)) {
    if (!isObj(list)) continue;
    const rows: Record<string, Build> = {};
    for (const [slug, raw] of Object.entries(list)) {
      if (!isObj(raw)) continue;
      const row: Build = {};
      if (Number.isInteger(raw.level) && (raw.level as number) >= 1 && (raw.level as number) <= 99) row.level = raw.level as number;
      if (typeof raw.classId === 'string' && raw.classId) row.classId = raw.classId;
      if (isObj(raw.skills)) { const s = Object.fromEntries(Object.entries(raw.skills).filter(([, r]) => typeof r === 'string')) as Partial<Record<SkillId, Rank>>; if (Object.keys(s).length) row.skills = s; }
      if (typeof raw.note === 'string' && raw.note) row.note = raw.note;
      if (Object.keys(row).length) rows[slug] = row;
    }
    if (Object.keys(rows).length) out[route] = rows;
  }
  return out as Builds;
}
/** 한 인물 기록 고치기(순수 함수). patch가 null이면 그 인물 기록을 지운다. 값이 undefined·빈 글인 칸, 빈 숙련·인물·루트는 지우고, 모두 비면 undefined(저장·내보내기에 {}를 남기지 않음). */
export function nextBuilds(builds: Builds | undefined, route: BuildRoute, slug: string, patch: Partial<Build> | null): Builds | undefined {
  const all: Record<string, Record<string, Build>> = { ...(builds || {}) };
  const rows = { ...(all[route] || {}) };
  if (patch === null) delete rows[slug];
  else {
    const merged: Build = { ...rows[slug], ...patch };
    if (patch.skills) merged.skills = Object.fromEntries(Object.entries({ ...rows[slug]?.skills, ...patch.skills }).filter(([, r]) => !!r)) as Partial<Record<SkillId, Rank>>;
    const row = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined && v !== '' && !(isObj(v) && !Object.keys(v).length))) as Build;
    if (Object.keys(row).length) rows[slug] = row; else delete rows[slug];
  }
  if (Object.keys(rows).length) all[route] = rows; else delete all[route];
  return Object.keys(all).length ? (all as Builds) : undefined;
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
