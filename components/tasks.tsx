'use client';
import { DateOdometer } from './date-odometer';
import { currentGameDate, formatGameDate, PART1_YEAR } from '@/lib/game-date';
import { useEffect, useRef, useState, ViewTransition } from 'react';
import { Check, Download, Upload, ArrowDown, ChevronDown, Archive, Trash2 } from 'lucide-react';
import type { Group, Tree } from '@/lib/content';
import type { Chapter } from '@/lib/checklist';
import { chapterGroups } from '@/lib/checklist';
import { checked } from '@/lib/check-state';
import { autoChecked, groupSteps } from '@/lib/status';
import { StatusButton, BoonSummary } from './status';
import { ImportOverlay, type ImportPhase } from './import-overlay';
import { useChecks } from './checks';
import { usePreference } from './preferences';
import { Button } from './ui/button';
import { SourceMarkup } from './source-markup';
import { personPortrait, lordPortrait } from '@/lib/portraits';
import { Progress } from './progress';
import { GameText, glueDots } from './game-text';
import overrides from '@/content/display-overrides.json';
import { GuideImage } from './image-viewer';
import { final25Class } from '@/lib/final25';
import { YuphasGroup } from './yuphas';
import { verificationTail } from '@/lib/display';
import { lordEmblems, blockMapTarget } from '@/lib/yuphas';
const treeText=(n:Tree):string=>typeof n==='string'?n:n.children.map(treeText).join('');
export function Tasks({route,label,part,chapters,groups,onDoc,onPerson,people=[],context}:{route:string;label:string;part:string;chapters:Chapter[];groups:Group[];onDoc:(url:string)=>void;onPerson?:(name:string)=>void;people?:string[];context?:(chapter:Chapter)=>React.ReactNode}){
  const checks=useChecks(),[announce,setAnnounce]=useState(''),[selected,setSelected]=useState<string|null>(null),[importPhase,setImportPhase]=useState<ImportPhase>({state:'idle'}),[imported,setImported]=useState(''),upload=useRef<HTMLInputElement>(null),toastTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  /** 가져오기: 전체 화면을 막고(최소 0.6초 보여 깜빡이지 않게) 파일을 읽어 검사한 뒤 저장한다. 실패 이유는 막는 창에 보인다.
   *  성공 알림은 파일 내용으로 만든다: 파일에 내 상태가 없으면 '내 상태 없음'이라고 알려 예전 파일·오래된 탭을 구별할 수 있게 한다. */
  async function importFile(file:File){
    setImportPhase({state:'busy'});const start=performance.now();let error='',message='';
    try{const raw=await file.text(),text=raw.charCodeAt(0)===0xFEFF?raw.slice(1):raw;/* 앞의 BOM 제거 */let value:unknown;try{value=JSON.parse(text);}catch{throw new Error('JSON 파일이 아니거나 내용이 깨졌습니다. 기록 관리 → 내보내기로 만든 파일을 고르세요.');}
      checks.importData(value);const d=value as {checks:Record<string,boolean>;status?:unknown};
      message=`가져왔습니다 · 체크 ${Object.values(d.checks).filter(Boolean).length}개 · ${d.status?'내 상태 포함':'파일에 내 상태 없음(기존 내 상태 유지)'}`;}
    catch(e){error=e instanceof Error?e.message:'파일을 읽지 못했습니다.';}
    await new Promise(r=>setTimeout(r,Math.max(0,600-(performance.now()-start))));
    if(error){setImportPhase({state:'error',message:error});return;}
    document.querySelector<HTMLDetailsElement>('.route-head .backup-menu')?.removeAttribute('open');setImportPhase({state:'idle'});
    clearTimeout(toastTimer.current);setImported(message);toastTimer.current=setTimeout(()=>setImported(''),5000);
  }
  /** 장의 마지막 항목을 체크해 그 장이 처음 완료되는 순간에만 색종이를 터뜨린다. 열기·가져오기·해제에서는 부르지 않는다. */
  async function celebrate(cg:Group[],title:string,id:string,value:boolean,target:HTMLElement){
    if(!value)return;
    const all=cg.flatMap(g=>g.actions.map(a=>({a,g:g.id})));
    if(all.every(({a,g})=>checked(a,g,checks.effective)))return;
    const next={...checks.effective,[id]:true};
    if(!all.every(({a,g})=>checked(a,g,next)))return;
    setAnnounce(`${title} 완료`);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const r=target.closest('details.chapter-section')?.querySelector('summary')?.getBoundingClientRect();
    const origin=r&&r.height&&r.bottom>0&&r.top<innerHeight?{x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight}:{x:.5,y:.6};
    const ink=getComputedStyle(target).getPropertyValue('--route-ink').trim();
    const confetti=(await import('canvas-confetti')).default;
    confetti({particleCount:90,spread:70,startVelocity:38,ticks:160,scalar:.9,disableForReducedMotion:true,origin,colors:['#94C4AB',ink||'#4A4658','#9DB8D4']});
  }
  const [hideDone,setHideDone]=usePreference<boolean>('tasks-hide-done',false);
  const head=useRef<HTMLDivElement>(null),scrolled=useRef(false);
  useEffect(()=>{const element=head.current;if(!element)return;const host=element.parentElement;
    const measure=()=>{host?.style.setProperty('--task-header-height',`${element.getBoundingClientRect().height}px`);document.documentElement.style.setProperty('--task-header-height',`${element.getBoundingClientRect().height}px`);};
    const observer=new ResizeObserver(measure);observer.observe(element);measure();
    // scroll-state 쿼리를 모르는 브라우저: 붙은 상태를 IntersectionObserver로 표시한다(같은 모양을 .is-stuck에 둔다).
    // 테마 단추는 하나만(2026-11-15 사용자 지시): 머리 막대가 맨 위에 붙기 전에는 오른쪽 위(첫 줄) 단추, 붙으면 막대 오른쪽 끝 단추. <html data-head-stuck>로 바꾼다.
    let stuck=false;const flag=()=>{const now=element.getBoundingClientRect().top<=0.5&&scrollY>0;if(now!==stuck){stuck=now;document.documentElement.toggleAttribute('data-head-stuck',now);}};
    addEventListener('scroll',flag,{passive:true});addEventListener('resize',flag);flag();
    let io:IntersectionObserver|undefined;
    if(!CSS.supports('container-type: scroll-state')){io=new IntersectionObserver(([e])=>element.classList.toggle('is-stuck',e.intersectionRatio<1&&e.boundingClientRect.top<1),{threshold:[1],rootMargin:'-1px 0px 0px 0px'});io.observe(element);}
    return ()=>{observer.disconnect();io?.disconnect();removeEventListener('scroll',flag);removeEventListener('resize',flag);document.documentElement.removeAttribute('data-head-stuck');document.documentElement.style.removeProperty('--task-header-height');};},[]);
  const active=chapters.find(c=>chapterGroups(c,groups).some(g=>g.actions.some(a=>!checked(a,g.id,checks.effective))))||chapters.at(-1)!;
  useEffect(()=>{
    if(!checks.ready||scrolled.current)return;
    let cancelled=false;
    document.fonts.ready.then(()=>requestAnimationFrame(()=>{
      if(cancelled)return;
      const target=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;
      if(target){reveal(target);target.scrollIntoView({behavior:'instant',block:'center'});}
      else document.querySelector<HTMLElement>('.chapter-section[data-current=true]')?.scrollIntoView({behavior:'instant',block:'start'});
      scrolled.current=true;
    }));
    return ()=>{cancelled=true;};
  },[checks.ready,active.title]);
  useEffect(()=>{const jump=()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){reveal(target);target.scrollIntoView({block:'center'});}};window.addEventListener('hashchange',jump);return()=>window.removeEventListener('hashchange',jump);},[]);
  const chapter=chapters.find(c=>c.title===selected)||active;
  const currentGroups=chapterGroups(chapter,groups);
  const next=currentGroups.flatMap(g=>g.actions.map(a=>({a,g}))).find(({a,g})=>!checked(a,g.id,checks.effective));
  const actions=groups.flatMap(g=>g.actions.map(a=>({a,g}))),count=actions.filter(({a,g})=>checked(a,g.id,checks.effective)).length;
  const markupProps={onDoc,onPerson,part,route};
  /** 이번 장의 첫 미완료 항목으로 이동한다. 고정 도구 줄에 있어 어느 위치에서나 쓸 수 있다. */
  const goNext=()=>{if(!next)return;setSelected(chapter.title);requestAnimationFrame(()=>{
    const row=document.getElementById(next.a.id)?.closest('li');if(!row)return;
    reveal(row);
    row.focus({preventScroll:true});row.scrollIntoView({behavior:'smooth',block:'center'});
    row.classList.remove('target-highlight');void row.offsetWidth;row.classList.add('target-highlight');
    row.addEventListener('animationend',()=>row.classList.remove('target-highlight'),{once:true});
  });};
  const actionNodes=(c:Chapter,g:Group,a:Group['actions'][number])=>Object.hasOwn(overrides.actions,a.id)?[a.text]:c.blocks.find(b=>b.id===g.id)?.actions[a.id]||[a.text];
  function exportFile(){const blob=new Blob([JSON.stringify(checks.data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='checklist.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  // 바닥 날짜: 처음으로 체크가 남은 묶음의 게임 날짜(스크롤과 무관). 1부만(2부·3부는 달력 날짜 없음). 기록을 읽은 뒤에만 보여 첫 화면에서 헛구르지 않는다.
  const gameDate=checks.ready&&part==='1'?currentGameDate(chapters.flatMap(c=>chapterGroups(c,groups)),(a,g)=>checked(a,g.id,checks.effective)):null;
  return <><section className="route-banner" aria-label={`${label} ${part}부 진행`}><div className="route-banner-art" data-route={route}><img className="banner-emblem" src={lordEmblems[route]} alt=""/><h1>{label}{route==='part3'?'':<span> {part}부</span>}</h1>{route==='part3'?<img className="banner-lord" src={lordPortrait(route,part,true)} alt=""/>:<ViewTransition name={`lord-${route}`} share="morph" default="none"><img className="banner-lord" src={lordPortrait(route,part,true)} alt=""/></ViewTransition>}</div></section>
  {/* 루트 머리 막대: 스크롤해도 맨 위에 고정된다(2026-11-14 사용자 지시). 붙어 있는 동안 작은 루트 이름이 보인다. 막대 높이는 바뀌지 않아 화면이 튀지 않는다. */}
  <div ref={head} className="route-head"><div className="route-head-bar">
    <p className="route-head-title" aria-hidden="true"><img src={lordPortrait(route,part)} alt=""/><span>{label}{route==='part3'?'':` ${part}부`}</span></p>
    <div className="banner-progress"><span>완료 <strong>{count}</strong> / {actions.length}</span><Progress value={count} max={actions.length} label="전체 진행률"/><strong>{Math.round(count/Math.max(1,actions.length)*100)}%</strong></div>
    <div className="check-toolbar" data-overlap-group="toolbar">
    <label className="chapter-picker"><span className="sr-only">장 선택</span><select id="chapter" aria-label="장 선택" value={chapter.title} onChange={e=>{const title=e.target.value;setSelected(title);requestAnimationFrame(()=>{const target=document.querySelector<HTMLDetailsElement>(`[data-chapter="${CSS.escape(title)}"]`);if(target){target.open=true;target.scrollIntoView({block:'start'});}});}}>{chapters.map(c=><option key={c.title}>{c.title}</option>)}</select></label>
    {/* 완료 숨기기는 고정 머리 막대에 둔다(2026-11-14 사용자 지시: 맨 위까지 올라가지 않아도 되게). */}<label className="check-control" title="완료 숨기기"><input type="checkbox" aria-label="완료 숨기기" checked={hideDone} onChange={e=>setHideDone(e.target.checked)}/> <span className="check-control-label" aria-hidden="true"><span className="label-long">완료 숨기기</span><span className="label-short">완료 숨김</span></span></label>
    <Button className="jump-next" onClick={goNext} disabled={!next} aria-label="다음 할 일로 이동"><ArrowDown size={20}/><span className="jump-label">이동</span></Button>
    {!checks.error&&<span role="status" className="save-status"><Check size={20} aria-label="저장됨"/></span>}
    <StatusButton route={route}/>
    <details className="backup-menu"><summary title="기록 관리"><Archive size={20} aria-hidden="true" className="backup-icon"/><span className="backup-label">기록 관리</span></summary><div className="toolbar-actions"><StatusButton route={route} menu/><Button variant="secondary" onClick={exportFile}><Download size={20}/> 내보내기</Button><Button variant="secondary" onClick={()=>upload.current?.click()}><Upload size={20}/> 가져오기</Button><Button variant="secondary" onClick={()=>{if(window.confirm('이 브라우저의 체크 기록과 내 상태를 모두 지웁니다. 되돌릴 수 없으니 먼저 내보내기로 백업하세요. 지울까요?'))checks.clear();}}><Trash2 size={20}/> 기록 지우기</Button>{/* accept를 두지 않는다: 휴대폰 파일 선택기는 내려받은 .json의 형식을 몰라 고를 수 없게 막는 일이 있다(2026-11-15). 내용은 가져올 때 검사한다. */}<input ref={upload} type="file" className="sr-only" aria-label="체크·내 상태 JSON 가져오기" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void importFile(file);}}/></div></details>
  </div></div></div>
  <div className="tasks-layout"><div className="tasks-main">{checks.error&&<div role="status" className="save-status error">{checks.status}<Button variant="secondary" onClick={checks.retry}>저장소 다시 읽기</Button></div>}
  {next&&<section className="next-action"><h2>다음 할 일</h2><p><GameText text={next.a.text} withSkills/></p></section>}
  <p className="sr-only" aria-live="polite">{announce}</p><div data-checklist-source>{chapters.map(c=>{const cg=chapterGroups(c,groups),total=cg.reduce((n,g)=>n+g.actions.length,0),done=cg.reduce((n,g)=>n+g.actions.filter(a=>checked(a,g.id,checks.effective)).length,0),date=chapterDates(c),complete=total>0&&done===total;return <details key={`${c.title}-${chapter.title}`} className="chapter-section" data-chapter={c.title} data-current={c.title===active.title} data-completed={complete} hidden={hideDone&&complete} open={c.title===chapter.title&&!complete}>
    <summary><ChevronDown size={22}/><span className="chapter-title">{c.title}</span>{!complete&&c.title===active.title&&<span className="progress-chip current-chip">현재</span>}{total>0&&<span className="progress-chip">{done}/{total}</span>}{!complete&&date&&<span className="chapter-date">{glueDots(date)}</span>}</summary>
    {c.event&&<GuideImage className="chapter-event" source src={'/'+c.event.src} alt={c.event.alt}/>}
    {c.blocks.map(b=>{const g=groups.find(g=>g.id===b.id),Container=g?'details':'section',Header=g?'summary':'header';return <YuphasGroup key={b.id}><Container open={g?true:undefined} className={g?'action-group':'chapter-supplement'} data-source-block={b.id} id={b.id}>
      {(g||b.portraits.length>0)&&<Header>{g&&<ChevronDown size={22}/ >}{g&&<span className="group-title">{b.heading.length&&!Object.hasOwn(overrides.groups,g.id)?<SourceMarkup nodes={b.heading} {...markupProps} skip={new Set(b.portraits.map(p=>p.name.replace(/ 초상화.*$/,'')))}/>:<GameText text={g.title} skip={new Set(b.portraits.map(p=>p.name.replace(/ 초상화.*$/,'')))}/>}</span>}<div className="group-portraits">{b.portraits.map(p=>{const name=p.name.replace(/ 초상화.*$/,''),img=<img key={p.src} data-source-image className={final25Class(p.name)} src={'/'+personPortrait(p.src,part,p.name)} alt={p.name} title={p.name} loading="lazy"/>;/* 제목 초상화도 인물 서랍을 연다(2026-11-15 사용자 결정). 접기 단추(summary)는 움직이지 않는다. */return onPerson&&people.includes(name)?<button type="button" key={p.src} className="portrait-button" aria-label={`${name} 인물 보기`} onClick={e=>{e.preventDefault();e.stopPropagation();onPerson(name);}}>{img}</button>:img;})}</div>{g&&<span className="group-count">{g.actions.filter(a=>checked(a,g.id,checks.effective)).length}/{g.actions.length}</span>}</Header>}
      {g&&groupSteps(g.actions.map(a=>a.id)).length>0&&<BoonSummary ids={g.actions.map(a=>a.id)}/>}{g&&<ol className="checklist">{g.actions.map(a=><li key={a.id} tabIndex={-1} hidden={hideDone&&checked(a,g.id,checks.effective)} data-complete={checked(a,g.id,checks.effective)}><input id={a.id} type="checkbox" checked={checked(a,g.id,checks.effective)} disabled={!checks.ready||autoChecked(a.id,checks.data.status)} aria-label={a.text} onChange={e=>{const value=e.target.checked;void celebrate(cg,c.title,a.id,value,e.currentTarget);checks.toggle(a.id,value);}}/><div><span className="action-category">{a.category}</span>{autoChecked(a.id,checks.data.status)&&<span className="status-owned">내 상태에서 보유</span>}<div className="action-text"><SourceMarkup nodes={actionNodes(c,g,a)} {...markupProps}/></div></div></li>)}</ol>}
      <div className="action-notes">{Object.hasOwn(overrides.notes,b.id)?(overrides.notes as Record<string,Group['notes']>)[b.id].map((n,i)=><p key={i}>{verificationTail(n.text)}</p>):<SourceMarkup nodes={b.notes} {...markupProps} map={blockMapTarget([...b.heading,...Object.values(b.actions).flat(),...b.notes].map(treeText).join(' '),route)}/>}</div>
    </Container></YuphasGroup>;})}
  </details>;})}</div></div>{context&&context(chapter)}</div>{gameDate&&<DateOdometer value={formatGameDate(PART1_YEAR,gameDate)} label={`게임 날짜 ${PART1_YEAR}년 ${gameDate.m}월 ${gameDate.d}일`}/>}<ImportOverlay phase={importPhase} onClose={()=>setImportPhase({state:'idle'})}/>{/* 알림 칸은 늘 두어 화면 읽기 프로그램이 새 문구를 읽게 한다. */}<p className={imported?'import-toast':'sr-only'} aria-live="polite">{imported}</p></>;
}
export function chapterDates(chapter:Chapter){const dates=chapter.blocks.flatMap(b=>b.title.match(/\d{1,2}\/\d{1,2}(?:\s*~\s*\d{1,2}\/\d{1,2})?/g)||[]);return [...new Set(dates)].join(' · ');}

function reveal(target:Element){let parent:Element|null=target;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}}
