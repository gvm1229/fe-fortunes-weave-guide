import data from '@/content/derived/final25.json';
/** 최종 25인 범위(최종 25명 + 팀 화면 교체 후보). 2026-11-14 사용자 지시: 인물 시트에 금색 배지, 할 일 초상화에 4px 금색 테두리. */
const names = new Set<string>(data.names);
export const isFinal25 = (name?: string) => !!name && names.has(name.replace(/ 초상화.*$/, '').trim());
export const final25Class = (name?: string) => (isFinal25(name) ? 'final25-portrait' : undefined);
