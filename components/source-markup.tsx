'use client';
import { GameText, imageName, classNamesByFile, namesInText } from './game-text';
import { createElement, Fragment } from 'react';
import { MapPin } from 'lucide-react';
import type { Tree } from '@/lib/content';
import { displayText } from '@/lib/display';
import { ReadMore } from './read-more';
import { GuideImage } from './image-viewer';
import classManifest from '@/assets/classes/manifest.json';
import { personPortrait } from '@/lib/portraits';
const blockTags=new Set(['h2','h3','h4','h5','li','p','td','th','summary','figcaption']);
function namesIn(n:Tree,acc:Set<string>):Set<string>{if(typeof n!=='string'){if(n.tag==='img'&&n.attrs.src&&/\/(portraits|classes)\//.test(n.attrs.src)){const name=imageName(n.attrs.src,n.attrs.alt);if(name)acc.add(name);}if(n.tag==='button'){const t=flatText(n.children);if(classNamesByFile.size&&[...classNamesByFile.values()].includes(t))acc.add(t);}n.children.forEach(c=>namesIn(c,acc));}return acc;}
function flatText(nodes:Tree[]):string{return nodes.map(n=>typeof n==='string'?n:flatText(n.children)).join('');}
/** 블록 안에 이미 있는 얼굴·병종 그림의 이름을 모아 글 속 그림을 다시 붙이지 않는다. */
/** 가장 바깥 묶음(표 칸·목록 항목·문단·제목)마다 이름 모음을 새로 만들고, 그 안의 묶음은 같은 모음을 함께 쓴다. */
function blockSkip(n:Exclude<Tree,string>,skip:Set<string>,inBlock:boolean):Set<string>{if(!blockTags.has(n.tag)&&!n.attrs['data-face-row'])return skip;return namesIn(n,inBlock?skip:new Set(skip));}
const isBlock=(n:Exclude<Tree,string>)=>blockTags.has(n.tag)||!!n.attrs['data-face-row'];
/** 글 조각을 그릴 때 이미 그림이 붙은 이름을 같은 묶음에서 다시 붙이지 않는다. */
function textSkip(text:string,skip:Set<string>):ReadonlySet<string>{const before=new Set(skip);namesInText(text).forEach(name=>skip.add(name));return before;}
export function SourceMarkup({nodes,onDoc,onMaterial,onPerson,part='1',skip:outerSkip}:{nodes:Tree[];onDoc:(url:string)=>void;onMaterial?:(id:string)=>void;onPerson?:(name:string)=>void;part?:string;skip?:ReadonlySet<string>}){
  const enrichSkills=!JSON.stringify(nodes).includes("/skills/");
  const classIcons=new Map<Tree,Exclude<Tree,string>>(),movedIcons=new Set<Tree>();
  function collectIcons(siblings:Tree[]){
    siblings.forEach((n,i)=>{
      if(typeof n==='string')return;
      if(n.tag==='img'&&n.attrs.src?.includes('/classes/')){
        const adjacent=siblings.slice(i+1).find(s=>typeof s!=='string'||s.trim());
        const button=adjacent&&typeof adjacent!=='string'?(adjacent.tag==='button'?adjacent:adjacent.tag==='span'?adjacent.children.find(c=>typeof c!=='string'&&c.tag==='button'):undefined):undefined;
        if(button&&typeof button!=='string'){
          const info=(classManifest.classes as Record<string,{file:string}>)[text(button.children)];
          if(info?.file===n.attrs.src){classIcons.set(button,n);movedIcons.add(n);}
        }
      }
      collectIcons(n.children);
    });
  }
  collectIcons(nodes);
  /** plain: 배경이 있는 칸(표 머리·버튼) 안의 글은 배지 없이 그린다(배경 겹침 방지). */
  function render(n:Tree,i:number,parentSkip:Set<string>=new Set(),inBlock=false,plain=false):React.ReactNode{
    if(typeof n==='string'&&plain)return displayText(n);
    if(typeof n==='string')return <GameText key={i} text={displayText(n)} part={part} withSkills={enrichSkills} skip={textSkip(displayText(n),parentSkip)}/>;
    if(movedIcons.has(n))return null;
    const skip=blockSkip(n,parentSkip,inBlock),sub=(c:Tree,j:number)=>render(c,j,skip,inBlock||isBlock(n),plain||n.tag==='th'||n.tag==='button');
    const a=n.attrs,children=n.children.filter(child=>!['table','thead','tbody','tfoot','tr','colgroup'].includes(n.tag)||typeof child!=='string'||child.trim()).map(sub);
    if(a['data-shared-notice'])return null;
    if(a['data-readable-group'])return <ReadMore key={i}>{a['data-readable-group']==='prose'?createElement(n.tag,{},children):children}</ReadMore>;
    if(n.tag==='br')return <br key={i}/>;
    if(n.tag==='col')return <col key={i}/>;
    if(n.tag==='img'&&!a.src)return null;
    if(n.tag==='img')return /\/(portraits|skills|gods|classes|weapons)\//.test(a.src)?<img key={i} src={'/'+personPortrait(a.src,part,a.alt?.replace(/ 초상화.*$/,''))} alt={a.alt||''} title={a.title} loading="lazy" data-source-image className={a.src.includes('/portraits/')||a.src.includes('/gods/')?'media-portrait':'media-icon'}/>:<GuideImage key={i} src={'/'+personPortrait(a.src,part,a.alt?.replace(/ 초상화.*$/,''))} alt={a.alt} className="media-guide" source/>;
    if(n.tag==='button'){const location=!!(a['data-recruit-material']||a['data-acquisition-modal']),classInfo=(classManifest.classes as Record<string,{file:string}>)[text(n.children)],chip=!location&&(/\/classes\//.test(a['data-reference-url']||'')||!!classInfo),icon=classIcons.get(n);return <button key={i} type="button" className={chip?'reference-chip':'button button-outline'} data-source-location={location||undefined} data-reference-url={a['data-reference-url']} aria-label={a['aria-label']} onClick={()=>a['data-recruit-material']&&onMaterial?onMaterial(a['data-recruit-material']):onDoc(a['data-reference-url']||'notes/index.md')}>{location&&<MapPin size={20}/ >}{chip&&classInfo&&<img className="inline-class-icon" src={'/'+classInfo.file} alt={icon?.attrs.alt||''} title={icon?.attrs.title} data-source-image={icon?true:undefined} loading="lazy"/>}{chip?text(n.children):children}</button>;}
    if(n.tag==='a'&&n.children.some(child=>typeof child!=='string'&&child.tag==='img'&&!/\/(portraits|gods|classes|skills|weapons)\//.test(child.attrs.src||'')))return <span key={i} data-source-location={a['data-map-link']||undefined}>{n.children.map(sub)}</span>;
    if(n.tag==='a'){if(a.href?.startsWith('#person-'))return <button className="person-inline" key={i} onClick={()=>onPerson?.(a.href!.slice(1))}>{children}</button>;if(a.href?.startsWith('http')||a.href?.startsWith('assets/'))return <a key={i} href={a.href.startsWith('assets/')?'/'+a.href:a.href} className={a['data-map-link']?'button button-outline':undefined} data-source-location={a['data-map-link']||undefined} target="_blank" rel="noreferrer">{a['data-map-link']&&<MapPin size={20}/ >}{children}</a>;return <button key={i} className="text-link" onClick={()=>onDoc(a.href||'notes/index.md')}>{children}</button>;}
    // 명성·지원 조건 칩은 안의 배지가 이미 배경을 가진다. 칩 껍데기를 빼 배경이 겹치지 않게 한다(2026-11-14 사용자 지적).
    if(a['data-condition-chip']&&/^(명성|지원)/.test(text(n.children).trim()))return <Fragment key={i}>{children}</Fragment>;
    return createElement(n.tag,{key:i,...Object.fromEntries(Object.entries(a).filter(([key])=>key.startsWith('data-')))},children);
  }
  return <div className="source-markup">{nodes.map((n,i)=>render(n,i,new Set(outerSkip)))}</div>;
}
function text(nodes:Tree[]):string{return nodes.map(n=>typeof n==='string'?n:text(n.children)).join('');}
