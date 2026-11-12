'use client';
import Link from 'next/link';
import { ArrowUpRight, Shield, UsersRound } from 'lucide-react';
import { ThemeSwitch } from './theme';
import type { Group, Route } from '@/lib/content';
import { useChecks } from './checks';
import { checked } from '@/lib/check-state';
export function Home({ routes }: {routes:{id:Route;label:string;description:string;parts:{part:string;groups:Group[]}[]}[]}) {
  const checks=useChecks();
  function progress(groups:Group[]){const total=groups.reduce((n,g)=>n+g.actions.length,0);const done=groups.reduce((n,g)=>n+g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length,0);return `${done} / ${total} 완료`;}
  return <main className="home"><header className="home-top"><span className="brand"><Shield size={28}/> 만자천홍 · 나의 공략</span><ThemeSwitch/></header><div className="home-intro"><h1>오늘의 여정을<br/>이어가세요</h1><p>지나온 일은 기록하고, 지금 할 일에 집중하세요.</p></div><div className="route-list">{routes.map(r=><section key={r.id} data-route={r.id}><div className="route-title"><Shield size={32}/><h2>{r.label}</h2><p>{r.description}</p></div><div className="route-parts">{r.parts.map(p=><Link key={p.part} href={`/${r.id}/${p.part}/`}><span>{r.id==='part3'?'공통 여정':`${p.part}부`}</span><span>{progress(p.groups)}</span><ArrowUpRight size={22}/></Link>)}</div></section>)}</div><Link className="team-link" href="/team/"><UsersRound size={24}/> 최종 25명과 루트별 비교</Link><p className="muted">하드·캐주얼 기준 · 체크 기록은 이 브라우저에 보관됩니다.</p></main>;
}
