// 2026-11-14 사용자 지시 검사: 사이트에 체크 기록 없음(새 브라우저 0개), 고정 머리의 완료 숨기기,
// 사용자 규칙: [U12] 첫 미완료로 이동은 고정 머리 안 · [U24] 최종 25인 얼굴 빨간 테두리 · [U25] 새 브라우저 빈 기록·개인 파일 404 · [U26] 인물 카드 싼 선물 · [U27] 완료 숨기기는 고정 머리, 맨 위로 단추 · [U29] 바닥 게임 날짜.
// 맨 위로 버튼, 인물 카드 선물 칸, 최종 25인 빨간 테두리(어두운 화면만, 2026-11-27).
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { eachPersonSheet } from './people-sheets.mjs';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const red = 'rgb(227, 0, 27)';
let n = 0;
try {
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1440, 900]]) for (const scheme of ['dark']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme }); const p = await ctx.newPage();
    for (const f of ['/reference-data/checklist.json', '/reference-files/theodora-progress-import.json', '/reference-data/carry-state.json', '/reference-data/unit-readiness.json', '/reference-files/notes/screenshots/personalized-desktop.jpg', '/reference-files/notes/theodora-ch5-validation.json']) assert.equal((await p.goto(base + f)).status(), 404, f + ' 공개됨');
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.waitForTimeout(600);
    assert.equal(await p.evaluate(() => document.querySelector('.banner-progress strong')?.textContent), '0', `${w} 새 브라우저 완료 수 0`);
    assert.equal(await p.evaluate(() => localStorage.getItem('fortunes-weave-checklist-v1')), JSON.stringify({ schemaVersion: 1, revision: 0, checks: {} }), '새 브라우저 저장소는 빈 기록');
    await p.evaluate(() => scrollTo(0, 2500)); await p.waitForTimeout(400);
    const head = await p.evaluate(() => {
      const bar = document.querySelector('.route-head-bar').getBoundingClientRect(), inner = { l: bar.left + parseFloat(getComputedStyle(document.querySelector('.route-head-bar')).paddingLeft) - 1, r: bar.right - parseFloat(getComputedStyle(document.querySelector('.route-head-bar')).paddingRight) + 1 };
      const parts = ['.route-head .check-control', '.route-head .jump-next', '.route-head .backup-menu', '.route-head .status-button', '.route-head .chapter-picker'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return { s, l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width }; }).filter(q => !(q.s.endsWith('status-button') && innerWidth < 600 && q.w === 0));
      // 내 상태(2026-11-15): 600px 미만은 머리 막대 대신 기록 관리 메뉴 안에 있다.
      const statusEntry = innerWidth < 600 ? !!document.querySelector('.route-head .backup-menu .status-menu-item') : document.querySelector('.route-head .status-button').getBoundingClientRect().width >= 44;
      const font = parseFloat(getComputedStyle(document.querySelector('.route-head .check-control')).fontSize);
      return { statusEntry, top: bar.top, bottom: bar.bottom, inner, parts, font, overflowX: document.documentElement.scrollWidth - innerWidth, outline: getComputedStyle(document.querySelector('img.final25-portrait')).outlineColor };
    });
    assert.ok(Math.abs(head.top) < 1, '머리 고정'); assert.ok(head.overflowX <= 0, '가로 넘침');
    assert.ok(head.font >= 13, '완료 숨기기 글자 13px 이상([U43] yuphastemple 값)'); assert.ok(head.statusEntry, `${w} 내 상태 입구`);
    for (const q of head.parts) { assert.ok(q.l >= head.inner.l && q.r <= head.inner.r && q.t >= head.top - 1 && q.b <= head.bottom + 1, `${w} ${q.s} 머리 밖`); if (q.s !== '.route-head .chapter-picker' && q.s !== '.route-head .check-control') assert.ok(q.w >= 44, `${q.s} 누를 폭`); }
    for (let i = 0; i < head.parts.length; i++) for (let j = i + 1; j < head.parts.length; j++) { const a = head.parts[i], b = head.parts[j]; assert.ok(a.r <= b.l + 0.5 || b.r <= a.l + 0.5 || a.b <= b.t + 0.5 || b.b <= a.t + 0.5, `${w} ${a.s}·${b.s} 겹침`); }
    const toolTops = head.parts.map(q => Math.round(q.t)); assert.ok(Math.max(...toolTops) - Math.min(...toolTops) <= 2, `${w} 도구가 한 줄이 아님`);
    assert.equal(head.outline, red, '최종 25인 테두리 빨강');
    const tt = p.locator('.to-top'); assert.equal(await tt.getAttribute('data-shown'), 'true', '맨 위로 보임');
    const box = await tt.boundingBox(); assert.ok(box.x + box.width <= w && box.y + box.height <= h && Math.abs(box.width - box.height) < 1, '맨 위로 위치');
    await p.locator('.route-head .check-control input').check(); assert.ok(await p.locator('.route-head .check-control input').isChecked());
    await tt.click(); await p.waitForTimeout(1200); assert.ok(await p.evaluate(() => scrollY) < 5, '맨 위로 이동');
    await p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: '인물', exact: true }).click(); await p.waitForTimeout(800);
    // 2026-11-27(U68): 싼 선물은 인물 서랍에 있다. 서랍을 모두 여는 검사는 390에서 한 번(네 루트 1440은 rules-browser-check [U26]).
    if (w === 390) { const gifts = await eachPersonSheet(p, async (d, n) => ({ n, c: await d.locator('.y-gift[data-cheap], .gift-chips li').count() }));
      assert.ok(gifts.length && gifts.every(g => g.c > 0), '모든 인물 서랍에 싼 선물 ' + gifts.filter(g => !g.c).map(g => g.n)); }
    n++; await ctx.close();
  }
  // 바닥 게임 날짜(2026-11-14): 새 브라우저(시작 전, 날짜 없음)는 숨김. 7장 앞까지 체크한 기록이면 7장 첫 날짜, 2부는 숨김. 맨 위로 버튼은 바닥 위.
  {const st=JSON.parse(readFileSync('content/derived/checklist.json','utf8')).stages.find(s=>s.id==='theodora-plan'),pb=JSON.parse(readFileSync('content/data/playbook.json','utf8')),checks={};
   for(const c of st.chapters.slice(0,st.chapters.findIndex(c=>c.title==='7장')))for(const b of c.blocks)for(const a of pb.groups.find(g=>g.id===b.id)?.actions||[])checks[a.id]=true;
   for(const [w,h] of [[390,844],[1440,900]]){const ctx=await browser.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();
    await p.goto(base+'/theodora/1/');await p.locator('.route-head').waitFor();await p.waitForTimeout(500);assert.equal(await p.locator('.date-odometer').count(),0,'새 브라우저는 바닥 날짜 없음');
    await p.evaluate(s=>localStorage.setItem('fortunes-weave-checklist-v1',s),JSON.stringify({schemaVersion:1,revision:1,checks}));await p.reload();await p.locator('.date-odometer').waitFor();
    const f=await p.evaluate(()=>{const e=document.querySelector('.date-odometer'),r=e.getBoundingClientRect(),t=document.querySelector('.to-top').getBoundingClientRect();return {label:e.querySelector('[role=status]')?.textContent,digits:[...e.querySelectorAll('.odometer-digit')].length,bottom:r.bottom,top:r.top,toTopBottom:t.bottom,face:e.querySelector('.odometer-face').getBoundingClientRect(),W:innerWidth,H:innerHeight,overflowX:document.documentElement.scrollWidth-innerWidth};});
    assert.match(f.label,/^게임 날짜 1449년 \d{1,2}월 \d{1,2}일$/,'바닥 날짜 이름');assert.equal(f.digits,8,'숫자 칸 8개(1449/MM/DD)');
    assert.ok(Math.abs(f.bottom-f.H)<1&&Math.abs((f.face.left+f.face.right)/2-f.W/2)<2,'바닥 가운데');assert.ok(f.toTopBottom<=f.top+1,'맨 위로 버튼이 바닥 위');assert.ok(Math.abs((f.bottom-f.top)-(w<600?40:56))<=1,`${w} 바닥 날짜 높이 ${f.bottom-f.top}`);assert.ok(f.overflowX<=0);
    const before=f.label;await p.locator('.chapter-section[data-current=true] .checklist input:not(:checked)').first().check().catch(()=>{});
    await p.goto(base+'/theodora/2/');await p.locator('.route-head').waitFor();await p.waitForTimeout(400);assert.equal(await p.locator('.date-odometer').count(),0,'2부는 바닥 날짜 없음');
    n++;await ctx.close();}}
  // [U58] 첫 화면 <head>의 탭 아이콘·홈 화면 아이콘 주소가 그림으로 열리고, /favicon.ico도 404가 아니다(검사 서버는 .ico 형식 이름이 없어 ICO 머리 바이트로 확인).
  {const ctx=await browser.newContext();const p=await ctx.newPage();await p.goto(base+'/');
   const links=await p.evaluate(()=>[...document.querySelectorAll('head link[rel=icon], head link[rel=apple-touch-icon]')].map(l=>({rel:l.rel,href:l.href})));
   assert.ok(links.some(l=>l.rel==='icon'),'[U58] 탭 아이콘 링크');assert.ok(links.some(l=>l.rel==='apple-touch-icon'),'[U58] 홈 화면 아이콘 링크');
   for(const u of [...links.map(l=>l.href),base+'/favicon.ico']){const r=await p.request.get(u);assert.equal(r.status(),200,`[U58] ${u} 상태`);if(/\.ico(\?|$)/.test(u))assert.deepEqual([...(await r.body()).subarray(0,4)],[0,0,1,0],`[U58] ${u} ICO 아님`);else assert.match(r.headers()['content-type']||'',/^image\//,`[U58] ${u} 그림 아님`);}
   n++;await ctx.close();}
  // [U71] 루트 머리 왼쪽 '첫 화면' 옆에 팀 화면(/team/) 단추. 320·390·1440에서 보이고 머리 안에 있으며 가로 넘침 없음.
  // 탭 줄 빈 칸 없음(2026-11-27 Fable 검토 6): 루트 탭·팀 탭의 마지막 탭 오른쪽 끝이 탭 상자 오른쪽 끝에서 8px 안(휴대폰 격자일 때).
  for (const [w, h] of [[320, 640], [390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.waitForTimeout(400);
    const t = await p.evaluate(() => { const a = document.querySelector('.guide-topbar a.guide-team[href="/team/"]'), bar = document.querySelector('.guide-topbar').getBoundingClientRect(); const r = a?.getBoundingClientRect(); const nav = document.querySelector('.guide-navigation'), btns = [...nav.querySelectorAll('button')]; return { ok: !!a && r.width >= 32 && r.left >= bar.left && r.right <= bar.right, label: a?.getAttribute('aria-label'), overflowX: document.documentElement.scrollWidth - innerWidth, grid: getComputedStyle(nav).display === 'grid', gap: nav.getBoundingClientRect().right - btns.at(-1).getBoundingClientRect().right }; });
    assert.ok(t.ok && t.label === '팀 25인 화면', `[U71] ${w} 팀 화면 단추 ${JSON.stringify(t)}`); assert.ok(t.overflowX <= 0, `[U71] ${w} 가로 넘침`);
    if (t.grid) assert.ok(t.gap <= 8, `${w} 루트 탭 줄 빈 칸 ${t.gap}px`);
    await p.goto(base + '/team/'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(300);
    const tt = await p.evaluate(() => { const l = document.querySelector('.team-head [role=tablist]'), b = [...l.querySelectorAll('[role=tab]')]; return { n: b.length, gap: l.getBoundingClientRect().right - b.at(-1).getBoundingClientRect().right, top: new Set(b.map(x => Math.round(x.getBoundingClientRect().top))).size, overflowX: document.documentElement.scrollWidth - innerWidth }; });
    if (w < 768) { assert.ok(tt.gap <= 8, `${w} 팀 탭 줄 빈 칸 ${JSON.stringify(tt)}`); if (w < 360) assert.equal(tt.top, 1, `${w} 팀 탭 한 줄 3칸`); }
    assert.ok(tt.overflowX <= 0, `${w} 팀 화면 가로 넘침`);
    n++; await ctx.close();
  }
  console.log(`통과: 고정 머리·맨 위로·선물·빈 체크 기록 ${n}개 화면`);
} finally { await browser.close(); }
