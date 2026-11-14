// 4판·5판에서 글자만 덮어쓴 행동 중 원본에 위치 버튼·병종 그림이 있던 것은
// 덮어쓰기를 지우고 원본 HTML 안 문구를 바꿔 버튼·그림을 살린다.
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const rcRaw = readFileSync('content/source/react-content.json', 'utf8'), rc = JSON.parse(rcRaw);
const ovRaw = readFileSync('content/display-overrides.json', 'utf8'), ov = JSON.parse(ovRaw);
const pb = JSON.parse(readFileSync('content/data/playbook.json', 'utf8'));
const fail = m => { throw new Error(m); };
const bow = n => `<button aria-haspopup="dialog" class="recruit-material-button" data-recruit-material="iron-bow" data-reference-doc="true" data-reference-url="notes/recruitment/iron-bow.html" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" viewbox="0 0 24 24"><path d="M7 6V4h10v2M5 8h14l1 13H4L5 8zM9 8v4h6V8"></path></svg><span>${n}</span><small class="recruit-material-hint">위치</small></button>`;
const sword = '<strong class="item-token">선더 소드</strong>';
const renown = n => `<span class="number-token renown-token renown-req">명성 ${n}</span>`;
const support = n => `<span class="number-token support-token support-req">지원 ${n}</span>`;
const classTok = (html, id) => html.match(new RegExp(`<span class="class-token" data-class="${id}">.*?</span></span>`, 's'))?.[0] || fail('class ' + id);
const plain = h => h.replace(/<[^>]+>/g, '');
const edits = {
  'theo-recruit-nujo--join': () => `12장에 누조가 활동 명단에 있는지 확인한다. <br class="copy-break"/>${renown(6)}·세오도라와 ${support(1)}·${bow('철의 활 3개')}를 갖추고, 지참품에 ${sword}가 있는지 본 뒤 스카우트해 합류를 확인한다. <br class="copy-break"/>다른 루트의 ${bow('철의 활')} 수량을 가져오지 않는다.`,
  'di-23--d20bb24be0': () => `디트리히 누조용 ${bow('철의 활 2개')}를 준비한다.`,
  'di-24--584da4ce13': () => `누조는 디트리히 기준 ${renown(9)}·${support(1)}·${bow('철의 활 2개')}를 준비합니다.`,
  'prep-mount-recruits--ea4768f4f8': old => `알렉산드라는 비탑승 중급인 ${classTok(old, '검사')} 등을 사용합니다.`,
  'leda-13--f374f0481c': old => `알렉산드라 전용 탈것 보관, 레다 <strong class="item-token">칼라의 활</strong>·${classTok(old, '무희')}, 두 자루 검, 회복 도구를 점검한다.`,
  'leda-first-store-then-play-20261108--3': old => `같은 레다 2부 1장을 다시 시작 · 알렉산드라의 ${classTok(old, '천익병')}과 전용 탈것 장착 후 6장까지 직접 진행 · 이 직접 완료에서 장착 자료 등록`,
};
const log = [];
for (const [id, make] of Object.entries(edits)) {
  let hit = 0;
  for (const s of rc.stages) for (const b of s.blocks) {
    const re = new RegExp(`(<input aria-label=")[^"]*("[^>]*data-task-id="${id}"[^>]*/>(?:(?!</li>).)*?<span class="action-text">)((?:(?!</li>).)*)(</span></div></li>)`, 's');
    const m = b.html.match(re); if (!m) continue;
    const text = make(m[3]); hit++;
    b.html = b.html.replace(re, (_, a, c, __, e) => a + plain(text).replace(/"/g, '&quot;') + c + text + e);
    const act = pb.groups.flatMap(g => g.actions).find(a => a.id === id); if (act && act.text) act.text = plain(text);
  }
  if (hit !== 1) fail(`${id} 일치 ${hit}`);
  if (!(id in ov.actions)) fail('override ' + id); delete ov.actions[id]; log.push('원본 문구로 옮김 ' + id);
}
writeFileSync('content/source/react-content.json', JSON.stringify(rc) + (rcRaw.endsWith('\n') ? '\n' : ''));
writeFileSync('content/display-overrides.json', JSON.stringify(ov, null, 2) + (ovRaw.endsWith('\n') ? '\n' : ''));
writeFileSync('content/data/playbook.json', JSON.stringify(pb, null, 2) + '\n');
console.log(log.join('\n'));
