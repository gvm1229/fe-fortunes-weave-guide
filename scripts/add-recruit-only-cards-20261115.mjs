// 2026-11-15 사용자 지시: 카드가 없던 지원 대화용 영입 13명(18개 루트 카드)에 인물 카드·서랍과 싼 선물을 단다.
// 1) content/data/affordable-gifts.json: 12명 싼 선물(yuphastemple 인물 페이지의 매우 좋아함·좋아함 중 500G 이하, 가격·id 순 6개.
//    이전 tools/collect_affordable_gifts.py와 같은 규칙). 같은 물품도 인물마다 반응이 달라 reactions를 따로 둔다.
// 2) content/data/recruit-only-cards.json: 할 일 목록에서 영입하는 루트·장, 그 루트에서 보는 지원 대화(루트별 지원 대화 문서 표).
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const load = p => { const raw = readFileSync(p, 'utf8'); return { p, raw, j: JSON.parse(raw) }; };
const save = ({ p, raw, j }) => { const nl = raw.includes('\r\n') ? '\r\n' : '\n', ind = raw.match(/\n( +)"/)?.[1].length || 2; writeFileSync(p, JSON.stringify(j, null, ind).replace(/\n/g, nl) + (raw.endsWith('\n') ? nl : '')); };
const fail = m => { throw new Error(m); };

// yuphastemple 인물 페이지(2026-11-15 읽음). 값: [id, 반응, 가격(locations.json MAP_ITEMS)]
const L = '매우 좋아함', K = '좋아함';
const picks = {
  자코네: ['zarcone', [['odd-vegetable-seeds', L], ['history-of-a-master', L], ['pickled-bulbs', K], ['pickled-vegetables', K], ['potted-vegetables', K], ['protection-figurine', K]]],
  누디누: ['nydine', [['history-of-a-master', L], ['kitten-figurine', K], ['saraminian-sweets', K], ['sharp-fishhook', K], ['pastry-cookbook', K], ['protection-figurine', K]]],
  대도: ['dadao', [['coffee-pastries', K], ['fragrant-pastries', K], ['honey-pastries', K], ['mellow-pastries', K], ['simple-pastries', K], ['jamel-milk', K]]],
  나타: ['nezha', [['odd-vegetable-seeds', L], ['history-of-a-master', L], ['pickled-bulbs', K], ['pickled-vegetables', K], ['potted-vegetables', K], ['protection-figurine', K]]],
  디에고: ['diego', [['history-of-a-master', L], ['crimson-ghosh', K], ['protection-figurine', K], ['school-scandal', K], ['antique-medal', K], ['bow-repair-kit', K]]],
  키로이카: ['kiroc', [['coffee-pastries', K], ['rare-southern-seeds', K], ['young-ghosh', K], ['brined-fish-guts', K], ['common-coffee', K], ['history-of-a-master', L]]],
  골라이어스: ['goliath', [['young-ghosh', K], ['brined-fish-guts', K], ['history-of-a-master', L], ['light-shosh', K], ['mature-ghosh', K], ['meaty-delicacy', K]]],
  양계: ['yang-jie', [['coffee-pastries', K], ['young-ghosh', K], ['brined-fish-guts', K], ['common-coffee', K], ['history-of-a-master', L], ['kitten-figurine', K]]],
  밴디츠: ['benditz', [['coffee-pastries', K], ['common-coffee', K], ['history-of-a-master', L], ['select-coffee', K], ['orgus-coffee', K], ['southern-coffee', K]]],
  시몬: ['simon', [['odd-vegetable-seeds', K], ['history-of-a-master', L], ['pickled-bulbs', K], ['pickled-vegetables', K], ['sharp-fishhook', K], ['crimson-ghosh', K]]],
  마지데: ['majide', [['young-ghosh', K], ['brined-fish-guts', K], ['history-of-a-master', L], ['light-shosh', K], ['mature-ghosh', K], ['meaty-delicacy', K]]],
  페페: ['peppe', [['coffee-pastries', K], ['odd-vegetable-seeds', L], ['rare-southern-seeds', L], ['brined-fish-guts', K], ['common-coffee', K], ['history-of-a-master', L]]],
};
// 기존 목록에 없던 물품(그림은 내려받지 못해 없음).
const newItems = {
  'pickled-vegetables': ['Pickled Vegetables', '채소 병절임', 100, 'https://fire-emblem-fortunes-weave.turam.dev/ko/entry/sofia/'],
  'potted-vegetables': ['Potted Vegetables', '화분 채소', 200, 'https://fire-emblem-fortunes-weave.turam.dev/ko/entry/halvin/'],
  'saraminian-sweets': ['Saraminian Sweets', '살라미스 과자', 100, 'https://fire-emblem-fortunes-weave.turam.dev/ko/entry/halvin/'],
  'meaty-delicacy': ['Meaty Delicacy', '짐승고기와 모래벌레 진미', 100, 'https://fire-emblem-fortunes-weave.turam.dev/ko/entry/goliath/'],
};
const G = load('content/data/affordable-gifts.json');
for (const [id, [english, korean, cost, koreanSource]] of Object.entries(newItems)) if (!G.j.items[id]) G.j.items[id] = { id, english, reaction: K, url: `https://yuphastemple.com/?item=${id}`, korean, koreanSource, cost, priceSource: 'https://yuphastemple.com/data/locations.json' };
for (const [name, [slug, list]] of Object.entries(picks)) {
  for (const [id] of list) if (!G.j.items[id]) fail('물품 없음 ' + id);
  G.j.people[name] = { cheap: list.map(([id]) => id), reactions: Object.fromEntries(list.map(([id, r]) => [id, r])), owned: [], categoryNote: '아래는 실제 선호가 확인된 물품 · 영입 요구품과 별개', source: `https://yuphastemple.com/${slug}/` };
}
save(G);

// 2) 카드 목록
const names = ['자코네', '누디누', '대도', '나타', '디에고', '자스민', '키로이카', '골라이어스', '양계', '밴디츠', '시몬', '마지데', '페페'];
for (const n of names) if (!G.j.people[n]?.cheap?.length) fail('선물 없음 ' + n);
const ck = JSON.parse(readFileSync('content/derived/checklist.json', 'utf8')), pb = JSON.parse(readFileSync('content/data/playbook.json', 'utf8'));
const groups = new Map(pb.groups.map(g => [g.id, g]));
const rc = JSON.parse(readFileSync('content/source/react-content.json', 'utf8')), have = new Set(rc.people.map(p => p.route + ':' + p.name));
const doc = readFileSync('content/notes/support-pairs-by-route.md', 'utf8');
const routeKo = { theodora: '세오도라', leda: '레다', dietrich: '디트리히', cai: '카이' };
const cards = [];
for (const route of Object.keys(routeKo)) {
  const st = ck.stages.find(s => s.id === `${route}-plan`) || fail(route);
  for (const name of names) {
    if (have.has(route + ':' + name)) fail('이미 카드 ' + route + name);
    const re = new RegExp(`${name}[^가-힣]{0,3}(영입|스카우트)|(영입|스카우트)[^。]{0,8}${name}`);
    const chapters = st.chapters.filter(c => c.blocks.some(b => { const g = groups.get(b.id); return g && re.test(g.title + ' ' + g.actions.map(a => a.text).join(' ')); })).map(c => c.title);
    if (!chapters.length) continue;
    // 루트별 지원 대화 표: 첫 칸이 이 루트, 대화 칸에 이 인물.
    const pairs = doc.split('\n').map(l => l.trim()).filter(l => l.startsWith(`| ${routeKo[route]} |`)).map(l => l.split('|')[2].trim()).filter(p => p.split('–').includes(name));
    // 3부 대화: 「3부에서만 보는 대화」 표(첫 칸이 대화)와 「3부에서도 시작할 수 있는 대화」 목록.
    const sec = t => doc.split(/^## /m).find(x => x.startsWith(t)) || fail('절 ' + t);
    const only3 = sec('3부에서만 보는 대화').split('\n').filter(l => l.trim().startsWith('|')).map(l => l.split('|')[1].trim());
    const any3 = sec('3부에서도 시작할 수 있는 대화').split(/[,\n.]/).map(x => x.trim());
    const pairs3 = [...new Set([...only3, ...any3].filter(p => p.split('–').includes(name)))];
    cards.push({ route, name, chapter: chapters[0], pairs: [...new Set(pairs)], pairs3 });
  }
}
const want = { theodora: 6, leda: 3, dietrich: 5, cai: 4 };
for (const [r, n] of Object.entries(want)) if (cards.filter(c => c.route === r).length !== n) fail(`${r} 카드 ${cards.filter(c => c.route === r).length}개(기대 ${n})`);
if (new Set(cards.map(c => c.name)).size !== 13) fail('13명 아님');
writeFileSync('content/data/recruit-only-cards.json', JSON.stringify({ date: '2026-11-15', note: '카드가 없던 지원 대화용 영입 동료. scripts/add-recruit-only-cards-20261115.mjs가 만든다.', cards }, null, 2) + '\n');
console.log(cards.map(c => `${c.route} ${c.name} ${c.chapter} [${c.pairs.join(', ')}]`).join('\n'));
