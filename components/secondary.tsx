'use client';
import { GameIcon } from './game-text';
import type { Secondary } from '@/lib/secondary';
import { Records, Semantic } from './records';
import { MaterialChip, KoBadge, YLink } from './yuphas';
import Link from 'next/link';
import { itemUrl, mapUrl } from '@/lib/yuphas';
import type { PrepFace } from '@/lib/prep';
import { Button } from './ui/button';
import { CalendarDays, Check, Info, MapPin, MessagesSquare, ScrollText, Users } from 'lucide-react';
import { ReadMore } from './read-more';
import { useChecks } from './checks';
type GoldChapter={chapter:number;target:number;afterScheduledSpend:number;notes:unknown;$notes?:unknown;$sharedNotes?:unknown;$goldRows:{label:unknown;amount:number;note:unknown;unit?:number;count?:number;optional:boolean;conditionTags:string[]}[]};
export function GoldTables({value,notice}:{value:unknown;notice?:React.ReactNode}){
  const gold=useChecks().data.status?.gold;
  if(!Array.isArray(value))return <Records value={value}/>;
  return <div className="gold-tables">{/* 내 상태의 보유 골드(2026-11-15). 지난 장의 목표와 비교하지 않도록 장마다 붙이지 않고 한 번만 보인다. */}{gold!==undefined&&<p className="status-summary" role="status">내 상태의 보유 골드 {gold.toLocaleString()}G · 현재 장의 목표와 비교하세요</p>}{(value as GoldChapter[]).map((chapter,i)=><section key={i}><h3>{chapter.chapter}장 · 목표 <span className="game-badge" data-kind="gold"><GameIcon kind="gold"/><b className="badge-value">{chapter.target.toLocaleString()}G</b></span></h3><table className="gold-table"><thead><tr><th>용도</th><th>금액</th><th>조건</th></tr></thead><tbody>{chapter.$goldRows.map((row,j)=><tr key={j}><td><ReadMore><Records value={row.label} disclose={false}/>{row.unit!==undefined&&<div>{row.unit.toLocaleString()}G × {row.count}</div>}</ReadMore></td><td className="amount">{row.optional?'+':''}{row.amount.toLocaleString()}G</td><td><ReadMore>{row.optional&&<span className="condition-chip">해당할 때만 추가</span>}{row.conditionTags.map(tag=><span className="condition-chip" key={tag}>{tag}</span>)}<Records value={row.note} disclose={false}/></ReadMore></td></tr>)}<tr><th scope="row">지출 뒤 여유</th><td className="amount">{chapter.afterScheduledSpend.toLocaleString()}G</td><td/></tr></tbody>{i===0&&<tfoot><tr><td colSpan={3}><aside className="info-notice"><Info size={20}/><ReadMore>{notice}<Records value={chapter.$sharedNotes}/></ReadMore></aside></td></tr></tfoot>}</table><ReadMore><Records value={chapter.$notes} disclose={false}/></ReadMore></section>)}</div>;
}
/** 준비 탭 작은 글: 한 문단에 두 문장까지(문단 규칙, browser-check "2문장 문단"). */
function Note({text}:{text:string}){const s=text.split(/(?<=[.!?])\s+/).filter(Boolean),out:string[]=[];for(let i=0;i<s.length;i+=2)out.push(s.slice(i,i+2).join(' '));return <>{out.map((t,i)=><p key={i} className="prep-note">{t}</p>)}</>;}
/** 준비 탭 얼굴: 이 루트 인물이면 누르면 인물 서랍(U50과 같은 동작), 아니면 그림과 이름만. */
function Face({f,people,onPerson}:{f:PrepFace;people:string[];onPerson:(name:string)=>void}){const img=<img src={f.portrait} alt="" width={48} height={48} loading="lazy"/>;return people.includes(f.name)?<button type="button" className="prep-face portrait-button" aria-label={`${f.name} 인물 보기`} onClick={()=>onPerson(f.name)}>{img}<span>{f.name}</span></button>:<span className="prep-face">{img}<span>{f.name}</span></span>;}
/** 준비 탭(2026-11-27 사용자 결정 Q2, U69): 그림 다섯 묶음. 표·문서 나무 없음. 자료는 서버의 lib/prep.ts. */
export function Preparation({data,route,onDoc,onPerson,people}:{data:Secondary;route:string;part?:string;onDoc:(url:string)=>void;onPerson:(name:string)=>void;people:string[]}){
  const p=data.panels,status=useChecks().data.status,levels=status&&Object.keys(status.gods).length?status.gods:null;
  const next=levels?p.chain.findIndex(c=>(levels[c.god]||0)<c.level):-1;
  const face=(f:PrepFace)=><Face key={f.name} f={f} people={people} onPerson={onPerson}/>;
  return <div className="prep-content">
    <section className="prep-panel" data-panel="gods"><h2 className="y-section-title">가호와 주간 봉사</h2>
      <ol className="prep-chain" aria-label="봉사 순서(누적 목표)">{p.chain.map((c,i)=>{const done=!!levels&&(levels[c.god]||0)>=c.level;return <li key={i} className="prep-chip" data-done={done||undefined} data-next={i===next||undefined} title={c.effect}>{done&&<Check size={14} aria-label="달성"/>}<span>{c.god}</span><b>{c.level}</b>{i===next&&<small>다음</small>}</li>;})}</ol>
      {levels&&next<0&&<p className="status-summary" role="status">봉사 순서의 목표를 모두 달성했습니다</p>}
      <ul className="god-tiles" aria-label="신별 가호">{p.gods.map(g=>{const lv=levels?levels[g.name]||0:null;return <li key={g.name} className="god-tile"><img src={g.file} alt="" loading="lazy"/><strong>{g.name}</strong>{lv===null?<span className="god-target">목표 {g.target}</span>:<span className="god-dots" role="img" aria-label={`가호 ${lv} / ${g.max}`}>{Array.from({length:g.max},(_,k)=><i key={k} data-on={k<lv||undefined}/>)}</span>}</li>;})}</ul>
      {(p.queue||p.boons.length>0)&&<div className="prep-line">{p.queue&&<span>이번 루트: {p.queue}</span>}{p.boons.map(b=><KoBadge key={b.name} ko={b.name.replace(/(\d+%)$/,' $1')} kind="renown" value={b.price.toLocaleString()}/>)}</div>}
      {p.end&&<Note text={p.end}/>}
    </section>
    <section className="prep-panel" data-panel="meals"><h2 className="y-section-title">{p.meals.kind==='weekly'?'이번 주 식사':p.meals.title}</h2>
      {p.meals.kind==='weekly'?<>{p.meals.rows.map(r=><div key={r.label} className="prep-row"><h3>{r.label}</h3><div className="prep-faces">{r.people.map(face)}</div><Note text={r.note}/></div>)}
        {p.meals.waiting.length>0&&<div className="prep-row"><h3>영입 대기</h3><div className="prep-faces">{p.meals.waiting.map(face)}</div></div>}
        {p.meals.next&&<div className="prep-row"><h3>다음 루트 먼저 · {p.meals.next.lord}</h3><div className="prep-faces">{face(p.meals.next.target)}</div><Note text={p.meals.next.text}/></div>}</>
      :<ul className="prep-list">{p.meals.lines.map(l=><li key={l}>{l}</li>)}</ul>}
    </section>
    <section className="prep-panel" data-panel="exams"><h2 className="y-section-title">시험 단계</h2>
      <ul className="exam-tiles">{p.exams.map(e=><li key={e.ko} className="exam-tile"><ScrollText size={28} aria-hidden="true"/><div><KoBadge ko={e.ko} kind="item"/><span className="exam-req">Lv {e.level}{e.renown!=null&&<> · 명성 {e.renown}</>}{e.note&&<> · {e.note}</>}</span>{e.en&&e.slug&&<YLink en={e.en} href={itemUrl(e.slug)}/>}</div></li>)}</ul>
      <Button variant="secondary" onClick={()=>onDoc('notes/exam.md')}>시험 안내</Button>
    </section>
    <section className="prep-panel" data-panel="before"><h2 className="y-section-title">장을 넘기기 전</h2>
      <ul className="prep-before">{p.before.map((l,i)=>{const Icon=[ScrollText,MessagesSquare,CalendarDays][i]||ScrollText;return <li key={i}><Icon size={18} aria-hidden="true"/><span>{l}</span></li>;})}</ul>
    </section>
    <section className="prep-panel" data-panel="links"><h2 className="y-section-title">바로가기</h2>
      <div className="prep-links"><YLink en="World Map" href={mapUrl(route)} icon={<MapPin size={18} aria-hidden="true"/>}/><Link className="button button-secondary" href="/team/"><Users size={18} aria-hidden="true"/>팀 25인</Link></div>
    </section>
  </div>;
}
export function Materials({data,route,part}:{data:Secondary;route:string;part:string;onDoc?:(url:string)=>void}){
  return <><h2>재료와 위치</h2>{part==='1'?<><div className="material-grid">{data.materials.map(m=><MaterialChip key={m.id} name={m.name} quantity={m.quantity} people={(m.info as {people?:string[]}|undefined)?.people} route={route}/>)}</div></>:<p>이 부의 입수·귀환·기한은 할 일의 본문 체크를 따르세요. 1부 영입 재료는 1부 화면에서 확인할 수 있습니다.</p>}<h2>구매 계획</h2><Records value={data.purchases}/><details><summary>구매 판단 기준</summary><Records value={data.rules}/></details><h2>장별 골드</h2><p className="info-notice"><Info size={20}/>이미 끝낸 항목의 예산은 빼세요.</p><GoldTables value={data.gold} notice={<Semantic nodes={data.notices} route={route} part={part}/>}/></>;
}
