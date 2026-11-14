// 검토 7 M2·M3·M4·L1·L2·L6·L7: 남은 누조 훈련 후보·이오 흔적·레다 철의 활 장·조사·위치 버튼.
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const load = p => { const raw = readFileSync(p, 'utf8'); return { raw, j: JSON.parse(raw) }; };
const save = (p, { raw, j }, ind) => { const nl = raw.includes('\r\n') ? '\r\n' : '\n'; writeFileSync(p, JSON.stringify(j, null, ind).replace(/\n/g, nl) + (raw.endsWith('\n') ? nl : '')); };
const RC = load('content/source/react-content.json'), DP = load('content/display-parity.json'), OV = load('content/display-overrides.json'), PB = load('content/data/playbook.json'), CG = load('content/data/chapter-gold.json');
const rc = RC.j, dp = DP.j, ov = OV.j, pb = PB.j, cg = CG.j;
const fail = m => { throw new Error(m); };
const log = [];
const stage = id => rc.stages.find(s => s.id === id) || fail('stage ' + id);
const block = (st, id) => stage(st).blocks.find(b => b.id === id) || fail('block ' + id);
const text = n => typeof n === 'string' ? n : n.children.map(text).join('');
const action = id => pb.groups.flatMap(g => g.actions).find(a => a.id === id) || fail('action ' + id);

// M2: 카이 훈련 표·2부 머리글의 누조 (12장 영입만, 훈련 없음)
const nujoSpan = /<span class="training-person">(?:<img[^>]*\/>)?<b>누조<\/b><\/span>\s?/g;
for (const st of ['cai-plan', 'cai-war-plan']) for (const b of stage(st).blocks) {
  const n0 = b.html; b.html = b.html.replace(nujoSpan, '');
  if (st === 'cai-war-plan' && b.id === 'team-cai-war') b.html = b.html.replace(/<a class="task-person" href="#person-cai-nuzzuo">(?:<img[^>]*\/>)?<b>누조<\/b><\/a>/g, '');
  if (b.html !== n0) log.push('누조 훈련 후보 제거 ' + st + ' ' + (b.id || '머리글'));
}
// 머리글 트리 사본(카이 1·2부)
const dropPerson = (name, node) => { if (typeof node === 'string') return node; node.children = node.children.filter(c => !(typeof c !== 'string' && c.tag === 'span' && c.children.some(x => typeof x !== 'string' && x.tag === 'b' && text(x) === name) && c.children.length <= 2)).map(c => dropPerson(name, c)); return node; };
for (const st of ['cai-plan', 'cai-war-plan']) { const b = dp.stages.find(s => s.id === st).blocks.find(b => b.id === ''); const n0 = JSON.stringify(b.tree); b.tree = b.tree.map(c => dropPerson('누조', c)); if (JSON.stringify(b.tree) !== n0) log.push('머리글 사본 누조 제거 ' + st); }

// M3: 세오도라·레다의 이오 글·묶음 머리 얼굴
{ const b = block('theodora-plan', 'theo-03'); const n0 = b.html;
  b.html = b.html.replace('루루디아·이오의 부족한 지원만', '루루디아의 부족한 지원만').replace('현재 여섯 명의 지원', '현재 다섯 명의 지원')
    .replace('<li>이오의 <span class="number-token support-token support-req">지원 3</span>도 이후에 필요하므로 관계를 열어 두고, 리네·단테 조건을 채운 뒤 식사 자리를 넘깁니다.</li>', '<li>리네·단테 조건을 채운 뒤 식사 자리를 넘깁니다.</li>');
  if (b.html === n0 || /<b>이오<\/b>/.test(b.html)) fail('theo-03 이오 ' + (b.html.match(/.{0,120}<b>이오<\/b>.{0,80}/s)?.[0] || '변화 없음')); log.push('theo-03 이오 글 제거'); }
const ioHead = /<(span|a) class="task-person"[^>]*>(?:<img[^>]*alt="이오 초상화"[^>]*\/>)<b>이오<\/b><\/\1>/g;
for (const [st, id] of [['leda-plan', 'leda-05'], ['leda-plan', 'leda-13'], ['theodora-war-plan', 'sequential-theodora-war06-preserve-20261108'], ['theodora-war-plan', 'sequential-theodora-register-20261108'], ['leda-war-plan', 'war-leda-first'], ['leda-war-plan', 'sequential-leda-war06-preserve-20261108'], ['leda-war-plan', 'war-clear-record']]) {
  const b = block(st, id), n0 = b.html; b.html = b.html.replace(ioHead, ''); if (b.html === n0) fail('머리 얼굴 이오 없음 ' + id);
  const g = pb.groups.find(g => g.id === id); if (g?.people) g.people = g.people.filter(n => n !== '이오'); log.push('머리 얼굴 이오 제거 ' + id);
}

// M3 골드: 이오가 빠져 알렉산드라 비탑승 중급 자격만(증서 1장 500G)
const fmt = n => n.toLocaleString('en-US') + 'G';
const goldBlocks = (route, chapter) => { const id = `gold-${route}-${chapter}`; return { id, b: block(route + '-plan', id), db: dp.stages.find(s => s.id === route + '-plan').blocks.find(x => x.id === id) || fail('dp ' + id), ch: cg.routes[route].find(c => c.chapter === chapter) }; };
const setHead = (g, T, A) => {
  g.b.html = g.b.html.replace(`최소 <span class="number-token money-token">${fmt(T)}</span>`, `최소 <span class="number-token money-token">${fmt(g.ch.target)}</span>`).replace(`마치면 <span class="number-token money-token">${fmt(A)}</span>`, `마치면 <span class="number-token money-token">${fmt(g.ch.afterScheduledSpend)}</span>`);
  let s = JSON.stringify(g.db.tree); s = s.replace(`"지출 전 권장 최소 ",{"tag":"span","attrs":{},"children":["${fmt(T)}"]}`, `"지출 전 권장 최소 ",{"tag":"span","attrs":{},"children":["${fmt(g.ch.target)}"]}`).replace(`"아래 이번 장 지출을 마치면 ",{"tag":"span","attrs":{},"children":["${fmt(A)}"]}`, `"아래 이번 장 지출을 마치면 ",{"tag":"span","attrs":{},"children":["${fmt(g.ch.afterScheduledSpend)}"]}`); g.db.tree = JSON.parse(s);
};
const must = (s, a, b) => { if (!s.includes(a)) fail('없음: ' + a.slice(0, 120)); return s.replace(a, b); };
const ioBadgeHtml = /·<span class="inline-person"><img alt="" height="26" loading="lazy" src="assets\/portraits\/c35\.webp" width="22"\/><span>이오<\/span><\/span>/;
const ioBadgeTree = '"·",{"tag":"span","attrs":{},"children":[{"tag":"img","attrs":{"alt":"","src":"assets/portraits/c35.webp"},"children":[]},{"tag":"span","attrs":{},"children":["이오"]}]}';
{ // 레다 12장: 이번 장 항목 1,000G → 500G, 목표 6,000 → 5,500G
  const g = goldBlocks('leda', 12), it = g.ch.items.find(i => i.label === '알렉산드라·이오 비탑승 중급 자격용') || fail('leda12 item');
  const T = g.ch.target, A = g.ch.afterScheduledSpend;
  Object.assign(it, { label: '알렉산드라 비탑승 중급 자격용', amount: 500, count: 1, note: '중급 증서1장 기준. 이미 가진 자격은 무료 변경.' }); g.ch.target -= 500;
  g.b.html = g.b.html.replace(/<tr>(?:(?!<\/tr>).)*c35\.webp(?:(?!<\/tr>).)*<\/tr>/s, tr => { let t = tr.replace(ioBadgeHtml, ''); t = must(t, '중급 증서 2장 기준', '중급 증서 1장 기준'); t = t.replace(/ 이오가 상급 자격까지 가졌다면 같은 등급 비탑승용으로 <span class="number-token money-token">2,500G<\/span> 추가\./, ''); t = must(t, '<td><span class="number-token money-token">1,000G</span></td>', '<td><span class="number-token money-token">500G</span></td>'); return t; });
  const walk = n => { if (typeof n === 'string') return n; if (n.tag === 'tr' && JSON.stringify(n).includes(ioBadgeTree)) { let t = JSON.stringify(n); t = must(t, ioBadgeTree + ',', ''); t = must(t, '"중급 증서 2장 기준. 이미 가진 자격은 무료 변경. 이오가 상급 자격까지 가졌다면 같은 등급 비탑승용으로 ",{"tag":"span","attrs":{},"children":["2,500G"]}," 추가."', '"중급 증서 1장 기준. 이미 가진 자격은 무료 변경."'); t = must(t, '["1,000G"]', '["500G"]'); return JSON.parse(t); } n.children = n.children.map(walk); return n; };
  g.db.tree = g.db.tree.map(walk); setHead(g, T, A);
  log.push(`gold-leda-12 알렉산드라만 500G (최소 ${fmt(T)}→${fmt(g.ch.target)}, 지출 뒤 ${fmt(A)}→${fmt(g.ch.afterScheduledSpend)})`);
}
{ // 세오도라 12장: 추가 줄 +1,000G → +500G (목표 밖)
  const g = goldBlocks('theodora', 12), ex = g.ch.extras.find(e => e.label === '실제 명성4 뒤 · 알렉산드라·이오 비탑승 중급 자격용') || fail('theo12 extra');
  Object.assign(ex, { label: '실제 명성4 뒤 · 알렉산드라 비탑승 중급 자격용', amount: 500 });
  g.b.html = g.b.html.replace(/<li>(?:(?!<\/li>).)*c35\.webp(?:(?!<\/li>).)*<\/li>/s, li => must(li.replace(ioBadgeHtml, ''), '+<span class="number-token money-token">1,000G</span>', '+<span class="number-token money-token">500G</span>'));
  const walk = n => { if (typeof n === 'string') return n; if (n.tag === 'li' && JSON.stringify(n).includes(ioBadgeTree)) { let t = must(JSON.stringify(n), ioBadgeTree + ',', ''); t = must(t, '["1,000G"]', '["500G"]'); return JSON.parse(t); } n.children = n.children.map(walk); return n; };
  g.db.tree = g.db.tree.map(walk); log.push('gold-theodora-12 추가 줄 알렉산드라만 +500G');
}
for (const [r, c] of [['leda', 12], ['theodora', 12]]) { const g = goldBlocks(r, c); if (/이오/.test(g.b.html.replace(/<[^>]+>/g, '')) || /이오/.test(JSON.stringify(g.db.tree)) || /이오/.test(JSON.stringify(g.ch))) fail(g.id + ' 이오 남음'); }

// M4: 레다 누조 철의 활은 11장에 산다(12장에 사면 장 다시 하기 회차마다 다시 산다). 12장 줄은 아직 없을 때만.
{ const g = goldBlocks('leda', 11), T = g.ch.target, A = g.ch.afterScheduledSpend;
  const note = 'Game8 다그시온 기본1,500G×3개 예산. 12장에 사면 장 다시 하기 때마다 다시 사야 하므로 11장에 산다. 이미 보유하면 제외.';
  const at = g.ch.items.findIndex(i => i.kind !== 'due'); g.ch.items.splice(at < 0 ? g.ch.items.length : at, 0, { label: '누조 영입용 철의 활 3개', amount: 4500, kind: 'due', note, unit: 1500, count: 3 }); g.ch.target += 4500;
  const rowHtml = `<tr><td><span class="gold-kind">이번 장</span><span class="gold-purpose">누조 영입용 <strong class="item-token">철의 활</strong> 3개</span><small class="gold-item-note">Game8 다그시온 기본 <span class="number-token money-token">1,500G</span>×3개 예산. 12장에 사면 장 다시 하기 때마다 다시 사야 하므로 11장에 산다. 이미 보유하면 제외.</small></td><td><span class="number-token money-token">4,500G</span></td></tr>`;
  g.b.html = must(g.b.html, '<tr><td><span class="gold-kind">추천 여유금</span>', rowHtml + '<tr><td><span class="gold-kind">추천 여유금</span>');
  const rowTree = { tag: 'tr', attrs: {}, children: [{ tag: 'td', attrs: {}, children: [{ tag: 'span', attrs: {}, children: ['이번 장'] }, { tag: 'span', attrs: {}, children: ['누조 영입용 ', { tag: 'strong', attrs: {}, children: ['철의 활'] }, ' 3개'] }, { tag: 'small', attrs: {}, children: ['Game8 다그시온 기본 ', { tag: 'span', attrs: {}, children: ['1,500G'] }, '×3개 예산. 12장에 사면 장 다시 하기 때마다 다시 사야 하므로 11장에 산다. 이미 보유하면 제외.'] }] }, { tag: 'td', attrs: {}, children: [{ tag: 'span', attrs: {}, children: ['4,500G'] }] }] };
  let done = false; const walk = n => { if (typeof n === 'string') return n; if (n.tag === 'tbody') { const i = n.children.findIndex(c => typeof c !== 'string' && text(c).startsWith('추천 여유금')); if (i >= 0) { n.children.splice(i, 0, rowTree); done = true; } } n.children = n.children.map(walk); return n; };
  g.db.tree = g.db.tree.map(walk); if (!done) fail('leda11 tbody'); setHead(g, T, A);
  log.push(`gold-leda-11 철의 활 4,500G 추가 (최소 ${fmt(T)}→${fmt(g.ch.target)}, 지출 뒤 ${fmt(A)}→${fmt(g.ch.afterScheduledSpend)})`);
}
// L2·M4: 레다·카이 누조 --need1 에 위치 버튼, 레다는 11장까지 산다
{ const btn = `<button aria-haspopup="dialog" class="recruit-material-button" data-recruit-material="iron-bow" data-reference-doc="true" data-reference-url="notes/recruitment/iron-bow.html" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" viewbox="0 0 24 24"><path d="M7 6V4h10v2M5 8h14l1 13H4L5 8zM9 8v4h6V8"></path></svg><span>철의 활 3개</span><small class="recruit-material-hint">위치</small></button>`;
  for (const [st, id, tail] of [['leda-plan', 'recruit-all-leda-nujo-20261114', ' 12장에 사면 장 다시 하기 때마다 다시 사야 하므로 11장까지 사 둔다.'], ['cai-plan', 'recruit-all-cai-nujo-20261114', '']]) {
    const b = block(st, id), aid = id + '--need1', plainOld = '영입 전에 준비한다: 철의 활 3개(다그시온 무기점·행상인).', plainNew = plainOld + tail;
    b.html = must(b.html, `aria-label="${plainOld}"`, `aria-label="${plainNew}"`);
    b.html = must(b.html, `<span class="action-text">${plainOld}</span>`, `<span class="action-text">영입 전에 준비한다: ${btn}(다그시온 무기점·행상인).${tail}</span>`);
    action(aid).text = plainNew; log.push('위치 버튼 ' + aid);
  }
}

// L1: 연회 장소으로 → 연회 장소로
for (const s of rc.stages) for (const b of s.blocks) if (b.html.includes('연회 장소으로')) { b.html = b.html.replaceAll('연회 장소으로', '연회 장소로'); log.push('조사 ' + b.id); }
for (const g of pb.groups) for (const a of g.actions) if (a.text?.includes('연회 장소으로')) a.text = a.text.replaceAll('연회 장소으로', '연회 장소로');
for (const k of Object.keys(ov.actions)) if (typeof ov.actions[k] === 'string' && ov.actions[k].includes('연회 장소으로')) { ov.actions[k] = ov.actions[k].replaceAll('연회 장소으로', '연회 장소로'); log.push('조사 덮어쓰기 ' + k); }

// L7: 명성6를 → 명성6을
for (const k of Object.keys(ov.actions)) if (typeof ov.actions[k] === 'string' && /명성\s?6를/.test(ov.actions[k])) { ov.actions[k] = ov.actions[k].replace(/명성(\s?)6를/g, '명성$16을'); log.push('조사 ' + k); }
for (const s of rc.stages) for (const b of s.blocks) if (/명성(?:<\/span>)?\s?6(?:<\/span>)?를/.test(b.html)) { b.html = b.html.replace(/(명성\s?6(?:<\/span>)?)를/g, '$1을'); log.push('조사 html ' + b.id); }

// L6: 플레이북 평문에 붙은 버튼·등급 글자 (덮어쓰기를 지운 6개)
for (const id of ['theo-recruit-nujo--join', 'di-23--d20bb24be0', 'di-24--584da4ce13', 'prep-mount-recruits--ea4768f4f8', 'leda-13--f374f0481c', 'leda-first-store-then-play-20261108--3']) {
  const a = action(id); const n0 = a.text;
  a.text = a.text.replace(/위치(?=[를을가이의 ])/g, '').replace(/(검사|무희|천익병)(?:중급직|상급직|하급직)/g, '$1').replace(/\s{2,}/g, ' ');
  if (a.text !== n0) log.push('평문 ' + id + ': ' + a.text);
}

save('content/source/react-content.json', RC, 0); save('content/display-parity.json', DP, 0); save('content/display-overrides.json', OV, 2); save('content/data/playbook.json', PB, 2); save('content/data/chapter-gold.json', CG, 2);
console.log(log.join('\n'));
