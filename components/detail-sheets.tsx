'use client';
import type { Person } from '@/lib/content';
import type { ClassInfo } from './people';
import { PersonInfo, PersonTags } from './people';
import { Sheet,SheetContent,SheetTitle } from './ui/sheet';
import { CharacterHeader, LikedGifts, SupportTable } from './yuphas';
import { BuildEditor, useBuild } from './build-editor';
/** 인물 서랍: yuphastemple 인물 머리 카드(큰 이름·병종·장점·약점 그림·소속 문장·큰 초상화) + 우리 계획 + 선호 선물·음식 + 지원(2026-11-27). 재료 서랍은 없앴다(재료는 yuphastemple 링크). */
export function PersonSheet({person,classes,route,part="1",onClose,onCloseAutoFocus}:{person:Person|undefined;classes:Record<string,ClassInfo>;route:string;part?:string;onClose:()=>void;onCloseAutoFocus?:(e:Event)=>void}){const build=useBuild(route,person?.yuphas?.slug);return <Sheet open={!!person} onOpenChange={open=>{if(!open)onClose();}}><SheetContent themeRoute={route} onCloseAutoFocus={onCloseAutoFocus}><div className="sheet-heading"><SheetTitle>{person?.name||'인물'}</SheetTitle></div><div className="sheet-scroll">{person&&<><CharacterHeader name={person.name} profile={person.yuphas&&part==='3'?{...person.yuphas,portrait:''}:person.yuphas} portrait={'/'+person.portrait} build={build}><PersonTags person={person} part={part}/></CharacterHeader>{/* 내 기록(2026-11-27 U72): 이 루트에서 이 인물의 병종·레벨·숙련 등급·메모. */}{person.yuphas&&<><h3 className="y-section-title">내 기록</h3><BuildEditor route={route} profile={person.yuphas}/></>}<PersonInfo person={person} classes={classes} part={part}/>{person.yuphas&&<><h3 className="y-section-title">선호 선물·음식</h3><LikedGifts profile={person.yuphas} cheap={person.cheapGifts.map(g=>g.name)}/><h3 className="y-section-title">지원</h3><SupportTable profile={person.yuphas}/></>}</>}</div></SheetContent></Sheet>;}
