import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

process.env.TEMP=process.env.TMP=resolve('.tmp');
const base=process.env.BROWSER_BASE_URL||'http://localhost:3000';
const staging='.tmp/design-lead-screens',destination='docs/screens/design-lead';
mkdirSync(staging,{recursive:true});mkdirSync(destination,{recursive:true});
const rows=[],interactions=[],errors=[],screens=[];
const expectedSources={portraits:0,skills:0,gods:0,classes:0,guides:0,locations:0};
for(const c of JSON.parse(readFileSync('content/derived/checklist.json')).stages.find(s=>s.id==='theodora-plan').chapters)for(const b of c.blocks)for(const k in expectedSources)expectedSources[k]+=b.expected[k];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});

async function ready(page){
  await page.waitForFunction(()=>!!document.querySelector('.app-shell')&&!document.querySelector('.checklist input[disabled]'));
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(150);
  await page.evaluate(async()=>Promise.all([...document.images].filter(e=>e.checkVisibility()).map(e=>{e.loading='eager';return e.decode().catch(()=>{});})));
}
async function capture(page,name){
  await page.screenshot({path:`${staging}/${name}.png`});screens.push(`${name}.png`);
}
async function measure(page,scene){
  const row=await page.evaluate(()=>{
    const visible=e=>e.checkVisibility()&&e.getBoundingClientRect().width>0&&!e.closest('.sr-only,[hidden],[aria-hidden=true],nextjs-portal');
    const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
    const text=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));
    const images=[...document.images].filter(e=>visible(e)&&!e.closest('.sidebar,.mobile-header')&&!/\/(portraits|gods)\//.test(e.getAttribute('src')||''));
    const imageRatios=images.filter(e=>e.naturalWidth).map(e=>({src:e.getAttribute('src'),error:Math.abs(rect(e).width/rect(e).height/(e.naturalWidth/e.naturalHeight)-1)}));
    const chipSizes=[...document.querySelectorAll('.source-markup .reference-chip,.source-markup .text-link')].filter(visible).map(e=>({name:e.textContent,height:rect(e).height,font:parseFloat(getComputedStyle(e).fontSize),padding:getComputedStyle(e).paddingInline,icons:[...e.querySelectorAll('img')].map(rect)}));
    const completed=[...document.querySelectorAll('.chapter-section[data-completed=true]')].map(e=>({title:e.dataset.chapter,open:e.open,height:rect(e).height,children:[...e.querySelector('summary').children].map(c=>c.tagName),summary:rect(e.querySelector('summary')).height}));
    const partialLines=[];
    for(const body of document.querySelectorAll('.person-summary .readable-group[data-expanded=false]>.readable-body')){
      if(!visible(body))continue;
      const boundary=rect(body),walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()){
        if(!walker.currentNode.textContent.trim())continue;
        const range=document.createRange();range.selectNodeContents(walker.currentNode);
        for(const r of range.getClientRects())if(r.top<boundary.bottom-1&&r.bottom>boundary.bottom+1)partialLines.push({text:walker.currentNode.textContent.slice(0,70),lineBottom:r.bottom,clipBottom:boundary.bottom});
      }
    }
    const personRows=[...document.querySelectorAll('.person-summary tr')];
    const home=document.querySelector('.sidebar-bottom>a'),homeRect=home&&rect(home);
    const homeText=home&&[...home.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
    let homeTextRect=null;
    if(homeText){const range=document.createRange();range.selectNodeContents(homeText);homeTextRect=rect(range);}
    const save=document.querySelector('.check-toolbar>.save-status'),bar=document.querySelector('.toolbar-progress');
    const sourceCounts={portraits:0,skills:0,gods:0,classes:0,guides:0,locations:0};
    for(const img of document.querySelectorAll('[data-checklist-source] [data-source-image]')){
      const src=img.getAttribute('src'),kind=src.includes('/portraits/')?'portraits':src.includes('/skills/')?'skills':src.includes('/gods/')?'gods':src.includes('/classes/')?'classes':'guides';sourceCounts[kind]++;
    }
    sourceCounts.locations=document.querySelectorAll('[data-checklist-source] [data-source-location]').length;
    const duplicateChipIcons=[...document.querySelectorAll('.reference-chip')].filter(e=>{const previous=e.parentElement.previousElementSibling;return previous?.tagName==='IMG'&&previous.getAttribute('src')===e.querySelector('img')?.getAttribute('src');}).map(e=>e.textContent);
    return {
      horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      minimumFont:Math.min(...text.map(e=>parseFloat(getComputedStyle(e).fontSize))),
      imageCount:imageRatios.length,maxImageRatioError:Math.max(0,...imageRatios.map(e=>e.error)),imageRatioViolations:imageRatios.filter(e=>e.error>.01),
      brokenImages:images.filter(e=>!e.naturalWidth).map(e=>e.src),chipSizes,completed,partialLines,sourceCounts,duplicateChipIcons,
      orphanStatusLines:document.querySelectorAll('.tasks-main>.save-status:not(.error)').length,
      certificateNoticeInTasks:[...document.querySelectorAll('.tasks-main .info-notice')].some(e=>e.textContent.includes('증서 수량은 준비 슬롯')),
      saveInToolbar:!!save,saveRightOfProgress:save&&bar?rect(save).left>=rect(bar).right:null,
      zeroChips:[...document.querySelectorAll('.person .tags>span')].map(e=>e.textContent).filter(s=>/^(지원|명성)\s*0$/.test(s.trim())),
      rawTierRows:personRows.filter(e=>e.querySelector('th')?.textContent==='가입 단계'&&/^\d+$/.test(e.querySelector('td')?.textContent.trim()||'')).map(e=>e.textContent),
      tierLabels:[...new Set(personRows.filter(e=>e.querySelector('th')?.textContent==='가입 단계').map(e=>e.querySelector('td').textContent))],
      joinLabels:[...document.querySelectorAll('.person .tags>.role-chip')].map(e=>e.textContent),
      home:home&&visible(home)?{width:homeRect.width,parentWidth:rect(home.parentElement).width,text:home.textContent,textFits:homeTextRect.left>=homeRect.left&&homeTextRect.right<=homeRect.right,themeAbove:rect(home.previousElementSibling).bottom<=homeRect.top}:null,
    };
  });
  rows.push({...scene,...row});
  assert.equal(row.horizontalOverflow,0,`${scene.label} 가로 넘침`);
  assert.ok(row.minimumFont>=18,`${scene.label} 최소 글자 ${row.minimumFont}`);
  assert.deepEqual(row.imageRatioViolations,[],`${scene.label} 그림 비율`);
  assert.deepEqual(row.brokenImages,[],`${scene.label} 그림 로딩`);
  assert.deepEqual(row.partialLines,[],`${scene.label} 반만 보이는 줄`);
  assert.deepEqual(row.zeroChips,[],`${scene.label} 0 조건 칩`);
  assert.deepEqual(row.rawTierRows,[],`${scene.label} 원시 가입 단계`);
  if(scene.view==='todo'){
    assert.deepEqual(row.sourceCounts,expectedSources,'원본 그림·위치 버튼 수');assert.deepEqual(row.duplicateChipIcons,[]);
    assert.equal(row.orphanStatusLines,0);assert.equal(row.certificateNoticeInTasks,false);
    assert.ok(row.saveInToolbar&&row.saveRightOfProgress);
    assert.ok(row.chipSizes.length>0);
    assert.ok(row.chipSizes.every(c=>c.height<=30&&c.font===18&&c.padding==='8px'),JSON.stringify(row.chipSizes.filter(c=>c.height>30)));
    assert.ok(row.chipSizes.every(c=>c.icons.length===1&&c.icons.every(i=>i.width===20&&i.height<=20)));
    assert.ok(row.completed.length>0&&row.completed.every(c=>!c.open&&c.height===48&&c.summary===48&&c.children.join(',')==='H2,SPAN,svg'),JSON.stringify(row.completed));
  }else{
    assert.deepEqual(row.tierLabels.sort(),['초급 전','초급','중급'].sort());
    assert.equal(row.joinLabels.filter(s=>s==='시작 동료').length,3);
    assert.equal(row.joinLabels.filter(s=>s==='자동 합류 4장').length,2);
  }
  if(scene.width>=1200)assert.ok(row.home?.textFits&&row.home.themeAbove&&row.home.width===row.home.parentWidth,JSON.stringify(row.home));
  return row;
}

try{
  for(const [width,height]of [[1440,900],[375,812]])for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height},colorScheme:theme});
    await context.addInitScript(value=>localStorage.setItem('theme',value),theme);
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/theodora/1/`);await ready(page);
    assert.equal(await page.locator('html').getAttribute('class'),theme);
    const autoScroll=await page.evaluate(()=>({scrollY,current:document.querySelector('.chapter-section[data-current=true]')?.dataset.chapter,top:document.querySelector('.chapter-section[data-current=true]').getBoundingClientRect().top,toolbarBottom:document.querySelector('.check-toolbar').getBoundingClientRect().bottom}));
    assert.ok(autoScroll.scrollY>0&&Math.abs(autoScroll.top-autoScroll.toolbarBottom-8)<2,JSON.stringify(autoScroll));
    interactions.push({width,height,theme,check:'load-current-chapter',...autoScroll});
    const label=`theodora-todo-${width}x${height}-${theme}`;
    await measure(page,{label,width,height,theme,view:'todo'});await capture(page,label);
    const jump=page.locator('.next-action').getByRole('button',{name:'이동',exact:true});
    await jump.scrollIntoViewIfNeeded();await jump.click();
    const target=page.locator('.checklist>li.target-highlight');
    await target.waitFor();
    const highlight=await target.evaluate(e=>{const s=getComputedStyle(e,'::after'),probe=document.createElement('span');probe.style.color='var(--accent)';e.append(probe);const accent=getComputedStyle(probe).color;probe.remove();return {focused:document.activeElement===e,border:s.borderTopWidth,color:s.borderTopColor,accent,duration:s.animationDuration,delay:s.animationDelay,opacity:s.opacity};});
    assert.ok(highlight.focused&&highlight.border==='2px'&&highlight.color===highlight.accent&&highlight.delay==='2s'&&highlight.duration==='0.15s'&&highlight.opacity==='1',JSON.stringify(highlight));
    const targetViewport=await target.evaluate(async e=>{
      let previous=scrollY,stable=0;
      while(stable<5){await new Promise(requestAnimationFrame);stable=scrollY===previous?stable+1:0;previous=scrollY;}
      const r=e.getBoundingClientRect(),toolbar=document.querySelector('.check-toolbar').getBoundingClientRect(),header=document.querySelector('.mobile-header'),nav=document.querySelector('.view-nav');
      return {top:r.top,bottom:r.bottom,toolbarBottom:toolbar.bottom,visibleBottom:innerWidth<768?nav.getBoundingClientRect().top:innerHeight,mobileHeaderTop:innerWidth<768?header.getBoundingClientRect().top:null};
    });
    assert.ok(targetViewport.top>=targetViewport.toolbarBottom&&targetViewport.bottom<=targetViewport.visibleBottom,JSON.stringify(targetViewport));
    if(width<768)assert.equal(targetViewport.mobileHeaderTop,0);
    await capture(page,`${label}-jump`);
    await page.waitForFunction(()=>document.querySelector('.target-highlight')?.getAnimations({subtree:true}).some(a=>a.currentTime>=1900&&a.currentTime<2000));
    assert.equal(await target.evaluate(e=>getComputedStyle(e,'::after').opacity),'1');
    await page.waitForFunction(()=>{const e=document.querySelector('.target-highlight');return e&&Number(getComputedStyle(e,'::after').opacity)>0&&Number(getComputedStyle(e,'::after').opacity)<1;});
    const fading=await target.evaluate(e=>Number(getComputedStyle(e,'::after').opacity));assert.ok(fading>0&&fading<1);
    await page.waitForFunction(()=>!document.querySelector('.target-highlight'));
    interactions.push({width,height,theme,check:'jump-focus-highlight',...highlight,targetViewport,fading,removed:true});
    // 접힌 설명까지 펼쳐 모든 병종 칩의 실제 크기와 문서 열기를 확인한다.
    await page.locator('.chapter-section[data-current=true] .prose-toggle[aria-expanded=false]').evaluateAll(es=>es.forEach(e=>e.click()));
    const chip=page.locator('.chapter-section[data-current=true] .reference-chip').first();
    await chip.click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
    interactions.push({width,height,theme,check:'class-chip-opens-document',passed:true});
    // 이미 끝낸 장도 사용자가 펼칠 수 있고, 다시 접으면 48px이어야 한다.
    const completed=page.locator('.chapter-section[data-completed=true]').first();
    await completed.locator('summary').click();assert.equal(await completed.getAttribute('open'),'');
    await completed.locator('summary').click();assert.equal(await completed.evaluate(e=>e.getBoundingClientRect().height),48);
    await page.evaluate(()=>scrollTo(0,0));await capture(page,`${label}-top`);
    const currentChip=page.locator('.chapter-section[data-current=true] .reference-chip').first();
    await currentChip.scrollIntoViewIfNeeded();await capture(page,`${label}-chips`);
    await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name:'인물',exact:true}).click();
    await page.getByRole('heading',{name:'인물',level:1,exact:true}).waitFor();await ready(page);
    await measure(page,{label:label.replace('-todo-','-people-'),width,height,theme,view:'people'});
    await capture(page,label.replace('-todo-','-people-'));
    const disclosure=page.locator('.person-summary .prose-toggle').first();await disclosure.scrollIntoViewIfNeeded();await disclosure.click();
    assert.equal(await disclosure.getAttribute('aria-expanded'),'true');await disclosure.click();
    interactions.push({width,height,theme,check:'person-disclosure-preserves-content',passed:true});
    await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name:'준비',exact:true}).click();
    assert.equal(await page.locator('main').getByText(/증서 수량은 준비 슬롯/).count(),0);
    await page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name:'재료와 구매',exact:true}).click();
    const notice=await page.locator('.gold-table tfoot .info-notice').evaluateAll(es=>es.filter(e=>e.textContent.includes('증서 수량은 준비 슬롯')).length);
    assert.equal(notice,1);
    interactions.push({width,height,theme,check:'certificate-notice-only-in-gold-table',count:notice});
    await context.close();console.log(`통과: ${width}×${height} ${theme} 할 일·인물·이동`);
  }
  assert.deepEqual(errors,[]);
}catch(error){errors.push(String(error));console.error(error);process.exitCode=1;}
finally{
  await browser.close();
  for(const file of screens)copyFileSync(`${staging}/${file}`,`${destination}/${file}`);
  writeFileSync('docs/design-lead-browser-results.json',JSON.stringify({status:errors.length?'failed':'passed',host:'Codex / Windows / installed Chrome / Playwright',base,rows,interactions,errors,screens:screens.map(s=>`${destination}/${s}`),limits:'세오도라 1부의 1440×900·375×812, 밝게·어둡게. 얼굴 토큰은 그림 비율 검사에서 제외한다. 다른 루트·운영체제·브라우저·배포 빌드는 증명하지 않는다.'},null,2));
}
