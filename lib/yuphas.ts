import links from '@/content/data/yuphas-links.json';
import { mapTarget, placeMapUrl, type MapTarget } from './map-target';
/** yuphastemple 주소 규칙(docs/yuphas-integration-research.md §1). 이름표는 scripts/yuphas/build-links.mjs가 만든 작은 파일만 읽는다. */
export const YUPHAS = 'https://yuphastemple.com';
type ItemRow = [en: string, slug: string, kind: string, icon: string | null];
const items = links.items as unknown as Record<string, ItemRow>;
const people = links.people as unknown as Record<string, [string, string]>;
export type YuphasItem = { ko: string; en: string; slug: string; kind: string; icon: string | null };
export function yuphasItem(ko: string): YuphasItem | undefined { const r = items[ko]; return r ? { ko, en: r[0], slug: r[1], kind: r[2], icon: r[3] } : undefined; }
export const yuphasItemNames = Object.keys(items);
export function yuphasPerson(ko: string): { en: string; slug: string } | undefined { const r = people[ko]; return r ? { en: r[0], slug: r[1] } : undefined; }
export const itemUrl = (slug: string) => `${YUPHAS}/?item=${slug}`;
export const personUrl = (slug: string, tab?: 'liked-gifts' | 'supports' | 'builder') => `${YUPHAS}/${slug}/${tab ? tab + '/' : ''}`;
export const giftUrl = (person: string, item: string) => `${YUPHAS}/${person}/liked-gifts/?item=${item}`;
/** 지도 루트 조각. 3부는 part-3. */
export const mapUrl = (route: string, q?: string) => `${YUPHAS}/map/${route === 'part3' ? 'part-3/' : route === 'all' ? '' : route + '/'}${q ? '?q=' + encodeURIComponent(q) : ''}`;
/** 장소 주소 /map/<루트>/<장소>/(+ ?q=). */
export const placeUrl = placeMapUrl;
const places = Object.entries(links.places as unknown as Record<string, [string, string, string[]]>).map(([ko, [en, slug, routes]]) => ({ ko, en, slug, routes }));
const itemNames = Object.entries(items).map(([ko, r]) => ({ ko, en: r[0], slug: r[1] }));
/** 할 일 묶음 글로 지도 단추 주소를 고른다(장소 → 물품 검색 → 루트 지도, lib/map-target.ts). */
export const blockMapTarget = (text: string, route: string): MapTarget => mapTarget(text, route, places, itemNames);
export type { MapTarget };
/** 루트 주인공의 yuphastemple 소속 문장(content/data/yuphas-images.json emblems). */
export const lordEmblems: Record<string, string> = { cai: '/yuphas/emblems/ribeira-winds.webp', dietrich: '/yuphas/emblems/house-lamine.webp', theodora: '/yuphas/emblems/megairas-beacon.webp', leda: '/yuphas/emblems/rose-tempest.webp', part3: '/yuphas/emblems/ribeira-winds.webp' };
