// Fable 검토 23 후속(한 번만 실행): 메모·병종 그림이 있는 줄을 덮어쓰기로 바꿔 그림 수 검사가 실패했다(2026-11-28).
// 메모 덮어쓰기(di-01·di-11·di-26·war-di-play)와 천익병 그림이 있는 행동 3개를 원본 HTML 수정으로 되돌린다.
import { readFileSync, writeFileSync } from 'node:fs';
const raw = {}; const load = p => { raw[p] = readFileSync(p, 'utf8'); return JSON.parse(raw[p]); };
const W = (p, v) => { const r = raw[p]; const nl = r.includes('\r\n') ? '\r\n' : '\n'; const ind = /^[[{]\r?\n/.test(r) ? 2 : 0; writeFileSync(p, JSON.stringify(v, null, ind).replace(/\n/g, nl) + (/\r?\n$/.test(r) ? nl : '')); };
const PB = 'content/data/playbook.json', RC = 'content/source/react-content.json', OV = 'content/display-overrides.json';
const pb = load(PB), rc = load(RC), ov = load(OV);
const fail = m => { throw new Error(m); };
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const log = [];
const block = id => rc.stages.flatMap(s => s.blocks).find(b => b.id === id) || fail('block ' + id);
const group = id => pb.groups.find(g => g.id === id) || fail('group ' + id);

// 1. 메모: 덮어쓰기 대신 원본 메모·HTML을 고친다. 드래군 메모는 병종 그림이 있어 남긴다.
const plain = h => h.replace(/<br class="copy-break"\/>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, '');
const noteEdits = {
  'di-01': [['디트리히 2부를 먼저 스킵하지 않는다.', '새 1부를 끝내기 전에는 2부를 다시 시작하지 않는다.']],
  'di-11': [['알렉산드라는 전용 페가수스 보관판이므로 상급 시험에 합격시키지 않는다.', null]],
  'di-26': [['상급 합격자는 이 방법의 비행판 자동 승급 주의를 별도로 확인해야 합니다.', null], ['비탑승 전환은 첫 보관 절차에서만 합니다. 평소에는 원래의 전투 병종으로 돌아옵니다.', null]],
  'war-di-play': [['이오를 기병, 알렉산드라를 천익병으로 되돌린 뒤 직접 플레이합니다.', '이오가 기병, 알렉산드라가 천익병인지 확인하고 직접 플레이합니다.']],
};
for (const [gid, edits] of Object.entries(noteEdits)) {
  const g = group(gid), b = block(gid), ul = b.html.match(/<ul class="chapter-cautions">[\s\S]*?<\/ul>/) || fail('ul ' + gid);
  let lis = [...ul[0].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1]);
  for (const [from, to] of edits) {
    const n = g.notes.find(x => x.text === from) || fail(`note ${gid}: ${from.slice(0, 15)}`);
    const li = lis.find(h => plain(h) === from.replace(/\s/g, '')) || fail(`li ${gid}: ${from.slice(0, 15)}`); if (/<img/.test(li)) fail('그림 메모 ' + gid);
    if (to) { lis = lis.map(h => h === li ? esc(to) : h); n.text = to; } else { lis = lis.filter(h => h !== li); g.notes = g.notes.filter(x => x !== n); }
  }
  b.html = b.html.replace(ul[0], `<ul class="chapter-cautions">${lis.map(h => `<li>${h}</li>`).join('')}</ul>`);
  delete ov.notes[gid]; log.push('메모 원본 ' + gid);
}

// 2. 천익병 그림이 있는 행동 3개
const T = '디트리히 루트는 보관용 준비가 필요 없다. 알렉산드라는 ', S = ' 등 전투 병종으로 키운다.';
for (const id of ['di-08--f0187602fe', 'recruit-dietrich-alexandra--hold-advanced', 'war-di-play--b6f5c789f0']) {
  const a = pb.groups.flatMap(g => g.actions).find(x => x.id === id) || fail(id);
  const b = rc.stages.flatMap(s => s.blocks).find(x => x.html.includes(`data-task-id="${id}"`));
  const s = b.html.lastIndexOf('<li', b.html.indexOf(`data-task-id="${id}"`)), e = b.html.indexOf('</li>', s), item = b.html.slice(s, e);
  const token = item.match(/<span class="class-token" data-class="천익병">[\s\S]*?<\/small><\/span><\/span>/) || fail('token ' + id);
  const text = T + '천익병' + S;
  let next = item.replace(/aria-label="[^"]*"/, `aria-label="${esc(text)}"`).replace(/<span class="action-text">[\s\S]*$/, `<span class="action-text">${esc(T)}${token[0]}${esc(S)}</span></div>`);
  b.html = b.html.slice(0, s) + next + b.html.slice(e); a.text = text; delete ov.actions[id]; log.push('천익병 원본 ' + id);
}

W(PB, pb); W(RC, rc); W(OV, ov);
console.log(log.join('\n'));
