// 사용자 규칙(docs/user-rules.md) 중 화면으로만 볼 수 있는 것. 각 검사 앞 [Uxx]는 규칙 번호다.
// 실행: BROWSER_BASE_URL=http://localhost:18763 node scripts/rules-browser-check.mjs (정적 빌드, 격리된 새 브라우저 저장소)
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { eachPersonSheet } from './people-sheets.mjs';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000', RED = 'rgb(227, 0, 27)';
const team = JSON.parse(readFileSync('content/source/react-content.json', 'utf8')).team;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ROUTES = ['theodora', 'leda', 'dietrich', 'cai'], done = [];
const hue = rgb => { const [r, g, b] = rgb.match(/\d+/g).map(Number).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return -1; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
try {
  for (const theme of ['dark']) {
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
    const lines = () => dlg.evaluate(d => [...d.querySelectorAll('table')].filter(t => [...t.querySelectorAll('th')].some(h => h.textContent.trim() === '대화')).flatMap(t => { const i = [...t.querySelectorAll('th')].findIndex(h => h.textContent.trim() === '대화'); return [...t.querySelectorAll('tbody tr')].map(tr => tr.children[i]?.querySelector('.y-pair-name') || tr.children[i]); }).filter(Boolean).map(td => { const w = document.createTreeWalker(td, NodeFilter.SHOW_TEXT), rects = []; for (let n; (n = w.nextNode());) if (n.textContent.trim()) { const r = document.createRange(); r.selectNodeContents(n); rects.push(...r.getClientRects()); } const fs = parseFloat(getComputedStyle(td).fontSize), span = rects.length ? Math.max(...rects.map(x => x.bottom)) - Math.min(...rects.map(x => x.top)) : 0; return { t: td.textContent.trim(), rows: span < fs * 2 ? 1 : Math.round(span / fs) }; }));
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
    // [U24] 최종 25인: 서랍에 금색 '최종 25인' 배지, 얼굴에 4px 빨간 테두리(어두운 화면만, 2026-11-27).
    await p.evaluate(() => scrollTo(0, 0));
    await p.locator('main button:has(img.final25-portrait):visible').first().click(); await p.getByRole('dialog').waitFor(); await p.waitForTimeout(300);
    const badge = await p.evaluate(() => { const b = document.querySelector('[role=dialog] .final25-badge'); return b && { t: b.textContent.trim(), bg: getComputedStyle(b).backgroundColor }; });
    assert.ok(badge && /최종 25/.test(badge.t) && hue(badge.bg) >= 30 && hue(badge.bg) <= 60, `[U24] ${theme} 서랍 금색 배지 ${JSON.stringify(badge)}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    // 2026-11-27(U68): 인물 탭 카드는 서랍 머리 카드(큰 초상화 + '최종 25인' 배지)라 얼굴 테두리는 할 일 화면의 얼굴에서 잰다.
    const ring = await p.evaluate(() => [...document.querySelectorAll('img.final25-portrait')].filter(e => e.checkVisibility()).slice(0, 5).map(e => getComputedStyle(e).outlineWidth + ' ' + getComputedStyle(e).outlineColor));
    assert.ok(ring.length && ring.every(r => r === '4px ' + RED), `[U24] ${theme} 최종 25인 얼굴 테두리 ${ring}`);
    await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(500);
    // [U09] 배경 없는 초상화는 한 가지 바탕색(불러온 뒤. 불러오기 전 자리 색은 뺀다).
    const bgs = await p.evaluate(() => [...new Set([...document.querySelectorAll('main img[src*="portraits"], .context-rail img[src*="portraits"]')].filter(e => e.checkVisibility() && e.hasAttribute('data-loaded')).map(e => getComputedStyle(e).backgroundColor))]);
    assert.equal(bgs.length, 1, `[U09] ${theme} 초상화 바탕색 ${bgs}`);
    // [U08] 같은 묶음 안에서 같은 얼굴을 되풀이하지 않는다.
    const dup = await p.evaluate(() => [...document.querySelectorAll('.group-portraits,.context-people,.people-grid')].flatMap(g => { const s = [...g.querySelectorAll('img[src*="/portraits/"]')].map(i => i.getAttribute('src')); return s.filter((x, i) => s.indexOf(x) !== i); }));
    assert.deepEqual(dup, [], `[U08] 묶음 안 같은 얼굴`);
    // [U05] 팀 화면 교체 카드: 6px 빨간 테두리, 배지에 누구 대신인지. [U06] 카드 순서는 역할 묶음 → 우선순위. [U08] 같은 얼굴 없음.
    for (const sc of team.proposal.scenarios) {
      await p.goto(base + '/team/'); await p.evaluate(s => localStorage.setItem('fortunes-weave-view-v1', JSON.stringify({ 'team-tab': 'final', 'team-scenario': s, 'team-trials': [] })), sc.id); await p.reload(); await p.waitForLoadState('networkidle');
      const r = await p.evaluate(() => ({ names: [...document.querySelectorAll('.unit-card .unit-name')].map(e => e.textContent.trim()), swapped: [...document.querySelectorAll('.unit-card[data-swapped]')].map(c => ({ b: getComputedStyle(c).borderTopWidth + ' ' + getComputedStyle(c).borderTopColor, badge: c.closest('.unit-cell')?.querySelector('.swap-badge')?.textContent || c.querySelector('.swap-badge')?.textContent || '' })), imgs: [...document.querySelectorAll('.unit-card img[src*="portraits"]')].map(i => i.getAttribute('src')) }));
      const swaps = sc.swaps || {}, expected = team.baseline.map(n => swaps[n] || n).sort((a, b) => team.units[a].displayGroupRank - team.units[b].displayGroupRank || team.units[a].displayPriority - team.units[b].displayPriority);
      assert.deepEqual(r.names, expected, `[U06] ${sc.id} 카드 순서`);
      assert.equal(new Set(r.imgs).size, r.imgs.length, `[U08] ${sc.id} 팀 화면 같은 얼굴`);
      for (const s of r.swapped) { assert.equal(s.b, '6px ' + RED, `[U05] ${theme} ${sc.id} 교체 테두리`); assert.ok(/대신/.test(s.badge) && Object.keys(swaps).some(o => s.badge.includes(o)), `[U05] ${sc.id} 배지에 누구 대신인지: ${s.badge}`); }
    }
    // [U48] 팀 '루트 편성': 같은 단계 제목의 왼쪽 여백이 한 가지(여러 열 배치면 각 열 안에서 같은 위치), 같은 칸 안 얼굴 되풀이 없음('비교 근거' 탭은 2026-11-27 삭제).
    for (const tab of ['루트 편성']) {
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
  // [U64] 어두운 화면만(2026-11-27): 운영체제가 밝게여도 <html class="dark">, color-scheme dark, 바탕이 어둡고, "화면 테마 바꾸기" 단추가 0개.
  { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' }), p = await ctx.newPage();
    for (const u of ['/', '/theodora/1/', '/team/']) {
      await p.goto(base + u); await p.waitForLoadState('networkidle');
      const r = await p.evaluate(() => {
        // 바탕색: body가 투명이면 html 색을 본다. 상대 휘도(0 검정 ~ 1 흰색).
        const bg = [document.body, document.documentElement].map(e => getComputedStyle(e).backgroundColor.match(/[\d.]+/g).map(Number)).find(c => c.length < 4 || c[3] > 0) || [255, 255, 255];
        const lin = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        return { dark: document.documentElement.classList.contains('dark'), scheme: getComputedStyle(document.documentElement).colorScheme, bg: bg.slice(0, 3).join(','), lum: 0.2126 * lin(bg[0]) + 0.7152 * lin(bg[1]) + 0.0722 * lin(bg[2]) };
      });
      assert.ok(r.dark, `[U64] ${u} 밝게 설정에서도 html에 dark`); assert.equal(r.scheme, 'dark', `[U64] ${u} color-scheme`);
      assert.ok(r.lum < 0.05, `[U64] ${u} 바탕이 어둡지 않음 rgb(${r.bg}) 휘도 ${r.lum.toFixed(3)}`);
      assert.equal(await p.getByRole('button', { name: '화면 테마 바꾸기' }).count(), 0, `[U64] ${u} 테마 바꾸기 단추 남음`);
    }
    await ctx.close(); }
  // [U65] 이름 규칙(2026-11-27): yuphastemple 단추는 영어 글·새 탭·yuphastemple 주소이고, 한국어 이름 배지는 누를 수 없다(단추·링크 안에 없다).
  //       한 할 일 묶음 안에서 같은 물품 주소의 영어 단추는 한 번만. 본문 지도 링크는 game8이 아니라 yuphastemple 지도.
  // [U66] 근거·기록용 글이 화면에 없다: 원문 기록·비교 근거·참고 문서·그림 출처·입수 원문·특기 검토 문서·근거/검토 문서 단추·조심 문구.
  // [U67] 인물 서랍·팀 인물 서랍 머리는 yuphastemple 인물 카드(이름 빛·병종 줄·장점·약점 12칸·소속 문장·큰 초상화), 선호 선물·음식 목록과 지원 표가 있다.
  { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }), p = await ctx.newPage();
    const BLOAT = ['원문 기록', '비교 근거', '참고 문서', '그림 출처', '입수 원문', '특기 검토 문서', '전체 참고 문서', '훈련 순서·시설Lv·스승 근거', '전원 영입 검토', '평준화·증서 근거', '한 곳에서만 확인', '확인되지 않았다', '실제 합류와 출격 자리는 게임 화면을 먼저 확인하세요', '고정 진입 조건이나 실제 잔액이 아닙니다', 'Game8', 'GameWith', 'Anna', 'allthings', 'altema', 'RPG Site', 'KeenGamer', '전체 비교·육성 근거 읽기', '원문'];
    const bloat = async (u) => { await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; })); const t = await p.evaluate(() => document.body.innerText); for (const w of BLOAT) assert.ok(!t.includes(w), `[U66] ${u} 화면에 '${w}'`); };
    for (const r of ROUTES) {
      await p.goto(base + `/${r}/1/`); await p.locator('.route-head').waitFor(); await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; })); await p.waitForTimeout(300);
      const navs = await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button').allInnerTexts(); assert.equal(navs.length, 4, `[U66] ${r} 탐색 화면 넷(할 일·인물·준비·재료와 구매) ${navs}`);
      assert.ok(!navs.some(x => /문서/.test(x)), `[U66] ${r} 참고 문서 화면 단추`);
      const y = await p.evaluate(() => { const links = [...document.querySelectorAll('[data-yuphas-link]')]; return {
        n: links.length,
        bad: links.filter(a => /[가-힣]/.test(a.textContent) || a.target !== '_blank' || !a.href.startsWith('https://yuphastemple.com/')).map(a => a.textContent + ' ' + a.href).slice(0, 5),
        dupe: [...document.querySelectorAll('.action-group,.chapter-supplement')].flatMap(g => { const h = [...g.querySelectorAll('[data-yuphas-link]')].map(a => a.href).filter(x => x.includes('?item=')); return h.filter((x, i) => h.indexOf(x) !== i); }).slice(0, 5),
        clickableKo: [...document.querySelectorAll('.game-badge[data-kind=item],.game-badge[data-kind=gift],.game-badge[data-kind=material],[data-ko-badge]')].filter(b => b.closest('a,button')).length,
        game8: [...document.querySelectorAll('main a[href*="game8"],main a[href*="gamewith"]')].length,
        map: links.filter(a => a.href.startsWith('https://yuphastemple.com/map/')).length, place: [...document.querySelectorAll('[data-map-tier=place] a')].filter(a => /\/map\/[a-z0-9-]+\/[a-z0-9-]+\//.test(a.href) && !/[가-힣]/.test(a.textContent)).length }; });
      assert.ok(y.n > 20, `[U65] ${r} yuphastemple 단추 수 ${y.n}`); assert.deepEqual(y.bad, [], `[U65] ${r} 영어·새 탭·주소`); assert.deepEqual(y.dupe, [], `[U65] ${r} 묶음 안 같은 물품 영어 단추 되풀이`);
      assert.equal(y.clickableKo, 0, `[U65] ${r} 누를 수 있는 한국어 배지`); assert.equal(y.game8, 0, `[U65] ${r} game8·gamewith 링크`); assert.ok(y.map > 0, `[U65] ${r} yuphastemple 지도 링크`); if (r === 'theodora') assert.ok(y.place > 0, `[U65] ${r} 장소 주소 지도 단추`);
      await bloat(`/${r}/1/ 할 일`);
      for (const v of ['인물', '준비', '재료와 구매']) { await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: v, exact: true }).click(); await p.waitForTimeout(500); await bloat(`/${r}/1/ ${v}`); }
      assert.equal(await p.locator('.map-thumbnail').count(), 0, `[U65] ${r} 지도 사진`);
    }
    // [U66] 출처 사이트 이름·근거 글은 2부·3부의 네 화면에도 없다(2026-11-27 Fable 검토 21 지적 5).
    for (const r of [...ROUTES.map(x => `/${x}/2/`), '/part3/3/']) {
      await p.goto(base + r); await p.locator('.route-head').waitFor(); await p.waitForTimeout(300); await bloat(`${r} 할 일`);
      for (const v of ['인물', '준비', '재료와 구매']) { await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: v, exact: true }).click(); await p.waitForTimeout(500); await bloat(`${r} ${v}`); }
    }
    // [U66] 문서 서랍(루트별 지원 대화·시험 안내·병종 문서)에 출처 목록·출처 사이트 이름이 없고, yuphastemple 밖으로 가는 링크가 0개(Fable 재검토 K).
    { const DOC_BLOAT = [...BLOAT, '출처', 'Fextralife', 'Serenes', 'hyperwiki'];
      const docCheck = async (label) => { const d = p.getByRole('dialog'); await d.waitFor(); await p.waitForTimeout(300); await p.evaluate(() => document.querySelectorAll('[role=dialog] details').forEach(x => { x.open = true; }));
        const t = await d.innerText(); for (const w of DOC_BLOAT) assert.ok(!t.includes(w), `[U66] ${label} 문서에 '${w}'`);
        const out = await d.locator('a[href^="http"]').evaluateAll(es => es.map(e => e.href).filter(h => !h.startsWith('https://yuphastemple.com/'))); assert.deepEqual(out, [], `[U66] ${label} 바깥 링크`);
        await p.keyboard.press('Escape'); await d.waitFor({ state: 'detached' }); };
      for (const r of ['/theodora/1/', '/cai/1/']) {
        await p.goto(base + r); await p.locator('.route-head').waitFor(); await p.waitForTimeout(300);
        await p.locator('.context-rail button', { hasText: '루트별 지원 대화' }).first().click(); await docCheck(`${r} 루트별 지원 대화`);
        await p.evaluate(() => document.querySelectorAll('main details').forEach(d => { d.open = true; })); const chip = p.locator('.tasks-main button.reference-chip').first(); await chip.scrollIntoViewIfNeeded(); await chip.click(); await docCheck(`${r} 병종 문서`);
        await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.getByRole('button', { name: '시험 안내', exact: true }).click(); await docCheck(`${r} 시험 안내`);
      } }
    // [U66] 인물 서랍(접기를 모두 연 상태)에도 출처 이름·근거 글·조사만 남은 괄호가 없다. 네 루트 1·2부와 3부의 모든 인물(Fable 재검토 A·C).
    for (const r of [...ROUTES.flatMap(x => [`/${x}/1/`, `/${x}/2/`]), '/part3/3/']) {
      await p.goto(base + r); await p.locator('.route-head').waitFor(); await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(400);
      await eachPersonSheet(p, async (d, name) => { for (let i = 0; i < 6 && await d.locator('.person-more button[aria-expanded=false]').count(); i++) await d.locator('.person-more button[aria-expanded=false]').first().click();
        const t = await d.innerText(); for (const w of BLOAT) assert.ok(!t.includes(w), `[U66] ${r} ${name} 서랍에 '${w}'`); assert.ok(!/\((?:은|는|의|에서) /.test(t), `[U66] ${r} ${name} 서랍에 조사만 남은 괄호`); });
    }
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.waitForTimeout(300);
    await p.locator('.group-portraits button:visible').first().click(); const dlg = p.getByRole('dialog'); await dlg.waitFor();
    const card = await dlg.evaluate(d => { const c = d.querySelector('[data-character-header]'); return c && { name: !!c.querySelector('.y-card-name'), glow: getComputedStyle(c.querySelector('.y-card-name')).textShadow.includes('202, 185, 157'), cls: !!c.querySelector('.y-card-class img'), skills: c.querySelectorAll('.y-skills li').length, marks: c.querySelectorAll('.y-skills li[data-state=boon],.y-skills li[data-state=bane]').length, faction: getComputedStyle(c, '::before').backgroundImage.includes('/yuphas/emblems/'), portrait: c.querySelector('.y-card-portrait')?.naturalWidth >= 400, gifts: d.querySelectorAll('.y-gift').length, ribbons: d.querySelectorAll('.y-ribbon').length, food: d.querySelectorAll('.y-food').length, sup: d.querySelectorAll('.y-support-table tbody tr').length, special: [...d.querySelectorAll('dt')].some(x => x.textContent.trim() === '특기') }; });
    assert.ok(card && card.name && card.glow && card.cls && card.skills === 12 && card.marks > 0 && card.faction && card.portrait, `[U67] 인물 서랍 머리 ${JSON.stringify(card)}`);
    assert.ok(card.gifts > 5 && card.ribbons > 0 && card.food > 0 && card.sup > 0 && !card.special, `[U67] 인물 서랍 선물·음식·지원 ${JSON.stringify(card)}`);
    // [U70] 서랍 지원 표 얼굴은 모든 줄에서 잘리지 않는다(줄 높이 ≥ 얼굴 높이 --face-h). 1440과 390에서 본다.
    for (const w of [1440, 390]) {
      await p.setViewportSize({ width: w, height: w > 800 ? 900 : 844 }); await p.waitForTimeout(300);
      const faces = await dlg.evaluate(d => { const t = d.querySelector('.y-support-table'); if (!t) return null; const h = parseFloat(getComputedStyle(t).getPropertyValue('--face-h')); return { h, short: [...t.querySelectorAll('tbody th')].map(th => th.getBoundingClientRect().height).filter(x => x < h).length, rows: t.querySelectorAll('tbody th').length }; });
      assert.ok(faces && faces.rows > 0 && faces.h > 0 && faces.short === 0, `[U70] ${w} 지원 표 얼굴 잘림 ${JSON.stringify(faces)}`);
    }
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.keyboard.press('Escape');
    // [U68] 인물 탭은 서랍 머리 카드 격자(이름 검색 + 역할 탭). 카드를 누르면 인물 서랍. 탭 안에 표·접기 없음.
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(500);
    const ppl = await p.evaluate(() => ({ cards: document.querySelectorAll('.people-grid .person-card').length, heads: document.querySelectorAll('.people-grid .person-card [data-character-header]').length, tables: document.querySelectorAll('main table').length, folds: document.querySelectorAll('main details, main [data-radix-collection-item][aria-expanded]').length, selects: document.querySelectorAll('main select').length, roles: [...document.querySelectorAll('.role-tabs [role=radio]')].map(e => e.textContent) }));
    assert.ok(ppl.cards > 5 && ppl.heads === ppl.cards && ppl.tables === 0 && ppl.folds === 0 && ppl.selects === 0 && ppl.roles[0] === '전체', `[U68] 인물 탭 ${JSON.stringify(ppl)}`);
    await p.locator('.person-card-open').first().click(); await p.getByRole('dialog').waitFor(); assert.ok(await p.getByRole('dialog').locator('.person-summary').count() > 0, '[U68] 카드 → 인물 서랍'); await p.keyboard.press('Escape'); await p.getByRole('dialog').waitFor({ state: 'detached' });
    assert.ok(await p.evaluate(() => document.activeElement?.matches('.people-grid .person-card:first-child .person-card-open')), '[U68] 서랍을 닫으면 초점이 그 카드로');
    // 키보드로 연 카드(셋째)도 그 카드로 돌아온다.
    await p.locator('.people-grid .person-card').nth(2).locator('.person-card-open').focus(); await p.keyboard.press('Enter'); await p.getByRole('dialog').waitFor(); await p.keyboard.press('Escape'); await p.getByRole('dialog').waitFor({ state: 'detached' });
    assert.ok(await p.evaluate(() => document.activeElement === document.querySelectorAll('.people-grid .person-card-open')[2]), '[U68] 키보드로 연 카드로 초점 복귀');
    for (const tab of ['최종 25인', '백마술', '루트 편성']) { await p.goto(base + '/team/'); await p.waitForLoadState('networkidle'); await p.getByRole('tab', { name: tab, exact: true }).click(); await p.waitForTimeout(400); await bloat(`/team/ ${tab}`); }
    assert.equal(await p.getByRole('tab').count(), 3, '[U66] 팀 탭 셋');
    await p.getByRole('tab', { name: '최종 25인', exact: true }).click(); await p.locator('.unit-card').first().click(); const td = p.getByRole('dialog'); await td.waitFor(); await p.waitForTimeout(300);
    const tcard = await td.evaluate(d => ({ head: d.querySelectorAll('[data-character-header] .y-skills li').length, special: [...d.querySelectorAll('dt')].some(x => x.textContent.trim() === '특기'), review: /특기 검토 문서/.test(d.innerText), gifts: d.querySelectorAll('.y-gift').length }));
    assert.ok(tcard.head === 12 && !tcard.special && !tcard.review && tcard.gifts > 0, `[U67] 팀 인물 서랍 ${JSON.stringify(tcard)}`);
    await p.goto(base + '/'); await p.waitForLoadState('networkidle'); await bloat('/');
    await ctx.close(); }
  // [U51] 휴대폰에서 고정 머리는 얇게(붙은 머리 높이 120px 이하, 화면의 1/6 이하). 바닥 날짜 40px은 header-browser-check.
  { const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } }), p = await ctx.newPage();
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.evaluate(() => scrollTo(0, 2500)); await p.waitForTimeout(500);
    const hh = await p.evaluate(() => document.querySelector('.route-head').getBoundingClientRect().height); assert.ok(hh <= 120, `[U51] 휴대폰 고정 머리 ${hh}px`);
    await ctx.close(); }
  // [U26] 네 루트 1부 인물 화면의 모든 인물 카드에 싼 선물이 있다.
  { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage();
    for (const r of ROUTES) { await p.goto(base + `/${r}/1/`); await p.locator('.route-head').waitFor(); await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(600);
      // 2026-11-27(U68): 인물 탭 카드는 머리 카드만이라 싼 선물·계획 글은 서랍에서 본다.
      const g = await eachPersonSheet(p, async (d, n) => ({ n, c: await d.locator('.y-gift[data-cheap], .gift-chips li').count() }));
      assert.ok(g.length > 5, `[U26] ${r} 인물 카드 수`); const miss = g.filter(x => !x.c).map(x => x.n); assert.deepEqual(miss, [], `[U26] ${r} 싼 선물 없는 인물`);
      // [U42] 누조 서랍은 '영입만·투자 없음'으로 보이고, 전력·실전 주력 같은 말이 없다(접기를 펼쳐도).
      const nz = (await eachPersonSheet(p, async d => { for (let i = 0; i < 6 && await d.locator('.person-more button[aria-expanded=false]').count(); i++) await d.locator('.person-more button[aria-expanded=false]').first().click(); return d.innerText(); }, ['누조']))[0] || null;
      if (nz) { assert.ok(/투자하지 않습니다/.test(nz), `[U42] ${r} 누조 카드 투자 없음 표시`); assert.ok(!/활 전력|실전 주력/.test(nz), `[U42] ${r} 누조 카드에 전력 문구`); } }
    await ctx.close(); }
  // [U10] 장의 마지막 항목을 체크하면 색종이가 터진다(움직임 줄이기가 아닐 때). 새 브라우저 저장소에서만 누른다.
  { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' }), p = await ctx.newPage();
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.waitForTimeout(400);
    const sec = p.locator('details.chapter-section').nth(1); await sec.evaluate(d => { d.open = true; });
    const boxes = sec.locator('input[type=checkbox]:not(:disabled)'); const n = await boxes.count(); assert.ok(n > 0, '[U10] 1장 체크 칸');
    for (let i = 0; i < n; i++) { const b = boxes.nth(i); if (!await b.isChecked()) { await b.scrollIntoViewIfNeeded(); await b.click(); } }
    await p.waitForFunction(() => [...document.querySelectorAll('canvas')].some(c => getComputedStyle(c).position === 'fixed'), null, { timeout: 4000 }).catch(() => {});
    assert.ok(await p.evaluate(() => [...document.querySelectorAll('canvas')].some(c => getComputedStyle(c).position === 'fixed')), '[U10] 장 완료 색종이');
    await ctx.close(); }
  console.log(`통과: 사용자 규칙 화면 검사(${done.join('·')} + 어두운 화면만 + 이름 규칙·근거 글 없음·인물 머리 + 네 루트 선물 + 색종이)`);
} finally { await browser.close(); }
