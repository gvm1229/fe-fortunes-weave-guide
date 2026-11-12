'use client';
import { useRef, useState } from 'react';
import { Download, Upload, ArrowDown, ChevronDown } from 'lucide-react';
import type { Group } from '@/lib/content';
import { checked } from '@/lib/check-state';
import { useChecks } from './checks';
import { Button } from './ui/button';
export function chaptersFor(groups:Group[]){
  let current='시작 전';const chapters:{title:string;groups:Group[]}[]=[];
  for(const g of groups){const match=g.title.match(/^(\d+)\s*(장|구간)/);if(match)current=`${match[1]}${match[2]}`;let chapter=chapters.find(c=>c.title===current);if(!chapter){chapter={title:current,groups:[]};chapters.push(chapter);}chapter.groups.push(g);}
  return chapters;
}
export function Tasks({groups,onDoc}:{groups:Group[];onDoc:(url:string)=>void}){
  const checks=useChecks();const [selected,setSelected]=useState<string|null>(null);const [importError,setImportError]=useState('');const upload=useRef<HTMLInputElement>(null);
  const chapters=chaptersFor(groups);
  const active=chapters.find(c=>c.groups.some(g=>g.actions.some(a=>!checked(a,g.id,checks.data.checks))));
  const chapter=chapters.find(c=>c.title===selected)||active||chapters.at(-1);
  const next=chapter?.groups.flatMap(g=>g.actions.map(a=>({a,g}))).find(({a,g})=>!checked(a,g.id,checks.data.checks));
  const actions=groups.flatMap(g=>g.actions.map(a=>({a,g})));
  const count=actions.filter(({a,g})=>checked(a,g.id,checks.data.checks)).length;
  function exportFile(){const blob=new Blob([JSON.stringify(checks.data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='checklist.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <><div className="check-toolbar"><div><strong>{count} / {actions.length} 완료</strong><progress value={count} max={actions.length} aria-label="이 부의 진행률"/></div><div className="toolbar-actions"><Button variant="outline" onClick={exportFile}><Download size={20}/> 내보내기</Button><Button variant="outline" onClick={()=>upload.current?.click()}><Upload size={20}/> 가져오기</Button><input ref={upload} type="file" accept="application/json,.json" className="sr-only" aria-label="체크 JSON 가져오기" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{checks.importData(JSON.parse(await file.text()));setImportError('');}catch(error){setImportError(error instanceof Error?error.message:'파일을 읽지 못했습니다.');}e.target.value='';}}/></div></div>
    <p role="status" className={checks.error?'error':'muted'}>{checks.status}</p>{checks.error&&<Button variant="outline" onClick={checks.retry}>저장소 다시 읽기</Button>}{importError&&<p role="alert" className="error">{importError}</p>}
    <div className="chapter-picker"><label htmlFor="chapter">장 선택</label><select id="chapter" value={chapter?.title||''} onChange={e=>setSelected(e.target.value)}>{chapters.map(c=><option key={c.title}>{c.title}</option>)}</select><Button variant="ghost" onClick={()=>setSelected(null)}>현재 위치</Button></div>
    {next?<section className="next-action"><h2>다음 할 일</h2><p>{next.a.text}</p><Button variant="outline" onClick={()=>document.getElementById(next.a.id)?.scrollIntoView({behavior:'smooth',block:'center'})}><ArrowDown size={20}/> 체크 위치로</Button></section>:<p className="next-action">이 장의 행동을 모두 확인했습니다.</p>}
    <h2 className="chapter-title">{chapter?.title}</h2>{chapter?.groups.map(g=><details className="action-group" key={g.id} open><summary><ChevronDown size={20}/><h3>{g.title}</h3><span>{g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length}/{g.actions.length}</span></summary><ol className="checklist">{g.actions.map(a=><li key={a.id} data-complete={checked(a,g.id,checks.data.checks)}><input id={a.id} type="checkbox" checked={checked(a,g.id,checks.data.checks)} disabled={!checks.ready} aria-label={a.text} onChange={e=>checks.toggle(a.id,e.target.checked)}/><div><span className="action-category">{a.category}</span><p>{a.text}</p></div></li>)}</ol>{(g.notes?.length>0||g.figures?.length>0||g.referenceLinks?.length)&&<details className="explanation"><summary>설명·그림·근거</summary>{g.notes?.map((n,i)=><p key={i}><strong>{n.category}</strong> · {n.text}</p>)}{g.figures?.map((html,i)=>{const src=html.match(/src="([^"]+)"/)?.[1];const alt=html.match(/alt="([^"]*)"/)?.[1]||'참고 그림';return src?<figure key={i}><a href={`/${src}`} target="_blank" rel="noreferrer"><img src={`/${src}`} alt={alt} loading="lazy"/></a><figcaption>{alt}</figcaption></figure>:null;})}{g.referenceLinks?.map(l=><Button key={l.url} variant="outline" onClick={()=>onDoc(l.url)}>{l.label}</Button>)}</details>}</details>)}
  </>;
}
