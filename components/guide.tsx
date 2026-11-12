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
export function Guide({route,label,part,groups,people,classes,secondary,docs}: {route:string;label:string;part:string;groups:Group[];people:Person[];classes:Record<string,ClassInfo>;secondary:Secondary;docs:ReferenceDoc[]}) {
  const [view,setView]=useState<View>('tasks');
  const [doc,setDoc]=useState<string|null>(null);
  return <Shell route={route} label={label} part={part} view={view} onView={setView}><div className="page-heading"><h1>{views.find(v=>v.id===view)?.label}</h1><p>{label}{route==='part3'?'':` ${part}부`}의 공략</p></div>{view==='tasks'&&<Tasks groups={groups} onDoc={setDoc}/ >}{view==='people'&&<People people={people} classes={classes} part={part} onDoc={setDoc}/ >}{view==='prep'&&<Preparation data={secondary} route={route} part={part} onDoc={setDoc}/ >}{view==='materials'&&<Materials data={secondary} route={route} part={part} onDoc={setDoc}/ >}{view==='docs'&&<DocList docs={docs} onOpen={setDoc}/ >}<DocumentSheet docs={docs} current={doc} onOpen={setDoc} onClose={()=>setDoc(null)} route={route}/></Shell>;
}
