// 2026-11-15 사용자 결정: 출처가 한 곳뿐인 사실은 단계를 두고 "확인 안 됨"을 짧게 적는다.
// 누조의 선더 소드 지참(12장 영입) · 제스터–레다 C(레다 10장까지 명성10).
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const fail = m => { throw new Error(m); };
const ovRaw = readFileSync('content/display-overrides.json', 'utf8'), ov = JSON.parse(ovRaw);
const pbRaw = readFileSync('content/data/playbook.json', 'utf8'), pb = JSON.parse(pbRaw);
const rc = JSON.parse(readFileSync('content/source/react-content.json', 'utf8'));
const all = rc.stages.flatMap(s => s.blocks.map(b => b.html)).join('');
let html = false;
const add = (id, tail) => {
  const li = all.match(new RegExp(`data-task-id="${id}"(?:(?!</li>).)*</li>`, 's'))?.[0] || fail('li ' + id);
  const a = pb.groups.flatMap(g => g.actions).find(a => a.id === id) || fail(id);
  const base = ov.actions[id] || a.text; if (base.includes(tail)) return;
  if (/<button|<img/.test(li)) {
    // 버튼·그림이 있는 줄은 덮어쓰기 대신 원본 HTML 글 끝에 붙인다(덮어쓰기는 마크업을 버린다).
    if (ov.actions[id]) fail('덮어쓰기+마크업 ' + id);
    const end = li.lastIndexOf('</span></div></li>'); if (end < 0) fail('끝 ' + id);
    const li2 = li.slice(0, end) + ' ' + tail + li.slice(end);
    for (const st of rc.stages) for (const b of st.blocks) if (b.html.includes(li)) b.html = b.html.replace(li, li2);
    a.text = `${a.text} ${tail}`; html = true; return;
  }
  ov.actions[id] = a.text = `${base} ${tail}`;
};
const sword = '선더 소드 지참은 원래 공략 한 곳에서만 확인됐다. 지참품에 없으면 영입은 그대로 하고 선더 소드는 반다르 상회 교환으로 마련한다.';
for (const id of ['theo-recruit-nujo--join', 'recruit-all-leda-nujo-20261114--scout', 'recruit-all-cai-nujo-20261114--scout']) add(id, sword);
add('recruit-all-leda-jester-20261112--join', '이 C가 실제로 열렸다는 확인은 아직 없다(출처 한 곳).');
if (html) { const raw = readFileSync('content/source/react-content.json', 'utf8'); writeFileSync('content/source/react-content.json', JSON.stringify(rc) + (raw.endsWith('\n') ? '\n' : '')); }
writeFileSync('content/display-overrides.json', JSON.stringify(ov, null, 2) + (ovRaw.endsWith('\n') ? '\n' : ''));
writeFileSync('content/data/playbook.json', JSON.stringify(pb, null, 2) + (pbRaw.endsWith('\n') ? '\n' : ''));
console.log('확인 안 됨 안내 4곳');

// Fable 검토 11 L1: 누조 메모의 단정("선더 소드를 들고 온다")도 확인 안 됨으로 맞춘다. M1: 옮긴 진행 문서 링크는 글자만 남긴다.
{
  const files = ['content/source/react-content.json', 'content/data/playbook.json', 'content/display-overrides.json', 'content/display-parity.json'];
  const re = /(12장 무렵 영입하면 (?:<[^>]+>)*선더 소드(?:<[^>]+>)*를 들고 온다)\.(?!고)/g;
  let n = 0;
  for (const f of files) { const s = readFileSync(f, 'utf8'), t = s.replace(re, (m, a) => { n++; return `${a}고 한다(원래 공략 한 곳에서만 확인).`; }); if (t !== s) writeFileSync(f, t); }
  const docs = ['content/notes/knowledge/sources.md', 'content/notes/restart-review.md', 'content/notes/theodora-renown-review.md'];
  let l = 0;
  for (const f of docs) { const s = readFileSync(f, 'utf8'), t = s.replace(/\[([^\]]*)\]\([^)]*progress\.md[^)]*\)/g, (m, a) => { l++; return a; }); if (t !== s) writeFileSync(f, t); }
  console.log(`누조 메모 ${n} · 진행 문서 링크 ${l}`);
}
