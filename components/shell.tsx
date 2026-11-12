'use client';
import Link from 'next/link';
import { BookOpen, CheckSquare, CircleUserRound, Coins, HeartHandshake, Shield, UsersRound, ArrowLeft } from 'lucide-react';
import { ThemeSwitch } from './theme';
export type View = 'tasks'|'people'|'prep'|'materials'|'docs';
export const views = [{id:'tasks',label:'지금 할 일',icon:CheckSquare},{id:'people',label:'인물',icon:CircleUserRound},{id:'prep',label:'준비',icon:HeartHandshake},{id:'materials',label:'재료·구매',icon:Coins},{id:'docs',label:'참고 문서',icon:BookOpen}] as const;
const mobileLabels={tasks:'할 일',people:'인물',prep:'준비',materials:'구매',docs:'문서'};
export function Shell({ route, label, part, view, onView, children }: {route:string;label:string;part:string;view:View;onView:(view:View)=>void;children:React.ReactNode}) {
  return <div className="app-shell" data-route={route}>
    <aside className="sidebar"><Link href="/" className="brand"><Shield size={28}/><span>만자천홍<br/>나의 공략</span></Link><Link href="/" className="back-link"><ArrowLeft size={20}/> 루트 선택</Link><p className="route-name">{label}{route==='part3'?'':` ${part}부`}</p>{route!=='part3'&&<div className="part-links"><Link href={`/${route}/1/`} aria-current={part==='1'?'page':undefined}>1부</Link><Link href={`/${route}/2/`} aria-current={part==='2'?'page':undefined}>2부</Link></div>}
    <nav aria-label="공략 화면" className="view-nav">{views.map(v=><button key={v.id} aria-label={v.label} aria-current={view===v.id?'page':undefined} onClick={()=>onView(v.id)}><v.icon size={24}/><span className="nav-full">{v.label}</span><span className="nav-short">{mobileLabels[v.id]}</span></button>)}</nav><Link href="/team/" className="team-link"><UsersRound size={22}/> 최종 팀·비교</Link><ThemeSwitch/></aside>
    <div className="workspace"><header className="mobile-header"><Link href="/" aria-label="루트 선택으로"><Shield size={24}/></Link><strong>{label}{route==='part3'?'':` ${part}부`}</strong><ThemeSwitch/></header><main id="main-content">{children}</main></div>
  </div>;
}
