'use client';
import type { Secondary } from '@/lib/secondary';
import { Records, Semantic } from './records';
export function Preparation({data,route,part,onDoc}:{data:Secondary;route:string;part:string;onDoc:(url:string)=>void}){
  return <><h2>가호와 주간 봉사</h2><Records value={data.service}/><details className="reference-disclosure"><summary>축복·보존·시험의 공통 기준</summary><Semantic nodes={data.prepTree} route={route} part={part} onDoc={onDoc}/><Semantic nodes={data.exam} route={route} part={part} onDoc={onDoc}/></details><details className="reference-disclosure"><summary>이 구간의 준비와 운영 안내</summary>{data.blocks.map((b,i)=><Semantic key={i} nodes={b.tree} route={route} part={part} onDoc={onDoc}/>)}</details></>;
}
export function Materials({data,route,part,onDoc}:{data:Secondary;route:string;part:string;onDoc:(url:string)=>void}){
  return <><h2>재료와 위치</h2>{part==='1'?<Semantic nodes={data.materialsTree} route={route} part={part} onDoc={onDoc}/>:<p>이 부의 입수·귀환·기한은 지금 할 일의 본문 체크를 따르세요. 1부 영입 재료는 1부 화면에서 확인할 수 있습니다.</p>}<h2>구매 계획</h2><Records value={data.purchases}/><details><summary>구매 판단 기준</summary><Records value={data.rules}/></details><h2>장별 골드</h2><p>이미 끝낸 항목의 예산은 빼세요. 고정 진입 조건이나 실제 잔액이 아닙니다.</p><Records value={data.gold}/></>;
}
