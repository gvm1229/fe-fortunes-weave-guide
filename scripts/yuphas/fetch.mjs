// phase 2: polite sequential fetch of KR wiki entry pages (temp-label check) and yuphas status codes. Cached.
import fs from 'node:fs';
import { SCR, readJson, sleep } from './lib.mjs';
const mode = process.argv[2];
const c = readJson(`${SCR}/gen/candidates.json`);
const UA = { 'user-agent': 'Mozilla/5.0 (guide name-table sync; sequential)' };
if (mode === 'wiki') {
  const dir = `${SCR}/kwiki/pages`; fs.mkdirSync(dir, { recursive: true });
  const slugs = [...new Set(c.map((e) => e.wikiSlug).filter(Boolean))];
  let n = 0;
  for (const s of slugs) {
    const f = `${dir}/${s}.html`; if (fs.existsSync(f)) continue;
    const r = await fetch(`https://fire-emblem-fortunes-weave.turam.dev/ko/entry/${s}/`, { headers: UA });
    fs.writeFileSync(f, r.ok ? await r.text() : `HTTP ${r.status}`); n++;
    await sleep(400);
  }
  console.log('wiki fetched', n, 'of', slugs.length);
} else if (mode === 'yuphas') {
  const f = `${SCR}/gen/yuphas-status.json`; const st = fs.existsSync(f) ? readJson(f) : {};
  const urls = new Set();
  for (const e of c) {
    for (const s of [e.slug, e.candidateSlug].filter(Boolean)) urls.add(e.group === 'people' ? `/${s}/` : e.group === 'places' ? `/map/${s}/` : `/?item=${s}`);
  }
  for (const extra of (process.argv[3] || '').split(',').filter(Boolean)) urls.add(extra);
  let n = 0;
  for (const u of urls) {
    if (st[u]) continue;
    const r = await fetch('https://yuphastemple.com' + u, { headers: UA, redirect: 'manual' });
    st[u] = r.status; await r.arrayBuffer(); n++;
    if (n % 50 === 0) fs.writeFileSync(f, JSON.stringify(st, null, 1));
    await sleep(300);
  }
  fs.writeFileSync(f, JSON.stringify(st, null, 1));
  console.log('yuphas checked', n, 'total', Object.keys(st).length, 'non200', Object.entries(st).filter(([, v]) => v !== 200));
}
