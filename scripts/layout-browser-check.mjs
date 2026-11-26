// 2026-11-15 사용자 지시 검사:
// 사용자 규칙: [U38] 세로 화면 군주 카드 위아래로 쌓기. (U28 테마 단추 검사는 2026-11-27 어두운 화면만 결정으로 뺐다.)
// 세로 화면(9:16 등)에서는 첫 화면 군주 카드 4장이 위아래로 쌓인다. 가로 화면은 한 줄에 4장.
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
let n = 0;
try {
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1152, 2048], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    await p.goto(base + '/'); await p.locator('.route-deck').waitFor(); await p.waitForTimeout(300);
    const cards = await p.evaluate(() => [...document.querySelectorAll('.route-card')].map(c => { const r = c.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top + scrollY) }; }));
    const portrait = h > w, rows = new Set(cards.map(c => c.t)).size, cols = new Set(cards.map(c => c.l)).size;
    if (portrait) assert.ok(rows === 4 && cols === 1, `${w}×${h} 세로 화면은 카드 4장을 위아래로 ${JSON.stringify(cards)}`);
    else assert.ok(rows === 1 && cols === 4, `${w}×${h} 가로 화면은 한 줄 ${JSON.stringify(cards)}`);
    const top = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.home-actions > *')].map(e => e.getBoundingClientRect().top)));
    assert.ok(top >= 8, `${w} 첫 화면 위쪽 단추가 맨 위에 붙음 ${top}`);
    n++; await ctx.close();
  }
  // [U69] 준비 탭은 그림 다섯 묶음, 표 0개, 1440·390·320에서 가로 넘침 0·화면 밖 요소 0.
  for (const [w, h] of [[320, 640], [390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    for (const r of ['/theodora/1/', '/leda/2/', '/part3/3/']) {
      await p.goto(base + r); await p.locator('.route-head').waitFor(); await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '준비', exact: true }).click(); await p.waitForTimeout(600);
      const m = await p.evaluate(() => ({ panels: [...document.querySelectorAll('.prep-content > .prep-panel')].map(e => e.dataset.panel).join(','), tables: document.querySelectorAll('.prep-content table').length, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, off: [...document.querySelectorAll('.prep-content *')].filter(e => e.checkVisibility() && e.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5).map(e => e.className).slice(0, 3), tileOut: [...document.querySelectorAll('.exam-tile, .god-tile, .prep-chip')].flatMap(t => { const r = t.getBoundingClientRect(); return [...t.querySelectorAll('*')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.left < r.left - 0.5 || q.right > r.right + 0.5); }).map(e => e.textContent.trim().slice(0, 20)); }).slice(0, 3), lineHead: (() => { const c = [...document.querySelectorAll('.prep-chain > .prep-chip')]; const left = Math.min(...c.map(e => e.getBoundingClientRect().left)); return c.filter(e => Math.abs(e.getBoundingClientRect().left - left) > 0.5 && e.previousElementSibling && e.getBoundingClientRect().top > e.previousElementSibling.getBoundingClientRect().bottom - 1).length; })() }));
      assert.ok(m.panels === 'gods,meals,exams,before,links' && m.tables === 0 && m.overflow <= 0 && !m.off.length && !m.tileOut.length && m.lineHead === 0, `[U69] ${w} ${r} 준비 탭 ${JSON.stringify(m)}`);
    }
    n++; await ctx.close();
  }
  console.log(`통과: 세로 화면 카드 쌓기·준비 탭 ${n}개 화면`);
} finally { await browser.close(); }
