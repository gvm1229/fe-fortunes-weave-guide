'use client';
import { useState } from 'react';
import { Heart, Award, Search } from 'lucide-react';
import type { Person } from '@/lib/content';
import { Records, Semantic } from './records';
export type ClassInfo={file:string;tier:string;weapons?:string[];traits?:string[]};
export function ClassPath({classes,manifest}:{classes:string[];manifest:Record<string,ClassInfo>}){return <ol className="class-path">{classes.map(c=><li key={c}>{manifest[c]&&<img src={`/${manifest[c].file}`} alt="" loading="lazy"/>}<span><strong>{c}</strong><span className="muted">{manifest[c]?.tier||'단계 미확인'}</span></span></li>)}</ol>;}
export function People({people,classes,part,onDoc}:{people:Person[];classes:Record<string,ClassInfo>;part:string;onDoc:(url:string)=>void}){
  const [query,setQuery]=useState('');const [role,setRole]=useState('전체');
  const list=people.filter(p=>p.name.includes(query)&&(role==='전체'||p.role===role));
  return <><div className="filters"><label className="search"><Search size={22}/><input aria-label="인물 이름 검색" placeholder="이름으로 찾기" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="역할 필터" value={role} onChange={e=>setRole(e.target.value)}>{['전체',...new Set(people.map(p=>p.role))].map(r=><option key={r}>{r}</option>)}</select></div><p className="muted">{list.length}명 · 실제 합류와 출격 자리는 게임 화면을 먼저 확인하세요.</p><div className="people-grid">{list.map(p=>{const gate=p.recruitment as {sup?:string;fame?:string};return <article className="person" key={`${p.route}-${p.name}`}><div className="person-heading">{p.portrait&&<img className="portrait" src={`/${p.portrait}`} alt={p.name} loading="lazy"/>}<div><h2>{p.name}</h2><p>{p.role}</p><div className="tags"><span><Heart size={20}/> 지원 {gate.sup??'미확인'}</span><span><Award size={20}/> 명성 {gate.fame??'미확인'}</span></div></div></div><ClassPath classes={p.classes} manifest={classes}/><Records value={p.goal}/><details><summary>영입 조건·자세한 육성</summary><Records value={p.recruitment}/><Records value={p.gates}/>{p.details&&<Semantic nodes={p.details} route={p.route} part={part} onDoc={onDoc} hidePortraits/>}</details></article>;})}</div>{!list.length&&<p>맞는 인물이 없습니다. 이름이나 역할을 바꿔 보세요.</p>}</>;
}
