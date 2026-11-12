'use client';
import { useState } from 'react';
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
export function Guide({route,label,part,chapters,groups,people,classes,secondary,docs}: {route:string;label:string;part:string;chapters:Chapter[];groups:Group[];people:Person[];classes:Record<string,ClassInfo>;secondary:Secondary;docs:ReferenceDoc[]}) {
  const [view,setView]=useState<View>('tasks');
  const [doc,setDoc]=useState<string|null>(null);
  const [material,setMaterial]=useState<string|null>(null),[person,setPerson]=useState<string|null>(null);
  return <Shell route={route} label={label} part={part} view={view} onView={setView}><div className="page-heading"><h1>{views.find(v=>v.id===view)?.label}</h1></div>{view==='tasks'&&<Tasks chapters={chapters} groups={groups} onDoc={setDoc} onMaterial={setMaterial} onPerson={setPerson} context={chapter=><ContextRail chapter={chapter} groups={groups} people={people} data={secondary} onPerson={setPerson} onMaterial={setMaterial}/>}/ >}{view==='people'&&<People people={people} classes={classes} part={part} onDoc={setDoc}/ >}{view==='prep'&&<Preparation data={secondary} route={route} part={part} onDoc={setDoc}/ >}{view==='materials'&&<Materials data={secondary} route={route} part={part} onDoc={setDoc} onMaterial={setMaterial}/ >}{view==='docs'&&<DocList docs={docs} onOpen={setDoc}/ >}<DocumentSheet docs={docs} current={doc} onOpen={setDoc} onClose={()=>setDoc(null)} route={route}/><MapSheet material={secondary.materials.find(m=>m.id===material)} route={route} onClose={()=>setMaterial(null)}/><PersonSheet person={people.find(p=>p.name===person?.replace(/ 초상화.*$/,''))} route={route} classes={classes} onClose={()=>setPerson(null)}/></Shell>;
}
