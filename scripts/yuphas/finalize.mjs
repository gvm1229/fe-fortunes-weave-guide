// phase 4: write content/data/yuphas-names.json, content/data/yuphas-characters.json, docs/reference/name-review.md
import fs from 'node:fs';
import { SCR, REPO, Y, readJson, normEn, createSlug, itemSlug } from './lib.mjs';

const REVIEWED = '2026-11-27';
const SITE = 'https://yuphastemple.com';
const WIKI = 'https://fire-emblem-fortunes-weave.turam.dev';
const cand = readJson(`${SCR}/gen/candidates.json`);
const status = readJson(`${SCR}/gen/yuphas-status.json`);
const D = Y('data.json').DATA;
const GIFTS = Y('gifts.json').characterGifts;
const SUP = Y('supports.json');
const wikiDir = readJson(`${SCR}/kwiki/dir.json`);

const pageTemp = (slug) => {
  const f = `${SCR}/kwiki/pages/${slug}.html`; if (!fs.existsSync(f)) return null;
  const h = fs.readFileSync(f, 'utf8'); if (h.startsWith('HTTP ')) return null;
  return h.includes('한국어: 임시 표기');
};
const urlOf = (group, slug) => group === 'people' ? `/${slug}/` : group === 'places' ? `/map/${slug}/` : `/?item=${slug}`;

const out = { reviewed: REVIEWED, site: SITE, koWiki: `${WIKI}/ko/`,
  rules: {
    keys: '열쇠는 우리 글의 한국어 이름. enOnly는 한국어 이름이 없는 yuphastemple 이름(영어 열쇠)',
    koGrade: 'game = 사용자가 게임 화면에서 확인(content/notes 기록) · wiki = 한국어 도감 제목이 확정 표기 · wiki-temp = 도감이 "한국어: 임시 표기"라고 적음 · unverified = 도감에 같은 제목이 없거나 우리 표기와 다름(P09 미확인)',
    slug: '물품·병종: yuphastemple itemSlug(아포스트로피 삭제, + → plus, 악센트 제거, 영숫자 밖은 -) · 인물: createSlug · 장소: 지도 urlSlug(아포스트로피 삭제)',
    urls: `물품 ${SITE}/?item=<slug> · 인물 ${SITE}/<slug>/<탭>/ · 장소 ${SITE}/map/<slug>/ (루트·?q= 선택)`,
    linkVerified: `${REVIEWED}에 위 주소를 한 번씩 요청해 응답 200을 받은 것만 true`,
    candidate: 'candidate는 같은 것으로 보이지만 확인하지 못한 후보. 링크를 만들지 않는다(docs/reference/name-review.md)',
  },
  people: {}, items: {}, places: {}, classes: {}, enOnly: {} };

const review = [];
const enIndex = new Map();
for (const e of cand) {
  const temp = e.wikiSlug ? pageTemp(e.wikiSlug) : null;
  let ko = e.ko, koGrade, koSource = e.wikiSlug ? `${WIKI}/ko/entry/${e.wikiSlug}/` : undefined;
  if (!ko && e.wikiKo && e.wikiVia === 'en') ko = e.wikiKo; // name we only know from yuphas: Korean from the wiki
  if (e.gameConfirmed) koGrade = 'game';
  else if (ko && e.wikiKo && ko === e.wikiKo && temp !== null) koGrade = temp ? 'wiki-temp' : 'wiki';
  else koGrade = 'unverified';
  const en = e.slug ? e.yname : (e.en || null);
  const rec = { ko: ko || null, en, slug: e.slug || null, kind: e.kind || (e.ytype ? e.ytype.toLowerCase() : null), koGrade,
    linkVerified: !!(e.slug && status[urlOf(e.group, e.slug)] === 200) };
  if (koSource) rec.koSource = koSource;
  if (e.wikiKo && e.wikiKo !== ko) rec.wikiKo = e.wikiKo;
  if (e.en && e.slug && normEn(e.en) !== normEn(e.yname)) rec.enOurs = e.en;
  if (e.aliases?.length) rec.aliases = e.aliases;
  if (e.candidateSlug) rec.candidate = { en: e.candidateEn, slug: e.candidateSlug, status: status[urlOf(e.group, e.candidateSlug)] ?? null };
  if (e.manualNote) rec.note = e.manualNote;
  if (e.enFromWiki) rec.enSource = '한국어 도감 제목으로 찾은 영어 이름';
  rec.usedIn = e.srcs;
  const group = ko ? e.group : 'enOnly';
  const key = ko || en;
  out[group][key] = rec;
  if (en) enIndex.set(normEn(en), rec);
  // review rows
  let why = null;
  if (koGrade === 'wiki-temp') why = '도감이 "한국어: 임시 표기"라고 적음';
  else if (koGrade === 'unverified') {
    if (!ko) why = '한국어 이름 없음(도감에 이 항목이 없음)';
    else if (e.wikiKo && e.wikiKo !== ko) why = `우리 표기와 도감 제목(${e.wikiKo})이 다름`;
    else if (!e.wikiSlug) why = '도감에서 같은 제목을 찾지 못함';
    else why = '도감 쪽을 읽지 못함';
  }
  if (!rec.slug) why = (why ? why + ' · ' : '') + (rec.candidate ? `yuphastemple 링크 없음(후보 ${rec.candidate.en})` : 'yuphastemple에서 같은 이름을 찾지 못해 링크 없음');
  else if (!rec.linkVerified) why = (why ? why + ' · ' : '') + `주소 응답 ${status[urlOf(e.group, e.slug)]}`;
  if (rec.note) why += ` · ${rec.note}`;
  if (why) review.push({ group, ko: ko || '—', en: en || rec.candidate?.en || '—', kind: rec.kind, koGrade, usedIn: e.srcs, why, wikiTemp: koGrade === 'wiki-temp' });
}

// ---- characters ----
const nameOf = (en) => { const r = enIndex.get(normEn(en)); return { en, ko: r?.ko ?? null, slug: r?.slug ?? itemSlug(en) }; };
const classRef = (en) => { if (!en) return null; const r = Object.values(out.classes).find((c) => c.en === en); return { en, ko: r?.ko ?? null, slug: createSlug(en) }; };
const FACTION_FILES = Object.fromEntries([...fs.readFileSync(`${SCR}/ydata/app.js`, 'utf8').match(/const FACTION_SYMBOLS = \{([\s\S]*?)\};/)[1].matchAll(/(?:'([^']+)'|"([^"]+)"|([A-Za-z]+))\s*:\s*'([a-z-]+)'/g)].map((m) => [m[1] || m[2] || m[3], m[4]]));
const chars = { reviewed: REVIEWED, site: SITE,
  sources: [`${SITE}/data/data.json`, `${SITE}/data/gifts.json`, `${SITE}/data/supports.json`],
  note: '이름(en)은 yuphastemple 그대로. ko는 content/data/yuphas-names.json에서 찾은 값(없으면 null). 선물 숫자는 yuphastemple이 보이는 값 그대로.',
  characters: {} };
const pe = Object.values(out.people);
for (const p of pe) {
  const c = D.characters.find((x) => x.name === p.en); if (!c) continue;
  const g = GIFTS[p.en] || {}; const s = SUP.characterSupports[p.en] || {};
  const skills = Object.fromEntries(Object.entries(c.skills || {}).map(([k, v]) => [k, { rank: v.rank, ...(v.affinity ? { affinity: v.affinity } : {}) }]));
  const icon = (k, a) => `/yuphas/icons/skills/${k.toLowerCase().replace(/ /g, '_')}${a ? '_' + a.toLowerCase() : ''}.png`;
  const ff = FACTION_FILES[c.faction];
  chars.characters[p.ko] = {
    ko: p.ko, en: p.en, slug: p.slug, gender: c.gender, epithet: c.epithet || null,
    faction: c.faction ? { en: c.faction, emblem: ff ? `/yuphas/emblems/${ff}.webp` : null } : null,
    classes: { start: classRef(c.startClass), unique: classRef(c.uniqueClass), beginner: classRef(c.beginner), specialty: classRef(c.specialty), late: (c.lateClasses || []).map(classRef) },
    skills,
    boons: Object.entries(skills).filter(([, v]) => v.affinity === 'Boon').map(([k]) => ({ skill: k, icon: icon(k, 'boon') })),
    banes: Object.entries(skills).filter(([, v]) => v.affinity === 'Bane').map(([k]) => ({ skill: k, icon: icon(k, 'bane') })),
    gifts: (g.gifts || []).map((part) => ({ part: part.part,
      loved: (part.loved || []).map(([n, v]) => ({ ...nameOf(n), value: v })),
      liked: (part.liked || []).map(([n, v]) => ({ ...nameOf(n), value: v })),
      disliked: (part.disliked_gifts || []).map(nameOf), dislikedCategories: part.disliked_categories || [] })),
    meals: { loved: (g.loved_meals || []).map(nameOf), liked: (g.liked_meals || []).map(nameOf), neutral: (g.neutral_meals || []).map(nameOf), disliked: (g.disliked_meals || []).map(nameOf) },
    supports: Object.entries(s).map(([partner, v]) => { const pr = Object.values(out.people).find((x) => x.en === partner); const { paired, ...ranks } = v; return { partner: { en: partner, ko: pr?.ko ?? null, slug: createSlug(partner) }, ranks, ...(paired ? { paired: true } : {}) }; }),
    supportNotes: SUP.supportNotes[p.en] || [],
    links: { page: `${SITE}/${p.slug}/`, gifts: `${SITE}/${p.slug}/liked-gifts/`, supports: `${SITE}/${p.slug}/supports/` },
    images: { portrait: `/yuphas/portraits/${p.slug}.webp`, thumb: `/yuphas/thumbs/${p.slug}.webp`, face: `/yuphas/faces/${p.slug}.png` },
  };
}
// every gift/meal name in the character file must be in the name table
const missing = new Set(); for (const c of Object.values(chars.characters)) { for (const pt of c.gifts) for (const x of [...pt.loved, ...pt.liked]) if (!enIndex.has(normEn(x.en))) missing.add(x.en); for (const t of ['loved', 'liked']) for (const x of c.meals[t]) if (!enIndex.has(normEn(x.en))) missing.add(x.en); }

fs.writeFileSync(`${REPO}/content/data/yuphas-names.json`, JSON.stringify(out, null, 2) + '\n');
{ const { characters, ...head } = chars; const h = JSON.stringify(head, null, 2).replace(/\n}$/, '');
  fs.writeFileSync(`${REPO}/content/data/yuphas-characters.json`, h + ',\n  "characters": {\n' + Object.entries(characters).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n') + '\n  }\n}\n'); }
fs.writeFileSync(`${SCR}/gen/review.json`, JSON.stringify(review, null, 1));
const st = {}; for (const grp of ['people', 'items', 'places', 'classes', 'enOnly']) for (const r of Object.values(out[grp])) { const k = grp + ':' + r.kind; st[k] ||= { n: 0, linked: 0, verified: 0, game: 0, wiki: 0, temp: 0, unverified: 0 }; const x = st[k]; x.n++; if (r.slug) x.linked++; if (r.linkVerified) x.verified++; x[{ game: 'game', wiki: 'wiki', 'wiki-temp': 'temp', unverified: 'unverified' }[r.koGrade]]++; }
console.log(st);
console.log('characters', Object.keys(chars.characters).length, 'missing gift/meal names', [...missing]);
console.log('review rows', review.length, 'temp', review.filter((r) => r.wikiTemp).length);
