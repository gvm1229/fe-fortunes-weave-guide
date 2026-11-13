'use client';
import { usePreference } from './preferences';
import { characterSummary } from '@/lib/character-summary';
import { GameText, GameIcon } from './game-text';
import { Search } from 'lucide-react';
import type { Person } from '@/lib/content';
import { RecordRows, Semantic } from './records';
import { Button } from './ui/button';
export type ClassInfo={file:string;tier:string;slug?:string;weapons?:string[];traits?:string[]};
export function ClassPath({classes,manifest,onDoc}:{classes:string[];manifest:Record<string,ClassInfo>;onDoc?:(url:string)=>void}){return <ol className="class-path">{classes.map(c=><li key={c}>{manifest[c]&&<img src={`/${manifest[c].file}`} alt="" loading="lazy"/>}{onDoc&&manifest[c]?.slug?<button className="text-link" onClick={()=>onDoc(`notes/classes/${manifest[c].slug}.md`)}>{c}</button>:<strong>{c}</strong>}<span className="role-chip">{manifest[c]?.tier||'단계 미확인'}</span></li>)}</ol>;}
export function PersonInfo({person,classes,part="1"}:{person:Person;classes:Record<string,ClassInfo>;part?:string}){
  const goal=person.goal&&typeof person.goal==='object'?Object.fromEntries(Object.entries(person.goal).filter(([key])=>key!=='classes')):person.goal;
  const summary=characterSummary(person,part);
  return <><table className="person-summary"><tbody>
    <tr><th scope="row">영입 이유</th><td><GameText text={summary.reason} part={part}/></td></tr>
    <tr><th scope="row">합류 계획</th><td>{summary.join}</td></tr>
    <tr><th scope="row">언제 출격?</th><td>{summary.battle}</td></tr>
    <tr><th scope="row">목표</th><td><ul className="summary-points">{summary.goals.map((line,i)=><li key={i}><strong><GameText text={line} withSkills part={part}/></strong></li>)}</ul></td></tr>
    <tr><th scope="row">병종</th><td><ClassPath classes={person.classes} manifest={classes}/></td></tr>
    <tr><th scope="row">멈출 때</th><td><ul className="summary-points">{summary.stop.map((line,i)=><li key={i}><GameText text={line} part={part}/></li>)}</ul></td></tr>
    {!!summary.caution.length&&<tr><th scope="row">보존 주의</th><td>{summary.caution.map(line=><strong key={line}>{line}</strong>)}</td></tr>}
    </tbody></table><details className="person-full-details"><summary>시험 조건·시기별 계획·원문 기록</summary><table className="person-info"><tbody><RecordRows value={goal} label="육성 목표"/><RecordRows value={person.readiness} label="출격·경험치"/><RecordRows value={person.recruitment} label="영입"/><RecordRows value={person.gates} label="시험·조건"/><RecordRows value={person.gifts.length?person.gifts:'미확인'} label="선물"/></tbody></table></details></>;
}
export function People({people,classes,part,onDoc}:{people:Person[];classes:Record<string,ClassInfo>;part:string;onDoc:(url:string)=>void}){
  const scope=`people-${people[0]?.route}-${part}`;
  const [query,setQuery]=usePreference<string>(scope+'-query','');const [role,setRole]=usePreference<string>(scope+'-role','전체');const [kind,setKind]=usePreference<string>(scope+'-kind','전체');
  const list=people.filter(p=>p.name.normalize('NFKC').includes(query.normalize('NFKC').trim())&&(role==='전체'||p.role===role)&&(kind==='전체'||p.kind===kind)).sort((a,b)=>['본대','보완','선택','수집'].indexOf(a.role)-['본대','보완','선택','수집'].indexOf(b.role)||a.order.localeCompare(b.order,undefined,{numeric:true}));
  return <><div className="filters people-filters"><label className="search"><Search size={22}/><input aria-label="인물 이름 검색" placeholder="이름으로 찾기" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="역할 필터" value={role} onChange={e=>setRole(e.target.value)}>{['전체',...new Set(people.map(p=>p.role))].map(r=><option key={r} value={r}>{r==='전체'?'모든 역할':r}</option>)}</select><select aria-label="육성판 목적" value={kind} onChange={e=>setKind(e.target.value)}>{["전체",...new Set(people.map(p=>p.kind))].map(k=><option key={k} value={k}>{k==='전체'?'모든 목적':k}</option>)}</select><Button variant="secondary" onClick={()=>{setQuery('');setRole('전체');setKind('전체');}}>필터 지우기</Button><Button variant="secondary" onClick={()=>onDoc('notes/exam.md')}>시험 안내</Button></div><p className="muted">{list.length}명 · 실제 합류와 출격 자리는 게임 화면을 먼저 확인하세요.</p><div className="people-grid">{list.map(p=>{const gate=p.recruitment as {sup?:string|number;fame?:string|number};return <article className="person" key={`${p.route}-${p.name}`}><div className="person-heading">{p.portrait&&<img className="portrait" src={`/${p.portrait}`} alt={p.name} loading="lazy"/>}<div><h2>{p.name}</h2><p className="role-chip">{p.role}</p>{part==='3'&&<p className="role-chip">{{theodora:'세오도라',leda:'레다',dietrich:'디트리히',kai:'카이',part3:'3부'}[p.route]}에서 준비 · {p.kind}</p>}<div className="tags">{p.joinLabel&&<span className="role-chip">{part==='1'?p.joinLabel:`1부: ${p.joinLabel}`}</span>}{gate.sup!=='0'&&gate.sup!==0&&<span><GameIcon kind="bond"/> 지원 {gate.sup??'미확인'}</span>}{gate.fame!=='0'&&gate.fame!==0&&<span><GameIcon kind="renown"/> 명성 {gate.fame??'미확인'}</span>}</div></div></div><PersonInfo person={p} classes={classes} part={part}/><details><summary>영입 조건·자세한 육성</summary>{p.details&&<Semantic nodes={p.details} route={p.route} part={part} onDoc={onDoc} hidePortraits/>}</details></article>;})}</div>{!list.length&&<p>맞는 인물이 없습니다. 이름이나 역할을 바꿔 보세요.</p>}</>;
}
