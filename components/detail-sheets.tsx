'use client';
import { GameText } from './game-text';
import type { Material } from '@/lib/secondary';
import type { Person } from '@/lib/content';
import type { ClassInfo } from './people';
import { PersonInfo, PersonTags } from './people';
import { isFinal25 } from '@/lib/final25';
import { GuideImage } from './image-viewer';
import { Sheet,SheetContent,SheetTitle } from './ui/sheet';
import { Records } from './records';
import { MapPin } from 'lucide-react';
/** title: 카드 제목. 사진 옆 이름이 제목과 같으면 그리지 않는다(단추 이름표는 유지, 2026-11-26 화면 다듬기 12). */
export function MapThumbnail({material,title,onOpen}:{material:Material;title?:string;onOpen:()=>void}){return <div className="map-thumbnail"><button onClick={onOpen} aria-label={`${material.name} 지도 보기`}>{material.images?.[0]&&<img src={'/'+material.images[0].file} alt={`${material.name} 지도`} loading="lazy"/>}{material.name!==title&&<span><GameText text={material.name}/></span>}</button><button className="button button-outline" onClick={onOpen}><MapPin size={20}/> 지도 보기</button></div>;}
export function MapSheet({material,route,onClose}:{material:Material|undefined;route:string;onClose:()=>void}){return <Sheet open={!!material} onOpenChange={open=>{if(!open)onClose();}}><SheetContent themeRoute={route}><div className="sheet-heading"><SheetTitle>{material?.name||'지도'}</SheetTitle></div><div className="sheet-scroll">{material?.images?.map(image=><figure key={image.file}><GuideImage src={'/'+image.file} alt={image.caption}/><figcaption>{image.caption}</figcaption></figure>)}{material&&<Records value={material.info}/>}</div></SheetContent></Sheet>;}
export function PersonSheet({person,classes,route,part="1",onClose}:{person:Person|undefined;classes:Record<string,ClassInfo>;route:string;part?:string;onClose:()=>void}){return <Sheet open={!!person} onOpenChange={open=>{if(!open)onClose();}}><SheetContent themeRoute={route}><div className="sheet-heading"><SheetTitle>{person?.name||'인물'}</SheetTitle></div><div className="sheet-scroll">{person&&<><div className="person-heading"><img className={'portrait'+(isFinal25(person.name)?' final25-portrait':'')} src={'/'+person.portrait} alt={person.name}/><PersonTags person={person} part={part}/></div><PersonInfo person={person} classes={classes} part={part}/></>}</div></SheetContent></Sheet>;}
