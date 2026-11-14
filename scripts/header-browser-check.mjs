// 2026-11-14 사용자 지시 검사: 사이트에 체크 기록 없음(새 브라우저 0개), 고정 머리의 완료 숨기기·테마 바꾸기,
// 맨 위로 버튼, 인물 카드 선물 칸, 최종 25인 빨간 테두리(밝게·어둡게 같은 색).
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const red = 'rgb(227, 0, 27)';
let n = 0;
try {
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1440, 900]]) for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme }); const p = await ctx.newPage();
    for (const f of ['/reference-data/checklist.json', '/reference-files/theodora-progress-import.json']) assert.equal((await p.goto(base + f)).status(), 404, f + ' 공개됨');
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.waitForTimeout(600);
    assert.equal(await p.evaluate(() => document.querySelector('.banner-progress strong')?.textContent), '0', `${w} 새 브라우저 완료 수 0`);
    assert.equal(await p.evaluate(() => localStorage.getItem('fortunes-weave-checklist-v1')), JSON.stringify({ schemaVersion: 1, revision: 0, checks: {} }), '새 브라우저 저장소는 빈 기록');
    await p.evaluate(() => scrollTo(0, 2500)); await p.waitForTimeout(400);
    const head = await p.evaluate(() => {
      const bar = document.querySelector('.route-head-bar').getBoundingClientRect(), inner = { l: bar.left + parseFloat(getComputedStyle(document.querySelector('.route-head-bar')).paddingLeft) - 1, r: bar.right - parseFloat(getComputedStyle(document.querySelector('.route-head-bar')).paddingRight) + 1 };
      const parts = ['.route-head .check-control', '.route-theme .icon-button', '.route-head .jump-next', '.route-head .backup-menu', '.route-head .chapter-picker'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return { s, l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width }; });
      const font = parseFloat(getComputedStyle(document.querySelector('.route-head .check-control')).fontSize);
      return { top: bar.top, bottom: bar.bottom, inner, parts, font, overflowX: document.documentElement.scrollWidth - innerWidth, outline: getComputedStyle(document.querySelector('img.final25-portrait')).outlineColor };
    });
    assert.ok(Math.abs(head.top) < 1, '머리 고정'); assert.ok(head.overflowX <= 0, '가로 넘침');
    assert.ok(head.font >= 18, '완료 숨기기 글자 18px 이상');
    for (const q of head.parts) { assert.ok(q.l >= head.inner.l && q.r <= head.inner.r && q.t >= head.top - 1 && q.b <= head.bottom + 1, `${w} ${q.s} 머리 밖`); if (q.s !== '.route-head .chapter-picker' && q.s !== '.route-head .check-control') assert.ok(q.w >= 44, `${q.s} 누를 폭`); }
    for (let i = 0; i < head.parts.length; i++) for (let j = i + 1; j < head.parts.length; j++) { const a = head.parts[i], b = head.parts[j]; assert.ok(a.r <= b.l + 0.5 || b.r <= a.l + 0.5 || a.b <= b.t + 0.5 || b.b <= a.t + 0.5, `${w} ${a.s}·${b.s} 겹침`); }
    assert.equal(head.outline, red, '최종 25인 테두리 빨강');
    const tt = p.locator('.to-top'); assert.equal(await tt.getAttribute('data-shown'), 'true', '맨 위로 보임');
    const box = await tt.boundingBox(); assert.ok(box.x + box.width <= w && box.y + box.height <= h && Math.abs(box.width - box.height) < 1, '맨 위로 위치');
    await p.locator('.route-head .check-control input').check(); assert.ok(await p.locator('.route-head .check-control input').isChecked());
    await p.locator('.route-theme .icon-button').click(); await p.waitForTimeout(200); await p.locator('.route-theme .icon-button').click();
    await tt.click(); await p.waitForTimeout(1200); assert.ok(await p.evaluate(() => scrollY) < 5, '맨 위로 이동');
    await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(800);
    const gifts = await p.evaluate(() => [...document.querySelectorAll('.person')].map(x => ({ n: x.querySelector('h2')?.textContent, c: x.querySelectorAll('.gift-chips li').length })));
    assert.ok(gifts.length && gifts.every(g => g.c > 0), '모든 인물 카드에 싼 선물');
    n++; await ctx.close();
  }
  console.log(`통과: 고정 머리·맨 위로·선물·빈 체크 기록 ${n}개 화면`);
} finally { await browser.close(); }
