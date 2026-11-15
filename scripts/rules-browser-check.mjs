// 사용자 규칙(docs/user-rules.md) 중 화면으로만 볼 수 있는 것. 각 검사 앞 [Uxx]는 규칙 번호다.
// 실행: BROWSER_BASE_URL=http://localhost:18763 node scripts/rules-browser-check.mjs (정적 빌드, 격리된 새 브라우저 저장소)
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000', RED = 'rgb(227, 0, 27)';
const team = JSON.parse(readFileSync('content/source/react-content.json', 'utf8')).team;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ROUTES = ['theodora', 'leda', 'dietrich', 'cai'], done = [];
const hue = rgb => { const [r, g, b] = rgb.match(/\d+/g).map(Number).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return -1; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
try {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' }); const p = await ctx.newPage();
    const errors = []; p.on('pageerror', e => errors.push(e.message));
    // [U34] 모든 진행 막대는 흰 바탕·초록 막대. 반쯤 채워 그린 화면의 색을 직접 잰다.
    for (const u of ['/', '/theodora/1/', '/part3/3/']) {
      await p.goto(base + u); await p.waitForLoadState('networkidle');
      const bars = p.locator('progress:visible'); const n = await bars.count(); assert.ok(n > 0, `[U34] ${u} 진행 막대 있음`);
      for (let i = 0; i < n; i++) {
        const bar = bars.nth(i); await bar.evaluate(e => { e.max = 100; e.value = 50; }); await bar.scrollIntoViewIfNeeded();
        const box = await bar.boundingBox(); if (!box || box.width < 24) continue;
        const png = await p.screenshot({ clip: { x: box.x, y: box.y + box.height / 2 - 1, width: box.width, height: 2 } });
        const px = await p.evaluate(async b64 => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); const at = f => [...x.getImageData(Math.floor(img.width * f), 0, 1, 1).data].slice(0, 3); return { fill: at(0.25), track: at(0.8) }; }, png.toString('base64'));
        const [r, g, b] = px.fill; assert.ok(g > 100 && g > r + 40 && g > b + 30, `[U34] ${theme} ${u} 막대 ${i} 초록 아님 ${px.fill}`);
        assert.ok(px.track.every(v => v >= 245), `[U34] ${theme} ${u} 막대 ${i} 바탕 흰색 아님 ${px.track}`);
      }
    }
    // [U11] '자세히' 접기 단추가 어디에도 없다.
    for (const u of ['/', '/team/', ...ROUTES.flatMap(r => [`/${r}/1/`, `/${r}/2/`]), '/part3/3/']) {
      await p.goto(base + u); await p.waitForLoadState('networkidle'); await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; }));
      const more = await p.evaluate(() => [...document.querySelectorAll('button,summary,[role=button],a')].filter(e => e.checkVisibility() && /자세히/.test(e.textContent)).map(e => e.textContent.trim().slice(0, 20)));
      assert.deepEqual(more, [], `[U11] ${u} 자세히 단추`);
    }
    // [U33] '이 장의 인물' 묶음의 얼굴 아래에 '루트별 지원 대화' 단추가 있고, 누르면 그 문서가 열린다.
    // [U32] 그 서랍: 인물 거르기 단추가 있고, 고르면 그 인물이 든 줄만 남는다. 대화(짝 이름) 칸은 한 줄로 보인다.
    await p.goto(base + '/theodora/1/'); await p.waitForLoadState('networkidle');
    const order = await p.evaluate(() => { const s = [...document.querySelectorAll('.context-rail section')].find(x => x.querySelector('h2')?.textContent === '이 장의 인물'), faces = s?.querySelector('.context-people'), btn = s?.querySelector('.support-doc-button'); return { has: !!btn, below: !!(faces && btn && faces.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING), text: btn?.textContent }; });
    assert.ok(order.has && order.below && /루트별 지원 대화/.test(order.text), `[U33] 인물 묶음 아래 지원 대화 단추 ${JSON.stringify(order)}`);
    await p.locator('.context-rail .support-doc-button').click(); const dlg = p.getByRole('dialog'); await dlg.waitFor();
    assert.ok(/루트별 지원 대화/.test(await dlg.innerText()), '[U33] 지원 대화 문서가 열림');
    const chips = dlg.locator('.pair-chip'); assert.ok(await chips.count() > 2, '[U32] 인물 거르기 단추');
    const lines = () => dlg.evaluate(d => [...d.querySelectorAll('table')].filter(t => [...t.querySelectorAll('th')].some(h => h.textContent.trim() === '대화')).flatMap(t => { const i = [...t.querySelectorAll('th')].findIndex(h => h.textContent.trim() === '대화'); return [...t.querySelectorAll('tbody tr')].map(tr => tr.children[i]); }).filter(Boolean).map(td => { const w = document.createTreeWalker(td, NodeFilter.SHOW_TEXT), rects = []; for (let n; (n = w.nextNode());) if (n.textContent.trim()) { const r = document.createRange(); r.selectNodeContents(n); rects.push(...r.getClientRects()); } const fs = parseFloat(getComputedStyle(td).fontSize), span = rects.length ? Math.max(...rects.map(x => x.bottom)) - Math.min(...rects.map(x => x.top)) : 0; return { t: td.textContent.trim(), rows: span < fs * 2 ? 1 : Math.round(span / fs) }; }));
    const all = await lines(); assert.ok(all.length > 20, '[U32] 대화 칸'); for (const l of all) assert.equal(l.rows, 1, `[U32] ${theme} 짝 이름이 두 줄 이상: ${l.t}`);
    const pick = (await chips.nth(1).innerText()).trim(); await chips.nth(1).click(); await p.waitForTimeout(200);
    const kept = await lines(); assert.ok(kept.length > 0 && kept.length < all.length && kept.every(l => l.t.includes(pick)), `[U32] '${pick}' 거르기 ${kept.length}/${all.length}`);
    await p.keyboard.press('Escape');
    // [U19] 넓은 화면에서 할 일 안의 표는 칸을 꽉 채운다.
    await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; }));
    const narrow = await p.evaluate(() => [...document.querySelectorAll('.tasks-main table')].filter(t => t.checkVisibility()).map(t => { const par = t.parentElement, cs = getComputedStyle(par), inner = par.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); return { w: t.getBoundingClientRect().width, inner, scroll: par.scrollWidth > par.clientWidth + 1 }; }).filter(x => !x.scroll && x.w < x.inner - 2));
    assert.deepEqual(narrow, [], `[U19] 칸을 채우지 않는 표`);
    // [U15] 그림이 붙는 배지는 묶음 색 바탕: 지원 분홍·명성 파랑·골드 노랑·재료 초록.
    const kinds = await p.evaluate(() => Object.fromEntries(['bond', 'renown', 'gold', 'material'].map(k => [k, [...document.querySelectorAll(`.game-badge[data-kind=${k}]`)].filter(e => e.checkVisibility() && !e.closest('.button,.text-link,.reference-chip,.ui-badge,.unit-card')).slice(0, 3).map(e => getComputedStyle(e).backgroundColor)])));
    const want = { bond: h => h >= 290 || h <= 20, renown: h => h >= 185 && h <= 250, gold: h => h >= 30 && h <= 65, material: h => h >= 75 && h <= 170 };
    for (const [k, list] of Object.entries(kinds)) { assert.ok(list.length, `[U15] ${k} 배지 있음`); for (const c of list) assert.ok(want[k](hue(c)), `[U15] ${theme} ${k} 배지 색 ${c} (색상 ${Math.round(hue(c))})`); }
    // [U27] 맨 위로: 오른쪽 아래 둥근 단추, 그림만(글자 없음), 풍선 도움말.
    await p.evaluate(() => scrollTo(0, 3000)); await p.waitForTimeout(500);
    const tt = await p.evaluate(() => { const e = document.querySelector('.to-top'), r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { round: parseFloat(cs.borderRadius) >= r.width / 2 - 1, text: e.textContent.trim(), title: e.title, svg: !!e.querySelector('svg'), right: innerWidth - r.right < 48, bottom: innerHeight - r.bottom < 120 }; });
    assert.ok(tt.round && !tt.text && tt.title && tt.svg && tt.right && tt.bottom, `[U27] 맨 위로 ${JSON.stringify(tt)}`);
    // [U24] 최종 25인: 서랍에 금색 '최종 25인' 배지, 얼굴에 4px 빨간 테두리(밝게·어둡게 같음).
    await p.evaluate(() => scrollTo(0, 0));
    await p.locator('main button:has(img.final25-portrait):visible').first().click(); await p.getByRole('dialog').waitFor(); await p.waitForTimeout(300);
    const badge = await p.evaluate(() => { const b = document.querySelector('[role=dialog] .final25-badge'); return b && { t: b.textContent.trim(), bg: getComputedStyle(b).backgroundColor }; });
    assert.ok(badge && /최종 25/.test(badge.t) && hue(badge.bg) >= 30 && hue(badge.bg) <= 60, `[U24] ${theme} 서랍 금색 배지 ${JSON.stringify(badge)}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(500);
    const ring = await p.evaluate(() => [...document.querySelectorAll('img.final25-portrait')].filter(e => e.checkVisibility()).slice(0, 5).map(e => getComputedStyle(e).outlineWidth + ' ' + getComputedStyle(e).outlineColor));
    assert.ok(ring.length && ring.every(r => r === '4px ' + RED), `[U24] ${theme} 최종 25인 얼굴 테두리 ${ring}`);
    // [U09] 배경 없는 초상화는 한 가지 바탕색(불러온 뒤. 불러오기 전 자리 색은 뺀다).
    const bgs = await p.evaluate(() => [...new Set([...document.querySelectorAll('main img[src*="portraits"], .context-rail img[src*="portraits"]')].filter(e => e.checkVisibility() && e.hasAttribute('data-loaded')).map(e => getComputedStyle(e).backgroundColor))]);
    assert.equal(bgs.length, 1, `[U09] ${theme} 초상화 바탕색 ${bgs}`);
    // [U08] 같은 묶음 안에서 같은 얼굴을 되풀이하지 않는다.
    const dup = await p.evaluate(() => [...document.querySelectorAll('.group-portraits,.context-people,.people-grid')].flatMap(g => { const s = [...g.querySelectorAll('img[src*="/portraits/"]')].filter(i => !i.closest('.person > :not(.person-heading)')).map(i => i.getAttribute('src')); return s.filter((x, i) => s.indexOf(x) !== i); }));
    assert.deepEqual(dup, [], `[U08] 묶음 안 같은 얼굴`);
    // [U05] 팀 화면 교체 카드: 6px 빨간 테두리(밝게·어둡게 같음), 배지에 누구 대신인지. [U06] 카드 순서는 역할 묶음 → 우선순위. [U08] 같은 얼굴 없음.
    for (const sc of team.proposal.scenarios) {
      await p.goto(base + '/team/'); await p.evaluate(s => localStorage.setItem('fortunes-weave-view-v1', JSON.stringify({ 'team-tab': 'final', 'team-scenario': s, 'team-trials': [] })), sc.id); await p.reload(); await p.waitForLoadState('networkidle');
      const r = await p.evaluate(() => ({ names: [...document.querySelectorAll('.unit-card .unit-name')].map(e => e.textContent.trim()), swapped: [...document.querySelectorAll('.unit-card[data-swapped]')].map(c => ({ b: getComputedStyle(c).borderTopWidth + ' ' + getComputedStyle(c).borderTopColor, badge: c.closest('.unit-cell')?.querySelector('.swap-badge')?.textContent || c.querySelector('.swap-badge')?.textContent || '' })), imgs: [...document.querySelectorAll('.unit-card img[src*="portraits"]')].map(i => i.getAttribute('src')) }));
      const swaps = sc.swaps || {}, expected = team.baseline.map(n => swaps[n] || n).sort((a, b) => team.units[a].displayGroupRank - team.units[b].displayGroupRank || team.units[a].displayPriority - team.units[b].displayPriority);
      assert.deepEqual(r.names, expected, `[U06] ${sc.id} 카드 순서`);
      assert.equal(new Set(r.imgs).size, r.imgs.length, `[U08] ${sc.id} 팀 화면 같은 얼굴`);
      for (const s of r.swapped) { assert.equal(s.b, '6px ' + RED, `[U05] ${theme} ${sc.id} 교체 테두리`); assert.ok(/대신/.test(s.badge) && Object.keys(swaps).some(o => s.badge.includes(o)), `[U05] ${sc.id} 배지에 누구 대신인지: ${s.badge}`); }
    }
    // [U48] 팀 '루트 편성'·'비교 근거': 같은 단계 제목의 왼쪽 여백이 한 가지(여러 열 배치면 각 열 안에서 같은 위치), 같은 칸 안 얼굴 되풀이 없음.
    for (const tab of ['루트 편성', '비교 근거']) {
      await p.goto(base + '/team/'); await p.waitForLoadState('networkidle'); await p.getByRole('tab', { name: tab, exact: true }).click(); await p.waitForTimeout(400);
      const r = await p.evaluate(() => { const panel = document.querySelector('[role=tabpanel]:not([hidden])'), hs = [...panel.querySelectorAll('h2,h3')].filter(e => e.checkVisibility());
        const off = hs.map(h => { const col = () => { for (let x = h; x && x !== panel; x = x.parentElement) { const p = x.parentElement, cs = p && getComputedStyle(p); if (cs && cs.display.includes('grid') && cs.gridTemplateColumns.trim().split(/\s+/).length > 1) return x; } return panel; }, box = col(); return h.tagName + ':' + Math.round(h.getBoundingClientRect().left - box.getBoundingClientRect().left); });
        const dups = [...panel.querySelectorAll('[class*="card"],section,article')].flatMap(c => { const s = [...c.querySelectorAll(':scope > * img[src*="/portraits/"], :scope > img[src*="/portraits/"]')].map(i => i.getAttribute('src')); return s.filter((x, i) => s.indexOf(x) !== i); });
        return { n: hs.length, off: [...new Set(off)], dups }; });
      assert.ok(r.n > 0 && new Set(r.off.map(o => o.split(':')[0])).size === r.off.length, `[U48] ${theme} ${tab} 같은 단계 제목의 왼쪽 여백이 여러 가지 ${JSON.stringify(r.off)}`); assert.deepEqual(r.dups, [], `[U48] ${tab} 같은 얼굴`);
    }
    // [U50] 할 일 묶음 제목의 얼굴은 누를 수 있고, 누르면 인물 서랍이 열린다.
    await p.goto(base + '/theodora/1/'); await p.waitForLoadState('networkidle');
    const gp = p.locator('.group-portraits button:visible').first(); assert.ok(await gp.count(), '[U50] 묶음 얼굴 단추'); await gp.click(); await p.getByRole('dialog').waitFor({ timeout: 3000 }); await p.keyboard.press('Escape');
    assert.deepEqual(errors, [], '페이지 오류'); done.push(theme); await ctx.close();
  }
  // [U51] 휴대폰에서 고정 머리는 얇게(붙은 머리 높이 120px 이하, 화면의 1/6 이하). 바닥 날짜 40px은 header-browser-check.
  { const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } }), p = await ctx.newPage();
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.evaluate(() => scrollTo(0, 2500)); await p.waitForTimeout(500);
    const hh = await p.evaluate(() => document.querySelector('.route-head').getBoundingClientRect().height); assert.ok(hh <= 120, `[U51] 휴대폰 고정 머리 ${hh}px`);
    await ctx.close(); }
  // [U26] 네 루트 1부 인물 화면의 모든 인물 카드에 싼 선물이 있다.
  { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage();
    for (const r of ROUTES) { await p.goto(base + `/${r}/1/`); await p.locator('.route-head').waitFor(); await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(600);
      const g = await p.evaluate(() => [...document.querySelectorAll('.person')].map(x => ({ n: x.querySelector('h2')?.textContent, c: x.querySelectorAll('.gift-chips li').length })));
      assert.ok(g.length > 5, `[U26] ${r} 인물 카드 수`); const miss = g.filter(x => !x.c).map(x => x.n); assert.deepEqual(miss, [], `[U26] ${r} 싼 선물 없는 인물`);
      // [U42] 누조 카드는 '영입만·투자 없음'으로 보이고, 전력·실전 주력 같은 말이 없다(원문 기록을 펼쳐도).
      const nz = await p.evaluate(() => { const c = [...document.querySelectorAll('.person')].find(x => x.querySelector('h2')?.textContent.trim() === '누조'); if (!c) return null; c.querySelectorAll('details').forEach(d => { d.open = true; }); return c.innerText; });
      if (nz) { assert.ok(/투자하지 않습니다/.test(nz), `[U42] ${r} 누조 카드 투자 없음 표시`); assert.ok(!/활 전력|실전 주력/.test(nz), `[U42] ${r} 누조 카드에 전력 문구`); } }
    await ctx.close(); }
  // [U10] 장의 마지막 항목을 체크하면 색종이가 터진다(움직임 줄이기가 아닐 때). 새 브라우저 저장소에서만 누른다.
  { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' }), p = await ctx.newPage();
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.waitForTimeout(400);
    // [U28] 테마 단추 바뀜은 부드럽게(투명도 전환). 움직임 줄이기가 아닐 때만 전환이 있다.
    const tr = await p.evaluate(() => [getComputedStyle(document.querySelector('.guide-topbar>.icon-button')).transitionProperty, getComputedStyle(document.querySelector('.route-theme')).transitionProperty]);
    for (const t of tr) assert.ok(/opacity|all/.test(t), `[U28] 전환 없음 ${t}`);
    const sec = p.locator('details.chapter-section').nth(1); await sec.evaluate(d => { d.open = true; });
    const boxes = sec.locator('input[type=checkbox]:not(:disabled)'); const n = await boxes.count(); assert.ok(n > 0, '[U10] 1장 체크 칸');
    for (let i = 0; i < n; i++) { const b = boxes.nth(i); if (!await b.isChecked()) { await b.scrollIntoViewIfNeeded(); await b.click(); } }
    await p.waitForFunction(() => [...document.querySelectorAll('canvas')].some(c => getComputedStyle(c).position === 'fixed'), null, { timeout: 4000 }).catch(() => {});
    assert.ok(await p.evaluate(() => [...document.querySelectorAll('canvas')].some(c => getComputedStyle(c).position === 'fixed')), '[U10] 장 완료 색종이');
    await ctx.close(); }
  console.log(`통과: 사용자 규칙 화면 검사(${done.join('·')} + 네 루트 선물 + 색종이)`);
} finally { await browser.close(); }
