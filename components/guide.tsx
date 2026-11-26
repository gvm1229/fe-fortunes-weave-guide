'use client';
import { useEffect, useRef, useState } from 'react';
import { guideHref } from '@/lib/document-links';
import type { Group, Person } from '@/lib/content';
import { Shell, type View, views } from './shell';
import { Tasks } from './tasks';
import { People, type ClassInfo } from './people';
import { Preparation, Materials } from './secondary';
import type { Secondary } from '@/lib/secondary';
import type { ReferenceDoc } from '@/lib/documents';
import { DocumentSheet } from './documents';
import type { Chapter } from '@/lib/checklist';
import { ContextRail } from './context-rail';
import { PersonSheet } from './detail-sheets';
import { useReadingMemory } from './preferences';
export function Guide({route,label,part,chapters,groups,people,classes,secondary,docs}: {route:string;label:string;part:string;chapters:Chapter[];groups:Group[];people:Person[];classes:Record<string,ClassInfo>;secondary:Secondary;docs:ReferenceDoc[]}) {
  const [view,setView]=useState<View>('tasks');
  useReadingMemory(`${route}-${part}-${view}`);
  const [doc,setDoc]=useState<string|null>(null);
  const [person,setPerson]=useState<string|null>(null);
  // 인물 서랍을 연 단추(인물 카드·얼굴)를 기억해 닫을 때 초점을 그 자리로 돌린다(키보드로 보던 카드를 잃지 않게, Fable 검토 21 지적 12).
  const opener=useRef<HTMLElement|null>(null);
  const openPerson=(id:string)=>{opener.current=document.activeElement instanceof HTMLElement&&document.activeElement!==document.body?document.activeElement:null;setPerson(id);};
  useEffect(()=>{const jump=()=>setView('tasks');window.addEventListener('guide-jump',jump);return()=>window.removeEventListener('guide-jump',jump);},[]);
  const openDoc=(url:string)=>{if(url.startsWith('#person-')){openPerson(url.slice(1));return;}const href=guideHref(url);if(href){setView('tasks');window.location.assign(href);}else setDoc(url);};
  return <Shell route={route} label={label} part={part} view={view} onView={setView}>{view!=='tasks'&&<div className="page-heading"><h1>{views.find(v=>v.id===view)?.label}</h1></div>}{view==='tasks'&&<Tasks route={route} label={label} part={part} chapters={chapters} groups={groups} onDoc={openDoc} onPerson={openPerson} people={people.map(p=>p.name)} context={chapter=><ContextRail chapter={chapter} groups={groups} people={people} data={secondary} onPerson={openPerson} onDoc={openDoc} route={route}/>}/ >}{view==='people'&&<People people={people} part={part} onDoc={openDoc} onPerson={openPerson}/ >}{view==='prep'&&<Preparation data={secondary} route={route} onDoc={openDoc} onPerson={openPerson} people={people.map(p=>p.name)}/ >}{view==='materials'&&<Materials data={secondary} route={route} part={part} onDoc={openDoc}/ >}<DocumentSheet docs={docs} current={doc} onOpen={setDoc} onClose={()=>setDoc(null)} route={route} part={part}/><PersonSheet part={part} person={people.find(p=>p.id===person||p.name===person?.replace(/ 초상화.*$/,''))} route={route} classes={classes} onClose={()=>setPerson(null)} onCloseAutoFocus={e=>{const el=opener.current;if(el?.isConnected){e.preventDefault();el.focus();}}}/></Shell>;
}
