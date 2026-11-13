import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const base=process.env.BROWSER_BASE_URL||'http://localhost:3000';
const raw=JSON.parse(readFileSync('content/source/react-content.json'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const checks=[],errors=[],screens=[];
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const nav=name=>page.getByRole('navigation',{name:'공략 화면'}).getByRole('button',{name,exact:true});
async function visit(path){assert.equal((await page.goto(base+path)).status(),200);await page.waitForLoadState('networkidle');}
async function layout(label){
  await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),broken:[...document.images].filter(e=>e.checkVisibility()&&e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0&&e.complete&&!e.naturalWidth).map(e=>e.src)}));
  assert.equal(result.overflow,0,label);assert.deepEqual(result.broken,[],label);checks.push(label);
}
try{
 await visit('/theodora/1/');
 const initial=await page.evaluate(()=>localStorage.getItem('fortunes-weave-checklist-v1'));
 await page.getByLabel('완료 숨기기',{exact:true}).check();await page.reload();await page.waitForLoadState('networkidle');
 assert.equal(await page.getByLabel('완료 숨기기',{exact:true}).isChecked(),true);
 assert.equal(await page.locator('.checklist>li[data-complete=true]:visible').count(),0);
 await page.getByLabel('완료 숨기기',{exact:true}).uncheck();
 checks.push('완료 숨기기·새로 고침 기억');
 await nav('인물').click();await page.getByLabel('인물 이름 검색').fill('리네');
 assert.equal(await page.locator('.people-grid>.person').count(),1);
 await page.getByRole('button',{name:'필터 지우기',exact:true}).click();
 await page.getByLabel('육성판 목적').selectOption({label:'기준 육성'});
 assert.ok(await page.locator('.people-grid>.person').count()>0);
 await page.reload();await nav('인물').click();assert.equal(await page.getByLabel('육성판 목적').inputValue(),'기준 육성');
 await page.getByRole('button',{name:'시험 안내',exact:true}).click();await page.getByRole('dialog').waitFor();assert.ok((await page.locator('.sheet-scroll').innerText()).length>100);await page.keyboard.press('Escape');
 const detail=page.locator('.person').first();await detail.getByRole('button',{name:'원문 기록'}).click();
 const classButton=detail.locator('button.text-link').filter({hasText:'경기병'}).first();await classButton.click();
 await page.getByRole('dialog').waitFor();assert.ok((await page.locator('.sheet-scroll').innerText()).includes('시험'));await page.keyboard.press('Escape');
 checks.push('육성판 필터·기억·시험 안내·인물 안 병종 버튼');
 assert.equal(await page.evaluate(()=>localStorage.getItem('fortunes-weave-checklist-v1')),initial);
 await visit('/team/');
 const tab=name=>page.getByRole('tab',{name,exact:true});
 await tab('최종 25인').click();
 for(const scenario of raw.team.proposal.scenarios){
   await page.getByRole('radiogroup',{name:'편성안'}).getByRole('radio',{name:scenario.title,exact:true}).click();
   for(const selected of [[],[raw.team.proposal.trials[0]],[raw.team.proposal.trials[1]],raw.team.proposal.trials]){
     for(const trial of raw.team.proposal.trials){const item=page.getByRole('toolbar',{name:'체험 교체'}).getByLabel(trial.label,{exact:true});const on=(await item.getAttribute('data-state'))==='on';if(on!==selected.some(t=>t.id===trial.id))await item.click();}
     await page.waitForTimeout(150);
     const swaps={...scenario.swaps};selected.forEach(t=>{swaps[t.outgoing]=t.incoming;});
     const expected=raw.team.baseline.map(n=>swaps[n]||n);
     assert.deepEqual(new Set(await page.locator('.unit-card').evaluateAll(es=>es.map(e=>e.querySelector('.unit-name').textContent))),new Set(expected));
     assert.equal(await page.locator('.unit-card[data-swapped]').count(),expected.filter(n=>!raw.team.baseline.includes(n)).length);
     assert.equal(await page.locator('.swap-badge').count(),expected.filter(n=>!raw.team.baseline.includes(n)).length);
   }
 }
 checks.push('편성 3종 × 체험 조합 4종의 25명 명단·교체 표시 일치');
 await page.reload();await page.waitForLoadState('networkidle');for(const trial of raw.team.proposal.trials)assert.equal(await page.getByRole('toolbar',{name:'체험 교체'}).getByLabel(trial.label,{exact:true}).getAttribute('data-state'),'on');
 const face=()=>page.locator('.unit-card',{has:page.locator('.unit-name',{hasText:'세오도라'})}).locator('.unit-face').getAttribute('src');
 const before=await face();await page.getByRole('button',{name:'시간 경과 후 초상화',exact:true}).click();await page.waitForTimeout(150);
 const after=await face();assert.notEqual(after,before);assert.ok(after.includes('post-timeskip'));
 await page.getByRole('button',{name:/^리네,/}).click();await page.getByRole('dialog').waitFor();assert.ok((await page.locator('.sheet-scroll').innerText()).includes('최종 병종'));
 await page.getByRole('dialog').getByRole('button',{name:'리브로 B',exact:true}).click();await page.waitForTimeout(200);assert.ok(await page.locator('#spell-physic').isVisible());await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});
 checks.push('체험·초상화 기억·인물 시트·백마술 이동');
 await tab('루트 편성').click();
 for(const route of ['세오도라','레다','디트리히','카이'])for(const part of ['1부','2부']){
   await page.getByRole('radiogroup',{name:'편성 루트'}).getByRole('radio',{name:route,exact:true}).click();await page.getByRole('radiogroup',{name:'편성 부'}).getByRole('radio',{name:part,exact:true}).click();await page.waitForTimeout(150);
   const cards=await page.locator('.route-unit').evaluateAll(es=>es.map(e=>e.querySelectorAll('img[src*="/portraits/"]').length));assert.ok(cards.length>0);assert.ok(cards.every(n=>n===1),route+part);
 }
 checks.push('네 루트 × 두 부 편성·카드당 초상화 하나');
 for(const [width,height]of [[375,812],[768,1024],[3840,2160]]){
   await page.setViewportSize({width,height});
   for(const name of ['백마술','루트 편성','비교 근거']){
     await tab(name).click();await page.waitForTimeout(150);await layout(name+' '+width);
     const path='.tmp/feature-'+width+'-'+({'백마술':'spells','루트 편성':'routes','비교 근거':'details'}[name])+'.png';await page.screenshot({path});screens.push(path);
   }
 }
 await page.setViewportSize({width:1440,height:900});await page.getByRole('tab',{name:'비교 근거',exact:true}).click();await page.getByRole('button',{name:'전체 참고 문서',exact:true}).click();
 await page.getByLabel('참고 문서 검색').fill('명시 발화');await page.locator('.document-list button').first().click();await page.getByRole('dialog').waitFor();
 assert.equal(await page.locator('.sheet-scroll [id="s01"]').count(),1);await page.keyboard.press('Escape');
 checks.push('Markdown 명시 앵커 보존');
 for(const route of ['theodora','leda','dietrich','kai']){
   await visit('/'+route+'/2/');for(const view of ['인물','준비','재료와 구매','참고 문서']){await nav(view).click();await layout(route+' 2부 '+view);}
 }
 await visit('/part3/3/');await nav('인물').click();assert.ok(await page.locator('.person-heading img[src*="post-timeskip"]').count()>0);
 checks.push('3부 인물 시간 경과 후 초상화');
 assert.deepEqual(errors,[]);
 console.log('통과: '+checks.length+'개 복원 기능·추가 화면 검사');
}catch(error){errors.push(String(error));console.error(error);process.exitCode=1;}
finally{writeFileSync('docs/feature-browser-results.json',JSON.stringify({status:errors.length?'failed':'passed',host:'Claude / Windows / Chrome / isolated Playwright contexts',base,checks,errors,screens,limits:'실제 사용자 저장소를 사용하지 않음. 휴대폰·태블릿은 창 크기 재현이며 실제 기기 검사는 아님.'},null,2));await browser.close();}
