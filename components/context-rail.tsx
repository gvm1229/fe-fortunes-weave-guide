'use client';
import { GameIcon } from './game-text';
import type { Chapter } from '@/lib/checklist';
import { chapterGroups, walkTree } from '@/lib/checklist';
import type { Group, Person } from '@/lib/content';
import type { Secondary } from '@/lib/secondary';
import { checked } from '@/lib/check-state';
import { useChecks } from './checks';
import { chapterDates } from './tasks';
import { MapThumbnail } from './detail-sheets';
import { personPortrait } from '@/lib/portraits';
export function ContextRail({chapter,groups,people,data,onPerson,onMaterial}:{chapter:Chapter;groups:Group[];people:Person[];data:Secondary;onPerson:(name:string)=>void;onMaterial:(id:string)=>void}){
  const checks=useChecks(),cg=chapterGroups(chapter,groups),total=cg.reduce((n,g)=>n+g.actions.length,0),done=cg.reduce((n,g)=>n+g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length,0);
  const part=groups[0]?.stage==='part3-plan'?'3':'1';
  const portraits=new Set(chapter.blocks.flatMap(b=>b.portraits.map(p=>personPortrait(p.src,part,p.name)))),members=[...new Map(people.filter(p=>portraits.has(p.portrait)).map(p=>[p.name,p])).values()],materialIds=new Set<string>();
  for(const b of chapter.blocks)for(const nodes of [b.heading,b.notes,...Object.values(b.actions)])walkTree(nodes,n=>{if(n.attrs['data-recruit-material'])materialIds.add(n.attrs['data-recruit-material']);});
  const materials=data.materials.filter(m=>materialIds.has(m.id));
  const gold=Array.isArray(data.gold)?data.gold.find(g=>String(g.chapter)===chapter.title.replace(/\D/g,'')):undefined;
  return <aside className="context-rail" aria-label="이 장의 정보"><section><h2>{chapter.title}</h2>{chapterDates(chapter)&&<p>{chapterDates(chapter)}</p>}<p>이 장 완료 <strong>{done}/{total}</strong></p></section><section><h2>이 장의 인물</h2><div className="context-people">{members.map(p=><button className="icon-button" key={p.name} onClick={()=>onPerson(p.name)} aria-label={`${p.name} 인물 보기`}><img src={'/'+p.portrait} alt={p.name} loading="lazy"/></button>)}</div>{!members.length&&<p>0명</p>}</section><section><h2><GameIcon kind="gold"/>골드 목표</h2><p>{gold?`${Number(gold.target||0).toLocaleString()}G`:'미확인'}</p></section><section><h2>이 장의 재료</h2>{materials.map(m=><MapThumbnail key={m.id} material={m} onOpen={()=>onMaterial(m.id)}/>)}{!materials.length&&<p>0개</p>}</section></aside>;
}
