import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync,copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
process.env.TEMP=process.env.TMP=resolve('.tmp');
const base=process.env.BROWSER_BASE_URL||'http://localhost:3000';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const rows=[],errors=[],screens=[];
mkdirSync('.tmp/corrections-screens',{recursive:true});mkdirSync('docs/screens',{recursive:true});
try{
 // 루트 머리 막대: 스크롤하면 맨 위에 붙고, 높이는 그대로, 붙은 동안만 작은 이름이 보인다(2026-11-14 사용자 지시).
 for(const [width,height] of [[1920,1080],[1440,900],[768,1024],[390,844]]){const page=await browser.newPage({viewport:{width,height}});await page.goto(`${base}/theodora/1/`);await page.locator('.route-head').waitFor();await page.waitForTimeout(2500);
  const at=y=>page.evaluate(async y=>{scrollTo(0,y);await new Promise(r=>setTimeout(r,250));const h=document.querySelector('.route-head');return {top:Math.round(h.getBoundingClientRect().top),height:Math.round(h.getBoundingClientRect().height),title:getComputedStyle(h.querySelector('.route-head-title')).display,progressInToolbar:!!document.querySelector('.check-toolbar .toolbar-progress,.check-toolbar progress'),overflow:document.documentElement.scrollWidth-innerWidth};},y);
  const top=await at(0),down=await at(2000);
  assert.ok(top.top>0&&top.title==='none'&&down.top===0&&down.title!=='none'&&top.height===down.height&&!top.progressInToolbar&&top.overflow===0&&down.overflow===0,width+' '+JSON.stringify({top,down}));
  if(width>=1440)assert.ok(await page.evaluate(()=>document.querySelector('.tasks-main').getBoundingClientRect().width>900),width+' 넓은 화면 할 일 칸');
  await page.close();}
 // 1001~1199px: 할 일 칸이 정보 칸보다 넓어야 한다(옛 태블릿 규칙으로 할 일이 300px로 눌리던 문제, 2026-11-14).
 for(const width of [1024,1100,1199]){const page=await browser.newPage({viewport:{width,height:800}});await page.goto(`${base}/theodora/1/`);await page.locator('.check-toolbar').waitFor();
  const w=await page.evaluate(()=>({main:document.querySelector('.tasks-main').getBoundingClientRect().width,rail:document.querySelector('.context-rail').getBoundingClientRect().width,overflow:document.documentElement.scrollWidth-innerWidth}));
  assert.ok(w.main>w.rail*1.5&&w.overflow===0,width+' '+JSON.stringify(w));await page.close();}
 for(const [width,height]of [[1440,900],[375,812]])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height},colorScheme:theme});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource:'))errors.push(m.text());});
  const scopes=[...['cai','dietrich','theodora','leda'].flatMap(route=>['1','2'].map(part=>({route,part}))),{route:'part3',part:'3'}];
  for(const {route,part} of scopes){
   await page.goto(`${base}/${route}/${part}/`);await page.waitForLoadState('networkidle');
   await page.waitForFunction(()=>!!document.querySelector('.app-shell')&&!document.querySelector('.checklist input[disabled]'));
   for(const [name,view]of [['할 일','tasks'],['인물','people'],['준비','prep'],['재료와 구매','materials']]){
    if(view!=='tasks')await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name,exact:true}).click();
    // 재설계 뒤 할 일 화면의 h1은 루트 띠(예: 세오도라 1부)다. 할 일은 도구 줄로 확인한다.
    if(view==='tasks')await page.locator('.check-toolbar').waitFor();else await page.getByRole('heading',{name,exact:true,level:1}).waitFor();
    if(view==='people')await page.locator('.person>details').evaluateAll(es=>es.forEach(e=>e.open=true));
    if(view==='prep')await page.locator('.reference-disclosure').evaluateAll(es=>es.forEach(e=>e.open=true));
    const row=await page.evaluate(()=>{
     const visible=e=>e.checkVisibility()&&e.getBoundingClientRect().width>0;
     return {eraViolations:document.querySelector('.app-shell')?.getAttribute('data-route')==='part3'?[]:[...document.querySelectorAll('img[src*="/post-timeskip/"]')].map(e=>e.src),horizontalScroll:document.documentElement.scrollWidth-innerWidth,amountWrapViolations:[...document.querySelectorAll('[data-amount],.gold-table .amount')].filter(e=>getComputedStyle(e).whiteSpace!=='nowrap').length,
      tableFontViolations:[...document.querySelectorAll('main .records,main .person-summary,main [data-info-table],main [data-gold-table],main .gold-table')].filter(visible).filter(e=>parseFloat(getComputedStyle(e).fontSize)!==(innerWidth<768&&e.matches('.person-summary,.gold-table,[data-gold-table]')?18:20)).length,
      groupLineViolations:[...document.querySelectorAll('.readable-group[data-expanded=false]>.readable-body')].filter(visible).filter(e=>e.getBoundingClientRect().height>parseFloat(getComputedStyle(e).lineHeight)*3+1).length,
      // 배지를 감싼 칩·버튼·표 머리에 배경이 있으면 배경이 겹친다(2026-11-14 사용자 지적). 카드·칸 같은 큰 면은 제외.
      doubledBadges:[...document.querySelectorAll('.game-badge')].filter(b=>{for(let e=b.parentElement;e&&!e.matches('p,li,td,dd,div,section,main,table,article,details');e=e.parentElement){const bg=getComputedStyle(e).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')return true;}return false;}).map(b=>b.textContent).slice(0,5),
      faceSizes:[...new Set([...document.querySelectorAll('main img[src*="/portraits/"],main img[src*="/gods/"]')].filter(e=>!e.closest('.game-badge')).filter(visible).map(e=>{const r=e.getBoundingClientRect();return `${r.width}×${r.height}`;}))]};
    });
    Object.assign(row,{route,part,view,width,height,theme});rows.push(row);
    assert.equal(row.horizontalScroll,0,JSON.stringify(row));assert.equal(row.eraViolations.length,0,JSON.stringify(row));
    assert.equal(row.amountWrapViolations,0,JSON.stringify(row));assert.deepEqual(row.doubledBadges,[],JSON.stringify(row));
    assert.equal(row.tableFontViolations,0,JSON.stringify(row));assert.equal(row.groupLineViolations,0,JSON.stringify(row));
    // 재설계 뒤 휴대폰은 표 글자 18px, 인물 얼굴 72px(app/redesign.css).
    if(view==='people')assert.deepEqual(row.faceSizes,[width<768?'72×72':'96×96']);
    // 인물 카드: 계획 쌍은 14개 이하. 카이 루트 전차병 5명은 옛 경로 병종을 말하지 않는다(마스터 기술용 줄만 예외, 2026-11-14 사용자 결정).
    if(view==='people'&&width===1440&&theme==='light'){
     for(const t of await page.getByRole('button',{name:/시험 조건·시기별 계획/}).all())if(await t.getAttribute('aria-expanded')!=='true')await t.click();
     const cards=await page.evaluate(()=>[...document.querySelectorAll('.person')].map(p=>({name:p.querySelector('h2')?.textContent,pairs:p.querySelectorAll('.detail-pairs>div').length,text:[...p.querySelectorAll('.person-summary td,.detail-pairs>div')].filter(e=>e.querySelector('dt')?.textContent!=='전차병 육성').map(e=>e.innerText).join(' '),goal:[...p.querySelectorAll('.person-summary tr')].find(r=>r.querySelector('th')?.textContent==='목표')?.querySelector('td')?.innerText||''})));
     assert.ok(cards.every(c=>c.pairs<=14),JSON.stringify(cards.filter(c=>c.pairs>14).map(c=>c.name+' '+c.pairs)));
     if(route==='cai'&&part!=='3')for(const c of cards.filter(c=>/^(카이|녹투라|세테스|누조|이오)$/.test(c.name)))assert.ok(!/바딩거|워리어|브리건드|스나이퍼|아처|창의 범위 공격|기준판에 레벨업|현재 병종의 주력/.test(c.text),c.name+' '+part+'부 옛 경로 글');
     if(route==='cai'&&part==='2')assert.ok(!cards.some(c=>/^(카이|녹투라|세테스|누조)$/.test(c.name)&&/권장 Lv20/.test(c.goal)),'2부 목표에 전차병 시험 조건');
    }
    if(view==='prep')assert.ok(row.faceSizes.every(size=>size==='48×48'));
    if(part!=='2'){
      await page.evaluate(()=>scrollTo(0,0));
      const file=`${route}-${view}-${width}x${height}-${theme}.png`;await page.screenshot({path:`.tmp/corrections-screens/${file}`});screens.push(file);
    }
   }
  }
  await page.goto(base+'/theodora/1/');await page.waitForLoadState('networkidle');
  await page.waitForFunction(()=>!document.querySelector('.checklist input[disabled]'));
  await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name:'준비',exact:true}).click();
  await page.getByRole('heading',{name:'준비',exact:true,level:1}).waitFor();
  await page.locator('.reference-disclosure').evaluateAll(es=>es.forEach(e=>e.open=true));
  const heading=page.getByRole('heading',{name:'1부 · 실전과 보충 육성',exact:true}).first();await heading.scrollIntoViewIfNeeded();
  const faceRows=await page.locator('.prep-content [data-face-row]').evaluateAll(es=>es.filter(e=>e.checkVisibility()&&e.textContent.trim()).map(e=>{
   const image=e.querySelector('img'),name=[...e.children].find(c=>c!==image&&c.textContent.trim());if(!image||!name)return null;
   const a=image.getBoundingClientRect(),b=name.getBoundingClientRect();return {name:name.textContent,width:a.width,height:a.height,nameToRight:b.left>=a.right,sameLine:Math.abs((a.top+a.bottom-b.top-b.bottom)/2)<1};
  }).filter(Boolean));
  assert.ok(faceRows.length>0);assert.ok(faceRows.every(r=>r.width===48&&r.height===48&&r.nameToRight&&r.sameLine),JSON.stringify(faceRows.filter(r=>!r.sameLine||!r.nameToRight)));
  rows.push({route:'theodora',part:'1',view:'prep-training',width,height,theme,faceRows});
  const file=`prep-training-${width}x${height}-${theme}.png`;await page.screenshot({path:`.tmp/corrections-screens/${file}`});screens.push(file);
  await page.close();console.log(`통과: 1·2·3부 전 루트·표·준비 줄 목록 ${width}×${height} ${theme}`);
 }
 assert.deepEqual(errors,[]);console.log(`통과: 추가 ${rows.length}개 장면, 준비 인물 48px·이름 오른쪽·같은 줄`);
}catch(error){errors.push(String(error));console.error(error);process.exitCode=1;}
finally{
 await browser.close();for(const file of screens)copyFileSync(`.tmp/corrections-screens/${file}`,`docs/screens/${file}`);
 writeFileSync('docs/corrections-browser-results.json',JSON.stringify({status:errors.length?'failed':'passed',host:'Codex / Windows / installed Chrome / Playwright',base,rows,errors,screens:screens.map(f=>`docs/screens/${f}`),limits:'1·2부 네 루트와 3부의 할 일·인물·준비·재료, 1부 실전·보충 육성 줄 목록. 다른 브라우저·운영체제·배포 빌드는 증명하지 않는다.'},null,2));
}
