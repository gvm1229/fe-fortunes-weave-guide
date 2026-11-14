// 원본 HTML과 글자가 다른 표시 나무만 transfer.mjs의 semantic()과 같은 변환으로 다시 만든다.
import { readFileSync, writeFileSync } from 'node:fs';
import { load } from 'cheerio';
function semantic(html) {
  const $ = load(html, null, false);
  function visit(n) {
    if (n.type === 'text') return n.data;
    if (!n.tagName || ['script', 'style', 'svg', 'path', 'input', 'iframe', 'object', 'embed'].includes(n.tagName)) return null;
    const attrs = Object.fromEntries(Object.entries(n.attribs || {}).filter(([k, v]) => /^(href|src|alt|title|id|colspan|rowspan|scope|data-[\w-]+|aria-label)$/.test(k) && !(/^(href|src|data-reference-url)$/.test(k) && /^(?:\s*(?:javascript|data|vbscript):|\/\/)/i.test(v))));
    return { tag: n.tagName, attrs, children: (n.children || []).map(visit).filter(x => x !== null) };
  }
  return $.root().contents().toArray().map(visit).filter(x => x !== null);
}
const treeText = t => Array.isArray(t) ? t.map(treeText).join('') : typeof t === 'string' ? t : treeText(t.children);
const htmlText = h => { const $ = load(h, null, false); $('script,style,svg,path,input,iframe,object,embed').remove(); return $.root().text(); };
const c = s => s.replace(/\s/g, '');
const rcRaw = readFileSync('content/source/react-content.json', 'utf8'), rc = JSON.parse(rcRaw);
const dpRaw = readFileSync('content/display-parity.json', 'utf8'), dp = JSON.parse(dpRaw);
const fixed = [];
for (const p of rc.people) { const q = dp.people.find(x => x.id === p.id); if (q && c(treeText(q.tree)) !== c(htmlText(p.html))) { q.tree = semantic(p.html); fixed.push(p.id); } }
for (const k of ['prep', 'materials', 'exam']) if (c(treeText(dp[k])) !== c(htmlText(rc[k]))) { dp[k] = semantic(rc[k]); fixed.push(k); }
for (const [k, h] of Object.entries(rc.budgets)) if (c(treeText(dp.budgets[k])) !== c(htmlText(h))) { dp.budgets[k] = semantic(h); fixed.push('budget ' + k); }
const nl = dpRaw.includes('\r\n') ? '\r\n' : '\n', ind = dpRaw.match(/\n( +)"/)?.[1].length || 0;
writeFileSync('content/display-parity.json', (ind ? JSON.stringify(dp, null, ind).replace(/\n/g, nl) : JSON.stringify(dp)) + (dpRaw.endsWith('\n') ? nl : ''));
console.log('다시 만듦:', fixed.join(', ') || '없음');
