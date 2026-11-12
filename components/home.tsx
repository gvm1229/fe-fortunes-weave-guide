'use client';
import Link from 'next/link';
import { ThemeSwitch } from './theme';
import type { Group, Route } from '@/lib/content';
import { useChecks } from './checks';
import { checked } from '@/lib/check-state';
const lordFiles:Record<string,string>={kai:'cai',theodora:'theodora',dietrich:'dietrich',leda:'leda'};
export function Home({routes}:{routes:{id:Route;label:string;parts:{part:string;groups:Group[]}[]}[]}){
  const checks=useChecks();
  function progress(groups:Group[]){return {total:groups.reduce((n,g)=>n+g.actions.length,0),done:groups.reduce((n,g)=>n+g.actions.filter(a=>checked(a,g.id,checks.data.checks)).length,0)};}
  const lords=['kai','theodora','dietrich','leda'].map(id=>routes.find(r=>r.id===id)!);
  const third=routes.find(r=>r.id==='part3')!,thirdProgress=progress(third.parts[0].groups);
  return <main className="home">
    <header className="home-top"><h1 className="brand">만자천홍 개인화 공략</h1><div className="home-actions"><Link className="button" href="/team/">최종 25명</Link><ThemeSwitch/></div></header>
    <div className="route-deck">{lords.map(r=>{
      const current=r.parts.find(p=>{const x=progress(p.groups);return x.done>0&&x.done<x.total;})||r.parts.find(p=>{const x=progress(p.groups);return x.done<x.total;})||r.parts.at(-1)!;
      return <Link className="route-card" key={r.id} data-route={r.id} href={`/${r.id}/${current.part}/`} aria-label={`${r.label} ${current.part}부 이어하기`}>
        <img className="route-emblem" src={`/assets/design/emblem-${lordFiles[r.id]}.webp`} alt=""/>
        <img className="lord-portrait" src={`/assets/portraits/post-timeskip/large/${lordFiles[r.id]}.png`} alt={r.label}/>
        <div className="route-card-content"><h2>{r.label}</h2>{r.parts.map(p=>{const x=progress(p.groups);return <div className="route-progress" key={p.part}><span>{p.part}부</span><progress value={x.done} max={x.total} aria-label={`${r.label} ${p.part}부 진행률`}/><span>{x.done}/{x.total}</span></div>;})}<span className="button button-accent">이어하기</span></div>
      </Link>;
    })}</div>
    <section className="third-band" data-route="part3"><div className="lord-faces">{lords.map(r=><img key={r.id} src={`/assets/portraits/post-timeskip/large/${lordFiles[r.id]}.png`} alt={r.label}/>)}</div><div className="third-progress"><span>{thirdProgress.done}/{thirdProgress.total}</span><progress value={thirdProgress.done} max={thirdProgress.total} aria-label="3부 진행률"/></div><Link className="button button-accent" href="/part3/3/">3부</Link></section>
  </main>;
}
