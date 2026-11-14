'use client';
// 내 상태(2026-11-15 사용자 요청): 축복 단계·가호 레벨·파편·골드를 이 브라우저에 저장하고 체크와 같은 JSON으로 내보낸다.
// 사이트 자료에는 개인 값을 넣지 않는다. 값이 없으면 안내 요약도 보이지 않는다.
import { useState } from 'react';
import { Minus, Plus, UserRound } from 'lucide-react';
import { useChecks } from './checks';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { boons, gods, hasStatus, remainingSteps, groupSteps, conditionalSteps } from '@/lib/status';
import godManifest from '@/assets/gods/manifest.json';

function Stepper({label,value,max,onChange}:{label:string;value:number;max:number;onChange:(v:number)=>void}){
  return <div className="stepper" role="group" aria-label={label}>
    <button type="button" className="button button-outline" aria-label={`${label} 낮추기`} aria-disabled={value<=0} onClick={()=>{if(value>0)onChange(value-1);}}><Minus size={20}/></button>
    <output aria-live="polite">{value}<span className="muted">/{max}</span></output>
    <button type="button" className="button button-outline" aria-label={`${label} 올리기`} aria-disabled={value>=max} onClick={()=>{if(value<max)onChange(value+1);}}><Plus size={20}/></button>
  </div>;
}
function Amount({label,unit,value,onChange}:{label:string;unit:string;value?:number;onChange:(v:number|undefined)=>void}){
  return <label className="status-amount"><span>{label}</span><span className="status-amount-input"><input type="number" inputMode="numeric" min={0} step={1} value={value??''} placeholder="미입력" onChange={e=>{const t=e.target.value.trim();if(t===''){onChange(undefined);return;}const n=Math.floor(Number(t));if(Number.isFinite(n)&&n>=0)onChange(n);}}/><span className="status-unit">{unit}</span></span></label>;
}
/** menu: 폰(600px 미만)에서는 머리 막대가 한 줄에 다 들어가지 않아 기록 관리 메뉴 안의 항목으로 연다. */
export function StatusButton({route,menu=false}:{route:string;menu?:boolean}){
  const [open,setOpen]=useState(false),checks=useChecks(),s=checks.data.status;
  const portraits=godManifest.portraits as Record<string,{file:string}>;
  return <Sheet open={open} onOpenChange={setOpen}>
    {menu?<Button variant="secondary" className="status-menu-item" onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");setOpen(true);}} disabled={!checks.ready}><UserRound size={20} aria-hidden="true"/> 내 상태</Button>:<Button variant="secondary" className="status-button" onClick={()=>setOpen(true)} disabled={!checks.ready} aria-label="내 상태"><UserRound size={20} aria-hidden="true"/><span className="status-label">내 상태</span></Button>}
    <SheetContent themeRoute={route} onCloseAutoFocus={menu?e=>{e.preventDefault();document.querySelector<HTMLElement>('.route-head .backup-menu summary')?.focus();}:undefined}><div className="sheet-heading"><SheetTitle>내 상태</SheetTitle></div><div className="sheet-scroll status-sheet">
      <p className="muted">이 브라우저에만 저장됩니다. 기록 관리 → 내보내기 파일에 체크와 함께 들어갑니다. 가진 축복 단계는 해당 구매 체크를 자동으로 완료합니다.</p>
      <section><h3>파편·골드</h3><div className="status-amounts">
        <Amount label="인과의 파편" unit="개" value={s?.shards} onChange={v=>checks.setStatus({shards:v})}/>
        <Amount label="골드" unit="G" value={s?.gold} onChange={v=>checks.setStatus({gold:v})}/>
      </div></section>
      <section><h3>가호</h3><ul className="status-list">{gods.map(g=>{const v=s?.gods[g.name]||0;return <li key={g.name}><span className="status-name">{portraits[g.name]&&<img src={'/'+portraits[g.name].file} alt="" width={32} height={32}/>}{g.name}</span><Stepper label={`${g.name} 가호 레벨`} value={v} max={g.max} onChange={n=>checks.setStatus({gods:{...s?.gods,[g.name]:n}})}/></li>;})}</ul></section>
      <section><h3>구세의 축복</h3><ul className="status-list">{boons.map(b=>{const v=s?.boons[b.id]||0,next=b.tiers[v];return <li key={b.id}><span className="status-name"><strong>{b.name}</strong><small className="muted">{v>0?`현재 ${b.tiers[v-1].effect}`:'없음'}{next?` · 다음 ${next.effect} ${next.price.toLocaleString()}파편`:' · 최대'}</small></span><Stepper label={`${b.name} 단계`} value={v} max={b.tiers.length} onChange={n=>checks.setStatus({boons:{...s?.boons,[b.id]:n}})}/></li>;})}</ul></section>
    </div></SheetContent>
  </Sheet>;
}
/** 축복 구매 묶음 위 요약: 이 묶음에서 아직 없는 추천 축복과 파편 합계, 보유 파편과의 차이. 내 상태가 비어 있으면 숨긴다. */
export function BoonSummary({ids}:{ids:string[]}){
  const checks=useChecks(),s=checks.data.status;
  if(!hasStatus(s)||!groupSteps(ids).length)return null;
  const {left,cost}=remainingSteps(s,groupSteps(ids)),diff=s?.shards===undefined?null:s.shards-cost;
  return <p className="status-summary" role="status">{left.length?<>남은 추천 축복 {left.length}개{left.some(id=>conditionalSteps.has(id))?'(조건부 포함)':''} · {cost.toLocaleString()}파편</>:<>이 묶음의 추천 축복을 모두 가졌습니다</>}{diff!==null&&left.length>0&&<> · 보유 {s!.shards!.toLocaleString()} → {diff>=0?`${diff.toLocaleString()} 남음`:`${(-diff).toLocaleString()} 부족`}</>}</p>;
}
