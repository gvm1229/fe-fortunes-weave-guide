'use client';
import { GameText, glueDots, glueLeadDots, imageName, classNamesByFile, namesInText } from './game-text';
import { createElement, Fragment } from 'react';
import { MapPin } from 'lucide-react';
import type { Tree } from '@/lib/content';
import { displayText } from '@/lib/display';
import { ReadMore } from './read-more';
import { GuideImage } from './image-viewer';
import classManifest from '@/assets/classes/manifest.json';
import { personPortrait } from '@/lib/portraits';
import { final25Class } from '@/lib/final25';
import { yuphasItem, itemUrl, mapUrl, type MapTarget } from '@/lib/yuphas';
import { useDocAvailable } from './doc-available';
import { YLink, useFirstLink } from './yuphas';
/** 근거·기록용 글(2026-11-27 사용자 결정: 화면에서 빼고 docs/reference/로). 자료는 그대로 두고 그릴 때 거른다. */
export const evidenceLabel=/근거|검토|원문|출처|확인$/;
const blockTags=new Set(['h2','h3','h4','h5','li','p','td','th','summary','figcaption']);
function namesIn(n:Tree,acc:Set<string>):Set<string>{if(typeof n!=='string'){if(n.tag==='img'&&n.attrs.src&&/\/(portraits|classes)\//.test(n.attrs.src)){const name=imageName(n.attrs.src,n.attrs.alt);if(name)acc.add(name);}if(n.tag==='button'){const t=flatText(n.children);if(classNamesByFile.size&&[...classNamesByFile.values()].includes(t))acc.add(t);}n.children.forEach(c=>namesIn(c,acc));}return acc;}
function flatText(nodes:Tree[]):string{return nodes.map(n=>typeof n==='string'?n:flatText(n.children)).join('');}
/** 블록 안에 이미 있는 얼굴·병종 그림의 이름을 모아 글 속 그림을 다시 붙이지 않는다. */
/** 가장 바깥 묶음(표 칸·목록 항목·문단·제목)마다 이름 모음을 새로 만들고, 그 안의 묶음은 같은 모음을 함께 쓴다. */
function blockSkip(n:Exclude<Tree,string>,skip:Set<string>,inBlock:boolean):Set<string>{if(!blockTags.has(n.tag)&&!n.attrs['data-face-row'])return skip;return namesIn(n,inBlock?skip:new Set(skip));}
const isBlock=(n:Exclude<Tree,string>)=>blockTags.has(n.tag)||!!n.attrs['data-face-row'];
/** 글 조각을 그릴 때 이미 그림이 붙은 이름을 같은 묶음에서 다시 붙이지 않는다. */
function textSkip(text:string,skip:Set<string>):ReadonlySet<string>{const before=new Set(skip);namesInText(text).forEach(name=>skip.add(name));return before;}
export function SourceMarkup({nodes,onDoc,onPerson,part='1',route='all',skip:outerSkip,map}:{nodes:Tree[];onDoc:(url:string)=>void;onMaterial?:(id:string)=>void;onPerson?:(name:string)=>void;part?:string;route?:string;skip?:ReadonlySet<string>;map?:MapTarget}){
  const first=useFirstLink(),docAvailable=useDocAvailable();let seq=0;
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
    if(typeof n==='string'&&plain)return <Fragment key={i}>{glueDots(displayText(n))}</Fragment>;
    if(typeof n==='string')return <GameText key={i} text={displayText(n)} part={part} withSkills={enrichSkills} skip={textSkip(displayText(n),parentSkip)}/>;
    if(movedIcons.has(n))return null;
    const skip=blockSkip(n,parentSkip,inBlock),sub=(c:Tree,j:number)=>render(c,j,skip,inBlock||isBlock(n),plain||n.tag==='th'||n.tag==='button');
    // 목록 항목 맨 앞 줄바꿈(<li> <br>글)은 빈 줄만 만든다. 그리지 않아 짧은 줄 사이 간격이 한 줄씩 벌어지지 않게 한다(2026-11-26 화면 다듬기 2).
    const a=n.attrs,children=glueLeadDots(n.children.filter(child=>!['table','thead','tbody','tfoot','tr','colgroup'].includes(n.tag)||typeof child!=='string'||child.trim()).filter((child,j,all)=>!(n.tag==='li'&&typeof child!=='string'&&child.tag==='br'&&all.slice(0,j).every(c=>typeof c==='string'&&!c.trim()))),sub,n.tag==='ul'||n.tag==='ol');
    if(a['data-shared-notice'])return null;
    if(a['data-readable-group'])return <ReadMore key={i}>{a['data-readable-group']==='prose'?createElement(n.tag,{},children):children}</ReadMore>;
    if(n.tag==='br')return <br key={i}/>;
    if(n.tag==='col')return <col key={i}/>;
    if(n.tag==='img'&&!a.src)return null;
    if(n.tag==='img')return /\/(portraits|skills|gods|classes|weapons)\//.test(a.src)?<img key={i} src={'/'+personPortrait(a.src,part,a.alt?.replace(/ 초상화.*$/,''))} alt={a.alt||''} title={a.title} loading="lazy" data-source-image className={a.src.includes('/portraits/')||a.src.includes('/gods/')?['media-portrait',final25Class(a.alt)].filter(Boolean).join(' '):'media-icon'}/>:<GuideImage key={i} src={'/'+personPortrait(a.src,part,a.alt?.replace(/ 초상화.*$/,''))} alt={a.alt} className="media-guide" source/>;
    if(n.tag==='button'){const label=text(n.children).trim();
      // 재료 단추: 서랍 대신 한국어 배지 + 영어 단추(yuphastemple 물품, 2026-11-27).
      if(a['data-recruit-material'])return <span key={i} className="y-material" data-source-location><GameText text={text(n.children.filter(c=>typeof c==='string'||c.tag!=='small')).trim()} part={part}/></span>;
      // 입수처 단추: 묶음에서 그 물품의 첫 영어 단추가 아직 없을 때만 영어 단추.
      if(a['data-acquisition-modal']){const y=yuphasItem((a['aria-label']||'').replace(/\s*입수처$/,''));/* 같은 물품의 영어 단추가 이미 있으면 보이지 않는 표시만 남겨 원본 위치 수(검사)가 그대로 맞게 한다. */return y&&first(y.slug,'acq'+(seq++))?<span key={i} data-source-location><YLink en={y.en} href={itemUrl(y.slug)}/></span>:<span key={i} data-source-location data-yuphas-dedup hidden/>;}
      // "○○ 위치" 문서 단추 → yuphastemple 지도에서 그 물품 찾기.
      if(/ 위치$/.test(label)){const y=yuphasItem(label.replace(/ 위치$/,''));return y?<YLink key={i} en={y.en} href={mapUrl(route,y.en)} icon={<MapPin size={18} aria-hidden="true"/>}/>:null;}
      if(evidenceLabel.test(label))return null;
          if(a['data-reference-url']&&!docAvailable(a['data-reference-url']))return <span key={i}>{children}</span>;
          {const location=!!(a['data-recruit-material']||a['data-acquisition-modal']),classInfo=(classManifest.classes as Record<string,{file:string}>)[text(n.children)],chip=!location&&(/\/classes\//.test(a['data-reference-url']||'')||!!classInfo),icon=classIcons.get(n);return <button key={i} type="button" className={chip?'reference-chip':'button button-outline'} data-source-location={location||undefined} data-reference-url={a['data-reference-url']} aria-label={a['aria-label']} onClick={()=>onDoc(a['data-reference-url']||'notes/index.md')}>{location&&<MapPin size={20}/ >}{chip&&classInfo&&<img className="inline-class-icon" src={'/'+classInfo.file} alt={icon?.attrs.alt||''} title={icon?.attrs.title} data-source-image={icon?true:undefined} loading="lazy"/>}{chip?text(n.children):children}</button>;}}
    if(n.tag==='a'&&n.children.some(child=>typeof child!=='string'&&child.tag==='img'&&!/\/(portraits|gods|classes|skills|weapons)\//.test(child.attrs.src||'')))return <span key={i} data-source-location={a['data-map-link']||undefined}>{n.children.map(sub)}</span>;
    if(n.tag==='a'){if(/^\s*(그림 출처|입수 원문)/.test(text(n.children)))return null;if(a['data-map-link'])/* 지도 단추: 묶음 글로 고른 장소 주소 → 물품 검색 → 루트 지도(2026-11-27, U65). map이 없으면 루트 지도. */return <span key={i} data-source-location data-map-tier={map?.tier||'route'}><YLink en={map?.label||'World Map'} href={map?.href||mapUrl(route)} icon={<MapPin size={18} aria-hidden="true"/>}/></span>;if(a.href?.startsWith('#person-'))return <button className="person-inline" key={i} onClick={()=>onPerson?.(a.href!.slice(1))}>{children}</button>;if(a.href?.startsWith('http')||a.href?.startsWith('assets/'))return <a key={i} href={a.href.startsWith('assets/')?'/'+a.href:a.href} className={a['data-map-link']?'button button-outline':undefined} data-source-location={a['data-map-link']||undefined} target="_blank" rel="noreferrer">{a['data-map-link']&&<MapPin size={20}/ >}{children}</a>;return <button key={i} className="text-link" onClick={()=>onDoc(a.href||'notes/index.md')}>{children}</button>;}
    // 명성·지원 조건 칩은 안의 배지가 이미 배경을 가진다. 칩 껍데기를 빼 배경이 겹치지 않게 한다(2026-11-14 사용자 지적).
    if(a['data-condition-chip']&&/^(명성|지원)/.test(text(n.children).trim()))return <Fragment key={i}>{children}</Fragment>;
    return createElement(n.tag,{key:i,...Object.fromEntries(Object.entries(a).filter(([key])=>key.startsWith('data-')))},children);
  }
  return <div className="source-markup">{glueLeadDots(nodes,(n,i)=>render(n,i,new Set(outerSkip)))}</div>;
}
function text(nodes:Tree[]):string{return nodes.map(n=>typeof n==='string'?n:text(n.children)).join('');}
