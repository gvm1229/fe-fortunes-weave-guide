'use client';
import Link from 'next/link';
import { Progress } from './progress';
import { ArrowRight } from 'lucide-react';
import { ThemeSwitch } from './theme';
import type { Group, Route } from '@/lib/content';
import { useChecks } from './checks';
import { checked } from '@/lib/check-state';
import { lordFiles, lordPortrait } from '@/lib/portraits';
const playOrder:Record<string,string>={theodora:'1st',leda:'2nd',dietrich:'3rd',kai:'4th'};
export function Home({routes}:{routes:{id:Route;label:string;parts:{part:string;groups:Group[]}[]}[]}){
  const checks=useChecks();
  function progress(groups:Group[]){return {total:groups.reduce((n,g)=>n+g.actions.length,0),done:groups.reduce((n,g)=>n+g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length,0)};}
  const lords=['kai','dietrich','theodora','leda'].map(id=>routes.find(r=>r.id===id)!);
  const third=routes.find(r=>r.id==='part3')!,thirdProgress=progress(third.parts[0].groups);
  return <main className="home">
    <header className="home-top"><h1 className="brand">만자천홍 개인화 공략</h1><div className="home-actions"><Link className="button" href="/team/">최종 25명</Link><ThemeSwitch/></div></header>
    <div className="route-deck">{lords.map(r=>{
      const current=r.parts.find(p=>{const x=progress(p.groups);return x.done>0&&x.done<x.total;})||r.parts.find(p=>{const x=progress(p.groups);return x.done<x.total;})||r.parts.at(-1)!;
      return <Link className="route-card" key={r.id} data-route={r.id} href={`/${r.id}/${current.part}/`} aria-label={`${r.label} ${current.part}부 이어하기`}>
        <img className="route-emblem" src={`/assets/design/emblems/${lordFiles[r.id]}.webp`} alt=""/>
        <img className="lord-portrait" src={lordPortrait(r.id,'1',true)} alt={r.label}/>
        <span className="route-order">루트 진행 순서: {playOrder[r.id]}</span>
        <div className="route-card-content"><h2>{r.label}</h2>{r.parts.map(p=>{const x=progress(p.groups);return <div className="route-progress" key={p.part}><span>{p.part}부</span><Progress value={x.done} max={x.total} label={`${r.label} ${p.part}부 진행률`}/><span>{x.done}/{x.total}</span></div>;})}<span className="button button-accent">이어하기</span></div>
      </Link>;
    })}</div>
    <Link className="third-band" data-route="part3" href="/part3/3/" aria-label="3부 이어하기"><div className="lord-faces">{lords.map(r=><img key={r.id} src={`/assets/portraits/post-timeskip/large/${lordFiles[r.id]}.png`} alt={r.label}/>)}</div><div className="third-progress"><div className="third-heading"><strong>3부</strong><span>{thirdProgress.done}/{thirdProgress.total}</span></div><Progress value={thirdProgress.done} max={thirdProgress.total} label="3부 진행률"/></div><ArrowRight size={28}/></Link>
  </main>;
}
