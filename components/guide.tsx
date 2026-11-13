'use client';
import { useEffect, useState } from 'react';
import { guideHref } from '@/lib/document-links';
import type { Group, Person } from '@/lib/content';
import { Shell, type View, views } from './shell';
import { Tasks } from './tasks';
import { People, type ClassInfo } from './people';
import { Preparation, Materials } from './secondary';
import type { Secondary } from '@/lib/secondary';
import type { ReferenceDoc } from '@/lib/documents';
import { DocList, DocumentSheet } from './documents';
import type { Chapter } from '@/lib/checklist';
import { ContextRail } from './context-rail';
import { MapSheet, PersonSheet } from './detail-sheets';
import { useReadingMemory } from './preferences';
export function Guide({route,label,part,chapters,groups,people,classes,secondary,docs}: {route:string;label:string;part:string;chapters:Chapter[];groups:Group[];people:Person[];classes:Record<string,ClassInfo>;secondary:Secondary;docs:ReferenceDoc[]}) {
  const [view,setView]=useState<View>('tasks');
  useReadingMemory(`${route}-${part}-${view}`);
  const [doc,setDoc]=useState<string|null>(null);
  const [material,setMaterial]=useState<string|null>(null),[person,setPerson]=useState<string|null>(null);
  useEffect(()=>{const jump=()=>setView('tasks');window.addEventListener('guide-jump',jump);return()=>window.removeEventListener('guide-jump',jump);},[]);
  const openDoc=(url:string)=>{if(url.startsWith('#person-')){setPerson(url.slice(1));return;}const href=guideHref(url);if(href){setView('tasks');window.location.assign(href);}else setDoc(url);};
  return <Shell route={route} label={label} part={part} view={view} onView={setView}><div className="page-heading"><h1>{views.find(v=>v.id===view)?.label}</h1></div>{view==='tasks'&&<Tasks chapters={chapters} groups={groups} onDoc={openDoc} onMaterial={setMaterial} onPerson={setPerson} context={chapter=><ContextRail chapter={chapter} groups={groups} people={people} data={secondary} onPerson={setPerson} onMaterial={setMaterial}/>}/ >}{view==='people'&&<People people={people} classes={classes} part={part} onDoc={openDoc}/ >}{view==='prep'&&<Preparation data={secondary} route={route} part={part} onDoc={openDoc}/ >}{view==='materials'&&<Materials data={secondary} route={route} part={part} onDoc={openDoc} onMaterial={setMaterial}/ >}{view==='docs'&&<DocList docs={docs} onOpen={setDoc}/ >}<DocumentSheet docs={docs} current={doc} onOpen={setDoc} onClose={()=>setDoc(null)} route={route} part={part}/><MapSheet material={secondary.materials.find(m=>m.id===material)} route={route} onClose={()=>setMaterial(null)}/><PersonSheet person={people.find(p=>p.id===person||p.name===person?.replace(/ 초상화.*$/,''))} route={route} classes={classes} onClose={()=>setPerson(null)}/></Shell>;
}
