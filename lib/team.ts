import { json, type Person } from './content';
import classes from '@/assets/classes/manifest.json';
export type TeamUnit={name:string;route?:string;role:string;class:string;portrait:string;weapons:{label:string;icon:string}[];signature:{name:string;icon:string;rank:string;note:string}[];white:unknown;reason:string;paths:{route:string;classes:string[];text:string}[]};
export type Scenario={id:string;title:string;description:string;swaps:Record<string,string>};
export function teamData(){
  const final=json<{final25Example:{name:string;role:string;class:string}[]}>('data/final-roster');
  const portraits=json<Record<string,{portrait:string}>>('data/people-display');
  const origins=Object.values(json<{routes:Record<string,Record<string,{baseRoute?:string}>>}>('data/unit-readiness').routes);
  const specialty=json<{scenarios:Scenario[];classUpdates:Record<string,string>;reasons:Record<string,string>;comparisons:unknown;roleUpdates:Record<string,string>}>('data/team-specialty-review');
  const signatures=json<{people:Record<string,[string,string][]>;items:Record<string,{name:string;icon:string;rank:string}>}>('data/team-signature-weapons');
  const white=json<{spells:Record<string,unknown>}>('data/team-white-highlights');
  const phases=json<{routes:Record<string,Record<string,Record<string,unknown>>>}>('data/phase-goals');
  const skillIcons:Record<string,[string,string]>={'검술':['검','sword'],'창술':['창','lance'],'도끼술':['도끼','axe'],'궁술':['활','bow'],'격투술':['격투','brawl'],'흑마술':['흑마법','black-magic'],'백마술':['백마법','white-magic']};
  const manifest=classes.classes as Record<string,{weapons?:string[]}>;
  const names=new Set(final.final25Example.map(p=>p.name));for(const s of specialty.scenarios)Object.values(s.swaps).forEach(n=>names.add(n));
  const units:Record<string,TeamUnit>={};
  for(const name of names){const base=final.final25Example.find(p=>p.name===name);const className=specialty.classUpdates[name]||base?.class||'미확인';units[name]={name,route:(()=>{const routes=[...new Set(origins.map(p=>p[name]?.baseRoute).filter((r):r is string=>!!r))];return routes.length===1?routes[0]:undefined;})(),role:base?.role||specialty.roleUpdates[name]||'대안',class:className,portrait:name==='이스마르'?'assets/portraits/eshmel-female.png':portraits[name]?.portrait||'',weapons:(manifest[className]?.weapons||[]).map(w=>({label:skillIcons[w]?.[0]||w,icon:skillIcons[w]?`assets/skills/${skillIcons[w][1]}.webp`:''})),signature:(signatures.people[name]||[]).map(([id,note])=>({...signatures.items[id],note})),white:white.spells[name]||[],reason:specialty.reasons[name]||'미확인',paths:Object.entries(phases.routes).filter(([,p])=>p[name]).map(([route,p])=>({route,...p[name]['3'] as {classes:string[];text:string}}))};}
  return {baseline:final.final25Example.map(p=>p.name),units,scenarios:specialty.scenarios,comparisons:specialty.comparisons,spells:json('data/team-white-spells'),selection:json('data/roster-selection').comparisons as Person[]};
}
