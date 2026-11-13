'use client';
import { characterReason } from '@/lib/character-summary';
import { GameText } from './game-text';
import type { Tree } from '@/lib/content';
import { Sheet,SheetContent,SheetTitle } from './ui/sheet';
import { useState, ViewTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, SlidersHorizontal } from 'lucide-react';
import type { teamData, TeamUnit } from '@/lib/team';
import type { ReferenceDoc } from '@/lib/documents';
import { personPortrait } from '@/lib/portraits';
import { type ClassInfo } from './people';
import { Records, Semantic } from './records';
import { ThemeSwitch } from './theme';
import { DocList, DocumentSheet } from './documents';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Toggle } from './ui/toggle';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { usePreference, useReadingMemory } from './preferences';
import { withViewTransition } from '@/lib/view-transition';
import { TeamRoutes } from './team-routes';

type Data=ReturnType<typeof teamData>;
const tabs=[['final','최종 25인'],['spells','백마술'],['routes','루트 편성'],['details','비교 근거']] as const;
function sectionTitle(n:Tree):string{if(typeof n==='string')return '';if(n.tag==='h2')return flat(n.children);for(const c of n.children){const t=sectionTitle(c);if(t)return t;}return '';}
function flat(nodes:Tree[]):string{return nodes.map(n=>typeof n==='string'?n:flat(n.children)).join('').trim();}
function withoutNav(n:Tree):Tree|null{if(typeof n==='string')return n;if(n.tag==='nav')return null;if(n.attrs.id==='roster'&&!n.children.some(c=>typeof c!=='string'||c.trim()))return null;return {...n,children:n.children.map(withoutNav).filter((c):c is Tree=>c!==null)};}

export function Team({data,classes,docs}:{data:Data;classes:Record<string,ClassInfo>;docs:ReferenceDoc[]}){
  const [scenario,setScenario]=usePreference<string>('team-scenario','current');
  const [trials,setTrials]=usePreference<string[]>('team-trials',[]);
  const [timeskip,setTimeskip]=usePreference<boolean>('team-timeskip',false);
  const [savedTab,setTab]=usePreference<string>('team-tab','final');
  const [openSections,setOpenSections]=usePreference<string[]>('team-detail-open',['comparison']);
  const [references,setReferences]=usePreference<boolean>('team-references',false);
  const [doc,setDoc]=useState<string|null>(null);
  const [spell,setSpell]=useState<string|null>(null);
  const [unit,setUnit]=useState<string|null>(null);
  const tab=tabs.some(([id])=>id===savedTab)?savedTab:'final';
  function findSpell(nodes:Tree[],id:string):Tree[]{for(const n of nodes){if(typeof n==='string')continue;if(n.attrs.id===id)return [n];const found=findSpell(n.children,id);if(found.length)return found;}return [];}
  const spellNodes=spell?findSpell(data.sections.spells.tree,spell):[];
  useReadingMemory(`team-${tab}`);
  const chosen=data.proposal.scenarios.find(s=>s.id===scenario)||data.proposal.scenarios[0];
  const swaps={...chosen.swaps};
  data.proposal.trials.filter(t=>trials.includes(t.id)).forEach(t=>{swaps[t.outgoing]=t.incoming;});
  // 정렬: 이전 공략(personalized-app/src/App.tsx:362)과 같은 displayGroupRank → displayPriority. 교체 인물도 자기 역할 자리로 간다.
  const names=data.baseline.map(name=>swaps[name]||name).sort((a,b)=>data.units[a].displayGroupRank-data.units[b].displayGroupRank||data.units[a].displayPriority-data.units[b].displayPriority);
  const outgoingOf=(name:string)=>data.baseline.find(original=>original!==name&&swaps[original]===name);
  const part=timeskip?'3':'1';
  const change=(update:()=>void)=>withViewTransition(update);
  const details=data.sections.details.tree.filter((n):n is Exclude<Tree,string>=>typeof n!=='string');
  function jump(id:string){
    if(id.startsWith('spell-')||id==='white-spell-book'){setUnit(null);setSpell(id);return;}
    if(id==='final-25'){change(()=>setTab('final'));return;}
    if(id==='route-comparison'){change(()=>setTab('routes'));return;}
    const owner=details.find(s=>JSON.stringify(s).includes(`"id":"${id}"`));
    change(()=>{setTab('details');if(owner?.attrs.id)setOpenSections(prev=>prev.includes(owner.attrs.id)?prev:[...prev,owner.attrs.id]);});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{const target=document.getElementById(id);if(target){target.closest('details')?.setAttribute('open','');target.scrollIntoView({block:'start'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}}));
  }
  const onDoc=(url:string)=>url.startsWith('#')?jump(decodeURIComponent(url.slice(1))):setDoc(url);
  const semanticProps={route:'all',part:'3',onDoc,onSpell:(id:string)=>jump('spell-'+id)};
  const female=names.filter(n=>data.units[n].female).length;
  const selected=unit?data.units[unit]:undefined,selectedOut=unit?outgoingOf(unit):undefined;
  const trialLabel=(label:string)=>label.split(' · ')[0];
  const options=<><ToggleGroup type="multiple" value={trials} onValueChange={v=>change(()=>setTrials(v))} aria-label="체험 교체">{data.proposal.trials.map(t=><ToggleGroupItem key={t.id} value={t.id} aria-label={t.label}>{trialLabel(t.label)}</ToggleGroupItem>)}</ToggleGroup><Toggle pressed={timeskip} onPressedChange={v=>change(()=>setTimeskip(v))}>시간 경과 후 초상화</Toggle></>;
  return <ViewTransition default="page-fade"><Tabs value={tab} onValueChange={v=>change(()=>setTab(v))} asChild><main className="team-page" data-tab={tab}>
    <header className="team-head">
      <div className="team-row">
        <Link href="/" className="back-link" aria-label="루트 선택으로"><ArrowLeft size={22}/><span className="team-back-label">루트 선택</span></Link>
        <h1 className="team-title">팀 구성</h1>
        <TabsList aria-label="팀 화면">{tabs.map(([id,label])=><TabsTrigger key={id} value={id}>{label}</TabsTrigger>)}</TabsList>
        <span className="team-count">25명 · 여성 {female}명</span>
        <ThemeSwitch/>
      </div>
      {tab==='final'&&<div className="team-row team-options">
        <ToggleGroup className="scenario-toggles" type="single" value={chosen.id} onValueChange={v=>v&&change(()=>setScenario(v))} aria-label="편성안">{data.proposal.scenarios.map(s=><ToggleGroupItem key={s.id} value={s.id}>{s.title}</ToggleGroupItem>)}</ToggleGroup>
        <div className="wide-options">{options}</div>
        <select className="scenario-select" aria-label="편성안" value={chosen.id} onChange={e=>{const v=e.target.value;change(()=>setScenario(v));}}>{data.proposal.scenarios.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
        <Popover><PopoverTrigger asChild><Button variant="secondary" className="narrow-options"><SlidersHorizontal size={20}/>옵션</Button></PopoverTrigger><PopoverContent className="team-popover"><p className="muted">25명 · 여성 {female}명</p>{options}</PopoverContent></Popover>
      </div>}
    </header>
    <TabsContent value="final" className="final-panel">
      <ol className="final-grid" id="final-25" aria-label="최종 25인">{names.map((name,i)=>{const u=data.units[name],out=outgoingOf(name);return <li key={name} className="unit-cell" style={{viewTransitionName:`team-unit-${i}`}}>
        <button type="button" className="unit-card" data-swapped={out?true:undefined} aria-label={out?`${name} · ${out} 대신`:name} onClick={()=>setUnit(name)}>
          <img className="unit-face" src={'/'+personPortrait(u.portrait,part,name)} alt="" loading="eager"/>
          <span className="unit-text"><strong className="unit-name">{name}</strong><span className="unit-class">{classes[u.class]&&<img src={'/'+classes[u.class].file} alt=""/>}{u.class}</span><span className="unit-role">{u.role}</span><span className="unit-weapons">{(u.usableWeapons||u.weapons).map(w=><Tooltip key={w.label}><TooltipTrigger asChild><img src={'/'+w.icon} alt={w.label.replace('백마법','백마술')} tabIndex={-1}/></TooltipTrigger><TooltipContent>{w.label.replace('백마법','백마술')}</TooltipContent></Tooltip>)}</span></span>
        </button>
        {out&&<span className="swap-badge" aria-hidden="true"><img src={'/'+personPortrait(data.units[out].portrait,part,out)} alt=""/><span>{out}</span><span>대신</span></span>}
      </li>;})}</ol>
    </TabsContent>
    <TabsContent value="spells" className="team-panel"><div className="spell-book"><Semantic nodes={data.sections.spells.tree} {...semanticProps}/></div></TabsContent>
    <TabsContent value="routes" className="team-panel"><TeamRoutes data={data} classes={classes} onDoc={onDoc} onSpell={id=>jump('spell-'+id)}/></TabsContent>
    <TabsContent value="details" className="team-panel">
      <Card className="chosen-plan"><h2>선택한 편성 · {chosen.title}</h2><p><GameText text={chosen.description} part={part}/></p>{Object.keys(swaps).length>0&&<ul className="swap-list">{Object.entries(swaps).map(([out,inn])=><li key={out}><strong>{out} → {inn}</strong><span className="muted"> · {data.units[inn]?.role}</span>{(data.proposal.roleTradeoffs[out+'→'+inn]||data.units[inn]?.loss)&&<p>{data.proposal.roleTradeoffs[out+'→'+inn]||data.units[inn]?.loss}</p>}</li>)}</ul>}{trials.length>0&&<p className="muted">켜진 체험: {data.proposal.trials.filter(t=>trials.includes(t.id)).map(t=>trialLabel(t.label)).join(' · ')}</p>}</Card>
      {details[0]&&<Card className="detail-section"><Semantic nodes={[withoutNav(details[0])!]} {...semanticProps}/></Card>}
      <Accordion type="multiple" className="detail-accordion" value={openSections} onValueChange={setOpenSections}>{details.slice(1).map((s,i)=>{const id=s.attrs.id||`section-${i}`,title=sectionTitle(s)||(id==='recruitment-pool'?'확보·예비':id);return <AccordionItem key={id} value={id}><AccordionTrigger>{title}</AccordionTrigger><AccordionContent><Semantic nodes={[withoutNav(s)!]} {...semanticProps}/></AccordionContent></AccordionItem>;})}</Accordion>
      <div className="reference-docs"><Button variant="secondary" onClick={()=>setReferences(!references)}><BookOpen size={22}/> 전체 참고 문서</Button>{references&&<DocList docs={docs} onOpen={setDoc}/>}</div>
    </TabsContent>
    <Sheet open={!!selected} onOpenChange={open=>{if(!open)setUnit(null);}}><SheetContent themeRoute="all">{selected&&unit&&<UnitSheet name={unit} u={selected} out={selectedOut} data={data} classes={classes} part={part} onDoc={setDoc} onSpell={id=>jump('spell-'+id)} semanticProps={semanticProps}/>}</SheetContent></Sheet>
    <Sheet open={spell!==null} onOpenChange={open=>{if(!open)setSpell(null);}}><SheetContent themeRoute="all"><div className="sheet-heading"><SheetTitle>백마술</SheetTitle></div><div className="sheet-scroll spell-panel"><Semantic nodes={spellNodes.length?spellNodes:data.sections.spells.tree} {...semanticProps}/></div></SheetContent></Sheet><DocumentSheet docs={docs} current={doc} onOpen={setDoc} onClose={()=>setDoc(null)} route="all"/>
  </main></Tabs></ViewTransition>;
}

function UnitSheet({name,u,out,data,classes,part,onDoc,semanticProps}:{name:string;u:TeamUnit;out?:string;data:Data;classes:Record<string,ClassInfo>;part:string;onDoc:(url:string)=>void;onSpell:(id:string)=>void;semanticProps:{route:string;part:string;onDoc:(url:string)=>void;onSpell:(id:string)=>void}}){
  const e=u.exam,skip=new Set([name]);
  return <><div className="sheet-heading"><SheetTitle>{name}</SheetTitle></div><div className="sheet-scroll unit-sheet">
    <div className="person-heading"><img className="portrait" src={'/'+personPortrait(u.portrait,part,name)} alt=""/><div><p className="unit-sheet-role">{u.role}</p><div className="tags">{u.favorite&&<Badge variant="strong">희망 인물</Badge>}{out&&<Badge variant="swap">{out} 대신</Badge>}</div></div></div>
    <dl className="detail-pairs">
      <div><dt>최종 병종</dt><dd className="route-unit-class">{classes[u.class]&&<img src={'/'+classes[u.class].file} alt=""/>}<button className="text-link" onClick={()=>onDoc(`notes/classes/${u.classSlug}.md`)}>{u.class}</button><Badge>{u.classTier}</Badge></dd></div>
      {e&&<div><dt>시험 조건</dt><dd><p>{[e.tier,`권장 Lv${e.level}`,/^\d/.test(e.renown)?`명성 ${e.renown}`:'',e.required&&`필수 ${e.required}`,e.choice&&`선택 ${e.choice}`].filter(Boolean).join(' · ')}</p>{e.unlock&&<p>해금 {e.unlock.replace(/^[\s·]+/,'')}</p>}</dd></div>}
      <div><dt>병과의 사용 가능 무기</dt><dd className="route-weapons">{(u.usableWeapons||u.weapons).map(w=><span key={w.label}><img src={'/'+w.icon} alt=""/>{w.label.replace('백마법','백마술')}</span>)}</dd></div>
      <div><dt>특기</dt><dd className="route-weapons">{u.specialtyIcons.map(s=><span key={s.skill}><img src={'/'+s.icon} alt=""/>{s.skill}</span>)}</dd></div>
      <div><dt>주요 무기·마법</dt><dd>{u.signatureWeapons.map(w=><div key={w.name} className="signature"><p><img className="game-skill" src={'/'+w.icon} alt=""/><strong>{w.name}</strong> · {w.rank}</p><Records value={{$prose:w.note.split(/(?<=[.!?。])\s+|(?<=[.!?。])(?=[가-힣])/u)}} disclose={false}/></div>)}</dd></div>
      {data.white[name]?.tree.length>0&&<div><dt>핵심 백마술</dt><dd><Semantic nodes={data.white[name].tree} {...semanticProps}/></dd></div>}
      {u.growthGoal&&<div><dt>경유</dt><dd>{u.growthGoal.via} → {u.growthGoal.skill} {u.growthGoal.rank} · {u.growthGoal.unlock}</dd></div>}
      <div><dt>역할 설명</dt><dd><GameText text={characterReason(name)||u.classReason} part={part} skip={skip}/></dd></div>
      {out&&<div><dt>교체 손익</dt><dd>{data.proposal.roleTradeoffs[out+'→'+name]||u.loss}</dd></div>}
    </dl>
    <Button variant="secondary" onClick={()=>onDoc(u.reviewUrl)}><BookOpen size={20}/> 특기 검토 문서</Button>
  </div></>;
}
