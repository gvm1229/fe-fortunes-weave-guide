'use client';
import type { Material } from '@/lib/secondary';
import type { Person } from '@/lib/content';
import type { ClassInfo } from './people';
import { ClassPath } from './people';
import { Sheet,SheetContent,SheetTitle } from './ui/sheet';
import { Records } from './records';
import { MapPin } from 'lucide-react';
export function MapThumbnail({material,onOpen}:{material:Material;onOpen:()=>void}){return <div className="map-thumbnail"><button onClick={onOpen} aria-label={`${material.name} 지도 보기`}>{material.images?.[0]&&<img src={'/'+material.images[0].file} alt={`${material.name} 지도`} loading="lazy"/>}<span>{material.name}</span></button><button className="button button-outline" onClick={onOpen}><MapPin size={20}/> 지도 보기</button></div>;}
export function MapSheet({material,route,onClose}:{material:Material|undefined;route:string;onClose:()=>void}){return <Sheet open={!!material} onOpenChange={open=>{if(!open)onClose();}}><SheetContent themeRoute={route}><div className="sheet-heading"><SheetTitle>{material?.name||'지도'}</SheetTitle></div><div className="sheet-scroll">{material?.images?.map(image=><figure key={image.file}><img src={'/'+image.file} alt={image.caption}/><figcaption>{image.caption}</figcaption></figure>)}{material&&<Records value={{quantity:material.quantity,place:material.place,method:material.method,steps:material.steps,warning:material.warning}}/>}</div></SheetContent></Sheet>;}
export function PersonSheet({person,classes,route,onClose}:{person:Person|undefined;classes:Record<string,ClassInfo>;route:string;onClose:()=>void}){return <Sheet open={!!person} onOpenChange={open=>{if(!open)onClose();}}><SheetContent themeRoute={route}><div className="sheet-heading"><SheetTitle>{person?.name||'인물'}</SheetTitle></div><div className="sheet-scroll">{person&&<><div className="person-heading"><img className="portrait" src={'/'+person.portrait} alt={person.name}/><span className="role-chip">{person.role}</span></div><ClassPath classes={person.classes} manifest={classes}/><Records value={person.goal}/><Records value={person.recruitment}/></>}</div></SheetContent></Sheet>;}
