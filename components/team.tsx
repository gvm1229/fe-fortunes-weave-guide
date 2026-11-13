'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import type { teamData } from '@/lib/team';
import type { ReferenceDoc } from '@/lib/documents';
import { personPortrait } from '@/lib/portraits';
import { ClassPath, type ClassInfo } from './people';
import { Records, Semantic } from './records';
import { ThemeSwitch } from './theme';
import { DocList, DocumentSheet } from './documents';
import { Button } from './ui/button';
import { ReadMore } from './read-more';
import { usePreference, useReadingMemory } from './preferences';

export function Team({data,classes,docs}:{data:ReturnType<typeof teamData>;classes:Record<string,ClassInfo>;docs:ReferenceDoc[]}){
  const [scenario,setScenario]=usePreference<string>('team-scenario','current');
  const [trials,setTrials]=usePreference<string[]>('team-trials',[]);
  const [timeskip,setTimeskip]=usePreference<boolean>('team-timeskip',false);
  const [tab,setTab]=usePreference<string>('team-tab','spells');
  const [route,setRoute]=usePreference<string>('team-route','theodora');
  const [part,setPart]=usePreference<string>('team-part','1');
  const [changes,setChanges]=usePreference<boolean>('team-changes',false);
  const [references,setReferences]=usePreference<boolean>('team-references',false);
  const [doc,setDoc]=useState<string|null>(null);
  useReadingMemory(`team-${tab}-${route}-${part}`);
  const chosen=data.proposal.scenarios.find(s=>s.id===scenario)||data.proposal.scenarios[0];
  const swaps={...chosen.swaps};
  data.proposal.trials.filter(t=>trials.includes(t.id)).forEach(t=>{swaps[t.outgoing]=t.incoming;});
  const names=data.baseline.map(name=>swaps[name]||name).sort((a,b)=>data.units[a].displayGroupRank-data.units[b].displayGroupRank||data.units[a].displayPriority-data.units[b].displayPriority);
  const routeNames:Record<string,string>={theodora:'세오도라',leda:'레다',dietrich:'디트리히',kai:'카이'};
  function jump(id:string){
    if(id.startsWith('spell-')||id==='white-spell-book')setTab('spells');
    else if(id==='route-comparison')setTab('routes');
    else setTab('details');
    requestAnimationFrame(()=>{const target=document.getElementById(id);if(target){target.closest('details')?.setAttribute('open','');target.scrollIntoView({block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}});
  }
  const onDoc=(url:string)=>url.startsWith('#')?jump(decodeURIComponent(url.slice(1))):setDoc(url);
  const semanticProps={route:'all',part:'3',onDoc,onSpell:(id:string)=>jump('spell-'+id)};
  const routeTeam=data.routeTeams[route]||data.routeTeams.theodora;
  return <main className="team-page">
    <header className="home-top"><Link href="/" className="back-link"><ArrowLeft size={22}/> 루트 선택</Link><ThemeSwitch/></header>
    <div className="page-heading"><h1>최종 25명</h1><p>목표 편성 · {names.length}명 · 여성 {names.filter(n=>data.units[n].female).length}명</p></div>
    <div className="scenario-tabs" role="group" aria-label="팀 편성안">{data.proposal.scenarios.map(s=><Button key={s.id} variant={s.id===chosen.id?'default':'secondary'} onClick={()=>setScenario(s.id)} aria-pressed={s.id===chosen.id}>{s.title}</Button>)}<Button variant="secondary" aria-pressed={timeskip} onClick={()=>setTimeskip(!timeskip)}>시간 경과 후 초상화 {timeskip?'ON':'OFF'}</Button></div>
    <ReadMore><p>{chosen.description}</p></ReadMore>
    <div className="filters">{data.proposal.trials.map(t=><label className="check-control" key={t.id}><input type="checkbox" checked={trials.includes(t.id)} onChange={e=>setTrials(e.target.checked?[...trials,t.id]:trials.filter(id=>id!==t.id))}/>{t.label}</label>)}</div>
    <div className="team-grid" id="final-25">{names.map(name=>{const u=data.units[name],outgoing=data.baseline.find(original=>original!==name&&swaps[original]===name);return <article key={name} className="team-unit" data-person={name}>
      <div className="team-stripe" data-route={u.route} aria-hidden="true"/>
      {outgoing&&<p className="role-chip">{outgoing} → {name}</p>}
      <div className="person-heading"><img src={'/'+personPortrait(u.portrait,timeskip?'3':'1',name)} alt={name} className="portrait" loading="lazy"/><div><h2><button className="text-link" onClick={()=>setDoc(u.reviewUrl)}>{name}</button></h2><p>{u.role}</p>{u.favorite&&<span className="role-chip">희망 인물</span>}</div></div>
      <ClassPath classes={[u.class]} manifest={classes} onDoc={setDoc}/>
      <ReadMore><p>{u.classReason}</p></ReadMore>
      <dl className="team-fields"><dt>사용 가능 무기</dt><dd>{(u.usableWeapons||u.weapons).map(w=><span key={w.label}><img src={'/'+w.icon} alt=""/>{w.label}</span>)}</dd><dt>특기</dt><dd>{u.specialtyIcons.map(s=><span key={s.skill}><img src={'/'+s.icon} alt=""/>{s.skill}</span>)}</dd><dt>주요 무기·마법</dt><dd>{u.signatureWeapons.map(w=><div key={w.name}><img src={'/'+w.icon} alt=""/><strong>{w.name}</strong> · {w.rank}<ReadMore><Records value={{$prose:w.note.split(/(?<=[.!?。])\s+|(?<=[.!?。])(?=[가-힣])/u)}} disclose={false}/></ReadMore></div>)}</dd></dl>
      {!!u.growthGoal&&<p>선택 경유 · 배틀 마스터 → 도끼술 S 준비</p>}
      <Semantic nodes={data.white[name].tree} {...semanticProps}/>
      {outgoing&&<ReadMore><p>{data.proposal.roleTradeoffs[outgoing+'→'+name]||u.loss}</p></ReadMore>}
    </article>;})}</div>
    <section className="team-reference"><div className="scenario-tabs" role="group" aria-label="팀 참고 정보">{[['spells','백마법'],['routes','루트 편성'],['details','비교·근거']].map(([id,label])=><Button key={id} variant={tab===id?'default':'secondary'} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</Button>)}</div>
      {tab==='routes'?<><div className="filters"><select aria-label="편성 루트" value={route} onChange={e=>setRoute(e.target.value)}>{Object.entries(routeNames).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><select aria-label="편성 부" value={part} onChange={e=>setPart(e.target.value)}>{['1','2','3'].map(p=><option key={p} value={p}>{p}부</option>)}</select><label className="check-control"><input type="checkbox" checked={changes} onChange={e=>setChanges(e.target.checked)}/> 변경 인물만</label><Link className="button button-secondary" href={`/${part==='3'?'part3':route}/${part}/`}>이 편성의 공략</Link></div><div id="route-comparison"><Semantic nodes={routeTeam.intro.tree} {...semanticProps} part={part}/><Semantic nodes={routeTeam.parts[part]?.tree||[]} {...semanticProps} part={part} changesOnly={changes}/></div></>:<Semantic nodes={data.sections[tab==='details'?'details':'spells'].tree} {...semanticProps}/>}
    </section>
    <Button variant="secondary" onClick={()=>setReferences(!references)}><BookOpen size={22}/> 전체 참고 문서</Button>{references&&<DocList docs={docs} onOpen={setDoc}/>}
    <DocumentSheet docs={docs} current={doc} onOpen={setDoc} onClose={()=>setDoc(null)} route="all"/>
  </main>;
}
