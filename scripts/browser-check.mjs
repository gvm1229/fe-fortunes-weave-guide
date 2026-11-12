import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const root=resolve('out');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.otf':'font/otf','.woff2':'font/woff2'};
const server=createServer((req,res)=>{let p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(root)){res.writeHead(403).end();return;}if(existsSync(p)&&statSync(p).isDirectory())p=resolve(p,'index.html');if(!existsSync(p)){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[extname(p)]||'application/octet-stream');res.end(readFileSync(p));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
mkdirSync('.tmp/screenshots',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];const errors=[];
async function measure(page,label){
  await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
    const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[hidden]');};
    const small=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<18).map(e=>({tag:e.tagName,text:e.textContent.slice(0,50),size:getComputedStyle(e).fontSize}));
    return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,small,background:getComputedStyle(document.body).backgroundColor,theme:document.documentElement.className};
  });
  assert.deepEqual(result.small,[],`${label} 18px 미만`);
  assert.ok(result.scrollWidth<=result.width,`${label} 가로 넘침 ${result.scrollWidth}/${result.width}`);
  if(result.width===375){const overlaps=await page.locator('.view-nav button span').evaluateAll(es=>es.map(e=>({r:e.getBoundingClientRect().toJSON(),p:e.parentElement.getBoundingClientRect().toJSON()})).filter(x=>x.r.width>x.p.width+1));assert.deepEqual(overlaps,[],`${label} mobile labels overlap`);}results.push({label,...result});
}
try{
  for(const [width,height]of [[3840,2160],[375,812],[768,1024],[1920,1080]]){
    for(const theme of ['light','dark']){
      const context=await browser.newContext({viewport:{width,height},colorScheme:theme});
      const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});
      for(const url of ['/','/theodora/1/','/team/']){
        await page.goto(base+url);await page.waitForLoadState('networkidle');await measure(page,`${url} ${width} ${theme}`);
        if(url==='/theodora/1/'){
          for(const name of ['인물','준비','재료·구매','참고 문서']){
            await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name,exact:true}).click();await measure(page,`${name} ${width} ${theme}`);if(width===375&&theme==='light'||width===1920&&theme==='dark')await page.screenshot({path:`.tmp/screenshots/view-${name}-${width}-${theme}.png`,fullPage:false});
          }
          await page.getByRole('button',{name:'지원 루프 따라하기',exact:false}).first().click();await page.getByRole('dialog').waitFor();if(width===375&&theme==='light'){const link=page.locator('[data-doc-url=\"weekly-support-review.md\"]');await link.scrollIntoViewIfNeeded();const top=await page.locator('.sheet-scroll').evaluate(e=>e.scrollTop);await link.click();await page.locator('.sheet-heading button').click();await page.waitForTimeout(100);const restored=await page.locator('.sheet-scroll').evaluate(e=>e.scrollTop);assert.ok(Math.abs(restored-top)<2,`document history scroll ${restored}/${top}`);}await measure(page,`문서 ${width} ${theme}`);await page.keyboard.press('Escape');
          await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name:'지금 할 일',exact:true}).click();
          const box=page.locator('.checklist input').first();const old=await box.isChecked();await box.click();await page.reload();assert.equal(await page.locator('.checklist input').first().isChecked(),!old,'체크 재로딩 보존');
          await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`.tmp/screenshots/guide-${width}-${theme}.png`,fullPage:false});
        }
        if(url==='/team/'){if(width===3840){const bottom=await page.locator('.team-grid').evaluate(e=>e.getBoundingClientRect().bottom);if(bottom>height)console.log(await page.locator('.team-unit').first().evaluate(e=>[...e.children].map(x=>({tag:x.tagName,class:x.className,height:x.getBoundingClientRect().height,margin:getComputedStyle(x).margin,padding:getComputedStyle(x).padding}))),await page.locator('.team-grid').evaluate(e=>({height:e.getBoundingClientRect().height,gap:getComputedStyle(e).gap,rows:getComputedStyle(e).gridTemplateRows})));assert.ok(bottom<=height,`4K final 25 overflow ${bottom}/${height}`);}for(const name of ['네 진영장 포함','역할 균형 추천','현재25인·병과 수정']){await page.getByRole('button',{name,exact:true}).click();assert.equal(await page.locator('.team-unit').count(),25);}await page.screenshot({path:`.tmp/screenshots/team-${width}-${theme}.png`,fullPage:false});}
        if(url==='/')await page.screenshot({path:`.tmp/screenshots/home-${width}-${theme}.png`,fullPage:false});
      }
      await context.close();
    }
  }
  const context=await browser.newContext();const page=await context.newPage();
  for(const route of ['theodora','leda','dietrich','kai'])for(const part of ['1','2']){await page.goto(`${base}/${route}/${part}/`);await page.waitForLoadState('networkidle');assert.ok(await page.locator('.checklist input').count()>0);}
  await page.goto(base+'/part3/3/');await page.waitForLoadState('networkidle');assert.ok(await page.locator('.checklist input').count()>0);
  await page.goto(base+'/theodora/1/');await page.waitForLoadState('networkidle');
  const original=await page.evaluate(()=>localStorage.getItem('fortunes-weave-checklist-v1'));
  await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{invalid')});
  assert.ok(await page.getByRole('alert').isVisible());assert.equal(await page.evaluate(()=>localStorage.getItem('fortunes-weave-checklist-v1')),original);
  const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'내보내기',exact:false}).click();const download=await downloadEvent;await download.saveAs('.tmp/export-checklist.json');assert.deepEqual(JSON.parse(readFileSync('.tmp/export-checklist.json','utf8')),JSON.parse(original));
  const imported={schemaVersion:1,revision:300,checks:{'prep-boons':true,'prep-boons--83c6deded0':false}};
  await page.locator('input[type=file]').setInputFiles({name:'checklist.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});
  await page.reload();await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('[id="prep-boons--83c6deded0"]').isChecked(),false);
  assert.equal(await page.locator('[id="prep-boons--5d107be39e"]').isChecked(),true);
  await page.goto(base+'/theodora/1/');await page.waitForLoadState('networkidle');const box=page.locator('.checklist input').first();const before=await box.isChecked();
  await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('시험 저장 실패','QuotaExceededError');};});await box.click();assert.equal(await box.isChecked(),before);assert.ok((await page.getByRole('status').innerText()).includes('저장하지 못했습니다'));
  const contrast=[];
  for(const theme of ['light','dark']){
    await page.emulateMedia({colorScheme:theme});
    for(const route of ['theodora','leda','dietrich','kai','part3']){
      await page.goto(`${base}/${route}/${route==='part3'?'3':'1'}/`);await page.waitForLoadState('networkidle');
      const colors=await page.locator('.app-shell').evaluate(e=>Object.fromEntries(['background','foreground','primary','secondary','accent','muted'].map(k=>[k,getComputedStyle(e).getPropertyValue('--'+k).trim()])));
      const luminance=hex=>{const rgb=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
      for(const token of ['foreground','primary','secondary','accent','muted']){const a=luminance(colors.background),b=luminance(colors[token]);const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5,`${route} ${theme} ${token} contrast ${ratio}`);contrast.push({route,theme,token,ratio});}
    }
  }
  assert.deepEqual(errors,[],'브라우저 실행 오류');
  writeFileSync('docs/browser-results.json',JSON.stringify({status:'passed',host:'Windows / installed Chrome / Playwright',results,contrast,checks:['체크 재로딩 보존','저장 실패 시 미반영','9개 범위 URL','팀 편성안 각각 25명','문서 열기·닫기'],errors},null,2));
  console.log(`통과: ${results.length}개 화면·테마 검사, 체크 저장·실패, 9개 URL, 팀 3안`);
}catch(error){writeFileSync('docs/browser-results.json',JSON.stringify({status:'failed',host:'Windows / installed Chrome / Playwright',error:String(error),results,errors},null,2));throw error;}
finally{await browser.close();await new Promise(r=>server.close(r));}
