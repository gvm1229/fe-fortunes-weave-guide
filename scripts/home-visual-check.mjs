import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[];
const rows=[],base=process.env.BROWSER_BASE_URL||'http://localhost:3000';
mkdirSync('.tmp/final-home',{recursive:true});
try{
 for(const [width,height]of [[375,812],[768,1024],[1280,720],[1440,900],[3840,2160]])for(const theme of ['dark']){
  const page=await browser.newPage({viewport:{width,height},colorScheme:theme});
  await page.goto(base+'/');await page.waitForLoadState('networkidle');
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()));});
  const row=await page.evaluate(()=>({horizontal:document.documentElement.scrollWidth-innerWidth,vertical:document.documentElement.scrollHeight-innerHeight,cards:[...document.querySelectorAll('.route-card')].map(card=>{
   const image=card.querySelector('.lord-portrait'),badge=card.querySelector('.route-order');
   const r=card.getBoundingClientRect();return {route:card.dataset.route,left:r.left,top:r.top,bottom:r.bottom,clearance:image.getBoundingClientRect().top+parseFloat(getComputedStyle(image).paddingTop)-badge.getBoundingClientRect().bottom};
  })}));
  assert.ok(row.horizontal<=0,JSON.stringify({width,height,theme,...row}));
  if(width>height)assert.ok(row.vertical<=0,JSON.stringify({width,height,theme,...row}));
  // [U38] 세로 화면(9:16 등)은 군주 카드 4장을 위아래로 쌓는다(세로 스크롤 허용). 각 카드 위가 앞 카드 아래보다 아래이고 왼쪽 끝이 같다.
  else{assert.equal(row.cards.length,4,JSON.stringify(row));for(let i=1;i<row.cards.length;i++){const a=row.cards[i-1],b=row.cards[i];assert.ok(b.top>=a.bottom-0.5&&Math.abs(b.left-a.left)<=1,`[U38] ${width}x${height} ${theme} 카드 쌓기: ${JSON.stringify(row.cards)}`);}}
  assert.ok(row.cards.every(c=>c.clearance>=0),JSON.stringify(row));
  const screenshot='.tmp/final-home/'+width+'-'+theme+'.png';await page.screenshot({path:screenshot});rows.push({width,height,theme,...row,screenshot});await page.close();
 }
 console.log('통과: 첫 화면 10개 조합 · 가로 넘침 없음 · 가로 화면 세로 스크롤 없음 · 세로 화면 카드 4장 위아래 쌓기(U38) · 배지·초상화 분리');
}catch(error){errors.push(String(error));console.error(error);process.exitCode=1;}finally{await browser.close();writeFileSync('docs/home-visual-results.json',JSON.stringify({status:errors.length?'failed':'passed',errors,host:'Codex / Windows / Chrome / static build',base,rows,limits:'창 크기 재현이며 실제 휴대폰·다른 브라우저 검사는 아님.'},null,2));}
