import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync,copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
process.env.TEMP=process.env.TMP=resolve('.tmp');
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const rows=[],errors=[],screens=[];
mkdirSync('.tmp/corrections-screens',{recursive:true});mkdirSync('docs/screens',{recursive:true});
try{
 for(const [width,height]of [[1440,900],[375,812]])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height},colorScheme:theme});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource:'))errors.push(m.text());});
  const scopes=[...['cai','dietrich','theodora','leda'].flatMap(route=>['1','2'].map(part=>({route,part}))),{route:'part3',part:'3'}];
  for(const {route,part} of scopes){
   await page.goto(`http://localhost:3000/${route}/${part}/`);await page.waitForLoadState('networkidle');
   await page.waitForFunction(()=>!!document.querySelector('.app-shell')&&!document.querySelector('.checklist input[disabled]'));
   for(const [name,view]of [['할 일','tasks'],['인물','people'],['준비','prep'],['재료와 구매','materials']]){
    if(view!=='tasks')await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name,exact:true}).click();
    await page.getByRole('heading',{name,exact:true,level:1}).waitFor();
    if(view==='people')await page.locator('.person>details').evaluateAll(es=>es.forEach(e=>e.open=true));
    if(view==='prep')await page.locator('.reference-disclosure').evaluateAll(es=>es.forEach(e=>e.open=true));
    const row=await page.evaluate(()=>{
     const visible=e=>e.checkVisibility()&&e.getBoundingClientRect().width>0;
     return {eraViolations:document.querySelector('.app-shell')?.getAttribute('data-route')==='part3'?[]:[...document.querySelectorAll('img[src*="/post-timeskip/"]')].map(e=>e.src),horizontalScroll:document.documentElement.scrollWidth-innerWidth,amountWrapViolations:[...document.querySelectorAll('[data-amount],.gold-table .amount')].filter(e=>getComputedStyle(e).whiteSpace!=='nowrap').length,
      tableFontViolations:[...document.querySelectorAll('main .records,main .person-summary,main [data-info-table],main [data-gold-table],main .gold-table')].filter(visible).filter(e=>parseFloat(getComputedStyle(e).fontSize)!==20).length,
      groupLineViolations:[...document.querySelectorAll('.readable-group[data-expanded=false]>.readable-body')].filter(visible).filter(e=>e.getBoundingClientRect().height>parseFloat(getComputedStyle(e).lineHeight)*3+1).length,
      faceSizes:[...new Set([...document.querySelectorAll('main img[src*="/portraits/"],main img[src*="/gods/"]')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return `${r.width}×${r.height}`;}))]};
    });
    Object.assign(row,{route,part,view,width,height,theme});rows.push(row);
    assert.equal(row.horizontalScroll,0,JSON.stringify(row));assert.equal(row.eraViolations.length,0,JSON.stringify(row));
    assert.equal(row.amountWrapViolations,0,JSON.stringify(row));
    assert.equal(row.tableFontViolations,0,JSON.stringify(row));assert.equal(row.groupLineViolations,0,JSON.stringify(row));
    if(view==='people')assert.deepEqual(row.faceSizes,['96×96']);
    if(view==='prep')assert.ok(row.faceSizes.every(size=>size==='48×48'));
    if(part!=='2'){
      await page.evaluate(()=>scrollTo(0,0));
      const file=`${route}-${view}-${width}x${height}-${theme}.png`;await page.screenshot({path:`.tmp/corrections-screens/${file}`});screens.push(file);
    }
   }
  }
  await page.goto('http://localhost:3000/theodora/1/');await page.waitForLoadState('networkidle');
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
 writeFileSync('docs/corrections-browser-results.json',JSON.stringify({status:errors.length?'failed':'passed',host:'Codex / Windows / installed Chrome / Playwright',base:'http://localhost:3000',rows,errors,screens:screens.map(f=>`docs/screens/${f}`),limits:'1·2부 네 루트와 3부의 할 일·인물·준비·재료, 1부 실전·보충 육성 줄 목록. 다른 브라우저·운영체제·배포 빌드는 증명하지 않는다.'},null,2));
}
