// 검토 7 M3: 세오도라·레다 주간 준비 화면(prep 사본)의 이오 지원·선물·대기열. 이오는 디트리히·카이에서만 영입한다.
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const raw = readFileSync('content/display-parity.json', 'utf8'), dp = JSON.parse(raw);
const text = n => typeof n === 'string' ? n : n.children.map(text).join('');
const fail = m => { throw new Error(m); };
const log = [];
const isIo = c => typeof c !== 'string' && text(c) === '이오' && JSON.stringify(c).includes('c35.webp');
for (const route of ['theodora', 'leda']) {
  const secs = dp.prep.filter(s => s.attrs?.['data-weekly-route'] === route); if (!secs.length) fail('prep ' + route);
  for (const sec of secs) {
  const walk = n => {
    if (typeof n === 'string') return n;
    if (n.tag === 'li' && text(n).includes('이오')) {
      const kids = n.children;
      // 얼굴 줄: 이오 얼굴 빼기
      for (const c of kids) if (typeof c !== 'string' && c.tag === 'div') c.children = c.children.filter(x => !isIo(x));
      // 선물 줄: 이오 선물만 있으면 줄째 빼기
      n.children = kids.filter(c => !(typeof c !== 'string' && c.tag === 'div' && text(c).startsWith('첫 인연을 열 때만') && text(c).includes('이오') && !c.children.slice(1).some(x => typeof x !== 'string' && !text(x).includes('이오'))));
      // 설명 줄
      for (const c of n.children) if (typeof c !== 'string' && c.tag === 'p' && text(c).includes('이오')) {
        const t = text(c);
        if (t.startsWith('이오의 지원 3이 미달이면 준비 · 누조')) c.children = [c.children[4], ' ', { tag: 'span', attrs: {}, children: ['지원 1'] }, '을 12장 영입 전에 준비 · 이미 충분하면 이 자리는 다른 미달 대상 · 실제 영입 요구품/의뢰 확인'];
        else if (t.startsWith('사란 지원 3·이오 지원 1')) c.children.splice(3, 4);
        else fail('설명 줄 ' + t);
      }
      // 대기열 줄: 이오 지원 N 하나뿐이면 null 표시
      if (/^이오지원 \d$/.test(text(n))) return null;
      return n;
    }
    n.children = n.children.map(walk).filter(c => c !== null); return n;
  };
  sec.children = sec.children.map(walk).filter(c => c !== null);
  const left = text(sec).match(/.{0,40}이오.{0,40}/g); if (left) fail(route + ' 이오 남음: ' + left.join(' / '));
  log.push(route + ' 주간 준비 이오 제거'); }
}
writeFileSync('content/display-parity.json', JSON.stringify(dp) + (raw.endsWith('\n') ? '\n' : ''));
console.log(log.join('\n'));

// 같은 수정을 원본 HTML(react-content.json prep)에도 한다(verify-feature-parity 대조).
{
  const RC = JSON.parse(readFileSync('content/source/react-content.json', 'utf8')), rcRaw = readFileSync('content/source/react-content.json', 'utf8');
  const must = (s, a, b) => { if (!s.includes(a)) fail('prep html 없음: ' + a.slice(0, 100)); return s.replace(a, b); };
  const io = (h, w) => `<a class="weekly-person" href="#person-${w}-io"><img alt="" height="54" loading="lazy" src="assets/portraits/c35.webp" width="46"/><span>이오</span></a>`;
  const ioRead = '<span class="reading-person"><img alt="" height="33" loading="lazy" src="assets/portraits/c35.webp" width="28"/><b>이오</b></span>';
  let h = RC.prep;
  const seg = route => { let a = -1; for (;;) { a = h.indexOf(`data-weekly-route="${route}"`, a + 1); if (a < 0) fail('seg ' + route); const b0 = h.indexOf('data-weekly-route="', a + 20), b = b0 < 0 ? h.length : b0; if (h.slice(a, b).includes('c35.webp')) return [a, b]; } };
  { const [a, b] = seg('theodora'); let s = h.slice(a, b);
    s = must(s, io(0, 'theodora'), '');
    s = must(s, `<p>${ioRead}의 <span class="number-token support-token support-req">지원 3</span>이 미달이면 준비 · `, '<p>');
    s = must(s, '<span class="number-token support-token support-req">지원 1</span>이 이미 충분하면 이 자리는 다른 미달 대상', '<span class="number-token support-token support-req">지원 1</span>을 12장 영입 전에 준비 · 이미 충분하면 이 자리는 다른 미달 대상');
    s = s.replace(/<div class="weekly-gifts gift-candidates"><span>첫 인연을 열 때만<\/span><span class="weekly-gift-choice"><b><span class="reading-person"><img[^>]*c35\.webp[^>]*\/><b>이오<\/b><\/span><\/b>(?:(?!<\/div>).)*<\/span><\/div>/s, m => (m.match(/weekly-gift-choice/g).length === 1 ? '' : fail('선물 줄 여러 명')));
    h = h.slice(0, a) + s + h.slice(b);
    { const n0 = h; h = h.replace(/<li><a class="weekly-person" href="#person-theodora-io">(?:(?!<\/li>).)*<\/li>/s, ''); if (h === n0) fail('theodora 대기열 이오'); }
    if (h.includes('#person-theodora-io')) fail('theodora prep html 이오 남음'); }
  { const [a, b] = seg('leda'); let s = h.slice(a, b);
    s = must(s, io(0, 'leda'), '');
    s = must(s, `·${ioRead} <span class="number-token support-token support-req">지원 1</span>`, '');
    h = h.slice(0, a) + s + h.slice(b); if (h.includes('#person-leda-io')) fail('leda prep html 이오 남음'); }
  RC.prep = h; writeFileSync('content/source/react-content.json', JSON.stringify(RC) + (rcRaw.endsWith('\n') ? '\n' : '')); console.log('prep 원본 HTML 이오 제거');
}
