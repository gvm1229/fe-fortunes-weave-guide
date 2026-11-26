// 2026-11-15 사용자 지시: 모든 단추는 서로 붙지 않고 간격이 있어야 한다.
// 사용자 규칙: [U37] 단추끼리 4px 이상, 화면 가장자리에서 8px 이상.
// 홈·팀·네 루트 1·2부·3부의 모든 화면(할 일·인물·준비·재료·문서), 모든 장을 펼친 상태, 열리는 서랍·메뉴에서
// 보이는 단추끼리(가로·세로) 간격이 MIN px 이상인지 본다. 겹친 것도 붙은 것으로 센다.
// 맨 위(스크롤 0)에서 잰다. fixed 층(아래 날짜·맨 위로·서랍 바탕)과 본문은 서로 재지 않는다. 닫힌 접기 안처럼 보이지 않는 단추는 뺀다.
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000', MIN = Number(process.env.MIN_GAP || 4), REPORT = !!process.env.REPORT;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const SEL = 'button, summary, a[href], [role=button], [role=tab], select, input:not([type=hidden]), .check-control';
function audit({ SEL, MIN, scope }) {
  const name = e => (e.className && typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : e.tagName.toLowerCase()) + ' «' + (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 14) + '»';
  const fixedLayer = e => { for (let x = e; x; x = x.parentElement) if (getComputedStyle(x).position === 'fixed') return x; return null; };
  const modal = document.querySelector('dialog:modal, [role=dialog]');
  const els = [...document.querySelectorAll(SEL)].filter(e => {
    if (scope && !e.closest(scope)) return false;
    if (modal && !modal.contains(e)) return false;
    if (!e.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true, opacityProperty: true })) return false;
    // 글줄 속 일반 링크(display:inline)는 단추가 아니라 글이다. 숨긴 체크 칸(sr-only)은 뺀다.
    if (e.tagName === 'A' && getComputedStyle(e).display === 'inline' && !e.className) return false;
    // 단추나 라벨 안의 체크 칸은 그 단추의 일부다.
    if (e.tagName === 'INPUT' && e.closest('label,.check-control')) return false;
    // 폭 0으로 접힌 칸(overflow hidden) 안에 숨은 단추는 보이지 않는다(붙기 전 막대 테마 단추).
    for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.overflowX !== 'visible' && x.getBoundingClientRect().width < 1) return false; }
    const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1;
  });
  const out = [];
  // 화면 가장자리(문서 위·왼쪽·오른쪽)에 붙은 단추도 막는다(2026-11-15 사용자 지시: 첫 화면 '최종 25명'이 맨 위에 붙음). 8px 이상.
  if (!modal && !scope) for (const e of els) { const r = e.getBoundingClientRect(), top = r.top + scrollY; if (r.left < -1 || r.right > innerWidth + 1) continue; /* 가로로 넘기는 띠(overflow) 안에서 잘린 단추는 가장자리가 아니라 띠 끝에 걸린 것이다 */ let clipped = false; for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const ov = getComputedStyle(x).overflowX; if (ov !== 'visible') { const c = x.getBoundingClientRect(); if (r.right > c.right + 1 || r.left < c.left - 1) { clipped = true; break; } } } if (clipped) continue; if (top < 8 || r.left < 8 || innerWidth - r.right < 8) out.push(`${name(e)} ↔ 화면 가장자리 (위 ${Math.round(top)} 왼쪽 ${Math.round(r.left)} 오른쪽 ${Math.round(innerWidth - r.right)})`); }
  // 2026-11-27: yuphastemple 영어 단추로 단추 수가 크게 늘어 쌍마다 조상 스타일·위치를 다시 읽으면 수십 분이 걸린다. 재는 동안 화면은 바뀌지 않으므로 미리 한 번씩 읽어 둔다(판정은 같다).
  const layer = new Map(els.map(e => [e, fixedLayer(e)])), rect = new Map(els.map(e => [e, e.getBoundingClientRect()]));
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
    const a = els[i], b = els[j]; if (layer.get(a) !== layer.get(b) || a.contains(b) || b.contains(a)) continue;
    // 같은 행동 줄의 체크 칸과 그 글(label for) 같은 한 묶음은 뺀다.
    if ((a.tagName === 'INPUT' && b.closest('li') === a.closest('li') && b.closest('li')) || (b.tagName === 'INPUT' && a.closest('li') === b.closest('li') && a.closest('li'))) continue;
    const r = rect.get(a), q = rect.get(b);
    if (r.top - q.bottom > MIN && r.left - q.right > MIN || q.top - r.bottom > MIN && q.left - r.right > MIN) continue;
    const vOverlap = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top), hOverlap = Math.min(r.right, q.right) - Math.max(r.left, q.left);
    const hGap = Math.max(q.left - r.right, r.left - q.right), vGap = Math.max(q.top - r.bottom, r.top - q.bottom);
    if ((vOverlap > 2 && hGap < MIN) || (hOverlap > 2 && vGap < MIN)) out.push(`${name(a)} ↔ ${name(b)} (가로 ${Math.round(hGap)} 세로 ${Math.round(vGap)})`);
  }
  return out;
}
const problems = new Map(); let screens = 0;
async function check(p, label, scope) {
  screens++;
  for (const x of await p.evaluate(audit, { SEL, MIN, scope })) { const k = x.replace(/\(가로.*$/, ''); if (!problems.has(k)) problems.set(k, `${label}: ${x}`); }
}
/** 지금 화면의 모든 접기를 펼치고 맨 위로 올린 뒤 잰다. */
async function checkAll(p, label) {
  await p.evaluate(() => { document.querySelectorAll('main details:not(.backup-menu)').forEach(d => { d.open = true; }); scrollTo(0, 0); }); await p.waitForTimeout(300);
  // 처음 열 때 현재 장으로 내려가 머리가 붙었다가 맨 위로 올라오면 머리 모양이 0.2초에 걸쳐 바뀐다. 바뀜이 끝난 뒤 잰다.
  await p.waitForFunction(() => !document.documentElement.hasAttribute('data-head-stuck')).catch(() => {}); await p.waitForTimeout(400);
  await check(p, label);
}
/** 화면 안 단추 종류마다 하나씩 눌러 서랍이 열리면 그 서랍을 잰다. */
async function checkSheets(p, label) {
  const kinds = await p.evaluate(() => { const seen = new Set(), out = []; for (const e of document.querySelectorAll('main button')) { const k = String(e.className).trim(); if (!k || seen.has(k) || !e.checkVisibility()) continue; seen.add(k); e.setAttribute('data-gap-probe', String(out.length)); out.push(k); } return out; });
  for (let i = 0; i < kinds.length && i < 24; i++) {
    const btn = p.locator(`[data-gap-probe="${i}"]`); if (!await btn.count()) continue;
    await btn.scrollIntoViewIfNeeded().catch(() => {}); await btn.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250);
    if (await p.locator('[role=dialog], dialog:modal').count()) { await p.waitForTimeout(250); await check(p, `${label} 서랍(${kinds[i]})`); await p.keyboard.press('Escape'); await p.waitForTimeout(250); }
  }
}
try {
  const routes = ['/', '/team/', ...['theodora', 'leda', 'dietrich', 'cai'].flatMap(r => [`/${r}/1/`, `/${r}/2/`]), '/part3/3/'];
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1152, 2048], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    for (const r of routes) {
      await p.goto(base + r); await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
      await checkAll(p, `${w} ${r}`); await checkSheets(p, `${w} ${r}`);
      const nav = p.getByRole('navigation', { name: '공략 화면' });
      if (await nav.count()) {
        for (const v of ['인물', '준비', '재료']) {
          const btn = nav.getByRole('button', { name: v, exact: true }); if (!await btn.count()) continue;
          await btn.click(); await p.waitForTimeout(400); await checkAll(p, `${w} ${r} ${v}`); await checkSheets(p, `${w} ${r} ${v}`);
        }
        await nav.getByRole('button', { name: '할 일', exact: true }).click().catch(() => {}); await p.waitForTimeout(300);
        if (await p.locator('.route-head .backup-menu').count()) {
          await p.evaluate(() => scrollTo(0, 0));
          // 붙은 머리 막대(작은 이름·테마 단추가 나타난 상태)도 잰다.
          await p.evaluate(() => scrollTo(0, 2500)); await p.waitForTimeout(500); await check(p, `${w} ${r} 붙은 막대`, '.route-head'); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
          await p.locator('.route-head .backup-menu summary').click(); await p.waitForTimeout(200); await check(p, `${w} ${r} 기록 관리`, '.route-head');
          const open = w < 600 ? p.locator('.route-head .status-menu-item') : p.locator('.route-head .status-button');
          if (w >= 600) await p.locator('.route-head .backup-menu summary').click();
          await open.click(); await p.getByRole('dialog').waitFor(); await p.waitForTimeout(300); await check(p, `${w} ${r} 내 상태`); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
        }
      }
    }
    await ctx.close();
  }
  if (REPORT) console.log([...problems.values()].join('\n'));
  assert.equal(problems.size, 0, `붙은 단추 ${problems.size}쌍:\n` + [...problems.values()].slice(0, 40).join('\n'));
  console.log(`통과: 단추 간격 ${MIN}px 이상 ${screens}개 화면`);
} finally { await browser.close(); }
