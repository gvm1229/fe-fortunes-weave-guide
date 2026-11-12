import { readFileSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { emptyCounts } from './checklist-source.mjs';

process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000';
const screenshots = 'docs/screens';
const staging = '.tmp/design-screens';
mkdirSync(screenshots, { recursive:true });
mkdirSync(staging, { recursive:true });
const derived = JSON.parse(readFileSync('content/derived/checklist.json'));
const spec = readFileSync('docs/design-spec.md','utf8');
const routeNames = {theodora:'세오도라',leda:'레다',dietrich:'디트리히',kai:'카이',part3:'3부'};
const expectedBackground = {};
for (const line of spec.split('\n')) {
  const cells = line.split('|').slice(1,-1).map(s=>s.trim());
  for (const [route,name] of Object.entries(routeNames)) for (const theme of ['light','dark']) {
    if (cells[0] === `${name} ${theme==='light'?'밝게':'어둡게'}`) expectedBackground[`${route}-${theme}`] = cells[1].toUpperCase();
  }
}
const sizes = [[1440,900],[1920,1080],[375,812],[768,1024]];
const results = [], parity = [], functionality = [], errors = [], failures = [], recoveries = [];
const browser = await chromium.launch({ executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const report = (final=false) => writeFileSync(final?'docs/browser-results.json':'.tmp/browser-progress.json',JSON.stringify({
  status:failures.length?'failed':'passed',host:'Codex / Windows / installed Chrome / Playwright',base,
  coverage:{sizes,themes:['light','dark'],routes:['/',...Object.keys(routeNames).map(r=>`/${r}/${r==='part3'?'3':'1'}/`),'/team/'],views:['할 일','인물','준비','재료와 구매','참고 문서'],screenshots},
  method:{overlap:'보이는 형제 요소의 사각형 교차: 화면 구역·탐색·도구 줄·장 제목·묶음 제목·인물·표·목록·시트. 부모/자식 포함과 스크롤 내용/고정 탭은 제외한다.',images:'접힌 장도 포함한 할 일 DOM만 원본과 비교. 다음 행동·보조 칸의 추가 그림은 제외. 같은 묶음의 같은 얼굴만 중복 제거.',limits:'실제 Windows Chrome 개발 서버 화면. 다른 운영체제·브라우저·배포 빌드·게임 사실은 증명하지 않는다.'},
  results,parity,functionality,errors,failures,recoveries
},null,2));

async function visit(page,path){
  try{assert.equal((await page.goto(base+path)).status(),200,path);}
  catch(e){if(!String(e).includes('ERR_ABORTED'))throw e;assert.equal((await page.goto(base+path)).status(),200,path);}
  await page.waitForLoadState('networkidle');
}

async function ready(page) {
  await page.locator('main').first().waitFor();
  if(/\/(theodora|leda|dietrich|kai|part3)\//.test(new URL(page.url()).pathname))await page.locator('.app-shell').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  try{await page.waitForFunction(()=>!document.querySelector('.checklist input[disabled]'),{},{timeout:10000});}
  catch(e){
    if(!String(e).includes('Timeout'))throw e;
    recoveries.push({url:page.url(),reason:'개발 서버의 초기 체크 상태가 끝나지 않아 한 번 새로 고침'});
    await page.reload();await page.waitForFunction(()=>!document.querySelector('.checklist input[disabled]'));
  }
  await page.evaluate(async()=>{
    const visible=e=>e.checkVisibility()&&e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0;
    await Promise.all([...document.images].filter(visible).map(img=>img.decode().catch(()=>{})));
  });
}

async function measure(page,{route='home',view='home',theme,width,height,screenshot=true}) {
  await ready(page);
  const row = await page.evaluate(()=>{
    const visible=e=>{
      if(e.closest('.sr-only,[hidden],[aria-hidden="true"],nextjs-portal'))return false;
      const r=e.getBoundingClientRect(),s=getComputedStyle(e);
      return r.width>1&&r.height>1&&s.visibility!=='hidden'&&s.display!=='none'&&e.checkVisibility();
    };
    const text=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));
    const minimumFont=Math.min(...text.map(e=>parseFloat(getComputedStyle(e).fontSize)));
    const small=text.filter(e=>parseFloat(getComputedStyle(e).fontSize)<18).map(e=>({text:e.textContent.slice(0,60),font:getComputedStyle(e).fontSize}));
    const overlaps=[];
    const selector='.home,.home-top,.home-actions,.route-deck,.route-card-content,.route-progress,.third-band,.lord-faces,.app-shell,.sidebar,.part-links,.view-nav,.view-nav button,.workspace main,.tasks-layout,.check-toolbar,.toolbar-actions,.context-rail,.context-people,.chapter-section>summary,.action-group>header,.group-portraits,.people-grid,.person-heading,.filters,.search,.records,.scenario-tabs,.team-grid,.god-list,.sheet-heading';
    for(const container of document.querySelectorAll(selector)){
      if(!visible(container))continue;
      const children=[...container.children].filter(e=>visible(e)&&getComputedStyle(e).position!=='absolute');
      for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){
        const a=children[i].getBoundingClientRect(),b=children[j].getBoundingClientRect();
        const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
        if(w>1&&h>1)overlaps.push({container:container.className,a:children[i].className||children[i].tagName,b:children[j].className||children[j].tagName,width:Math.round(w),height:Math.round(h)});
      }
    }
    const brokenImages=[...document.images].filter(e=>visible(e)&&e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0&&(!e.complete||e.naturalWidth===0)).map(e=>e.getAttribute('src'));
    const transparentButtons=[...document.querySelectorAll('button')].filter(e=>visible(e)&&e.textContent.trim()&&getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)').map(e=>e.textContent.slice(0,60));
    const rgb=getComputedStyle(document.body).backgroundColor;
    const background='#'+rgb.match(/\d+/g).slice(0,3).map(n=>Number(n).toString(16).padStart(2,'0')).join('').toUpperCase();
    return {horizontalScroll:Math.max(0,document.documentElement.scrollWidth-innerWidth),minimumFont,small,
      dashboardVerticalScroll:document.querySelector('.home')?Math.max(0,document.documentElement.scrollHeight-innerHeight):null,
      overlapCount:overlaps.length,overlaps,brokenImages,transparentButtons,background,bgToken:getComputedStyle(document.body).getPropertyValue('--bg').trim().toUpperCase(),
      imageCount:document.querySelectorAll('img').length};
  });
  const expected=route==='home'||route==='team'?(theme==='light'?'#EFEBE3':'#121116'):expectedBackground[`${route}-${theme}`];
  const label=`${route}-${view}-${width}x${height}-${theme}`;
  Object.assign(row,{label,route,view,width,height,theme,expectedBackground:expected,backgroundMatches:row.background===expected&&row.bgToken===expected});
  results.push(row);
  for(const [ok,message] of [[row.horizontalScroll===0,'가로 스크롤'],[row.minimumFont>=18,'최소 글자'],[row.dashboardVerticalScroll===null||row.dashboardVerticalScroll===0,'첫 화면 세로 스크롤'],[row.overlapCount===0,'요소 겹침'],[row.brokenImages.length===0,'그림 로딩'],[row.transparentButtons.length===0,'채운 버튼'],[row.backgroundMatches,'body 배경']])if(!ok)failures.push(`${label}: ${message}`);
  // docs에 PNG를 계속 쓰면 개발 서버가 다시 불러와지므로 검사 뒤 복사한다.
  if(screenshot){row.png=`${screenshots}/${label}.png`;await page.screenshot({path:`${staging}/${label}.png`,fullPage:false});}
  report();
}

async function compareImages(page,route,part='1') {
  const stageId=route==='part3'?'part3-plan':`${route}${part==='2'?'-war':''}-plan`;
  const stage=derived.stages.find(s=>s.id===stageId);
  const expected=emptyCounts(),old=emptyCounts();
  for(const chapter of stage.chapters)for(const b of chapter.blocks)for(const key in expected){expected[key]+=b.expected[key];old[key]+=b.raw[key];}
  const actual=await page.locator('[data-checklist-source]').evaluate(root=>{
    const counts={portraits:0,skills:0,gods:0,classes:0,guides:0,locations:0};
    for(const img of root.querySelectorAll('[data-source-image]')){
      const src=img.getAttribute('src');const kind=src.includes('/portraits/')?'portraits':src.includes('/skills/')?'skills':src.includes('/gods/')?'gods':src.includes('/classes/')?'classes':'guides';counts[kind]++;
    }
    counts.locations=root.querySelectorAll('[data-source-location]').length;return counts;
  });
  parity.push({stage:stageId,old,expected,actual,passed:JSON.stringify(expected)===JSON.stringify(actual)});
  try{assert.deepEqual(actual,expected,`${stageId} 원본 그림·위치 버튼`);}catch(e){failures.push(e.message);}
}

try {
  for(const [width,height] of sizes)for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height},colorScheme:theme});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource:'))errors.push(m.text());});
    await visit(page,'/');await measure(page,{theme,width,height});
    for(const route of Object.keys(routeNames)){
      console.log(`${width}×${height} ${theme} ${route}`);
      await visit(page,`/${route}/${route==='part3'?'3':'1'}/`);
      await measure(page,{route,view:'tasks',theme,width,height});
      if(width===1440&&theme==='light')await compareImages(page,route);
      for(const [name,view] of [['인물','people'],['준비','prep'],['재료와 구매','materials'],['참고 문서','docs']]){
        await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name,exact:true}).click();
        await page.getByRole('heading',{name,level:1,exact:true}).waitFor();
        if(view==='prep'){
          for(const detail of await page.locator('.reference-disclosure').all())await detail.evaluate(e=>{e.open=true;});
          const gods=await page.locator('main img[src*="/gods/"]').evaluateAll(es=>es.map(e=>({src:e.getAttribute('src'),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
          if(new Set(gods.map(g=>g.src)).size!==gods.length||gods.some(g=>g.width!==32||g.height!==32))failures.push(`${route} ${theme} ${width}: 신별 초상 32px 한 번`);
        }
        await measure(page,{route,view,theme,width,height});
        if(view==='materials'&&route!=='part3'){
          const maps=page.locator('.material-entry .map-thumbnail img');
          if(await maps.count()!==await page.locator('.material-entry').count())failures.push(`${route}: 재료별 지도 누락`);
          if(width===375){
            await page.getByRole('button',{name:'지도 보기',exact:true}).first().click();await page.getByRole('dialog').waitFor();
            await measure(page,{route,view:'map-sheet',theme,width,height});await page.keyboard.press('Escape');
          }
        }
        if(view==='docs'&&width===375){
          await page.locator('.document-list button').first().click();await page.getByRole('dialog').waitFor();
          await measure(page,{route,view:'document-sheet',theme,width,height});await page.keyboard.press('Escape');
        }
      }
      assert.deepEqual(errors,[],`${route} 브라우저 실행·HTML 구조 오류`);
    }
    await visit(page,'/team/');await measure(page,{route:'team',view:'team',theme,width,height});
    const stripes=await page.locator('.team-stripe').evaluateAll(es=>es.map(e=>({height:e.getBoundingClientRect().height,background:getComputedStyle(e).backgroundColor})));
    assert.equal(stripes.length,25);assert.ok(stripes.every(s=>s.height===6));
    await context.close();
  }

  const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
  for(const theme of ['light','dark']){await page.emulateMedia({colorScheme:theme});await page.goto(base+'/');await measure(page,{theme,width:1280,height:720});}
  for(const route of ['theodora','leda','dietrich','kai']){await page.goto(`${base}/${route}/2/`);await ready(page);await compareImages(page,route,'2');}
  await page.goto(base+'/theodora/1/');await ready(page);
  const box=page.locator('.chapter-section[open] .checklist input').first(),before=await box.isChecked(),boxId=await box.getAttribute('id');
  await box.click();await page.reload();await ready(page);assert.equal(await page.locator(`[id="${boxId}"]`).isChecked(),!before);functionality.push('체크 재로딩 보존');
  const original=await page.evaluate(()=>localStorage.getItem('fortunes-weave-checklist-v1'));
  await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{invalid')});assert.ok(await page.getByRole('alert').isVisible());assert.equal(await page.evaluate(()=>localStorage.getItem('fortunes-weave-checklist-v1')),original);functionality.push('잘못된 JSON은 기존 기록 보존');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'내보내기',exact:false}).click();const download=await pending;await download.saveAs('.tmp/export-checklist.json');assert.deepEqual(JSON.parse(readFileSync('.tmp/export-checklist.json')),JSON.parse(original));functionality.push('JSON 내보내기');
  const imported={schemaVersion:1,revision:300,checks:{'prep-boons':true,'prep-boons--83c6deded0':false}};
  await page.locator('input[type=file]').setInputFiles({name:'checklist.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await page.reload();await ready(page);
  assert.equal(await page.locator('[id="prep-boons--83c6deded0"]').isChecked(),false);assert.equal(await page.locator('[id="prep-boons--5d107be39e"]').isChecked(),true);functionality.push('가져오기·상속 true보다 개별 false 우선');
  const currentBox=page.locator('.chapter-section[open] .checklist input').first(),current=await currentBox.isChecked();await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('시험 저장 실패','QuotaExceededError');};});await currentBox.click();assert.equal(await currentBox.isChecked(),current);assert.ok((await page.getByRole('status').innerText()).includes('저장하지 못했습니다'));functionality.push('저장 실패 시 체크 미반영');
  await page.reload();await ready(page);
  await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name:'참고 문서',exact:true}).click();
  await page.getByRole('button',{name:'지원 루프 따라하기',exact:false}).first().click();await page.getByRole('dialog').waitFor();
  const link=page.locator('[data-doc-url="weekly-support-review.md"]').first();await link.scrollIntoViewIfNeeded();const scroll=await page.locator('.sheet-scroll').evaluate(e=>e.scrollTop);await link.click();await page.getByRole('button',{name:'뒤로',exact:true}).click();await page.waitForTimeout(100);assert.ok(Math.abs(await page.locator('.sheet-scroll').evaluate(e=>e.scrollTop)-scroll)<2);await page.keyboard.press('Escape');functionality.push('문서 뒤로·읽던 위치 복원');
  await page.goto(base+'/team/');for(const name of ['네 진영장 포함','역할 균형 추천','현재25인·병과 수정']){await page.getByRole('button',{name,exact:true}).click();assert.equal(await page.locator('.team-unit').count(),25);}functionality.push('팀 세 편성 각각 25명');
  await context.close();
  assert.deepEqual(errors,[],'브라우저 실행 오류');
  if(failures.length)throw new Error(`${failures.length}건 화면 실패: ${failures.slice(0,8).join('; ')}`);
  console.log(`통과: ${results.length}개 장면, ${parity.length}개 부 원본 그림·위치 버튼, ${functionality.length}개 동작`);
} catch(error) {
  failures.push(String(error));console.error(error);process.exitCode=1;
} finally {
  await browser.close();
  for(const row of results)if(row.png)copyFileSync(`${staging}/${row.label}.png`,row.png);
  report(true);
}
