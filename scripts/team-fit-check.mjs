// 최종 25인: 16:9·9:16 등 여러 화면에서 스크롤 없이 25명이 보이고, 교체 카드만 6px 테두리와 같은 색 배지를 갖는지 검사한다.
// 실행: BROWSER_BASE_URL=http://localhost:18763 node scripts/team-fit-check.mjs (정적 빌드 권장, 격리된 Playwright 저장소 사용)
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const base=process.env.BROWSER_BASE_URL||'http://localhost:18763';
const raw=JSON.parse(readFileSync('content/source/react-content.json'));
const viewports=[[1920,1080],[1440,810],[1280,720],[1080,1920],[768,1024],[390,693]];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[],errors=[];
try{
  for(const theme of ['light','dark'])for(const [width,height]of viewports){
    const context=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    for(const scenario of raw.team.proposal.scenarios)for(const trials of [[],raw.team.proposal.trials]){
      await page.goto(base+'/team/');
      await page.evaluate(([s,t])=>localStorage.setItem('fortunes-weave-view-v1',JSON.stringify({'team-tab':'final','team-scenario':s,'team-trials':t})),[scenario.id,trials.map(t=>t.id)]);
      await page.reload();await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
      const swaps={...scenario.swaps};trials.forEach(t=>{swaps[t.outgoing]=t.incoming;});
      const expected=raw.team.baseline.map(n=>swaps[n]||n),incoming=expected.filter(n=>!raw.team.baseline.includes(n));
      const r=await page.evaluate(()=>{
        const before=scrollY;scrollTo(0,100);const scrolled=scrollY;scrollTo(0,before);
        const cells=[...document.querySelectorAll('.unit-cell')].map(c=>c.getBoundingClientRect());
        const cards=[...document.querySelectorAll('.unit-card')];
        const minFont=Math.min(...cards.flatMap(c=>[...c.querySelectorAll('.unit-text *')].filter(e=>e.getClientRects().length&&e.textContent.trim()).map(e=>parseFloat(getComputedStyle(e).fontSize))),...[...document.querySelectorAll('.swap-badge')].map(e=>parseFloat(getComputedStyle(e).fontSize)));
        const swapped=cards.filter(c=>c.hasAttribute('data-swapped'));
        return {sh:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth,scrolled,count:cells.length,inView:cells.every(b=>b.top>=0&&b.left>=0&&b.bottom<=innerHeight&&b.right<=innerWidth),sameSize:new Set(cells.map(b=>Math.round(b.width)+'x'+Math.round(b.height))).size===1,
          overflow:cards.filter(c=>c.scrollHeight>c.clientHeight+1||c.scrollWidth>c.clientWidth+1).length,
          textOut:cards.filter(c=>{const b=c.getBoundingClientRect();return [...c.querySelectorAll('.unit-text>*')].some(e=>{const a=e.getBoundingClientRect();return a.width&&(a.right>b.right+1||a.bottom>b.bottom+1||a.left<b.left-1);});}).length,
          minFont,swapped:swapped.length,border:swapped.map(c=>getComputedStyle(c).borderTopWidth+' '+getComputedStyle(c).borderTopColor),plainBorder:cards.filter(c=>!c.hasAttribute('data-swapped')).every(c=>getComputedStyle(c).borderTopColor==='rgba(0, 0, 0, 0)'),
          badges:[...document.querySelectorAll('.swap-badge')].map(b=>{const r=b.getBoundingClientRect(),cell=b.parentElement.getBoundingClientRect(),name=b.parentElement.querySelector('.unit-name').getBoundingClientRect();return {color:getComputedStyle(b).backgroundColor,right:r.right>=cell.right-16&&r.right<=cell.right+1,top:r.top<cell.top+8,covers:!(r.bottom<=name.top||r.top>=name.bottom||r.right<=name.left||r.left>=name.right)};})};
      });
      const label=`${theme} ${width}x${height} ${scenario.id} 체험${trials.length}`;
      assert.equal(r.sh,height,label+' 세로 스크롤');assert.equal(r.sw,width,label+' 가로 스크롤');assert.equal(r.scrolled,0,label+' 스크롤 가능');
      assert.equal(r.count,25,label);assert.ok(r.inView,label+' 화면 밖 칸');assert.ok(r.sameSize,label+' 칸 크기');
      assert.equal(r.overflow,0,label+' 카드 넘침');assert.equal(r.textOut,0,label+' 글자 넘침');
      assert.ok(r.minFont>=(width<=599?14:18),label+' 최소 글자 '+r.minFont);
      assert.equal(r.swapped,incoming.length,label+' 교체 수');assert.ok(r.plainBorder,label+' 나머지 테두리');
      for(const [i,b] of r.badges.entries()){assert.ok(r.border[i].startsWith('6px'),label+' 6px');assert.ok(r.border[i].endsWith(b.color.replace('rgb(','rgb(')),label+' 배지 색=테두리 색');assert.ok(b.right&&b.top,label+' 배지 위치');assert.ok(!b.covers,label+' 배지가 이름을 가림');}
      results.push(label);
    }
    await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log(`통과: 최종 25인 ${results.length}개 조합(화면 6 × 편성안 3 × 체험 2 × 테마 2)`);
}catch(error){errors.push(String(error));console.error(error);process.exitCode=1;}
finally{writeFileSync('docs/team-fit-results.json',JSON.stringify({status:errors.length?'failed':'passed',host:'Claude / Windows / Chrome / isolated Playwright contexts',base,checked:results,errors},null,2));await browser.close();}
