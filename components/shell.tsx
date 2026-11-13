'use client';
import Link from 'next/link';
import { BookOpen, CheckSquare, CircleUserRound, Coins, HeartHandshake, House } from 'lucide-react';
import { ThemeSwitch } from './theme';
import { lordPortrait } from '@/lib/portraits';
export type View='tasks'|'people'|'prep'|'materials'|'docs';
export const views=[{id:'tasks',label:'할 일',icon:CheckSquare},{id:'people',label:'인물',icon:CircleUserRound},{id:'prep',label:'준비',icon:HeartHandshake},{id:'materials',label:'재료와 구매',icon:Coins},{id:'docs',label:'참고 문서',icon:BookOpen}] as const;
const mobileLabels={tasks:'할 일',people:'인물',prep:'준비',materials:'재료',docs:'문서'};
export function Shell({route,label,part,view,onView,children}:{route:string;label:string;part:string;view:View;onView:(view:View)=>void;children:React.ReactNode}){
  return <div className="app-shell" data-route={route}>
    <header className="guide-topbar"><Link className="guide-home" href="/"><House size={22}/><span>첫 화면</span></Link><div className="guide-scope"><img src={lordPortrait(route,part)} alt=""/><strong>{label}</strong>{route!=='part3'&&<div className="part-links"><Link href={`/${route}/1/`} aria-current={part==='1'?'page':undefined}>1부</Link><Link href={`/${route}/2/`} aria-current={part==='2'?'page':undefined}>2부</Link></div>}</div><ThemeSwitch/></header>
    <div className="workspace"><nav aria-label="공략 화면" className="guide-navigation">{views.map(v=><button key={v.id} aria-label={v.label} aria-current={view===v.id?'page':undefined} onClick={()=>{onView(v.id);window.scrollTo(0,0);}}><v.icon size={22}/><span className="nav-full">{v.label}</span><span className="nav-short">{mobileLabels[v.id]}</span></button>)}</nav><main id="main-content">{children}</main></div>
  </div>;
}
