// phase 3: download the images yuphastemple character pages, tabs and item popups use. Sequential, polite, cached.
import fs from 'node:fs';
import path from 'node:path';
import { SCR, REPO, Y, readJson, sleep, itemSlug } from './lib.mjs';

const D = Y('data.json').DATA;
const MAP_ITEMS = Y('locations.json').MAP_ITEMS;
const pictures = Y('pictures.json');
const idx = fs.readFileSync(`${SCR}/ydata/index.html`, 'utf8');
const CLASS_ICONS = JSON.parse(idx.match(/CLASS_ICONS\s*=\s*(\[[^\]]*\])/)[1]);
const app = fs.readFileSync(`${SCR}/ydata/app.js`, 'utf8');
const FACTIONS = [...new Set([...app.match(/const FACTION_SYMBOLS = \{([\s\S]*?)\};/)[1].matchAll(/:\s*'([a-z-]+)'/g)].map((m) => m[1]))];
const cand = readJson(`${SCR}/gen/candidates.json`);
const people = cand.filter((e) => e.group === 'people');
const pName = (n) => String(n).replace(/\s*\([^)]*\)\s*$/, '').replace(/ /g, '_');

const jobs = []; // { url, out, kind }
const add = (url, out, kind) => jobs.push({ url: 'https://yuphastemple.com/' + url, out: 'public/yuphas/' + out, kind });
for (const p of people) {
  const f = pName(p.yname); const s = p.slug;
  add(`images/characters/${encodeURIComponent(f)}.webp`, `portraits/${s}.webp`, 'portraits');
  add(`images/charactersthumb/${encodeURIComponent(f)}.webp`, `thumbs/${s}.webp`, 'thumbs');
  add(`images/faces/${encodeURIComponent(f)}.png`, `faces/${s}.png`, 'faces');
}
for (const f of FACTIONS) add(`images/factions/${f}.webp`, `emblems/${f}.webp`, 'emblems');
for (const sk of D.skills) {
  const b = sk.toLowerCase().replace(/ /g, '_');
  for (const v of ['', '_boon', '_bane']) add(`images/skills/${b + v === 'authority_bane' ? b + v : b + v + '-v2'}.png`, `icons/skills/${b}${v}.png`, 'skill-icons');
  add(`images/skills/${b}-flat.png`, `icons/skills/${b}-flat.png`, 'skill-icons');
}
for (const a of ['sword', 'spear', 'axe', 'bow', 'gauntlet', 'assist']) add(`images/arts/${a}-v2.png`, `icons/arts/${a}.png`, 'art-icons');
// class icons for every class in our name table (both body types where the site has them)
const ourClasses = new Set(cand.filter((e) => e.group === 'classes').map((e) => e.yname || e.candidateEn).filter(Boolean));
for (const ci of CLASS_ICONS) { const [g, file] = ci.split('/'); if (ourClasses.has(file.replace(/_/g, ' '))) add(`images/classicons/${g}/${encodeURIComponent(file)}.webp`, `classes/${g}/${file.toLowerCase().replace(/_/g, '-')}.webp`, 'class-icons'); }
// mounts: picture per mount + species thumb
for (const m of D.mounts) if (m.img) add(m.img, `mounts/${path.basename(m.img)}`, 'mounts');
for (const sp of [...new Set(D.mounts.map((m) => m.species))]) add(`images/mountsthumb/${encodeURIComponent(sp.replace(/\s+/g, '_'))}.png`, `mounts/species-${sp.toLowerCase().replace(/\s+/g, '-')}.png`, 'mounts');
// item pictures (popup) for every item in our name table that has one
const itemSlugs = new Set(cand.filter((e) => e.group === 'items' && e.slug).map((e) => e.slug));
for (const s of itemSlugs) if (pictures['map-items/' + s]) add(`images/map-items/${s}.webp`, `items/${s}.webp`, 'items');
// meals
for (const [n, v] of Object.entries(MAP_ITEMS)) if (v.type === 'Meal') add(v.img, `meals/${itemSlug(n)}.webp`, 'meals');
// type icons used by item rows and popups
const typeIcons = new Set();
for (const v of Object.values(MAP_ITEMS)) if (v.icon && v.icon.startsWith('images/items/')) typeIcons.add(v.icon);
for (const f of ['sword.webp', 'spear.webp', 'axe.webp', 'bow.webp', 'gauntlets.webp', 'black_magic.webp', 'white_magic.webp', 'ring.webp', 'shield.webp', 'staff.webp', 'mask.webp', 'crate.webp', 'battalion_physical.webp']) typeIcons.add('images/items/' + f);
for (const t of typeIcons) add(t, `icons/items/${path.basename(t)}`, 'item-type-icons');
for (const f of ['gifts/giftLoved.png', 'gifts/giftLiked.png', 'foodHeaders/great.png', 'foodHeaders/good.png', 'foodHeaders/bad.png']) add(`images/${f}`, `icons/ui/${f.replace('/', '-')}`, 'ui-icons');

const log = [];
let n = 0, bytes = 0;
for (const j of jobs) {
  const out = path.join(REPO, j.out);
  if (fs.existsSync(out)) { const sz = fs.statSync(out).size; bytes += sz; log.push({ ...j, status: 200, size: sz, cached: true }); continue; }
  const r = await fetch(j.url, { headers: { 'user-agent': 'Mozilla/5.0 (guide image sync; sequential)' } });
  const ct = r.headers.get('content-type') || '';
  if (r.ok && ct.startsWith('image/')) {
    const buf = Buffer.from(await r.arrayBuffer()); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf); bytes += buf.length; n++;
    log.push({ ...j, status: r.status, size: buf.length });
  } else { await r.arrayBuffer(); log.push({ ...j, status: r.status, ct }); }
  await sleep(250);
}
fs.writeFileSync(`${SCR}/gen/images-log.json`, JSON.stringify(log, null, 1));
const by = {}; for (const l of log) { by[l.kind] ||= { ok: 0, fail: 0, bytes: 0 }; if (l.size) { by[l.kind].ok++; by[l.kind].bytes += l.size; } else by[l.kind].fail++; }
console.log('downloaded', n, 'total bytes', bytes, by);
console.log('failed:', log.filter((l) => !l.size).map((l) => l.url + ' ' + l.status).join('\n'));
