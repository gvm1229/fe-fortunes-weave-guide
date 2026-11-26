/** 병종 고르기 창에 보이는 병종 규칙(yuphastemple 병종 창과 같음, 2026-11-27 U72). 가져오기 없는 순수 함수라 검사(scripts/builds-check.mjs)도 Node로 부른다. */
export type YClass = { slug: string; en: string; ko: string | null; license: string; level: number | null; renown: number | null; part3: boolean; column: string; gender?: string; mounted: boolean; moves: string[]; weapons: string[] };
export type YCharacter = { gender: string; unique: string; noRide?: boolean };
/** 고유 병종은 그 인물 것 하나(Commoner·Noble), 성별 전용 병종은 그 성별만, 못 타는 인물(Goliath·Orchel)은 기마·비행 병종 제외. */
export function allowedFor(classes: YClass[], person: YCharacter | undefined): YClass[] {
  if (!person) return [];
  return classes.filter((c) => (c.license !== 'default' || c.slug === person.unique) && (!c.gender || c.gender === person.gender) && !(person.noRide && c.mounted));
}
