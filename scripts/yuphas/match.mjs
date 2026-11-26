// phase 1: collect every name we mention, match to yuphastemple names and the KR wiki (no network)
import fs from 'node:fs';
import { SCR, Y, R, readJson, itemSlug, createSlug, mapSlug, normEn } from './lib.mjs';

const D = Y('data.json').DATA;
const MAP_ITEMS = Y('locations.json').MAP_ITEMS;
const LOCS = Y('locations.json').LOCATIONS;
const WEAPONS = Y('weapons.json').WEAPONS;
const GIFTS = Y('gifts.json').characterGifts;
const wikiKo = readJson(`${SCR}/kwiki/dir.json`); // slug -> {ko, sec}
const wikiEn = readJson(`${SCR}/kwiki/endir.json`); // slug -> en

// ---- yuphas item index (subset of app.js resolveItemSlug, enough for our names) ----
const yItem = {}; // itemSlug -> { name, ytype }
const addI = (n, t) => { if (n && !yItem[itemSlug(n)]) yItem[itemSlug(n)] = { name: String(n), ytype: t }; };
for (const [k, list] of Object.entries(WEAPONS)) for (const w of list) addI(w.n, k);
for (const [n, v] of Object.entries(MAP_ITEMS)) addI(n, v.type);
for (const g of Object.values(GIFTS)) for (const p of g.gifts || []) for (const t of ['loved', 'liked']) for (const [n] of p[t] || []) addI(n, 'Gift');
for (const s of D.scrolls || []) { addI(s.n, 'Scroll'); addI(s.source, 'Scroll'); }
for (const m of D.mounts) addI(m.name, 'Mount');
for (const b of D.battalions) addI(b.n, 'Battalion');
const yClass = {}; for (const c of D.classes) yClass[createSlug(c.name)] = c.name;
for (const c of D.classes) if (!yItem[itemSlug(c.name)]) yItem[itemSlug(c.name)] = { name: c.name, ytype: 'Class' };
const yChar = {}; for (const c of D.characters) yChar[createSlug(c.name)] = c.name;
const REGIONS = new Set(Object.values(LOCS).map((v) => v.r));
const yLoc = {}; for (const n of Object.keys(LOCS)) yLoc[mapSlug(n)] = n;

// ---- wiki: en name -> slugs ----
const wikiByEn = {}; for (const [s, en] of Object.entries(wikiEn)) (wikiByEn[normEn(en)] ||= []).push(s);
const wikiByKo = {}; for (const [s, v] of Object.entries(wikiKo)) (wikiByKo[v.ko] ||= []).push(s);
const SEC = { character: '캐릭터', location: '위치', class: '병종', spell: '마법' };
const wikiFor = (en, ko, kind) => {
  const want = kind === 'character' ? ['캐릭터'] : kind === 'location' ? ['위치'] : kind === 'class' ? ['병종'] : ['아이템', '마법', '탈것', '군단병'];
  const okSec = (s) => want.includes(wikiKo[s]?.sec);
  const byEn = (wikiByEn[normEn(en)] || []).filter(okSec);
  if (byEn.length === 1) return { slug: byEn[0], via: 'en' };
  if (byEn.length > 1) { const k = byEn.find((s) => wikiKo[s].ko === ko); return { slug: k || byEn[0], via: 'en', ambiguous: byEn }; }
  const byKo = (wikiByKo[ko] || []).filter(okSec);
  if (byKo.length === 1) return { slug: byKo[0], via: 'ko' };
  return null;
};

const entries = []; // { group, ko, en, kind, srcs:[], aliases }
const byKey = new Map();
const put = (group, ko, en, kind, src, extra = {}) => {
  const key = group + '|' + (ko || 'EN:' + en);
  let e = byKey.get(key);
  if (!e) { e = { group, ko: ko || null, en: en || null, kind, srcs: [], aliases: [], ...extra }; byKey.set(key, e); entries.push(e); }
  if (!e.en && en) e.en = en;
  if (e.en && en && normEn(e.en) !== normEn(en)) (e.enVariants ||= []).includes(en) || (e.enVariants ||= []).push(en);
  if (!e.srcs.includes(src)) e.srcs.push(src);
  return e;
};

// people (people-display keys: 60 + 이스마르 + 타호니아)
const pd = R('content/data/people-display.json');
const sp = R('content/data/support-pairs-source.json').names;
for (const ko of Object.keys(pd)) put('people', ko, sp[ko] || null, 'character', 'content/data/people-display.json');
// items from manifest
const man = R('assets/items/manifest.json').items;
for (const [ko, v] of Object.entries(man)) { const e = put('items', ko, v.english || null, v.kind, 'assets/items/manifest.json'); e.aliases = v.aliases || []; e.ourIcon = v.file; }
// gift chips in people-display (after manifest so manifest english wins)
const PD_GIFTS = []; for (const v of Object.values(pd)) for (const g of v.gifts || []) PD_GIFTS.push(g);
// affordable gifts
const ag = R('content/data/affordable-gifts.json').items;
for (const v of Object.values(ag)) { const e = put('items', v.korean, v.english, 'gift', 'content/data/affordable-gifts.json'); e.ourIcon ||= v.icon; }
const aliasOf = {}; for (const [ko, v] of Object.entries(man)) for (const a of v.aliases || []) aliasOf[a] = ko;
for (const g of PD_GIFTS) { if (aliasOf[g]) { const e = byKey.get('items|' + aliasOf[g]); (e.aliasUses ||= {})[g] = 'content/data/people-display.json'; if (!e.srcs.includes('content/data/people-display.json (별칭 ' + g + ')')) e.srcs.push('content/data/people-display.json (별칭 ' + g + ')'); } else put('items', g, null, 'gift', 'content/data/people-display.json'); }
// team weapon/magic names
const tk = R('content/data/team-korean-name-sources.json').items;
const ws = R('content/data/team-white-spells.json').items;
for (const v of ws) put('items', v.name, v.english, 'spell', 'content/data/team-white-spells.json');
const sw = R('content/data/team-signature-weapons.json');
for (const [id, [ko, , skill]] of Object.entries(sw.itemDefinitions)) put('items', ko, null, /마법|白|黒|흑마|백마/.test(skill) ? 'spell' : 'weapon', 'content/data/team-signature-weapons.json', { teamId: id });
const wb = R('content/data/weapon-buy-sources.json').weapons;
for (const v of Object.values(wb)) put('items', v.name, v.english, 'weapon', 'content/data/weapon-buy-sources.json');
const wh = R('content/data/team-white-highlights.json').spells;
for (const list of Object.values(wh)) for (const s of list) put('items', s.name, null, 'spell', 'content/data/team-white-highlights.json');
for (const v of Object.values(tk)) put('items', v.name, null, null, 'content/data/team-korean-name-sources.json', { koSourceGiven: v.source });

// classes
const cd = R('content/data/class-details.json').classes;
for (const [ko, v] of Object.entries(cd)) put('classes', ko, yClass[v.slug] || null, 'class', 'content/data/class-details.json', { ourSlug: v.slug });

// places from checklist-display-names
const cdn = R('content/data/checklist-display-names.json');
const known6 = new Set(['Panja Bay', 'Talbos South Road', 'Kosharu Lake', 'Azure Crystal Cave', "Yu Phas's Temple", 'Kroios Fort']);
const wikiPlaceKo = new Set(Object.values(wikiKo).filter((v) => v.sec === '위치').map((v) => v.ko));
for (const [en, ko] of Object.entries(cdn)) {
  if (!/[가-힣]/.test(ko) || /[가-힣]/.test(en)) continue;
  let hit = null; const w = en.split(' ');
  for (let i = w.length; i >= 1 && !hit; i--) {
    const s = mapSlug(w.slice(0, i).join(' ')); const rest = w.slice(i).join(' ').replace(/ region$/, '').replace(/^Land of /, '');
    if (yLoc[s] && (i === w.length || REGIONS.has(rest))) hit = { name: yLoc[s], trimmed: i < w.length };
  }
  if (hit || known6.has(en) || wikiPlaceKo.has(ko)) put('places', ko, en, 'location', 'content/data/checklist-display-names.json', { yHit: hit });
}

// yuphas-derived gift + meal names for our characters
const ourEn = new Set(Object.keys(pd).map((ko) => sp[ko]).filter(Boolean)); ourEn.add('Eshmel'); ourEn.add('Tahonia');
const derived = new Map();
for (const en of ourEn) {
  const g = GIFTS[en]; if (!g) continue;
  for (const p of g.gifts || []) for (const t of ['loved', 'liked']) for (const [n] of p[t] || []) derived.set(n, 'gift');
  for (const t of ['loved_meals', 'liked_meals']) for (const n of g[t] || []) derived.set(n, 'meal');
}

// classes our characters use on yuphastemple (start / unique / beginner / specialty / late)
for (const en of ourEn) { const ch = D.characters.find((x) => x.name === en); if (!ch) continue;
  for (const cn of [ch.startClass, ch.uniqueClass, ch.beginner, ch.specialty, ...(ch.lateClasses || [])].filter(Boolean)) {
    const ex = entries.find((e) => e.group === 'classes' && e.en === cn);
    if (ex) { if (!ex.srcs.includes('yuphas data.json (our characters)')) ex.srcs.push('yuphas data.json (our characters)'); }
    else put('classes', null, cn, 'class', 'yuphas data.json (our characters)');
  } }
// ---- resolve ----
const enIndexOurItems = new Map(); for (const e of entries) if (e.group === 'items' && e.en) enIndexOurItems.set(normEn(e.en), e);
for (const [n, kind] of derived) { if (!enIndexOurItems.has(normEn(n))) { const ko = null; const e = put('items', ko, n, kind, 'yuphas gifts.json (liked lists of our characters)'); enIndexOurItems.set(normEn(n), e); } else enIndexOurItems.get(normEn(n)).srcs.push('yuphas gifts.json (liked lists of our characters)'); }

for (const e of entries) {
  const kind = e.kind || 'item';
  const wk = wikiFor(e.en, e.ko, e.group === 'people' ? 'character' : e.group === 'places' ? 'location' : e.group === 'classes' ? 'class' : 'item');
  if (wk) { e.wikiSlug = wk.slug; e.wikiVia = wk.via; e.wikiKo = wikiKo[wk.slug].ko; e.wikiEn = wikiEn[wk.slug]; if (wk.ambiguous) e.wikiAmbiguous = wk.ambiguous; }
  // if ko missing and wiki gives one
  if (!e.ko && e.wikiKo && wk.via === 'en') e.koFromWiki = true;
  // english from wiki when ours missing (lookup by ko title only)
  if (!e.en && e.wikiEn && wk.via === 'ko') e.enFromWiki = true;
  const en = e.en || (e.enFromWiki ? e.wikiEn : null);
  let yname = null, slug = null;
  const tryName = (n) => {
    if (!n) return false;
    if (e.group === 'people') { const s = createSlug(n); if (yChar[s]) { yname = yChar[s]; slug = s; return true; } return false; }
    if (e.group === 'places') { const s = mapSlug(n); if (yLoc[s]) { yname = yLoc[s]; slug = s; return true; } return false; }
    if (e.group === 'classes') { const s = createSlug(n); if (yClass[s]) { yname = yClass[s]; slug = s; return true; } return false; }
    const s = itemSlug(n); if (yItem[s]) { yname = yItem[s].name; slug = s; e.ytype = yItem[s].ytype; return true; } return false;
  };
  if (e.group === 'classes') tryName(cd[e.ko]?.slug?.replace(/-/g, ' ')) || tryName(e.wikiEn);
  else if (e.group === 'places') { tryName(e.yHit?.name) || tryName(en) || tryName(e.wikiEn); }
  else { tryName(en); if (!slug && e.wikiEn && e.wikiKo === e.ko) { if (tryName(e.wikiEn)) e.enCorrectedFromWiki = true; } }
  e.yname = yname; e.slug = slug;
}
// manual decisions (each listed in docs/reference/name-review.md)
const MANUAL = {
  'items|심판의 천칭': { accept: { en: 'Scales of Judgment', slug: 'scales-of-judgment' }, note: '우리·도감 영어는 Scales of Judgement, yuphastemple은 Scales of Judgment(영국·미국 철자 차이만). 한국어 제목은 도감과 같다' },
  'items|데스': { candidate: { en: 'Death Γ', slug: itemSlug('Death Γ') }, note: '도감 한국어 제목은 "데스Γ"(우리 표기 "데스"와 글자 Γ가 다름). 같은 마법인지 미확인' },
  'items|루나': { candidate: { en: 'Luna Λ', slug: itemSlug('Luna Λ') }, note: '도감 한국어 제목은 "루나Λ"(우리 표기 "루나"와 글자 Λ가 다름). 같은 마법인지 미확인' },
  'places|탈보스 남도': { candidate: { en: 'Tarvos South Road', slug: mapSlug('Tarvos South Road') }, note: '우리 영어 Talbos South Road는 yuphastemple에 없음. 도감에는 타르보스 남도 / Tarvos South Road. 같은 곳인지 미확인' },
  'classes|오리할디아': { candidate: { en: 'Orichaldia', slug: createSlug('Orichaldia') }, note: '우리 슬러그 orichalda는 yuphastemple에 없음. yuphastemple Orichaldia, 도감 한국어 오리할디어. 같은 병종인지 미확인' },
};
for (const e of entries) {
  const m = MANUAL[e.group + '|' + e.ko]; if (!m) continue;
  e.manualNote = m.note;
  if (m.accept) { e.en = e.en || m.accept.en; e.yname = m.accept.en; e.slug = m.accept.slug; e.manualAccept = true; }
  if (m.candidate) { e.candidateEn = m.candidate.en; e.candidateSlug = m.candidate.slug; }
}
const GAME = { '리나리아': 1, '태양 열매': 1, '멜라라': 1, '리가네트': 1, '라돈 잉어': 1, '라돈 꼬치고기': 1 };
for (const e of entries) if (e.group === 'items' && GAME[e.ko]) e.gameConfirmed = true;
console.log('kind mismatches:', entries.filter((e) => e.ytype && e.kind && !({ gift: ['Gift'], weapon: ['Sword', 'Spear', 'Axe', 'Bow', 'Gauntlet'], spell: ['Black Magic', 'White Magic'], material: ['Vegetable'], fish: ['Fish'], ore: ['Ore'], meat: ['Meat'], meal: ['Meal'] }[e.kind] || [e.ytype]).includes(e.ytype)).map((e) => `${e.ko}(${e.kind})→${e.yname}(${e.ytype})`).join('; '));
console.log('game-confirmed found:', entries.filter((e) => e.gameConfirmed).map((e) => e.ko).join(','));
const st = {}; for (const e of entries) { const k = e.group + ':' + (e.kind || '?'); st[k] ||= { n: 0, slug: 0, wiki: 0 }; st[k].n++; if (e.slug) st[k].slug++; if (e.wikiSlug) st[k].wiki++; }
console.log(st, entries.length);
console.log('NO SLUG:', entries.filter((e) => !e.slug).map((e) => `${e.group}/${e.kind}:${e.ko}=${e.en}${e.wikiEn ? ' [wiki ' + e.wikiEn + '/' + e.wikiKo + ']' : ''}`).join('\n'));
fs.writeFileSync(`${SCR}/gen/candidates.json`, JSON.stringify(entries, null, 1));
