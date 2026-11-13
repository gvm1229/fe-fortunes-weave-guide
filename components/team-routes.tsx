'use client';
import Link from 'next/link';
import type { teamData } from '@/lib/team';
import type { ClassInfo } from './people';
import { GameText } from './game-text';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { usePreference } from './preferences';
import { withViewTransition } from '@/lib/view-transition';
const routeNames:Record<string,string>={theodora:'세오도라',leda:'레다',dietrich:'디트리히',kai:'카이'};
type Data=ReturnType<typeof teamData>;
/** 루트 편성 탭: 원본 조각을 카드 하나에 얼굴 하나로 다시 배치한다. 글 속 인물·병종 그림은 넣지 않는다. */
export function TeamRoutes({data,classes,onDoc,onSpell}:{data:Data;classes:Record<string,ClassInfo>;onDoc:(url:string)=>void;onSpell:(id:string)=>void}){
  const [route,setRoute]=usePreference<string>('team-route','theodora');
  const [savedPart,setPart]=usePreference<string>('team-part','1');
  const part=savedPart==='2'?'2':'1';
  const team=data.routeParts[route]||data.routeParts.theodora,current=team.parts[part];
  const allNames=new Set([...Object.keys(data.units),...current?.units.map(u=>u.name)||[],...team.intro.priority,...Object.keys(classes)]);
  return <section className="team-routes" aria-labelledby="route-team-title">
    <div className="team-controls"><ToggleGroup type="single" value={route} onValueChange={v=>v&&withViewTransition(()=>setRoute(v))} aria-label="편성 루트">{Object.entries(routeNames).map(([id,label])=><ToggleGroupItem key={id} value={id}>{label}</ToggleGroupItem>)}</ToggleGroup><ToggleGroup type="single" value={part} onValueChange={v=>v&&withViewTransition(()=>setPart(v))} aria-label="편성 부">{['1','2'].map(p=><ToggleGroupItem key={p} value={p}>{p}부</ToggleGroupItem>)}</ToggleGroup><Link className="button button-primary" href={`/${route}/${part}/`}>이 편성의 공략</Link></div>
    <Card className="route-intro"><h2 id="route-team-title">{routeNames[route]} {part}부 우선 전력{current&&<Badge>{current.count}</Badge>}</h2>{current?.note&&<p className="muted">{current.note}</p>}<ul className="priority-chips" aria-label="우선 인물">{team.intro.priority.map(name=>{const u=data.units[name];return <li key={name}>{u?<img src={'/'+u.portrait} alt="" loading="lazy"/>:null}{name}</li>;})}</ul><ul className="route-notes">{team.intro.notes.map(n=><li key={n}>{n}</li>)}</ul></Card>
    <div className="route-unit-grid">{current?.units.map(u=><Card className="route-unit" key={u.name} data-person={u.name}>
      <div className="route-unit-head"><img className="route-unit-face" src={'/'+u.portrait} alt="" loading="lazy"/><div><h3>{u.name}</h3><p><GameText text={u.reason} skip={allNames} withSkills/></p></div></div>
      <dl className="detail-pairs">
        <div><dt>병종</dt><dd className="route-unit-class">{classes[u.className]&&<img src={'/'+classes[u.className].file} alt="" loading="lazy"/>}{u.classSlug?<button className="text-link" onClick={()=>onDoc(`notes/classes/${u.classSlug}.md`)}>{u.className}</button>:<strong>{u.className}</strong>}<Badge>{u.classTier}</Badge></dd></div>
        {u.weapons.length>0&&<div><dt>병종 무기</dt><dd className="route-weapons">{u.weapons.map(w=><span key={w.skill}><img src={'/'+w.icon} alt="" loading="lazy"/>{w.skill}</span>)}</dd></div>}
        {u.white&&<div><dt>{u.white.allowed?u.white.title||'핵심 백마술':'백마술 · 병종 변경 시'}</dt><dd>{u.white.spells.length>0&&<div className="spell-chips">{u.white.spells.map(s=><button key={s.id} className="button" title={s.title} onClick={()=>onSpell(s.id)}>{s.name}<Badge variant="strong">{s.rank}</Badge></button>)}</div>}{u.white.notes.map(n=><p key={n} className="muted">{n}</p>)}</dd></div>}
        {u.goal.length>0&&<div><dt>목표</dt><dd>{u.goal.map(g=><p key={g}><GameText text={g} skip={allNames} withSkills/></p>)}</dd></div>}
      </dl>
    </Card>)}</div>
  </section>;
}
