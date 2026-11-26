// 2026-11-15 일관성 정리(docs/design-spec.md "일관성 정리 · 2026-11-15 사용자 승인")가 화면에서 지켜지는지 본다.
// 1440×900·390×844에서 팀 화면, 세오도라 1부 다섯 화면, 3부를 열고(모든 접기를 펼친 뒤) 다음을 확인한다.
// 1) [U53] 보이는 배지 일반 아이콘(.game-badge>svg)은 채움(fill이 none이 아님)
// 2) 보이는 글은 18px 이상(예외: 휴대폰 크기의 팀 격자 칸 .unit-card·.final-grid 14px)
// 3) [U54] 보이는 표 머리 칸(행 머리 th)은 왼쪽·위 정렬, 인물 표 머리 칸 폭은 데스크톱 120px·휴대폰 100px
// 4) [U55] 폭 60px 이상인 단추·단추 링크·접기 제목·선택 상자는 모서리 0px(2026-11-27 yuphastemple 값, 옛 10px 대체. 아래 EXCEPTIONS 제외). 장 선택·완료 숨기기는 채운 조작 요소(390px 미만 예외는 사양)
// 5) [U55] 접기 제목(details>summary)에 브라우저 기본 ▶ 표시가 없음(list-style-type: none)
// 6) [U56] 390×844에서 4글자 이하인 배지 이름(.badge-label)은 한 줄(상자 높이 32px 이하). 배지는 이름과 값 사이에서만 줄을 넘긴다.
// 7) [U56] 배지 이름과 값이 같은 줄에 있으면 둘 사이가 3px 이상("반짝반짝어 1마리"가 "반짝반짝어1마리"로 붙지 않게)
// 8) [U56] 390×844(그리고 360×800의 할 일·준비·3부)에서 금액 표([data-gold-table])·본문 표(.source-markup·.semantic table)는 칸 폭 안에 들어감(가로로 넘치거나 부모보다 넓지 않음)
// 9) 줄 머리 "·" 막기 묶음(.dot-glue)의 부모는 flex·grid가 아님. flex·grid 부모는 묶음을 따로 칸으로 떼어 글 사이에 간격·줄바꿈을 만든다(2026-11-26 검토 1: 단추 "루트별 육 성· 중단 기준")
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
// 4번 검사의 사양상 예외(모서리 10px이 아니어도 된다).
const EXCEPTIONS = [
  '.reference-chip', // 본문 줄 안의 참고 칩: 칩 모서리 8px(사양 "본문 줄 안의 참고 칩 30px")
  '.source-markup .text-link', '.sheet-scroll .text-link', // 같은 참고 칩 모양의 글 링크 단추(8px)
  '.pair-chip', // 지원 대화 인물 거르기 칩: 칩 모서리 8px
  '.document-list button', // 참고 문서 목록 한 줄은 카드 모양: 카드 모서리 16px
  '.unit-card', // 팀 격자 칸은 카드(사양의 팀 칸 예외)
  '.person-inline', // 글줄 안의 인물 이름 단추(글처럼 줄을 넘긴다)
  '.person-full-details>summary', // 접기 제목(단추가 아니라 제목 줄)
  '.chapter-section>summary', // 장 제목 줄: 붙어 있을 때 아래 글을 가리려고 쪽 바탕색(--bg)을 깐 제목 줄이라 모서리가 없다
];
function audit({ EXCEPTIONS, phone, fitOnly }) {
  const visible = e => e.checkVisibility({ visibilityProperty: true, opacityProperty: true }) && (r => r.width > 0 && r.height > 0)(e.getBoundingClientRect());
  const name = e => `${e.tagName.toLowerCase()}${typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''} «${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 16)}»`;
  const out = { fill: [], font: [], th: [], thWidth: [], radius: [], filled: [], marker: [], wrap: [], valueGap: [], tableFit: [], dotGlue: [] };
  // [U53]
  for (const s of document.querySelectorAll('.game-badge>svg')) if (visible(s) && getComputedStyle(s).fill === 'none') out.fill.push(name(s.parentElement));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement; if (!el || !n.textContent.trim() || /^(SCRIPT|STYLE|NOSCRIPT|OPTION)$/.test(el.tagName)) continue;
    if (phone && el.closest('.unit-card,.final-grid')) continue;
    // [U43] 글자 크기는 yuphastemple 값(2026-11-27): 가장 작은 읽는 글 13px 이상(점수·시기 13.8px). 읽어 주지 않는 장식(aria-hidden: ↗·▲▼)은 뺀다. 옛 '18px 이상' 대체.
    const size = parseFloat(getComputedStyle(el).fontSize); if (size >= 13 || !visible(el) || el.closest('[aria-hidden=true]')) continue;
    out.font.push(`${name(el)} ${size}px`);
  }
  for (const th of document.querySelectorAll('th')) {
    const rowHeader = th.scope === 'row' || (!th.closest('thead') && th === th.parentElement.firstElementChild);
    // [U54]
    if (rowHeader && visible(th) && (!/^(left|start)$/.test(getComputedStyle(th).textAlign) || getComputedStyle(th).verticalAlign !== 'top')) out.th.push(`${name(th)} ${getComputedStyle(th).textAlign}/${getComputedStyle(th).verticalAlign}`);
  }
  // [U54] 인물 표 머리 칸 폭
  for (const th of document.querySelectorAll('.person-summary th[scope=row]')) { if (!visible(th)) continue; const w = th.getBoundingClientRect().width; if (Math.abs(w - (innerWidth < 768 ? 100 : 120)) > 1) out.thWidth.push(`${name(th)} ${Math.round(w)}px`); }
  // [U55] 장 선택·완료 숨기기는 채운 조작 요소(389px 이하 옛 모양 예외는 사양 보고)
  if (innerWidth >= 390) for (const e of document.querySelectorAll('.route-head .chapter-picker select, .route-head .check-control')) { const bg = getComputedStyle(e).backgroundColor; if (visible(e) && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) out.filled.push(name(e)); }
  // [U55]
  for (const e of document.querySelectorAll('button, a.button, summary, select')) {
    if (!visible(e) || e.getBoundingClientRect().width < 60 || EXCEPTIONS.some(sel => e.matches(sel))) continue;
    const c = getComputedStyle(e);
    // 바탕이 투명한 것(장·묶음 접기 제목, 아코디언 제목, 그림 열기 단추, 배지 안 글 단추)은 모양이 없어 모서리를 재지 않는다.
    if (c.backgroundColor === 'rgba(0, 0, 0, 0)' || c.backgroundColor === 'transparent') continue;
    if (c.borderTopLeftRadius !== '0px') out.radius.push(`${name(e)} ${c.borderTopLeftRadius}`);
  }
  for (const s of document.querySelectorAll('details>summary')) if (visible(s) && getComputedStyle(s).listStyleType !== 'none') out.marker.push(`${name(s)} ${getComputedStyle(s).listStyleType}`);
  // [U56]
  for (const b of document.querySelectorAll('.game-badge')) { const l = b.querySelector(':scope>.badge-label'), v = b.querySelector(':scope>.badge-value'); if (!l || !v || !visible(b)) continue; const a = l.getBoundingClientRect(), c = v.getBoundingClientRect(); if (Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 2 && c.left - a.right < 3) out.valueGap.push(`${name(b)} ${Math.round(c.left - a.right)}px`); }
  if (phone) for (const l of document.querySelectorAll('.game-badge .badge-label')) { if (!visible(l)) continue; const h = l.getBoundingClientRect().height; if (l.textContent.trim().length <= 4 && h > 32) out.wrap.push(`${name(l.closest('.game-badge'))} ${Math.round(h)}px`); }
  for (const g of document.querySelectorAll('.dot-glue')) { const d = getComputedStyle(g.parentElement).display; if (/flex|grid/.test(d)) out.dotGlue.push(`${name(g.parentElement)} ${d} «${g.textContent.trim().slice(0, 12)}»`); }
  if (fitOnly) { for (const k of Object.keys(out)) if (k !== 'tableFit') out[k] = []; }
  if (phone || fitOnly) for (const t of document.querySelectorAll('[data-gold-table], .source-markup table, .semantic table')) { if (!visible(t)) continue; const w = t.getBoundingClientRect().width, pw = t.parentElement.clientWidth; if (t.scrollWidth > t.clientWidth + 1 || w > pw + 1) out.tableFit.push(`${name(t.rows[1]?.cells[0] || t)} 표 ${Math.round(Math.max(w, t.scrollWidth))}px > 칸 ${pw}px`); }
  return out;
}
const LABELS = { fill: '배지 아이콘 채움', font: '글자 13px 이상', th: '표 머리 칸 왼쪽·위', thWidth: '인물 표 머리 칸 폭', radius: '단추 모서리 0px', filled: '장 선택·완료 숨기기 채움', marker: '기본 ▶ 없음', wrap: '짧은 배지 이름 한 줄', tableFit: '표가 칸 안에 들어감', valueGap: '배지 이름·값 간격 3px 이상', dotGlue: '"·" 묶음 부모가 flex·grid 아님' };
let failed = 0, screens = 0;
async function check(p, label, phone, fitOnly = false) {
  await p.evaluate(() => { document.querySelectorAll('details:not(.backup-menu)').forEach(d => { d.open = true; }); scrollTo(0, 0); });
  // 접기 내용은 높이 0에서 펼쳐지는 전환(::details-content)이 있어 끝날 때까지 기다린 뒤 잰다.
  await p.waitForTimeout(fitOnly ? 600 : 300);
  const out = await p.evaluate(audit, { EXCEPTIONS, phone, fitOnly }); screens++;
  const bad = Object.entries(out).filter(([, v]) => v.length);
  if (!bad.length) { console.log(`통과  ${label}`); return; }
  failed++; console.log(`실패  ${label}`);
  for (const [k, v] of bad) console.log(`  - ${LABELS[k]}: ${v.length}개 · ${[...new Set(v)].slice(0, 5).join(' / ')}`);
}
try {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const phone = w < 600;
    for (const route of ['/team/', '/theodora/1/', '/part3/3/']) {
      await p.goto(base + route); await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
      await check(p, `${w} ${route}`, phone);
      if (route !== '/theodora/1/') continue;
      const nav = p.getByRole('navigation', { name: '공략 화면' });
      for (const v of ['인물', '준비', '재료']) {
        await nav.getByRole('button', { name: v }).first().click(); await p.waitForTimeout(500);
        await check(p, `${w} ${route} ${v}`, phone);
        // 2026-11-27(U68): 인물 표는 서랍에 있다. [U54] 표 머리 칸 폭을 서랍에서 잰다(표가 1개 이상인지도 본다).
        if (v === '인물') { await p.locator('.person-card-open').first().click(); await p.getByRole('dialog').waitFor(); await p.waitForTimeout(300);
          if (!await p.locator('.sheet .person-summary th[scope=row]').count()) { failed++; console.log(`실패: ${w} 인물 서랍 표 없음`); }
          await check(p, `${w} ${route} 인물 서랍`, phone);
          // [U55] 내 기록(U72)의 누를 곳은 32px 이상(병종 단추·레벨 ▼▲·등급 칸).
          const small = await p.evaluate(() => [...document.querySelectorAll('.sheet :is(.build-class,.build-steps button,.build-skills select)')].map(e => e.getBoundingClientRect()).filter(r => r.width < 32 || r.height < 32).length);
          if (small) { failed++; console.log(`실패  ${w} 내 기록 누를 곳 32px 미만 ${small}개`); }
          await p.keyboard.press('Escape'); await p.getByRole('dialog').waitFor({ state: 'detached' }); }
      }
    }
    await ctx.close();
  }
  // [U55] 병종 고르기 창(U72) 320·390·1440: 칩 이름이 잘리지 않고(말줄임 없음) 오른쪽 위 무기 그림과 겹치지 않는다(Fable 검토 21 지적 10).
  for (const [w, h] of [[320, 640], [390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    await p.goto(base + '/theodora/1/'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
    await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(400);
    await p.locator('.person-card[data-person="세오도라"] .person-card-open').click(); await p.getByRole('dialog').waitFor(); await p.locator('.build-class').click(); await p.getByRole('dialog', { name: '병종 고르기' }).waitFor(); await p.waitForTimeout(300);
    const chips = await p.evaluate(() => [...document.querySelectorAll('.class-picker .class-chip')].map(c => { const n = c.querySelector('.class-chip-name'), wp = c.querySelector('.class-chip-weapons'); if (!n) return null; const a = document.createRange(); a.selectNodeContents(n); const t = a.getBoundingClientRect(), b = wp?.getBoundingClientRect(); return { name: n.textContent, cut: n.scrollWidth > n.clientWidth + 1, hit: !!b && b.width > 0 && t.right > b.left && t.top < b.bottom && t.bottom > b.top }; }).filter(x => x && (x.cut || x.hit)));
    screens++; if (chips.length) { failed++; console.log(`실패  ${w} 병종 창 칩 이름 잘림·겹침 ${JSON.stringify(chips.slice(0, 5))}`); }
    await ctx.close(); }
  // [U56] 360×800: 표가 칸 안에 들어가는지만 본다(폭 389px 이하 금액 표 칸 여백 8px).
  { const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } }); const p = await ctx.newPage();
    for (const [route, v] of [['/theodora/1/', null], ['/theodora/1/', '준비'], ['/part3/3/', null]]) {
      await p.goto(base + route); await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
      if (v) { await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: v }).first().click(); await p.waitForTimeout(500); }
      await check(p, `360 ${route}${v ? ' ' + v : ''} (표 폭)`, true, true);
    }
    await ctx.close(); }
  console.log(failed ? `실패: ${failed}/${screens}개 화면` : `통과: 일관성 검사 ${screens}개 화면`);
} finally { await browser.close(); }
process.exit(failed ? 1 : 0);
