/**
 * 할 일 지도 단추의 yuphastemple 주소(2026-11-27 사용자 결정 Q3, Fable 검토 5). 원본 지도 링크에는 장소가 없어서 같은 묶음 글에서 고른다.
 * ① 그 루트 지도의 장소가 글에 정확히 하나 → 장소 주소 /map/<루트>/<장소>/ (단추 글 = 영어 장소 이름. 물품도 하나면 ?q=<물품>)
 * ② 아니고 yuphastemple 물품이 정확히 하나 → 지도 물품 검색 /map/<루트>/?q=<물품 영어 이름> (단추 글 World Map)
 * ③ 둘 다 아니면 루트 지도 /map/<루트>/
 * 가져오기 없는 순수 함수라 검사(scripts/yuphas-links-check.mjs)도 Node로 직접 부른다.
 */
export type MapName = { ko: string; en: string; slug: string };
export type MapPlace = MapName & { routes: string[] };
export type MapTarget = { tier: 'place' | 'item' | 'route'; href: string; label: string };
const SITE = 'https://yuphastemple.com';
const seg = (route: string) => (route === 'part3' ? 'part-3' : route);
export const routeMapUrl = (route: string, q?: string) => `${SITE}/map/${seg(route)}/${q ? '?q=' + encodeURIComponent(q) : ''}`;
export const placeMapUrl = (route: string, slug: string, q?: string) => `${SITE}/map/${seg(route)}/${slug}/${q ? '?q=' + encodeURIComponent(q) : ''}`;
/** 글에 나오는 이름(긴 이름 먼저, 찾은 부분은 지워서 짧은 이름이 그 안에서 다시 잡히지 않게). 두 글자 미만 이름은 보지 않는다. 슬러그로 한 번씩. */
export function namesIn<T extends MapName>(text: string, rows: T[]): T[] {
  let rest = text;
  const hits = new Map<string, T>();
  for (const r of [...rows].sort((a, b) => b.ko.length - a.ko.length)) {
    if (r.ko.length < 2 || !rest.includes(r.ko)) continue;
    hits.set(r.slug, r);
    rest = rest.split(r.ko).join(' ');
  }
  return [...hits.values()];
}
export function mapTarget(text: string, route: string, places: MapPlace[], items: MapName[]): MapTarget {
  const place = namesIn(text, places.filter((p) => p.routes.includes(route)));
  const item = namesIn(text, items);
  if (place.length === 1) return { tier: 'place', href: placeMapUrl(route, place[0].slug, item.length === 1 ? item[0].en : undefined), label: place[0].en };
  if (item.length === 1) return { tier: 'item', href: routeMapUrl(route, item[0].en), label: 'World Map' };
  return { tier: 'route', href: routeMapUrl(route), label: 'World Map' };
}
