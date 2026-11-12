'use client';
import Link from 'next/link';
import { BookOpen, CheckSquare, CircleUserRound, Coins, HeartHandshake, House } from 'lucide-react';
import { ThemeSwitch } from './theme';
import { lordPortrait } from '@/lib/portraits';
export type View='tasks'|'people'|'prep'|'materials'|'docs';
export const views=[{id:'tasks',label:'할 일',icon:CheckSquare},{id:'people',label:'인물',icon:CircleUserRound},{id:'prep',label:'준비',icon:HeartHandshake},{id:'materials',label:'재료와 구매',icon:Coins},{id:'docs',label:'참고 문서',icon:BookOpen}] as const;
const mobileLabels={tasks:'할 일',people:'인물',prep:'준비',materials:'재료',docs:'문서'};
export function Shell({route,label,part,view,onView,children}:{route:string;label:string;part:string;view:View;onView:(view:View)=>void;children:React.ReactNode}){
  const src=lordPortrait(route,part);
  return <div className="app-shell" data-route={route}>
    <aside className="sidebar"><div className="rail-lord"><img src={src} alt=""/><p className="route-name">{label}</p></div>{route!=='part3'&&<div className="part-links"><Link href={`/${route}/1/`} aria-current={part==='1'?'page':undefined}>1부</Link><Link href={`/${route}/2/`} aria-current={part==='2'?'page':undefined}>2부</Link></div>}
    <nav aria-label="공략 화면" className="view-nav">{views.map(v=><button key={v.id} aria-label={v.label} aria-current={view===v.id?'page':undefined} onClick={()=>{onView(v.id);window.scrollTo(0,0);}}><v.icon size={24}/><span className="nav-full">{v.label}</span><span className="nav-short">{mobileLabels[v.id]}</span></button>)}</nav><div className="sidebar-bottom"><ThemeSwitch/><Link className="button button-outline" href="/"><House size={20}/>첫 화면</Link></div></aside>
    <div className="workspace"><header className="mobile-header"><Link href="/" aria-label="첫 화면"><img src={src} alt=""/></Link><strong>{label}{route==='part3'?'':` ${part}부`}</strong>{route!=='part3'&&<Link className="button button-outline mobile-part" href={`/${route}/${part==='1'?'2':'1'}/`}>{part==='1'?'2':'1'}부</Link>}<ThemeSwitch/></header><main id="main-content">{children}</main></div>
  </div>;
}
