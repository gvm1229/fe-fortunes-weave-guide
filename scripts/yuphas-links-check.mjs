// yuphastemple 이름표 검사(content/data/yuphas-names.json).
//   node scripts/yuphas-links-check.mjs            — 네트워크 없이: 슬러그 형식, 우리 글의 이름이 모두 이름표에 있는지, 인물 자료의 이름 연결
//   node scripts/yuphas-links-check.mjs --network  — 위에 더해 링크 주소를 하나씩(0.3초 간격) 열어 응답 200인지 확인
// 슬러그 규칙은 yuphastemple의 data/app.js(itemSlug·createSlug)와 data/map.js(urlSlug)를 그대로 옮겼다(docs/yuphas-integration-research.md §1.3).
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const createSlug = (t) => fold(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const itemSlug = (n) => createSlug(String(n).replace(/['’]/g, '').replace(/[+]/g, ' plus'));
const mapSlug = (n) => createSlug(String(n).replace(/['’]/g, ''));
const slugFor = { people: createSlug, places: mapSlug, classes: createSlug, items: itemSlug, enOnly: itemSlug };
const GRADES = new Set(['game', 'wiki', 'wiki-temp', 'unverified']);

const T = read('content/data/yuphas-names.json');
const errors = [];
const fail = (m) => errors.push(m);

// 1. 칸과 슬러그 형식
const groups = ['people', 'items', 'places', 'classes', 'enOnly'];
const byKo = {}; const byEn = new Map();
for (const g of groups) for (const [key, r] of Object.entries(T[g] || {})) {
  const where = `${g}.${key}`;
  if (!GRADES.has(r.koGrade)) fail(`${where}: koGrade 값이 이상함(${r.koGrade})`);
  if (g !== 'enOnly' && r.ko !== key) fail(`${where}: 열쇠와 ko가 다름`);
  if (g === 'enOnly' && (r.ko || r.en !== key)) fail(`${where}: enOnly는 ko 없이 영어 열쇠`);
  if (r.slug) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug)) fail(`${where}: 슬러그 형식(${r.slug})`);
    if (!r.en) fail(`${where}: 슬러그는 있는데 영어 이름이 없음`);
    else if (slugFor[g](r.en) !== r.slug) fail(`${where}: 슬러그 ${r.slug} ≠ 규칙으로 만든 ${slugFor[g](r.en)}`);
  } else if (r.linkVerified) fail(`${where}: 슬러그 없이 linkVerified`);
  if (r.koGrade !== 'unverified' && !r.ko) fail(`${where}: 한국어 이름 없이 확인 등급 ${r.koGrade}`);
  if (r.candidate && r.candidate.slug && slugFor[g](r.candidate.en) !== r.candidate.slug) fail(`${where}: 후보 슬러그 형식`);
  if (r.ko) { byKo[g] ||= {}; byKo[g][r.ko] = r; for (const a of r.aliases || []) byKo[g][a] = r; }
  if (r.en) byEn.set(createSlug(r.en) + '|' + (g === 'people' ? 'p' : g === 'places' ? 'l' : 'i'), r);
}

// 2. 우리 글에 나오는 이름이 모두 이름표에 있다(링크가 있거나, 슬러그 null로 미확인이 드러나 있거나)
const need = (g, ko, src) => { if (!byKo[g]?.[ko]) fail(`이름표에 없음: ${g} "${ko}" (${src})`); };
const people = read('content/data/people-display.json');
for (const [ko, v] of Object.entries(people)) { need('people', ko, 'people-display'); for (const gift of v.gifts || []) need('items', gift, `people-display ${ko} 선물`); }
for (const ko of Object.keys(read('content/data/support-pairs-source.json').names)) need('people', ko, 'support-pairs-source');
for (const [ko] of Object.entries(read('assets/items/manifest.json').items)) need('items', ko, 'assets/items/manifest.json');
for (const v of Object.values(read('content/data/affordable-gifts.json').items)) need('items', v.korean, 'affordable-gifts');
for (const v of read('content/data/team-white-spells.json').items) need('items', v.name, 'team-white-spells');
for (const [ko] of Object.values(read('content/data/team-signature-weapons.json').itemDefinitions)) need('items', ko, 'team-signature-weapons');
for (const v of Object.values(read('content/data/weapon-buy-sources.json').weapons)) need('items', v.name, 'weapon-buy-sources');
for (const list of Object.values(read('content/data/team-white-highlights.json').spells)) for (const s of list) need('items', s.name, 'team-white-highlights');
for (const ko of Object.keys(read('content/data/class-details.json').classes)) need('classes', ko, 'class-details');

// 3. 인물 자료(content/data/yuphas-characters.json)의 선물·음식·지원 상대 이름이 이름표와 이어진다
const C = read('content/data/yuphas-characters.json').characters;
const linked = (en, kind) => byEn.has(createSlug(en) + '|' + kind);
for (const [ko, c] of Object.entries(C)) {
  if (!byKo.people?.[ko]) fail(`인물 자료 ${ko}: 이름표 people에 없음`);
  for (const p of c.gifts) for (const x of [...p.loved, ...p.liked]) if (!linked(x.en, 'i')) fail(`인물 자료 ${ko}: 선물 ${x.en}이 이름표에 없음`);
  for (const t of ['loved', 'liked']) for (const x of c.meals[t]) if (!linked(x.en, 'i')) fail(`인물 자료 ${ko}: 음식 ${x.en}이 이름표에 없음`);
}

// 4. (선택) 네트워크: 주소 응답 200
if (process.argv.includes('--network')) {
  const urlOf = (g, s) => g === 'people' ? `/${s}/` : g === 'places' ? `/map/${s}/` : `/?item=${s}`;
  for (const g of groups) for (const [key, r] of Object.entries(T[g] || {})) {
    if (!r.slug) continue;
    const res = await fetch(T.site + urlOf(g, r.slug), { redirect: 'manual' }); await res.arrayBuffer();
    if (res.status !== 200) fail(`${g}.${key}: ${urlOf(g, r.slug)} 응답 ${res.status}`);
    await new Promise((ok) => setTimeout(ok, 300));
  }
}

const count = (g) => Object.values(T[g] || {});
const all = groups.flatMap(count);
console.log(`yuphas 이름표: ${all.length}개 · 링크 ${all.filter((r) => r.slug).length} · 미확인 한국어 ${all.filter((r) => r.koGrade === 'unverified').length} · 임시 표기 ${all.filter((r) => r.koGrade === 'wiki-temp').length}`);
// 화면용 작은 이름표(content/data/yuphas-links.json)가 정본에서 만든 그대로인지(scripts/yuphas/build-links.mjs --check).
{ const { spawnSync } = await import('node:child_process'); const r = spawnSync(process.execPath, ['scripts/yuphas/build-links.mjs', '--check'], { encoding: 'utf8' }); if (r.status !== 0) fail('yuphas-links.json이 정본과 다름: node scripts/yuphas/build-links.mjs'); else console.log(r.stdout.trim()); }
if (errors.length) { console.error(errors.join('\n')); console.error(`yuphas-links-check 실패 ${errors.length}건`); process.exit(1); }
console.log('yuphas-links-check 통과');
