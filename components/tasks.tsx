'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Download, Upload, ArrowDown, ChevronDown } from 'lucide-react';
import type { Group } from '@/lib/content';
import type { Chapter } from '@/lib/checklist';
import { chapterGroups } from '@/lib/checklist';
import { checked } from '@/lib/check-state';
import { useChecks } from './checks';
import { usePreference } from './preferences';
import { Button } from './ui/button';
import { SourceMarkup } from './source-markup';
import { personPortrait } from '@/lib/portraits';
import overrides from '@/content/display-overrides.json';
import { GuideImage } from './image-viewer';
export function Tasks({chapters,groups,onDoc,onMaterial,onPerson,context}:{chapters:Chapter[];groups:Group[];onDoc:(url:string)=>void;onMaterial?:(id:string)=>void;onPerson?:(name:string)=>void;context?:(chapter:Chapter)=>React.ReactNode}){
  const checks=useChecks(),[selected,setSelected]=useState<string|null>(null),[importError,setImportError]=useState(''),upload=useRef<HTMLInputElement>(null);
  const [hideDone,setHideDone]=usePreference<boolean>('tasks-hide-done',false);
  const toolbar=useRef<HTMLDivElement>(null),scrolled=useRef(false);
  useEffect(()=>{const element=toolbar.current;if(!element)return;const measure=()=>element.closest('.tasks-main')?.setAttribute('style',`--task-header-height:${element.getBoundingClientRect().height}px`);const observer=new ResizeObserver(measure);observer.observe(element);measure();return ()=>observer.disconnect();},[]);
  const active=chapters.find(c=>chapterGroups(c,groups).some(g=>g.actions.some(a=>!checked(a,g.id,checks.data.checks))))||chapters.at(-1)!;
  useEffect(()=>{
    if(!checks.ready||scrolled.current)return;
    let cancelled=false;
    document.fonts.ready.then(()=>requestAnimationFrame(()=>{
      if(cancelled)return;
      const target=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;
      if(target){target.closest('details')?.setAttribute('open','');target.scrollIntoView({behavior:'instant',block:'center'});}
      else document.querySelector<HTMLElement>('.chapter-section[data-current=true]')?.scrollIntoView({behavior:'instant',block:'start'});
      scrolled.current=true;
    }));
    return ()=>{cancelled=true;};
  },[checks.ready,active.title]);
  useEffect(()=>{const jump=()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){target.closest('details')?.setAttribute('open','');target.scrollIntoView({block:'center'});}};window.addEventListener('hashchange',jump);return()=>window.removeEventListener('hashchange',jump);},[]);
  const chapter=chapters.find(c=>c.title===selected)||active;
  const currentGroups=chapterGroups(chapter,groups);
  const next=currentGroups.flatMap(g=>g.actions.map(a=>({a,g}))).find(({a,g})=>!checked(a,g.id,checks.data.checks));
  const actions=groups.flatMap(g=>g.actions.map(a=>({a,g}))),count=actions.filter(({a,g})=>checked(a,g.id,checks.data.checks)).length;
  const part=groups[0]?.stage==='part3-plan'?'3':'1';
  const markupProps={onDoc,onMaterial,onPerson,part};
  const actionNodes=(c:Chapter,g:Group,a:Group['actions'][number])=>Object.hasOwn(overrides.actions,a.id)?[a.text]:c.blocks.find(b=>b.id===g.id)?.actions[a.id]||[a.text];
  function exportFile(){const blob=new Blob([JSON.stringify(checks.data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='checklist.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <div className="tasks-layout"><div className="tasks-main"><div ref={toolbar} className="check-toolbar" data-overlap-group="toolbar">
    <label className="chapter-picker"><span className="sr-only">장 선택</span><select id="chapter" aria-label="장 선택" value={chapter.title} onChange={e=>{const title=e.target.value;setSelected(title);requestAnimationFrame(()=>{const target=document.querySelector<HTMLDetailsElement>(`[data-chapter="${CSS.escape(title)}"]`);if(target){target.open=true;target.scrollIntoView({block:'start'});}});}}>{chapters.map(c=><option key={c.title}>{c.title}</option>)}</select></label>
    <div className="toolbar-progress"><strong>{count}/{actions.length}</strong><progress value={count} max={actions.length} aria-label="이 부의 진행률"/></div>
    {!checks.error&&<span role="status" className="save-status"><Check size={20} aria-label="저장됨"/></span>}
    <div className="toolbar-actions"><Button variant="secondary" onClick={exportFile}><Download size={20}/> 내보내기</Button><Button variant="secondary" onClick={()=>upload.current?.click()}><Upload size={20}/> 가져오기</Button><input ref={upload} type="file" accept="application/json,.json" className="sr-only" aria-label="체크 JSON 가져오기" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{checks.importData(JSON.parse(await file.text()));setImportError('');}catch(error){setImportError(error instanceof Error?error.message:'파일을 읽지 못했습니다.');}e.target.value='';}}/></div>
  </div>{checks.error&&<div role="status" className="save-status error">{checks.status}<Button variant="secondary" onClick={checks.retry}>저장소 다시 읽기</Button></div>}{importError&&<p role="alert" className="error">{importError}</p>}
  {next&&<section className="next-action"><h2>다음 할 일</h2><SourceMarkup nodes={actionNodes(chapter,next.g,next.a)} {...markupProps}/><Button onClick={()=>{setSelected(chapter.title);requestAnimationFrame(()=>{
    const row=document.getElementById(next.a.id)?.closest('li');if(!row)return;
    row.closest('details')?.setAttribute('open','');
    row.focus({preventScroll:true});row.scrollIntoView({behavior:'smooth',block:'center'});
    row.classList.remove('target-highlight');void row.offsetWidth;row.classList.add('target-highlight');
    row.addEventListener('animationend',()=>row.classList.remove('target-highlight'),{once:true});
  });}}><ArrowDown size={20}/> 이동</Button></section>}
  <label className="check-control"><input type="checkbox" checked={hideDone} onChange={e=>setHideDone(e.target.checked)}/> 완료 숨기기</label><div data-checklist-source>{chapters.map(c=>{const cg=chapterGroups(c,groups),total=cg.reduce((n,g)=>n+g.actions.length,0),done=cg.reduce((n,g)=>n+g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length,0),date=chapterDates(c),complete=total>0&&done===total;return <details key={`${c.title}-${chapter.title}`} className="chapter-section" data-chapter={c.title} data-current={c.title===active.title} data-completed={complete} hidden={hideDone&&complete} open={c.title===chapter.title&&!complete}>
    <summary><h2>{c.title}</h2>{!complete&&c.title===active.title&&<span className="progress-chip current-chip">현재</span>}<span className="progress-chip">{done}/{total}</span><ChevronDown size={24}/>{!complete&&date&&<span className="chapter-date">{date}</span>}</summary>
    {c.event&&<GuideImage className="chapter-event" source src={'/'+c.event.src} alt={c.event.alt}/>}
    {c.blocks.map(b=>{const g=groups.find(g=>g.id===b.id);return <section className={g?'action-group':'chapter-supplement'} key={b.id} data-source-block={b.id} id={b.id}>
      {(g||b.portraits.length>0)&&<header>{g&&<h3>{b.heading.length&&!Object.hasOwn(overrides.groups,g.id)?<SourceMarkup nodes={b.heading} {...markupProps}/>:g.title}</h3>}<div className="group-portraits">{b.portraits.map(p=><img key={p.src} data-source-image src={'/'+personPortrait(p.src,part,p.name)} alt={p.name} title={p.name} loading="lazy"/>)}</div></header>}
      {g&&<ol className="checklist">{g.actions.map(a=><li key={a.id} tabIndex={-1} hidden={hideDone&&checked(a,g.id,checks.data.checks)} data-complete={checked(a,g.id,checks.data.checks)}><input id={a.id} type="checkbox" checked={checked(a,g.id,checks.data.checks)} disabled={!checks.ready} aria-label={a.text} onChange={e=>checks.toggle(a.id,e.target.checked)}/><div><span className="action-category">{a.category}</span><div className="action-text"><SourceMarkup nodes={actionNodes(c,g,a)} {...markupProps}/></div></div></li>)}</ol>}
      <div className="action-notes">{Object.hasOwn(overrides.notes,b.id)?(overrides.notes as Record<string,Group['notes']>)[b.id].map((n,i)=><p key={i}>{n.text}</p>):<SourceMarkup nodes={b.notes} {...markupProps}/>}</div>
    </section>;})}
  </details>;})}</div></div>{context&&context(chapter)}</div>;
}
export function chapterDates(chapter:Chapter){const dates=chapter.blocks.flatMap(b=>b.title.match(/\d{1,2}\/\d{1,2}(?:\s*~\s*\d{1,2}\/\d{1,2})?/g)||[]);return [...new Set(dates)].join(' · ');}
