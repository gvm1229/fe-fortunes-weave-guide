'use client';
import { Children, Fragment, cloneElement, isValidElement, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Markdown from 'react-markdown';
import Link from 'next/link';
import remarkGfm from 'remark-gfm';
import type { Root, RootContent } from 'mdast';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import type { ReferenceDoc } from '@/lib/documents';
import { resolveDoc, headingId, guideHref } from '@/lib/document-links';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { GuideImage } from './image-viewer';
import { ReadMore } from './read-more';
import { Semantic } from './records';
export { resolveDoc } from '@/lib/document-links';

function documentAnchors(){
  return (tree:Root)=>{
    const seen=new Map<string,number>();
    const text=(node:RootContent):string=>'value' in node?String(node.value):'children' in node?node.children.map(n=>text(n as RootContent)).join(''):'';
    function walk(node:Root|RootContent){
      if(node.type==='heading'){
        const base=headingId(text(node)),count=seen.get(base)||0;seen.set(base,count+1);
        node.data={...node.data,hProperties:{id:base+(count?'-'+count:'')}};
      }
      if(node.type==='html'){
        const id=node.value.match(/^<a\s+(?:id|name)=["']([^"']+)["']\s*>(?:<\/a>)?$/)?.[1];
        if(id)Object.assign(node,{type:'paragraph',children:[],data:{hName:'span',hProperties:{id}}});
      }
      if('children' in node)node.children.forEach(child=>walk(child as RootContent));
    }
    walk(tree);
  };
}
export function DocList({docs,onOpen}:{docs:ReferenceDoc[];onOpen:(url:string)=>void}){
  const [query,setQuery]=useState('');
  return <><label className="search"><Search size={22}/><input placeholder="문서 제목으로 찾기" aria-label="참고 문서 검색" value={query} onChange={e=>setQuery(e.target.value)}/></label><p className="muted">현재 루트·부에 맞게 읽습니다. 루트 간 비교는 최종 팀 화면에서 볼 수 있습니다.</p><ul className="document-list">{docs.filter(d=>d.title.includes(query)).map(d=><li key={d.path}><button onClick={()=>onOpen(d.path)}><BookOpen size={20}/>{d.title}</button></li>)}</ul></>;
}
function DocumentTable({children}:{children?:ReactNode}){
  const elements=(nodes:ReactNode)=>Children.toArray(nodes).filter(isValidElement<{children?:ReactNode}>);
  const rows=elements(children).flatMap(section=>elements(section.props.children)).map(row=>elements(row.props.children).map(cell=>cell.props.children));
  const mobileContent=(nodes:ReactNode):ReactNode=>Children.map(nodes,node=>isValidElement<{id?:string;children?:ReactNode}>(node)?cloneElement(node,{...(node.props.id?{id:node.props.id+'-mobile'}:{}),...('children' in node.props?{children:mobileContent(node.props.children)}:{})}):node);
  return <><table className="document-table">{children}</table><div className="document-definitions">{rows.slice(1).map((row,i)=><dl className="document-definition" key={i}>{row.map((cell,j)=><Fragment key={j}><dt>{mobileContent(rows[0]?.[j])}</dt><dd>{mobileContent(cell)}</dd></Fragment>)}</dl>)}</div></>;
}
export function DocumentSheet({docs,current,onOpen,onClose,route,part='3'}:{docs:ReferenceDoc[];current:string|null;onOpen:(url:string)=>void;onClose:()=>void;route:string;part?:string}){
  const [history,setHistory]=useState<{url:string;scroll:number}[]>([]);
  const scroll=useRef<HTMLDivElement>(null),positions=useRef(new Map<string,number>());
  const url=current?resolveDoc(current):null,path=url?.split('#')[0],fragment=url?.split('#')[1];
  const doc=docs.find(d=>d.path===path);
  useLayoutEffect(()=>{
    if(!url||!scroll.current)return;
    const pane=scroll.current;
    const target=fragment?[...pane.querySelectorAll<HTMLElement>('[id="'+CSS.escape(fragment)+'"],[id="'+CSS.escape(fragment+'-mobile')+'"]')].find(e=>e.checkVisibility()):null;
    if(target){target.scrollIntoView({block:'start'});target.tabIndex=-1;target.focus({preventScroll:true});}
    else pane.scrollTop=positions.current.get(url)||0;
  },[url,fragment]);
  function follow(next:string){
    if(url){positions.current.set(url,scroll.current?.scrollTop||0);setHistory(h=>[...h,{url,scroll:scroll.current?.scrollTop||0}]);}
    onOpen(resolveDoc(next,path||undefined));
  }
  function back(){
    const previous=history.at(-1);if(!previous)return;
    setHistory(h=>h.slice(0,-1));onOpen(previous.url);
    requestAnimationFrame(()=>{if(scroll.current)scroll.current.scrollTop=previous.scroll;});
  }
  function close(){if(url)positions.current.set(url,scroll.current?.scrollTop||0);setHistory([]);onClose();}
  function link(href:string,children:ReactNode){
    const destination=guideHref(href,path);
    if(destination)return <Link href={destination} onClick={()=>{close();window.dispatchEvent(new Event('guide-jump'));}}>{children}</Link>;
    if(/^https?:/.test(href))return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
    if(href.includes('assets/'))return <a href={'/'+href.slice(href.indexOf('assets/'))} target="_blank" rel="noreferrer">{children}</a>;
    if(/(?:^|\/)data\//.test(href))return <a href={'/reference-data/'+href.slice(href.lastIndexOf('/')+1)} target="_blank" rel="noreferrer">{children}</a>;
    if(/\.(?:json|png|jpe?g|webp)(?:#.*)?$/.test(href))return <a href={'/reference-files/'+resolveDoc(href,path)} target="_blank" rel="noreferrer">{children}</a>;
    const resolved=resolveDoc(href,path).split('#')[0];
    if(!docs.some(d=>d.path===resolved)&&/^(?:index|tips|units|part[23]|theodora|leda|dietrich|kai|classes|characters|paralogues|sources)\.md$/.test(resolved))return <span title="참고 보관의 원본 공략">{children}</span>;
    return <button data-doc-url={href} className="text-link" onClick={()=>follow(href)}>{children}</button>;
  }
  return <Sheet open={current!==null} onOpenChange={open=>{if(!open)close();}}><SheetContent themeRoute={route}><div className="sheet-heading"><Button variant="ghost" onClick={back} disabled={!history.length}><ArrowLeft size={20}/> 뒤로</Button><SheetTitle>{doc?.title||'문서 확인'}</SheetTitle></div><div className="sheet-scroll" ref={scroll} onScroll={e=>{if(url)positions.current.set(url,e.currentTarget.scrollTop);}}>
    {doc?doc.tree?<Semantic nodes={doc.tree} route={route} part={part} onDoc={follow}/>:<Markdown remarkPlugins={[remarkGfm,documentAnchors]} components={{table:DocumentTable,p:({children})=><ReadMore><p>{children}</p></ReadMore>,a:({href,children})=>link(href||'',children),img:({src,alt})=>{const s=String(src||'');return <GuideImage src={s.includes('assets/')?'/'+s.slice(s.indexOf('assets/')):s} alt={alt||'참고 그림'}/>;}}}>{doc.body}</Markdown>:<p>이 문서는 현재 루트·부에 없거나 원본 연결을 확인해야 합니다. <Link href="/team/">최종 팀의 전체 참고 문서</Link>에서 확인하세요.</p>}
  </div></SheetContent></Sheet>;
}
