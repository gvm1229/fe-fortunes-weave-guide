// phase 5: content/data/yuphas-images.json — our image -> downloaded yuphastemple replacement (for the UI phase)
import fs from 'node:fs';
import path from 'node:path';
import { SCR, REPO, Y, R, readJson } from './lib.mjs';
const ex = (p) => fs.existsSync(path.join(REPO, 'public', p)); // p like /yuphas/x
const exA = (p) => fs.existsSync(path.join(REPO, p));
const names = R('content/data/yuphas-names.json');
const pd = R('content/data/people-display.json');
const MAP_ITEMS = Y('locations.json').MAP_ITEMS;
const WEAPONS = Y('weapons.json').WEAPONS;
const D = Y('data.json').DATA;
const WTYPE = { Sword: 'sword.webp', Spear: 'spear.webp', Axe: 'axe.webp', Bow: 'bow.webp', Gauntlet: 'gauntlets.webp', 'Black Magic': 'black_magic.webp', 'White Magic': 'white_magic.webp' };
const wtype = {}; for (const [k, l] of Object.entries(WEAPONS)) for (const w of l) wtype[w.n] = WTYPE[k];
const typeIcon = (en) => { const i = MAP_ITEMS[en]?.icon; const f = i ? path.basename(i) : wtype[en]; return f && ex(`/yuphas/icons/items/${f}`) ? `/yuphas/icons/items/${f}` : null; };

const out = { reviewed: '2026-11-27', note: '왼쪽 = 지금 우리 그림(저장소 경로), 오른쪽 = public/yuphas/에 받은 yuphastemple 그림(사이트 경로). 화면 교체는 다음 단계에서 한다. 출처: assets/design/SOURCES.md',
  portraits: {}, items: {}, classes: {}, skills: {}, emblems: {}, extra: {}, noReplacement: [] };
const lordSlug = { 카이: 'cai', 디트리히: 'dietrich', 세오도라: 'theodora', 레다: 'leda' };
for (const [ko, r] of Object.entries(names.people)) {
  const s = r.slug; const ours = [];
  if (pd[ko]?.portrait) ours.push(pd[ko].portrait);
  for (const p of [`assets/portraits/large/${s}.png`, `assets/portraits/pre-timeskip/large/${s}.webp`]) if (exA(p)) ours.push(p);
  if (s === 'eshmel' && exA('assets/portraits/eshmel-female.png')) ours.push('assets/portraits/eshmel-female.png');
  out.portraits[ko] = { en: r.en, ours, yuphas: { portrait: `/yuphas/portraits/${s}.webp`, thumb: `/yuphas/thumbs/${s}.webp`, face: `/yuphas/faces/${s}.png` } };
  for (const p of [`assets/portraits/post-timeskip/${s}.png`, ...fs.readdirSync(path.join(REPO, 'assets/portraits/post-timeskip')).filter((f) => f.startsWith(s + '.') || f.startsWith(s + '-')).map((f) => `assets/portraits/post-timeskip/${f}`)]) if (exA(p) && !out.noReplacement.includes(p)) out.noReplacement.push(p);
}
const man = R('assets/items/manifest.json').items;
const ag = R('content/data/affordable-gifts.json').items;
const ourIcon = {}; for (const [ko, v] of Object.entries(man)) ourIcon[ko] = v.file; for (const v of Object.values(ag)) ourIcon[v.korean] ||= v.icon;
let pic = 0;
for (const [ko, r] of Object.entries(names.items)) {
  const picture = r.slug && ex(`/yuphas/items/${r.slug}.webp`) ? `/yuphas/items/${r.slug}.webp` : null;
  const ti = r.en ? typeIcon(r.en) : null;
  if (!ourIcon[ko] && !picture && !ti) continue;
  if (picture) pic++;
  out.items[ko] = { en: r.en, ours: ourIcon[ko] || null, yuphas: picture, yuphasTypeIcon: ti };
}
for (const [en, r] of Object.entries(names.enOnly)) {
  const p = r.kind === 'meal' ? `/yuphas/meals/${r.slug}.webp` : r.slug ? `/yuphas/items/${r.slug}.webp` : null;
  out.items[en] = { en, ours: null, yuphas: p && ex(p) ? p : null, yuphasTypeIcon: typeIcon(en) };
}
for (const f of fs.readdirSync(path.join(REPO, 'assets/classes')).filter((f) => f.endsWith('.webp'))) {
  const s = f.replace('.webp', '').replace(/^orichalda$/, 'orichaldia');
  const female = ex(`/yuphas/classes/female/${s}.webp`) ? `/yuphas/classes/female/${s}.webp` : null;
  const male = ex(`/yuphas/classes/male/${s}.webp`) ? `/yuphas/classes/male/${s}.webp` : null;
  out.classes[`assets/classes/${f}`] = { female, male, ...(s !== f.replace('.webp', '') ? { note: '우리 orichalda = yuphastemple Orichaldia(이름 일치 미확인, name-review.md)' } : {}) };
}
const SK = { sword: 'sword', lance: 'spear', axe: 'axe', bow: 'bow', brawl: 'gauntlet', 'black-magic': 'black_magic', 'white-magic': 'white_magic', authority: 'authority', infantry: 'infantry', riding: 'riding', armor: 'armor', flying: 'flying' };
for (const [ours, y] of Object.entries(SK)) {
  const o = { plain: `/yuphas/icons/skills/${y}.png`, boon: `/yuphas/icons/skills/${y}_boon.png`, bane: `/yuphas/icons/skills/${y}_bane.png` };
  if (ex(`/yuphas/icons/skills/${y}-flat.png`)) o.flat = `/yuphas/icons/skills/${y}-flat.png`;
  for (const k of Object.keys(o)) if (!ex(o[k])) o[k] = null;
  out.skills[`assets/skills/${ours}.webp`] = o;
}
const FAC = { 'Ribeira Winds': 'ribeira-winds', 'House Lamine': 'house-lamine', "Megaira's Beacon": 'megairas-beacon', 'Rose Tempest': 'rose-tempest' };
for (const [ko, s] of Object.entries(lordSlug)) { const f = D.characters.find((c) => c.name === names.people[ko].en).faction; out.emblems[`assets/design/emblems/${s}.webp`] = { faction: f, yuphas: `/yuphas/emblems/${FAC[f]}.webp`, note: '우리 그림은 닌텐도 공식 클랜 문장(글자 포함), yuphastemple 그림은 게임 안 소속 문장' }; }
const ls = (d) => fs.readdirSync(path.join(REPO, 'public/yuphas', d)).map((f) => `/yuphas/${d}/${f}`);
out.extra = { emblems: ls('emblems'), mounts: ls('mounts'), meals: ls('meals'), artIcons: ls('icons/arts'), itemTypeIcons: ls('icons/items'), uiIcons: ls('icons/ui'),
  note: '지금 우리에게 맞는 그림이 없는 새 그림(탈것·음식·기술 종류·선물 반응 머리 등)' };
fs.writeFileSync(`${REPO}/content/data/yuphas-images.json`, JSON.stringify(out, null, 2) + '\n');
console.log('portraits', Object.keys(out.portraits).length, 'items', Object.keys(out.items).length, 'with picture', pic, 'classes', Object.keys(out.classes).length, 'skills', Object.keys(out.skills).length, 'noReplacement', out.noReplacement.length);
console.log('class missing:', Object.entries(out.classes).filter(([, v]) => !v.female && !v.male).map(([k]) => k));
