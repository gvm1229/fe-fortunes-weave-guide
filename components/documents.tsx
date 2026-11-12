'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import type { ReferenceDoc } from '@/lib/documents';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
export function resolveDoc(url:string,current='notes/index.md'){
  const decoded=decodeURIComponent(url).split('#')[0].replace(/\.html$/,'.md');
  if(!decoded)return current;
  if(decoded.endsWith('tips.md'))return 'notes/weekly-support-review.md';
  if(decoded.startsWith('notes/'))return decoded;
  const parts=(current.slice(0,current.lastIndexOf('/')+1)+decoded).split('/');const result:string[]=[];
  for(const part of parts){if(part==='..')result.pop();else if(part!=='.')result.push(part);}return result.join('/');
}
export function DocList({docs,onOpen}:{docs:ReferenceDoc[];onOpen:(url:string)=>void}){
  const [query,setQuery]=useState('');
  return <><label className="search"><Search size={22}/><input placeholder="문서 제목으로 찾기" aria-label="참고 문서 검색" value={query} onChange={e=>setQuery(e.target.value)}/></label><p className="muted">현재 루트·부에 맞게 읽습니다. 루트 간 비교는 최종 팀 화면에서 볼 수 있습니다.</p><ul className="document-list">{docs.filter(d=>d.title.includes(query)).map(d=><li key={d.path}><button onClick={()=>onOpen(d.path)}><BookOpen size={20}/>{d.title}</button></li>)}</ul></>;
}
export function DocumentSheet({docs,current,onOpen,onClose,route}:{docs:ReferenceDoc[];current:string|null;onOpen:(url:string)=>void;onClose:()=>void;route:string}){
  const [history,setHistory]=useState<{path:string;scroll:number}[]>([]);const scroll=useRef<HTMLDivElement>(null);const last=useRef<string|null>(null);const positions=useRef(new Map<string,number>());
  const path=current?resolveDoc(current):null;const doc=docs.find(d=>d.path===path);
  useLayoutEffect(()=>{if(path===last.current)return;last.current=path;if(scroll.current)scroll.current.scrollTop=path?positions.current.get(path)||0:0;},[path]);
  function follow(url:string){if(url.startsWith('#')){const id=decodeURIComponent(url.slice(1));scroll.current?.querySelector(`[id="${CSS.escape(id)}"]`)?.scrollIntoView();return;}if(path){positions.current.set(path,scroll.current?.scrollTop||0);setHistory(h=>[...h,{path,scroll:scroll.current?.scrollTop||0}]);}onOpen(resolveDoc(url,path||undefined));}
  function back(){const previous=history.at(-1);if(previous){setHistory(h=>h.slice(0,-1));last.current=previous.path;onOpen(previous.path);requestAnimationFrame(()=>{if(scroll.current)scroll.current.scrollTop=previous.scroll;});}}
  return <Sheet open={current!==null} onOpenChange={open=>{if(!open){if(path)positions.current.set(path,scroll.current?.scrollTop||0);onClose();}}}><SheetContent themeRoute={route}><div className="sheet-heading"><Button variant="ghost" onClick={back} disabled={!history.length}><ArrowLeft size={20}/> 뒤로</Button><SheetTitle>{doc?.title||'문서 확인'}</SheetTitle></div><div className="sheet-scroll" ref={scroll} onScroll={e=>{if(path)positions.current.set(path,e.currentTarget.scrollTop);}}>{doc?<Markdown remarkPlugins={[remarkGfm]} components={{h2:({children})=><h2 id={String(children).replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-')}>{children}</h2>,h3:({children})=><h3 id={String(children).replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-')}>{children}</h3>,a:({href,children})=>href?.startsWith('http')?<a href={href} target="_blank" rel="noreferrer">{children}</a>:href?.includes('data/')?<a href={'/reference-data/'+href.slice(href.lastIndexOf('/')+1)} target="_blank" rel="noreferrer">{children}</a>:href?.includes('assets/')?<a href={'/'+href.slice(href.indexOf('assets/'))} target="_blank" rel="noreferrer">{children}</a>:<button data-doc-url={href} className="text-link" onClick={()=>follow(href||'')}>{children}</button>,img:({src,alt})=>{const s=String(src||'');return <img src={s.includes('assets/')?'/'+s.slice(s.indexOf('assets/')):s} alt={alt||'참고 그림'} loading="lazy"/>;}}}>{doc.body}</Markdown>:<p>이 문서는 현재 루트·부에 없거나 원본 연결을 확인해야 합니다. 최종 팀의 전체 참고 문서에서 확인하세요.</p>}</div></SheetContent></Sheet>;
}
