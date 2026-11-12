'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import type { teamData } from '@/lib/team';
import type { ReferenceDoc } from '@/lib/documents';
import type { ClassInfo } from './people';
import { ClassPath } from './people';
import { Records } from './records';
import { ThemeSwitch } from './theme';
import { DocList, DocumentSheet } from './documents';
import { Button } from './ui/button';
export function Team({data,classes,docs}:{data:ReturnType<typeof teamData>;classes:Record<string,ClassInfo>;docs:ReferenceDoc[]}){
  const [scenario,setScenario]=useState('current');const [doc,setDoc]=useState<string|null>(null);const [references,setReferences]=useState(false);
  const chosen=data.scenarios.find(s=>s.id===scenario)||data.scenarios[0];
  return <main className="team-page"><header className="home-top"><Link href="/" className="back-link"><ArrowLeft size={22}/> 루트 선택</Link><ThemeSwitch/></header><div className="page-heading"><h1>최종 25명</h1><p>목표 편성입니다. 실제 영입·보유·습득 완료를 뜻하지 않습니다.</p></div><div className="scenario-tabs" role="group" aria-label="팀 편성안">{data.scenarios.map(s=><Button key={s.id} variant={s.id===scenario?'default':'outline'} onClick={()=>setScenario(s.id)} aria-pressed={s.id===scenario}>{s.title}</Button>)}</div><p>{chosen.description}</p><div className="team-grid">{data.baseline.map(original=>{const name=chosen.swaps[original]||original;const u=data.units[name];return <article key={original} className="team-unit"><div className="person-heading">{u.portrait&&<img src={`/${u.portrait}`} alt={name} className="portrait" loading="lazy"/>}<div><h2>{name}</h2><p>{u.role}</p></div></div><ClassPath classes={[u.class]} manifest={classes}/><dl className="team-fields"><dt>사용 가능 무기</dt><dd>{u.weapons.map(w=><span key={w.label}>{w.icon&&<img src={`/${w.icon}`} alt=""/>}{w.label}</span>)}</dd><dt>주요 무기·마법</dt><dd>{u.signature.map(w=><div key={w.name}>{w.icon&&<img src={`/${w.icon}`} alt=""/>}<strong>{w.name}</strong> · {w.rank}</div>)}</dd></dl><details><summary>루트별 경유·백마법</summary><p>{u.reason}</p>{u.signature.map(w=><p key={w.name}><strong>{w.name}</strong> - {w.note}</p>)}<Records value={u.paths.map(p=>({...p,route:undefined,기준판:{theodora:'세오도라',leda:'레다',dietrich:'디트리히',kai:'카이'}[p.route]||p.route}))}/><Records value={u.white}/></details></article>;})}</div><details className="reference-disclosure"><summary>편성 비교와 백마법 효과</summary><Records value={data.comparisons}/><Records value={data.selection}/><Records value={data.spells}/></details><Button variant="outline" onClick={()=>setReferences(!references)}><BookOpen size={22}/> 전체 참고 문서</Button>{references&&<DocList docs={docs} onOpen={setDoc}/>}<DocumentSheet docs={docs} current={doc} onOpen={setDoc} onClose={()=>setDoc(null)} route="all"/></main>;
}
