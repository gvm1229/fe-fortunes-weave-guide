'use client';
import { useEffect, useRef, useState, ViewTransition } from 'react';
import { Check, Download, Upload, ArrowDown, ChevronDown, Archive } from 'lucide-react';
import type { Group } from '@/lib/content';
import type { Chapter } from '@/lib/checklist';
import { chapterGroups } from '@/lib/checklist';
import { checked } from '@/lib/check-state';
import { useChecks } from './checks';
import { usePreference } from './preferences';
import { Button } from './ui/button';
import { SourceMarkup } from './source-markup';
import { personPortrait, lordPortrait, lordFiles } from '@/lib/portraits';
import { Progress } from './progress';
import { GameText } from './game-text';
import overrides from '@/content/display-overrides.json';
import { GuideImage } from './image-viewer';
import { final25Class } from '@/lib/final25';
export function Tasks({route,label,part,chapters,groups,onDoc,onMaterial,onPerson,context}:{route:string;label:string;part:string;chapters:Chapter[];groups:Group[];onDoc:(url:string)=>void;onMaterial?:(id:string)=>void;onPerson?:(name:string)=>void;context?:(chapter:Chapter)=>React.ReactNode}){
  const checks=useChecks(),[announce,setAnnounce]=useState(''),[selected,setSelected]=useState<string|null>(null),[importError,setImportError]=useState(''),upload=useRef<HTMLInputElement>(null);
  /** 장의 마지막 항목을 체크해 그 장이 처음 완료되는 순간에만 색종이를 터뜨린다. 열기·가져오기·해제에서는 부르지 않는다. */
  async function celebrate(cg:Group[],title:string,id:string,value:boolean,target:HTMLElement){
    if(!value)return;
    const all=cg.flatMap(g=>g.actions.map(a=>({a,g:g.id})));
    if(all.every(({a,g})=>checked(a,g,checks.data.checks)))return;
    const next={...checks.data.checks,[id]:true};
    if(!all.every(({a,g})=>checked(a,g,next)))return;
    setAnnounce(`${title} 완료`);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const r=target.closest('details.chapter-section')?.querySelector('summary')?.getBoundingClientRect();
    const origin=r&&r.height&&r.bottom>0&&r.top<innerHeight?{x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight}:{x:.5,y:.6};
    const dark=document.documentElement.classList.contains('dark'),ink=getComputedStyle(target).getPropertyValue('--route-ink').trim();
    const confetti=(await import('canvas-confetti')).default;
    confetti({particleCount:90,spread:70,startVelocity:38,ticks:160,scalar:.9,disableForReducedMotion:true,origin,colors:[dark?'#94C4AB':'#4E8469',ink||'#4A4658',dark?'#9DB8D4':'#D2A97F']});
  }
  const [hideDone,setHideDone]=usePreference<boolean>('tasks-hide-done',false);
  const head=useRef<HTMLDivElement>(null),scrolled=useRef(false);
  useEffect(()=>{const element=head.current;if(!element)return;const host=element.parentElement;
    const measure=()=>{host?.style.setProperty('--task-header-height',`${element.getBoundingClientRect().height}px`);document.documentElement.style.setProperty('--task-header-height',`${element.getBoundingClientRect().height}px`);};
    const observer=new ResizeObserver(measure);observer.observe(element);measure();
    // scroll-state 쿼리를 모르는 브라우저: 붙은 상태를 IntersectionObserver로 표시한다(같은 모양을 .is-stuck에 둔다).
    let io:IntersectionObserver|undefined;
    if(!CSS.supports('container-type: scroll-state')){io=new IntersectionObserver(([e])=>element.classList.toggle('is-stuck',e.intersectionRatio<1&&e.boundingClientRect.top<1),{threshold:[1],rootMargin:'-1px 0px 0px 0px'});io.observe(element);}
    return ()=>{observer.disconnect();io?.disconnect();document.documentElement.style.removeProperty('--task-header-height');};},[]);
  const active=chapters.find(c=>chapterGroups(c,groups).some(g=>g.actions.some(a=>!checked(a,g.id,checks.data.checks))))||chapters.at(-1)!;
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
  const next=currentGroups.flatMap(g=>g.actions.map(a=>({a,g}))).find(({a,g})=>!checked(a,g.id,checks.data.checks));
  const actions=groups.flatMap(g=>g.actions.map(a=>({a,g}))),count=actions.filter(({a,g})=>checked(a,g.id,checks.data.checks)).length;
  const markupProps={onDoc,onMaterial,onPerson,part};
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
  return <><section className="route-banner" aria-label={`${label} ${part}부 진행`}><div className="route-banner-art" data-route={route}><img className="banner-emblem" src={`/assets/design/emblems/${lordFiles[route]}.webp`} alt=""/><h1>{label}{route==='part3'?'':<span> {part}부</span>}</h1>{route==='part3'?<img className="banner-lord" src={lordPortrait(route,part,true)} alt=""/>:<ViewTransition name={`lord-${route}`} share="morph" default="none"><img className="banner-lord" src={lordPortrait(route,part,true)} alt=""/></ViewTransition>}</div></section>
  {/* 루트 머리 막대: 스크롤해도 맨 위에 고정된다(2026-11-14 사용자 지시). 붙어 있는 동안 작은 루트 이름이 보인다. 막대 높이는 바뀌지 않아 화면이 튀지 않는다. */}
  <div ref={head} className="route-head"><div className="route-head-bar">
    <p className="route-head-title" aria-hidden="true"><img src={lordPortrait(route,part)} alt=""/><span>{label}{route==='part3'?'':` ${part}부`}</span></p>
    <div className="banner-progress"><span>완료 <strong>{count}</strong> / {actions.length}</span><Progress value={count} max={actions.length} label="전체 진행률"/><strong>{Math.round(count/Math.max(1,actions.length)*100)}%</strong></div>
    <div className="check-toolbar" data-overlap-group="toolbar">
    <label className="chapter-picker"><span className="sr-only">장 선택</span><select id="chapter" aria-label="장 선택" value={chapter.title} onChange={e=>{const title=e.target.value;setSelected(title);requestAnimationFrame(()=>{const target=document.querySelector<HTMLDetailsElement>(`[data-chapter="${CSS.escape(title)}"]`);if(target){target.open=true;target.scrollIntoView({block:'start'});}});}}>{chapters.map(c=><option key={c.title}>{c.title}</option>)}</select></label>
    {/* 완료 숨기기는 고정 머리 막대에 둔다(2026-11-14 사용자 지시: 맨 위까지 올라가지 않아도 되게). */}<label className="check-control"><input type="checkbox" checked={hideDone} onChange={e=>setHideDone(e.target.checked)}/> <span className="check-control-label">완료 숨기기</span></label>
    <Button className="jump-next" onClick={goNext} disabled={!next} aria-label="다음 할 일로 이동"><ArrowDown size={20}/><span className="jump-label">이동</span></Button>
    {!checks.error&&<span role="status" className="save-status"><Check size={20} aria-label="저장됨"/></span>}
    <details className="backup-menu"><summary title="기록 관리"><Archive size={20} aria-hidden="true" className="backup-icon"/><span className="backup-label">기록 관리</span></summary><div className="toolbar-actions"><Button variant="secondary" onClick={exportFile}><Download size={20}/> 내보내기</Button><Button variant="secondary" onClick={()=>upload.current?.click()}><Upload size={20}/> 가져오기</Button><input ref={upload} type="file" accept="application/json,.json" className="sr-only" aria-label="체크 JSON 가져오기" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{checks.importData(JSON.parse(await file.text()));setImportError('');}catch(error){setImportError(error instanceof Error?error.message:'파일을 읽지 못했습니다.');}e.target.value='';}}/></div></details>
  </div></div></div>
  <div className="tasks-layout"><div className="tasks-main">{checks.error&&<div role="status" className="save-status error">{checks.status}<Button variant="secondary" onClick={checks.retry}>저장소 다시 읽기</Button></div>}{importError&&<p role="alert" className="error">{importError}</p>}
  {next&&<section className="next-action"><h2>다음 할 일</h2><p><GameText text={next.a.text} withSkills/></p></section>}
  <p className="sr-only" aria-live="polite">{announce}</p><div data-checklist-source>{chapters.map(c=>{const cg=chapterGroups(c,groups),total=cg.reduce((n,g)=>n+g.actions.length,0),done=cg.reduce((n,g)=>n+g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length,0),date=chapterDates(c),complete=total>0&&done===total;return <details key={`${c.title}-${chapter.title}`} className="chapter-section" data-chapter={c.title} data-current={c.title===active.title} data-completed={complete} hidden={hideDone&&complete} open={c.title===chapter.title&&!complete}>
    <summary><ChevronDown size={24}/><span className="chapter-title">{c.title}</span>{!complete&&c.title===active.title&&<span className="progress-chip current-chip">현재</span>}{total>0&&<span className="progress-chip">{done}/{total}</span>}{!complete&&date&&<span className="chapter-date">{date}</span>}</summary>
    {c.event&&<GuideImage className="chapter-event" source src={'/'+c.event.src} alt={c.event.alt}/>}
    {c.blocks.map(b=>{const g=groups.find(g=>g.id===b.id),Container=g?'details':'section',Header=g?'summary':'header';return <Container open={g?true:undefined} className={g?'action-group':'chapter-supplement'} key={b.id} data-source-block={b.id} id={b.id}>
      {(g||b.portraits.length>0)&&<Header>{g&&<ChevronDown size={22}/ >}{g&&<span className="group-title">{b.heading.length&&!Object.hasOwn(overrides.groups,g.id)?<SourceMarkup nodes={b.heading} {...markupProps} skip={new Set(b.portraits.map(p=>p.name.replace(/ 초상화.*$/,'')))}/>:<GameText text={g.title} skip={new Set(b.portraits.map(p=>p.name.replace(/ 초상화.*$/,'')))}/>}</span>}<div className="group-portraits">{b.portraits.map(p=><img key={p.src} data-source-image className={final25Class(p.name)} src={'/'+personPortrait(p.src,part,p.name)} alt={p.name} title={p.name} loading="lazy"/>)}</div>{g&&<span className="group-count">{g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length}/{g.actions.length}</span>}</Header>}
      {g&&<ol className="checklist">{g.actions.map(a=><li key={a.id} tabIndex={-1} hidden={hideDone&&checked(a,g.id,checks.data.checks)} data-complete={checked(a,g.id,checks.data.checks)}><input id={a.id} type="checkbox" checked={checked(a,g.id,checks.data.checks)} disabled={!checks.ready} aria-label={a.text} onChange={e=>{const value=e.target.checked;void celebrate(cg,c.title,a.id,value,e.currentTarget);checks.toggle(a.id,value);}}/><div><span className="action-category">{a.category}</span><div className="action-text"><SourceMarkup nodes={actionNodes(c,g,a)} {...markupProps}/></div></div></li>)}</ol>}
      <div className="action-notes">{Object.hasOwn(overrides.notes,b.id)?(overrides.notes as Record<string,Group['notes']>)[b.id].map((n,i)=><p key={i}>{n.text}</p>):<SourceMarkup nodes={b.notes} {...markupProps}/>}</div>
    </Container>;})}
  </details>;})}</div></div>{context&&context(chapter)}</div></>;
}
export function chapterDates(chapter:Chapter){const dates=chapter.blocks.flatMap(b=>b.title.match(/\d{1,2}\/\d{1,2}(?:\s*~\s*\d{1,2}\/\d{1,2})?/g)||[]);return [...new Set(dates)].join(' · ');}

function reveal(target:Element){let parent:Element|null=target;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}}
