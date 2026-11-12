'use client';
import { createElement } from 'react';
import { MapPin } from 'lucide-react';
import type { Tree } from '@/lib/content';
import { displayText } from '@/lib/display';
import { ReadMore } from './read-more';
import { GuideImage } from './image-viewer';
export function SourceMarkup({nodes,onDoc,onMaterial,onPerson}:{nodes:Tree[];onDoc:(url:string)=>void;onMaterial?:(id:string)=>void;onPerson?:(name:string)=>void}){
  function render(n:Tree,i:number):React.ReactNode{
    if(typeof n==='string')return displayText(n);
    const a=n.attrs,children=n.children.filter(child=>!['table','thead','tbody','tfoot','tr','colgroup'].includes(n.tag)||typeof child!=='string'||child.trim()).map(render);
    if(a['data-shared-notice'])return null;
    if(a['data-readable-group'])return <ReadMore key={i}>{a['data-readable-group']==='prose'?createElement(n.tag,{},children):children}</ReadMore>;
    if(n.tag==='br')return <br key={i}/>;
    if(n.tag==='col')return <col key={i}/>;
    if(n.tag==='img'&&!a.src)return null;
    if(n.tag==='img')return /\/(portraits|skills|gods|classes|weapons)\//.test(a.src)?<img key={i} src={'/'+a.src.replace(/^\/+/, '')} alt={a.alt||''} title={a.title} loading="lazy" data-source-image className={a.src.includes('/portraits/')||a.src.includes('/gods/')?'media-portrait':'media-icon'}/>:<GuideImage key={i} src={'/'+a.src.replace(/^\/+/, '')} alt={a.alt} className="media-guide" source/>;
    if(n.tag==='button'){const location=!!(a['data-recruit-material']||a['data-acquisition-modal']);return <button key={i} type="button" className="button button-outline" data-source-location={location||undefined} data-reference-url={a['data-reference-url']} aria-label={a['aria-label']} onClick={()=>a['data-recruit-material']&&onMaterial?onMaterial(a['data-recruit-material']):onDoc(a['data-reference-url']||'notes/index.md')}>{location&&<MapPin size={20}/ >}{children}</button>;}
    if(n.tag==='a'&&n.children.some(child=>typeof child!=='string'&&child.tag==='img'&&!/\/(portraits|gods|classes|skills|weapons)\//.test(child.attrs.src||'')))return <span key={i} data-source-location={a['data-map-link']||undefined}>{n.children.map(render)}</span>;
    if(n.tag==='a'){if(a.href?.startsWith('#person-'))return <button className="person-inline" key={i} onClick={()=>onPerson?.(text(n.children))}>{children}</button>;if(a.href?.startsWith('http')||a.href?.startsWith('assets/'))return <a key={i} href={a.href.startsWith('assets/')?'/'+a.href:a.href} className={a['data-map-link']?'button button-outline':undefined} data-source-location={a['data-map-link']||undefined} target="_blank" rel="noreferrer">{a['data-map-link']&&<MapPin size={20}/ >}{children}</a>;return <button key={i} className="text-link" onClick={()=>onDoc(a.href||'notes/index.md')}>{children}</button>;}
    return createElement(n.tag,{key:i,...Object.fromEntries(Object.entries(a).filter(([key])=>key.startsWith('data-')))},children);
  }
  return <div className="source-markup">{nodes.map(render)}</div>;
}
function text(nodes:Tree[]):string{return nodes.map(n=>typeof n==='string'?n:text(n.children)).join('');}
