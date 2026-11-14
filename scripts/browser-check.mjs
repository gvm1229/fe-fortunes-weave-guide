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
const routeNames = {theodora:'세오도라',leda:'레다',dietrich:'디트리히',cai:'카이',part3:'3부'};
const sizes = [[1440,900],[1920,1080],[375,812],[768,1024]];
const results = [], parity = [], functionality = [], errors = [], failures = [], recoveries = [];
const browser = await chromium.launch({ executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const report = (final=false) => writeFileSync(final?'docs/browser-results.json':'.tmp/browser-progress.json',JSON.stringify({
  status:failures.length?'failed':'passed',host:'Codex / Windows / installed Chrome / Playwright',base,
  coverage:{sizes,themes:['light','dark'],routes:['/',...Object.keys(routeNames).map(r=>`/${r}/${r==='part3'?'3':'1'}/`),'/team/'],views:['할 일','인물','준비','재료와 구매','참고 문서'],screenshots},
  method:{overlap:'보이는 형제 요소의 사각형 교차: 화면 구역·탐색·도구 줄·장 제목·묶음 제목·인물·표·목록·시트. 부모/자식 포함과 스크롤 내용/고정 탭은 제외한다.',images:'접힌 장도 포함한 할 일 DOM만 원본과 비교. 다음 행동·보조 칸의 추가 그림은 제외. 같은 묶음의 같은 얼굴만 중복 제거.',limits:'Windows Chrome에서 정적 배포 빌드를 로컬 HTTP 서버로 검사. 다른 운영체제·브라우저·실제 기기·게임 사실은 증명하지 않는다.'},
  results,parity,functionality,errors,failures,recoveries
},null,2));

async function visit(page,path){
  try{assert.equal((await page.goto(base+path)).status(),200,path);}
  catch(e){if(!String(e).includes('ERR_ABORTED'))throw e;assert.equal((await page.goto(base+path)).status(),200,path);}
  await page.waitForLoadState('networkidle');
}

async function ready(page) {
  await page.locator('main').first().waitFor();
  if(/\/(theodora|leda|dietrich|cai|part3)\//.test(new URL(page.url()).pathname))await page.locator('.app-shell').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  try{await page.waitForFunction(()=>!document.querySelector('.checklist input[disabled]'),{},{timeout:10000});}
  catch(e){
    if(!String(e).includes('Timeout'))throw e;
    recoveries.push({url:page.url(),reason:'개발 서버의 초기 체크 상태가 끝나지 않아 한 번 새로 고침'});
    await page.reload();await page.waitForFunction(()=>!document.querySelector('.checklist input[disabled]'));
  }
  await page.evaluate(async()=>{
    await Promise.all([...document.images].filter(e=>e.checkVisibility()).map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));
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
      // 붙는(sticky) 머리는 아래 글 위에 겹쳐 보이는 것이 정상이다(루트 머리 막대, 2026-11-14).
      const children=[...container.children].filter(e=>visible(e)&&getComputedStyle(e).position!=='absolute'&&!e.matches('.route-head'));
      for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){
        const a=children[i].getBoundingClientRect(),b=children[j].getBoundingClientRect();
        const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
        if(w>1&&h>1)overlaps.push({container:container.className,a:children[i].className||children[i].tagName,b:children[j].className||children[j].tagName,width:Math.round(w),height:Math.round(h)});
      }
    }
    const brokenImages=[...document.images].filter(e=>visible(e)&&e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0&&(!e.complete||e.naturalWidth===0)).map(e=>e.getAttribute('src'));
    // 재설계 v3에서 의도적으로 배경이 없는 버튼: 탐색 항목, 배지로 채운 인물 이름, 그림 버튼, 접기 머리, 채운 목록 안의 탭.
    const transparentButtons=[...document.querySelectorAll('button')].filter(e=>visible(e)&&e.textContent.trim()&&!e.matches('.guide-navigation button,.person-inline:has(.game-badge),.map-thumbnail button,.ui-accordion-trigger,[role=tab],[role=radio]')&&getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)').map(e=>e.textContent.slice(0,60));
    const aspectRatioViolations=[...document.images].filter(e=>visible(e)&&e.naturalWidth&&getComputedStyle(e).objectFit==='fill'&&!/\/(portraits|gods)\//.test(e.getAttribute('src')||'')).flatMap(e=>{
      const r=e.getBoundingClientRect(),ratio=e.naturalWidth/e.naturalHeight,error=Math.abs(r.width/r.height/ratio-1);
      return error>.01?[{src:e.getAttribute('src'),display:[r.width,r.height],natural:[e.naturalWidth,e.naturalHeight],error}]:[];
    });
    // 재설계 v3 크기: 묶음 머리 얼굴 36, 글 속 원본 얼굴 28, 정보 칸·준비 48, 인물 카드 96(휴대폰 72). 배지 안 얼굴은 뺀다.
    const faceSections=[['groups','.tasks-main .group-portraits img',36],['tasks','.tasks-main .source-markup img[src*="/portraits/"]:not(.game-badge img),.tasks-main .source-markup img[src*="/gods/"]:not(.game-badge img)',28],['rail','.context-rail img[src*="/portraits/"]',48],['prep','.prep-content img[src*="/portraits/"]:not(.game-badge img),.prep-content img[src*="/gods/"]:not(.game-badge img)',48],['people','.people-grid .person-heading img[src*="/portraits/"]',innerWidth<768?72:96]];
    const faceSizes=faceSections.map(([section,selector,size])=>({section,size,actual:[...new Set([...document.querySelectorAll(selector)].filter(visible).map(e=>{const r=e.getBoundingClientRect();return `${r.width}×${r.height}`;}))]}));
    const faceSizeViolations=faceSizes.filter(s=>s.actual.some(v=>v!==`${s.size}×${s.size}`));
    const paragraphs=[...document.querySelectorAll('main p,.sheet-scroll p')].filter(visible);
    const paragraphViolations=paragraphs.filter(e=>e.textContent.split(/(?<=[.!?。])\s+|(?<=[.!?。])(?=[가-힣])|(?<=[가-힣][.!?。])(?=\d)/u).filter(s=>s.trim()).length>2).map(e=>e.textContent.slice(0,120));
    const groupLineViolations=[...document.querySelectorAll('.readable-group[data-expanded=false]>.readable-body')].filter(visible).filter(e=>e.getBoundingClientRect().height>parseFloat(getComputedStyle(e).lineHeight)*3+1).map(e=>e.textContent.slice(0,80));
    const personTables=[...document.querySelectorAll('.person-summary')].filter(visible).map(e=>({columns:e.rows[0].cells.length,labelWidth:e.rows[0].cells[0].getBoundingClientRect().width}));
    const order=[...document.querySelectorAll('.route-card')].map(e=>({route:e.getAttribute('data-route'),badge:e.querySelector('.route-order')?.textContent,src:e.querySelector('.lord-portrait')?.getAttribute('src'),rect:{x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y},badgeVisible:(()=>{const b=e.querySelector('.route-order')?.getBoundingClientRect(),r=e.getBoundingClientRect();return b&&b.width>0&&b.top>=r.top&&b.bottom<=r.bottom&&b.left>=r.left&&b.right<=r.right;})()}));
    const eraViolations=document.querySelector('.app-shell')?.getAttribute('data-route')!=='part3'?[...document.querySelectorAll('.app-shell img[src*="/post-timeskip/"]')].map(e=>e.getAttribute('src')):[];
    const croppedScenes=[...document.querySelectorAll('img[src*="/events/"],img[src*="/guide/"],img[src*="/recruitment/"],img[src*="/underworld/"]')].filter(visible).filter(e=>getComputedStyle(e).objectFit!=='contain').map(e=>e.getAttribute('src'));
    const sceneHeights=[...document.querySelectorAll('.image-open>img')].filter(visible).map(e=>e.getBoundingClientRect().height);
    const disclosureImageClips=[...document.querySelectorAll('.image-open>img')].filter(visible).filter(e=>{
      const r=e.getBoundingClientRect();let parent=e.parentElement;
      while(parent){if(parent.classList.contains('readable-body')&&getComputedStyle(parent).overflow==='hidden'){const p=parent.getBoundingClientRect();if(r.top<p.top-1||r.bottom>p.bottom+1)return true;}parent=parent.parentElement;}return false;
    }).map(e=>e.getAttribute('src'));
    const goldTables=[...document.querySelectorAll('.gold-table,[data-gold-table]')].filter(visible).map(e=>({columns:e.querySelector('thead tr')?.children.length,amountRight:[...e.querySelectorAll('.amount,[data-amount]')].every(c=>getComputedStyle(c).textAlign==='right')}));
    const luminance=hex=>{const channels=hex.trim().replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;};
    const accentContrast=[...document.querySelectorAll('.route-card,.app-shell,.third-band')].map(e=>{const s=getComputedStyle(e),a=luminance(s.getPropertyValue('--accent')),b=luminance(s.getPropertyValue('--accent-fg'));return {route:e.getAttribute('data-route'),foreground:s.getPropertyValue('--accent-fg').trim(),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
    const rgb=getComputedStyle(document.body).backgroundColor;
    const background='#'+rgb.match(/\d+/g).slice(0,3).map(n=>Number(n).toString(16).padStart(2,'0')).join('').toUpperCase();
    return {horizontalScroll:Math.max(0,document.documentElement.scrollWidth-innerWidth),minimumFont,small,
      dashboardVerticalScroll:document.querySelector('.home')?Math.max(0,document.documentElement.scrollHeight-innerHeight):null,
      overlapCount:overlaps.length,overlaps,brokenImages,transparentButtons,background,bgToken:getComputedStyle(document.body).getPropertyValue('--bg').trim().toUpperCase(),
      imageCount:document.querySelectorAll('img').length,aspectRatioViolations,faceSizes,faceSizeViolations,paragraphViolations,groupLineViolations,personTables,order,eraViolations,croppedScenes,sceneHeights,goldTables,accentContrast,disclosureImageClips};
  });
  // 재설계 v3(docs/design-spec.md "재설계 v3" 표): 루트·팀 화면 body는 공통 --bg(#F4F3F0 / #191918). 첫 화면은 이전 색 그대로.
  const expected=route==='home'?(theme==='light'?'#EFEBE3':'#121116'):(theme==='light'?'#F4F3F0':'#191918');
  const label=`${route}-${view}-${width}x${height}-${theme}`;
  Object.assign(row,{label,route,view,width,height,theme,expectedBackground:expected,backgroundMatches:row.background===expected&&(route!=='home'||row.bgToken===expected)});
  results.push(row);
  for(const [ok,message] of [[row.horizontalScroll===0,'가로 스크롤'],[row.minimumFont>=(width<768&&route==='team'?14:18),'최소 글자'],[row.dashboardVerticalScroll===null||row.dashboardVerticalScroll===0||width<768,'첫 화면 세로 스크롤'],[row.overlapCount===0,'요소 겹침'],[row.brokenImages.length===0,'그림 로딩'],[row.transparentButtons.length===0,'채운 버튼'],[row.backgroundMatches,'body 배경']])if(!ok)failures.push(`${label}: ${message}`);
  for(const [items,message]of [[row.aspectRatioViolations,'원본 그림 비율'],[row.faceSizeViolations,'얼굴 크기'],[row.paragraphViolations,'2문장 문단'],[row.groupLineViolations,'3줄 묶음'],[row.eraViolations,'타임스킵 시대'],[row.croppedScenes,'그림 전체 표시']])if(items.length)failures.push(`${label}: ${message}`);
  if(row.personTables.some(t=>t.columns!==2||Math.abs(t.labelWidth-(width<768?100:120))>1))failures.push(`${label}: 인물 2열 표 너비`);
  if(row.goldTables.some(t=>t.columns!==3||!t.amountRight))failures.push(`${label}: 골드 3열 표·금액 정렬`);
  if(row.sceneHeights.some(h=>h>(width<768?height*.6:480)+1))failures.push(`${label}: 그림 최대 높이`);
  if(row.disclosureImageClips.length)failures.push(`${label}: 접힌 설명의 그림 잘림`);
  if(row.accentContrast.some(c=>c.ratio<4.5))failures.push(`${label}: accent 글자 대비`);
  if(route==='home'){
    if(JSON.stringify(row.order.map(r=>r.route))!==JSON.stringify(['cai','dietrich','theodora','leda']))failures.push(`${label}: 오벨리스크 순서`);
    const badges=['4th','3rd','1st','2nd'];
    if(row.order.some((r,i)=>r.badge!==`루트 진행 순서: ${badges[i]}`||!r.badgeVisible||!r.src.includes('/pre-timeskip/large/')))failures.push(`${label}: 배지·타임스킵 전 큰 그림`);
    if(width===375&&(row.order[0].rect.y!==row.order[1].rect.y||row.order[2].rect.y!==row.order[3].rect.y||row.order[2].rect.y<=row.order[0].rect.y))failures.push(`${label}: 휴대폰 2×2`);
  }
  // docs에 PNG를 계속 쓰면 개발 서버가 다시 불러와지므로 검사 뒤 복사한다.
  if(screenshot){row.png=`${screenshots}/${label}.png`;await page.screenshot({path:`${staging}/${label}.png`,fullPage:false});}
  report();
}

async function stickyCheck(page,route,width,theme){
  if(width>=768&&width<1200)return;
  await page.evaluate(()=>scrollTo(0,800));await page.waitForTimeout(80);
  const measurement=await page.evaluate(()=>{
    // 2026-11-14 현재 배치: 도구 줄은 모든 폭에서 맨 위(top 0). 넓은 화면의 오른쪽 정보 칸은 위아래 24px을 둔 sticky, 767px 이하는 가로 띠(static).
    // 고정 머리는 루트 머리 막대(진행 줄 + 도구 줄). 정보 칸은 그 아래 16px에 붙는다.
    const toolbar=document.querySelector('.route-head'),rail=document.querySelector('.context-rail');
    return {scrollY,toolbarTop:toolbar.getBoundingClientRect().top,toolbarHeight:toolbar.getBoundingClientRect().height,railTop:rail.getBoundingClientRect().top,railHeight:rail.getBoundingClientRect().height,railOverflow:getComputedStyle(rail).overflowY,railPosition:getComputedStyle(rail).position};
  });
  const mobile=width<768,ih=await page.evaluate(()=>innerHeight),passed=Math.abs(measurement.toolbarTop)<1&&(mobile?measurement.railPosition==='static':Math.abs(measurement.railTop-measurement.toolbarHeight-16)<1&&measurement.railHeight<=ih-measurement.toolbarHeight-32+1&&measurement.railOverflow==='auto');
  await page.locator('.chapter-section[open]').evaluate(e=>e.scrollIntoView({block:'start'}));
  measurement.chapterClearance=await page.evaluate(()=>document.querySelector('.chapter-section[open]').getBoundingClientRect().top-document.querySelector('.route-head').getBoundingClientRect().bottom);
  functionality.push({check:'sticky',route,width,theme,...measurement,passed:passed&&measurement.chapterClearance>=-1});
  if(!passed||measurement.chapterClearance< -1)failures.push(`${route}-${width}-${theme}: 고정 영역·장 제목 가림`);
  await page.evaluate(()=>scrollTo(0,0));
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
      await stickyCheck(page,route,width,theme);
      if(width===1440&&theme==='light')await compareImages(page,route);
      for(const [name,view] of [['인물','people'],['준비','prep'],['재료와 구매','materials'],['참고 문서','docs']]){
        await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name,exact:true}).click();
        await page.getByRole('heading',{name,level:1,exact:true}).waitFor();
        if(view==='prep'){
          for(const detail of await page.locator('.reference-disclosure').all())await detail.evaluate(e=>{e.open=true;});
          const gods=await page.locator('main img[src*="/gods/"]').evaluateAll(es=>es.map(e=>({src:e.getAttribute('src'),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
          if(new Set(gods.map(g=>g.src)).size!==gods.length||gods.some(g=>g.width!==48||g.height!==48))failures.push(`${route} ${theme} ${width}: 신별 초상 48px 한 번`);
        }
        await measure(page,{route,view,theme,width,height});
        if(view==='materials'&&route!=='part3'){
          const maps=page.locator('.material-entry .map-thumbnail');
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
    assert.equal(await page.locator('.unit-card').count(),25);
    await context.close();
  }

  const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
  for(const theme of ['light','dark']){await page.emulateMedia({colorScheme:theme});await page.goto(base+'/');await measure(page,{theme,width:1280,height:720});}
  for(const route of ['theodora','leda','dietrich','cai']){await page.goto(`${base}/${route}/2/`);await ready(page);await compareImages(page,route,'2');}
  for(const [width,height]of [[1440,900],[375,812]])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height});await page.emulateMedia({colorScheme:theme});
    await page.goto(base+'/theodora/1/');await ready(page);await page.getByLabel('장 선택',{exact:true}).selectOption({label:'6장'});await ready(page);
    const toggle=page.locator('.chapter-section[open] .prose-toggle:visible').first();
    if(await toggle.count()){
      const group=toggle.locator('..'),before=await group.locator('.readable-body').first().textContent();await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert.equal(await group.locator('.readable-body').first().textContent(),before);await toggle.click();
      functionality.push({check:'disclosure',width,theme,passed:true});
    }
    const image=page.locator('.chapter-section[open]>.image-open').first();await image.scrollIntoViewIfNeeded();await image.click();await page.getByRole('dialog').waitFor();
    await measure(page,{route:'theodora',view:'event-original',theme,width,height});
    const original=await page.locator('.image-original>img').evaluate(async e=>{await e.decode();return {natural:[e.naturalWidth,e.naturalHeight],display:[Math.round(e.getBoundingClientRect().width),Math.round(e.getBoundingClientRect().height)]};});
    assert.deepEqual(original.display,original.natural);functionality.push({check:'image-enlargement',width,theme,...original,passed:true});await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:1280,height:720});await page.emulateMedia({colorScheme:'light'});
  await page.goto(base+'/theodora/1/');await ready(page);
  const box=page.locator('.chapter-section[open] .checklist input').first(),before=await box.isChecked(),boxId=await box.getAttribute('id');
  await box.click();await page.reload();await ready(page);assert.equal(await page.locator(`[id="${boxId}"]`).isChecked(),!before);functionality.push('체크 재로딩 보존');
  const original=await page.evaluate(()=>localStorage.getItem('fortunes-weave-checklist-v1'));
  await page.locator('input[type=file]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{invalid')});await page.locator('p.error[role=alert]').waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('fortunes-weave-checklist-v1')),original);functionality.push('잘못된 JSON은 기존 기록 보존');
  if(!await page.locator('details.backup-menu').evaluate(e=>e.open))await page.locator('details.backup-menu>summary').click();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'내보내기',exact:false}).click();const download=await pending;await download.saveAs('.tmp/export-checklist.json');{const a=JSON.parse(readFileSync('.tmp/export-checklist.json')),b=JSON.parse(original);assert.deepEqual(a,b,JSON.stringify(Object.keys({...a,...b}).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(k=>[k,JSON.stringify(a[k]).slice(0,120),JSON.stringify(b[k]).slice(0,120)])));}functionality.push('JSON 내보내기');
  const imported={schemaVersion:1,revision:300,checks:{'prep-boons':true,'prep-boons--83c6deded0':false}};
  await page.locator('input[type=file]').setInputFiles({name:'checklist.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await page.reload();await ready(page);
  assert.equal(await page.locator('[id="prep-boons--83c6deded0"]').isChecked(),false);assert.equal(await page.locator('[id="prep-boons--5d107be39e"]').isChecked(),true);functionality.push('가져오기·상속 true보다 개별 false 우선');
  const currentBox=page.locator('.chapter-section[open] .checklist input').first(),current=await currentBox.isChecked();await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('시험 저장 실패','QuotaExceededError');};});await currentBox.click();assert.equal(await currentBox.isChecked(),current);assert.ok((await page.getByRole('status').innerText()).includes('저장하지 못했습니다'));functionality.push('저장 실패 시 체크 미반영');
  await page.reload();await ready(page);
  await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name:'참고 문서',exact:true}).click();
  await page.getByRole('button',{name:'지원 루프 따라하기',exact:false}).first().click();await page.getByRole('dialog').waitFor();
  const link=page.locator('[data-doc-url="weekly-support-review.md"]').first();await link.scrollIntoViewIfNeeded();const scroll=await page.locator('.sheet-scroll').evaluate(e=>e.scrollTop);await link.click();await page.getByRole('button',{name:'뒤로',exact:true}).click();await page.waitForTimeout(100);assert.ok(Math.abs(await page.locator('.sheet-scroll').evaluate(e=>e.scrollTop)-scroll)<2);await page.keyboard.press('Escape');functionality.push('문서 뒤로·읽던 위치 복원');
  await page.goto(base+'/team/');for(const name of ['네 진영장 포함','역할 균형 추천','현재 25인·병과 수정']){await page.getByRole('radiogroup',{name:'편성안'}).getByRole('radio',{name,exact:true}).click();assert.equal(await page.locator('.unit-card').count(),25);}functionality.push('팀 세 편성 각각 25명');
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
if(!process.exitCode)await import('./corrections-browser-check.mjs');
if(!process.exitCode)await import('./header-browser-check.mjs');
