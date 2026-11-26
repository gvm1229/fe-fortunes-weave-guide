// 병종 고르기 창 자료 content/data/yuphas-classes.json을 만든다(2026-11-27 고침 F, 인물 육성 기록 U72).
// 원본: 작업 폴더의 yuphastemple data.json(DATA.classes·DATA.characters)과 app.js의 열 배치 표(CLASS_COLUMN). 손으로 고치지 않는다.
//   node scripts/yuphas/classes.mjs
// 병종은 60개: 고유 2(Commoner·Noble) + 초급 5 + 중급 12 + 상급 16 + 코끼리 1 + 최상급 16 + 신장직 8.
// 뺀 것: God(신 전용, 우리 인물 62명 중 쓰는 사람 없음)과 DLC 인물 전용 3부 병종 4개(Awakened·Badhbh Cath·Seere·Trickster).
// 그 사이트 창에서 직접 센 수(여성 59·남성 57)와 맞는다(docs/fixes-round-plan.md §A3).
import fs from 'node:fs';
import { REPO, Y, R, createSlug } from './lib.mjs';
const D = Y('data.json').DATA;
const names = R('content/data/yuphas-names.json').classes;
const ourCharacters = R('content/data/yuphas-characters.json').characters;
const koBySlug = new Map(Object.values(names).map((r) => [r.slug, r.ko]));
for (const c of Object.values(ourCharacters)) for (const k of ['start', 'unique']) { const x = c.classes[k]; if (x?.ko && !koBySlug.has(x.slug)) koBySlug.set(x.slug, x.ko); }
// app.js CLASS_COLUMN(그 사이트가 손으로 정한 열). 없으면 이동 규칙으로 정한다(app.js renderModalClasses).
const COLUMN = { Infantry: ['Dancer', 'War Monk', 'The Apsara', 'The Godhand', 'Blacksmith', 'High Savant', 'Seere'], Ranged: ['Bow Knight', 'Forest Knight'], Magic: ['Valkyrium', 'Troubadour'], Armor: ['Guardian', 'Sentinel', 'Orichaldia', 'The Cavalier', 'The Trident', 'Elephant Rider', 'Light Cavalry', 'Charioteer', 'Bardinger'] };
const fixed = new Map(Object.entries(COLUMN).flatMap(([col, list]) => list.map((n) => [n, col])));
const WEAPONS = ['Sword', 'Spear', 'Axe', 'Bow', 'Gauntlet', 'Black Magic', 'White Magic'];
const file = (s) => s.toLowerCase().replace(/ /g, '_');
const movement = (types) => { const out = []; if (types.includes('cavalry')) out.push('Riding'); else if (types.includes('flying')) out.push('Flying'); else if (types.includes('infantry')) out.push('Infantry'); if (types.includes('armored')) out.push('Armor'); return out; };
function column(c) {
  if (fixed.has(c.name)) return fixed.get(c.name);
  const m = movement(c.type || []);
  if (m[1]) return m[1];
  if (m[0] === 'Infantry' && ('Black Magic' in c.skills || 'White Magic' in c.skills)) return 'Magic';
  if (m[0] === 'Infantry' && 'Bow' in c.skills) return 'Ranged';
  return m[0] === 'Flying' ? 'Riding' : m[0];
}
const LICENSE = { 'N/A': 'default', Beginner: 'beginner', Specialty: 'specialty', Advanced: 'advanced', Elephant: 'elephant', Master: 'master', Divine: 'divine' };
const classes = D.classes.filter((c) => !c.dlc && c.name !== 'God').map((c) => {
  const types = c.type || [], slug = createSlug(c.name);
  // 이동 아이콘(scripts/yuphas/class-moves.mjs와 같은 규칙).
  const t = types.join(' '), moves = [/cavalry/.test(t) ? 'riding' : /flying/.test(t) ? 'flying' : 'infantry', ...(/armored/.test(t) ? ['armor'] : [])];
  return {
    slug, en: c.name, ko: koBySlug.get(slug) || null, license: LICENSE[c.license || 'N/A'],
    level: c.level ?? null, renown: c.renown ?? null, part3: c.note === 'Part 3 Unlock',
    column: column(c).toLowerCase(), ...(c.gender ? { gender: c.gender } : {}),
    // 못 타는 인물(Goliath·Orchel) 규칙: 그 사이트처럼 type에 cavalry·flying이 있는 병종을 뺀다(Fable 검토 4).
    mounted: types.includes('cavalry') || types.includes('flying'),
    moves, weapons: WEAPONS.filter((w) => w in (c.skills || {})).map(file),
  };
});
const licenses = [
  { id: 'default', en: 'Default', ko: '기본', level: null, renown: null },
  { id: 'beginner', en: 'Beginner', ko: '초급', level: 5, renown: 1 },
  { id: 'specialty', en: 'Specialty', ko: '중급', level: 20, renown: 4 },
  { id: 'advanced', en: 'Advanced', ko: '상급', level: 35, renown: 8 },
  { id: 'elephant', en: 'Elephant', ko: '코끼리', level: 35, renown: null, part3: true },
  { id: 'master', en: 'Master', ko: '최상급', level: 45, renown: null, part3: true },
  { id: 'divine', en: 'Divine', ko: '신장직', level: 45, renown: null, part3: true, single: true },
];
// 증서 값이 data.json 병종 값과 같은지(그 사이트 창 머리 글과 같은 계산: 묶음 안 모든 병종이 같은 값일 때만 머리에 보인다).
for (const l of licenses.filter((x) => x.id !== 'default')) { const rows = classes.filter((c) => c.license === l.id); for (const k of ['level', 'renown']) if (l[k] != null && !rows.every((c) => c[k] === l[k])) throw new Error(`증서 ${l.id} ${k} 값이 병종과 다릅니다`); }
const raw = new Map(D.characters.map((c) => [createSlug(c.name), c]));
const noRide = (c) => Object.values(c?.abilities || {}).flat().some((a) => /cannot change( class)? to cavalry or flying/i.test(a?.ef || ''));
const characters = Object.fromEntries(Object.values(ourCharacters).map((c) => [c.slug, { gender: c.gender, unique: c.classes.unique?.slug || 'commoner', ...(noRide(raw.get(c.slug)) ? { noRide: true } : {}) }]));
const out = { note: 'scripts/yuphas/classes.mjs가 yuphastemple data.json에서 만든 표. 고치지 말고 다시 만든다.', reviewed: '2026-11-27', site: 'https://yuphastemple.com', licenses, classes, characters };
fs.writeFileSync(`${REPO}/content/data/yuphas-classes.json`, JSON.stringify(out, null, 1) + '\n');
console.log('병종', classes.length, '· 인물', Object.keys(characters).length, '· 못 타는 인물', Object.entries(characters).filter(([, v]) => v.noRide).map(([k]) => k).join(','));
