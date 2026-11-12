'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Download, Upload, ArrowDown, ChevronDown, Info } from 'lucide-react';
import type { Group } from '@/lib/content';
import type { Chapter } from '@/lib/checklist';
import { chapterGroups } from '@/lib/checklist';
import { checked } from '@/lib/check-state';
import { useChecks } from './checks';
import { Button } from './ui/button';
import { SourceMarkup } from './source-markup';
import overrides from '@/content/display-overrides.json';
import { GuideImage } from './image-viewer';
import { ReadMore } from './read-more';
export function Tasks({chapters,groups,onDoc,onMaterial,onPerson,context}:{chapters:Chapter[];groups:Group[];onDoc:(url:string)=>void;onMaterial?:(id:string)=>void;onPerson?:(name:string)=>void;context?:(chapter:Chapter)=>React.ReactNode}){
  const checks=useChecks(),[selected,setSelected]=useState<string|null>(null),[importError,setImportError]=useState(''),upload=useRef<HTMLInputElement>(null);
  const toolbar=useRef<HTMLDivElement>(null);
  useEffect(()=>{const element=toolbar.current;if(!element)return;const measure=()=>element.closest('.tasks-main')?.setAttribute('style',`--task-header-height:${element.getBoundingClientRect().height}px`);const observer=new ResizeObserver(measure);observer.observe(element);measure();return ()=>observer.disconnect();},[]);
  const active=chapters.find(c=>chapterGroups(c,groups).some(g=>g.actions.some(a=>!checked(a,g.id,checks.data.checks))))||chapters.at(-1)!;
  const chapter=chapters.find(c=>c.title===selected)||active;
  const currentGroups=chapterGroups(chapter,groups);
  const next=currentGroups.flatMap(g=>g.actions.map(a=>({a,g}))).find(({a,g})=>!checked(a,g.id,checks.data.checks));
  const actions=groups.flatMap(g=>g.actions.map(a=>({a,g}))),count=actions.filter(({a,g})=>checked(a,g.id,checks.data.checks)).length;
  const markupProps={onDoc,onMaterial,onPerson};
  const actionNodes=(c:Chapter,g:Group,a:Group['actions'][number])=>Object.hasOwn(overrides.actions,a.id)?[a.text]:c.blocks.find(b=>b.id===g.id)?.actions[a.id]||[a.text];
  function exportFile(){const blob=new Blob([JSON.stringify(checks.data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='checklist.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <div className="tasks-layout"><div className="tasks-main"><div ref={toolbar} className="check-toolbar" data-overlap-group="toolbar">
    <label className="chapter-picker"><span className="sr-only">장 선택</span><select id="chapter" aria-label="장 선택" value={chapter.title} onChange={e=>setSelected(e.target.value)}>{chapters.map(c=><option key={c.title}>{c.title}</option>)}</select></label>
    <div className="toolbar-progress"><strong>{count}/{actions.length}</strong><progress value={count} max={actions.length} aria-label="이 부의 진행률"/></div>
    <div className="toolbar-actions"><Button variant="secondary" onClick={exportFile}><Download size={20}/> 내보내기</Button><Button variant="secondary" onClick={()=>upload.current?.click()}><Upload size={20}/> 가져오기</Button><input ref={upload} type="file" accept="application/json,.json" className="sr-only" aria-label="체크 JSON 가져오기" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{checks.importData(JSON.parse(await file.text()));setImportError('');}catch(error){setImportError(error instanceof Error?error.message:'파일을 읽지 못했습니다.');}e.target.value='';}}/></div>
  </div><div role="status" className={checks.error?'save-status error':'save-status'}>{checks.error?<>{checks.status}<Button variant="secondary" onClick={checks.retry}>저장소 다시 읽기</Button></>:<Check size={20} aria-label="저장됨"/>}</div>{importError&&<p role="alert" className="error">{importError}</p>}
  {!!chapters[0].notices?.length&&<aside className="info-notice"><Info size={20}/><ReadMore><SourceMarkup nodes={chapters[0].notices} {...markupProps}/></ReadMore></aside>}
  {next&&<section className="next-action"><h2>다음 할 일</h2><SourceMarkup nodes={actionNodes(chapter,next.g,next.a)} {...markupProps}/><Button onClick={()=>{setSelected(chapter.title);requestAnimationFrame(()=>document.getElementById(next.a.id)?.scrollIntoView({behavior:'smooth',block:'center'}));}}><ArrowDown size={20}/> 이동</Button></section>}
  <div data-checklist-source>{chapters.map(c=>{const cg=chapterGroups(c,groups),total=cg.reduce((n,g)=>n+g.actions.length,0),done=cg.reduce((n,g)=>n+g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length,0),date=chapterDates(c);return <details key={`${c.title}-${chapter.title}`} className="chapter-section" data-chapter={c.title} data-current={c.title===active.title} open={c.title===chapter.title}>
    <summary><h2>{c.title}</h2>{c.title===active.title&&<span className="progress-chip current-chip">현재</span>}<span className="progress-chip">{done}/{total}</span><ChevronDown size={24}/>{date&&<span className="chapter-date">{date}</span>}</summary>
    {c.event&&<GuideImage className="chapter-event" source src={'/'+c.event.src} alt={c.event.alt}/>}
    {c.blocks.map(b=>{const g=groups.find(g=>g.id===b.id);return <section className={g?'action-group':'chapter-supplement'} key={b.id} data-source-block={b.id}>
      {(g||b.portraits.length>0)&&<header>{g&&<h3>{b.heading.length&&!Object.hasOwn(overrides.groups,g.id)?<SourceMarkup nodes={b.heading} {...markupProps}/>:g.title}</h3>}<div className="group-portraits">{b.portraits.map(p=><img key={p.src} data-source-image src={'/'+p.src} alt={p.name} title={p.name} loading="lazy"/>)}</div></header>}
      {g&&<ol className="checklist">{g.actions.map(a=><li key={a.id} data-complete={checked(a,g.id,checks.data.checks)}><input id={a.id} type="checkbox" checked={checked(a,g.id,checks.data.checks)} disabled={!checks.ready} aria-label={a.text} onChange={e=>checks.toggle(a.id,e.target.checked)}/><div><span className="action-category">{a.category}</span><div className="action-text"><SourceMarkup nodes={actionNodes(c,g,a)} {...markupProps}/></div></div></li>)}</ol>}
      <div className="action-notes">{Object.hasOwn(overrides.notes,b.id)?(overrides.notes as Record<string,Group['notes']>)[b.id].map((n,i)=><p key={i}>{n.text}</p>):<SourceMarkup nodes={b.notes} {...markupProps}/>}</div>
    </section>;})}
  </details>;})}</div></div>{context&&context(chapter)}</div>;
}
export function chapterDates(chapter:Chapter){const dates=chapter.blocks.flatMap(b=>b.title.match(/\d{1,2}\/\d{1,2}(?:\s*~\s*\d{1,2}\/\d{1,2})?/g)||[]);return [...new Set(dates)].join(' · ');}
