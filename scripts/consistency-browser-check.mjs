// 2026-11-15 일관성 정리(docs/design-spec.md "일관성 정리 · 2026-11-15 사용자 승인")가 화면에서 지켜지는지 본다.
// 1440×900·390×844에서 팀 화면, 세오도라 1부 다섯 화면, 3부를 열고(모든 접기를 펼친 뒤) 다음을 확인한다.
// 1) 보이는 배지 일반 아이콘(.game-badge>svg)은 채움(fill이 none이 아님)
// 2) 보이는 글은 18px 이상(예외: 휴대폰 크기의 팀 격자 칸 .unit-card·.final-grid 14px)
// 3) 보이는 표 머리 칸(행 머리 th)은 왼쪽 정렬
// 4) 폭 60px 이상인 단추·단추 링크·접기 제목·선택 상자는 모서리 10px(아래 EXCEPTIONS 제외)
// 5) 접기 제목(details>summary)에 브라우저 기본 ▶ 표시가 없음(list-style-type: none)
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
function audit({ EXCEPTIONS, phone }) {
  const visible = e => e.checkVisibility({ visibilityProperty: true, opacityProperty: true }) && (r => r.width > 0 && r.height > 0)(e.getBoundingClientRect());
  const name = e => `${e.tagName.toLowerCase()}${typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''} «${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 16)}»`;
  const out = { fill: [], font: [], th: [], radius: [], marker: [] };
  for (const s of document.querySelectorAll('.game-badge>svg')) if (visible(s) && getComputedStyle(s).fill === 'none') out.fill.push(name(s.parentElement));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement; if (!el || !n.textContent.trim() || /^(SCRIPT|STYLE|NOSCRIPT|OPTION)$/.test(el.tagName)) continue;
    if (phone && el.closest('.unit-card,.final-grid')) continue;
    const size = parseFloat(getComputedStyle(el).fontSize); if (size >= 18 || !visible(el)) continue;
    out.font.push(`${name(el)} ${size}px`);
  }
  for (const th of document.querySelectorAll('th')) {
    const rowHeader = th.scope === 'row' || (!th.closest('thead') && th === th.parentElement.firstElementChild);
    if (rowHeader && visible(th) && !/^(left|start)$/.test(getComputedStyle(th).textAlign)) out.th.push(`${name(th)} ${getComputedStyle(th).textAlign}`);
  }
  for (const e of document.querySelectorAll('button, a.button, summary, select')) {
    if (!visible(e) || e.getBoundingClientRect().width < 60 || EXCEPTIONS.some(sel => e.matches(sel))) continue;
    const c = getComputedStyle(e);
    // 바탕이 투명한 것(장·묶음 접기 제목, 아코디언 제목, 그림 열기 단추, 배지 안 글 단추)은 모양이 없어 모서리를 재지 않는다.
    if (c.backgroundColor === 'rgba(0, 0, 0, 0)' || c.backgroundColor === 'transparent') continue;
    if (c.borderTopLeftRadius !== '10px') out.radius.push(`${name(e)} ${c.borderTopLeftRadius}`);
  }
  for (const s of document.querySelectorAll('details>summary')) if (visible(s) && getComputedStyle(s).listStyleType !== 'none') out.marker.push(`${name(s)} ${getComputedStyle(s).listStyleType}`);
  return out;
}
const LABELS = { fill: '배지 아이콘 채움', font: '글자 18px 이상', th: '표 머리 칸 왼쪽', radius: '단추 모서리 10px', marker: '기본 ▶ 없음' };
let failed = 0, screens = 0;
async function check(p, label, phone) {
  await p.evaluate(() => { document.querySelectorAll('details:not(.backup-menu)').forEach(d => { d.open = true; }); scrollTo(0, 0); });
  await p.waitForTimeout(300);
  const out = await p.evaluate(audit, { EXCEPTIONS, phone }); screens++;
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
      for (const v of ['인물', '준비', '재료', '문서']) {
        await nav.getByRole('button', { name: v }).first().click(); await p.waitForTimeout(500);
        await check(p, `${w} ${route} ${v}`, phone);
      }
    }
    await ctx.close();
  }
  console.log(failed ? `실패: ${failed}/${screens}개 화면` : `통과: 일관성 검사 ${screens}개 화면`);
} finally { await browser.close(); }
process.exit(failed ? 1 : 0);
