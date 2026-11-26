// 장소별로 그 장소가 나오는 yuphastemple 지도(루트) 표 content/data/yuphas-place-routes.json을 만든다(2026-11-27 고침 B-1, 할 일 지도 단추의 장소 주소).
// 원본: 작업 폴더의 yuphastemple locations.json(LOCATIONS[영어 이름].a의 키 = 그 장소가 있는 지도). 손으로 고치지 않는다.
//   node scripts/yuphas/places.mjs
import fs from 'node:fs';
import { REPO, SCR, mapSlug } from './lib.mjs';
const src = `${SCR}/ydata/locations.json`;
if (!fs.existsSync(src)) { console.error(`${src}가 없습니다. 먼저 node scripts/yuphas/fetch.mjs로 yuphastemple 자료를 받으세요.`); process.exit(1); }
const { LOCATIONS } = JSON.parse(fs.readFileSync(src, 'utf8'));
const route = { Cai: 'cai', Dietrich: 'dietrich', Theodora: 'theodora', Leda: 'leda', 'Part 3': 'part3' };
const out = {};
for (const [en, loc] of Object.entries(LOCATIONS)) { const routes = Object.keys(loc.a || {}).map((k) => route[k]).filter(Boolean); if (routes.length) out[mapSlug(en)] = routes; }
fs.writeFileSync(`${REPO}/content/data/yuphas-place-routes.json`, JSON.stringify({ note: 'scripts/yuphas/places.mjs가 yuphastemple locations.json에서 만든 표(장소 슬러그 → 그 장소가 있는 지도 루트).', places: out }, null, 1) + '\n');
console.log('장소', Object.keys(out).length);
