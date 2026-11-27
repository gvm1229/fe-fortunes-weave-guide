'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { validateChecks, validateStatus, sanitizeStatus, sanitizeBuilds, nextBuilds, type CheckState, type Status, type Build, type BuildRoute } from '@/lib/check-state';
import { limits, effectiveChecks, emptyStatus } from '@/lib/status';
const key='fortunes-weave-checklist-v1';
/** 인물 육성 기록(U72)은 다른 열쇠에 둔다. 육성 기록을 모르는 옛 코드가 떠 있는 탭이 체크 열쇠를 덮어써도 지워지지 않는다(2026-11-27 Fable 검토 21 지적 4).
 *  화면·내보내기·가져오기에서는 data.builds로 합쳐 다룬다. 예전에 체크 열쇠 안에 들어간 builds는 처음 읽을 때 이 열쇠로 옮긴다. */
const buildsKey='fortunes-weave-builds-v1';
// 사이트에는 체크 기록을 넣지 않는다(2026-11-14 사용자 지시). 처음 여는 브라우저는 빈 기록에서 시작하고, 기록은 그 브라우저 저장소와 JSON 백업에만 있다.
const empty:CheckState={schemaVersion:1,revision:0,checks:{}};
const initial={data:empty,ready:false,status:'체크 기록을 불러오는 중입니다.',error:false};
let snapshot=initial;
/** 저장소 값은 느슨하게 읽는다(모르는 축복은 버림. 육성 기록은 모양만 고치고 모르는 인물·병종도 보관). 가져오기 파일만 엄격하게 검사한다. */
function readStored(value:unknown):CheckState{const d=validateChecks(value);return d.status?{...d,status:sanitizeStatus(d.status,limits)}:d;}
const listeners=new Set<()=>void>();
function emit(){listeners.forEach(fn=>fn());}
function load(){
  if(snapshot.ready)return;
  try{const raw=localStorage.getItem(key);const {builds:legacy,...checksData}=raw===null?empty:readStored(JSON.parse(raw));
    const rawBuilds=localStorage.getItem(buildsKey);let builds=rawBuilds===null?undefined:sanitizeBuilds(JSON.parse(rawBuilds));
    if(rawBuilds===null&&legacy){builds=legacy;localStorage.setItem(buildsKey,JSON.stringify(legacy));}
    if(raw===null||legacy)localStorage.setItem(key,JSON.stringify(checksData));
    const data:CheckState={...checksData,...(builds&&Object.keys(builds).length?{builds}:{})};
    snapshot={data,ready:true,status:'이 브라우저의 체크 기록을 불러왔습니다.',error:false};}
  catch{snapshot={...snapshot,ready:false,status:'기록을 읽거나 저장할 수 없습니다. JSON으로 백업하고 브라우저 저장 설정을 확인하세요. 기존 기록은 덮어쓰지 않았습니다.',error:true};}
  emit();
}
function subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
/** 저장에 성공하면 true. 가져오기는 실패를 알 수 있게 이 값을 본다. */
function save(data:CheckState):boolean{
  let ok=true;
  // 육성 기록 열쇠를 먼저 쓰고, 실패하면 체크 열쇠도 쓰지 않는다(알림 '바뀌지 않았습니다'가 참이 되게). 기록이 비면 열쇠를 지우지 않고 {}를 둔다:
  // 열쇠가 없으면 처음 읽을 때 체크 열쇠의 옛 builds를 옮겨 오므로, 지운 기록이 옛 탭 값으로 되살아나지 않게 한다(Fable 재검토 E).
  try{const {builds,...checksData}=data,before=localStorage.getItem(buildsKey);localStorage.setItem(buildsKey,JSON.stringify(builds&&Object.keys(builds).length?builds:{}));
    try{localStorage.setItem(key,JSON.stringify(checksData));}catch(e){try{if(before===null)localStorage.removeItem(buildsKey);else localStorage.setItem(buildsKey,before);}catch{/* 되돌리기도 실패하면 그대로 둔다 */}throw e;}snapshot={data,ready:true,status:'체크를 이 브라우저에 저장했습니다.',error:false};}
  catch{ok=false;snapshot={...snapshot,status:'저장하지 못했습니다. 체크는 바뀌지 않았습니다. 저장 공간을 확인한 뒤 다시 시도하세요.',error:true};}
  emit();return ok;
}
export function useChecks(){
  const state=useSyncExternalStore(subscribe,()=>snapshot,()=>initial);
  useEffect(()=>{load();const sync=(e:StorageEvent)=>{if(e.key===key||e.key===buildsKey){snapshot=initial;load();}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  const bump=(data:CheckState)=>save({...data,revision:snapshot.data.revision+1,updatedAt:new Date().toISOString()});
  // effective: 저장된 체크 + 내 상태의 축복 단계로 끝난 구매 체크(2026-11-15). 화면의 완료·진행률·날짜는 이것을 쓴다.
  return {...state,effective:effectiveChecks(state.data.checks,state.data.status),
    setStatus:(patch:Partial<Status>)=>{if(!snapshot.ready)return;const next={...emptyStatus,...snapshot.data.status,...patch};bump({...snapshot.data,status:validateStatus(next,limits)});},
    toggle:(id:string,value:boolean)=>{if(snapshot.ready)save({...snapshot.data,checks:{...snapshot.data.checks,[id]:value},revision:snapshot.data.revision+1,updatedAt:new Date().toISOString()});},/** 파일을 검사해 저장한다. 파일의 육성 기록을 썼으면 true(알림 문구용). */
    importData:(value:unknown):boolean=>{const data=validateChecks(value,limits,true);/* 내 상태가 없는 예전 파일은 지금의 내 상태를 지우지 않는다. 육성 기록이 없는(또는 빈) 파일도 지금 육성 기록을 지우지 않고, 있으면 파일 것으로 통째로 바꾼다(2026-11-27 U72). */if(!save({...data,...(!data.status&&snapshot.data.status?{status:snapshot.data.status}:{}),...(!data.builds&&snapshot.data.builds?{builds:snapshot.data.builds}:{}),revision:Math.max(data.revision,snapshot.data.revision)+1,updatedAt:new Date().toISOString()}))throw new Error('이 브라우저에 저장하지 못했습니다. 저장 공간이나 사생활 보호 모드를 확인하세요.');return !!data.builds;},retry:()=>{snapshot=initial;load();},clear:()=>{/* 기록 지우기는 체크와 내 상태만 지우고 인물 육성 기록은 남긴다(2026-11-27 U72). */if(snapshot.ready)save({...empty,...(snapshot.data.builds?{builds:snapshot.data.builds}:{}),revision:snapshot.data.revision+1,updatedAt:new Date().toISOString()});},
    /** 인물 육성 기록 한 사람 고치기. patch가 null이면 그 사람 기록을 지운다. 읽기 실패 때는 덮어쓰지 않는다. */
    setBuild:(route:BuildRoute,slug:string,patch:Partial<Build>|null)=>{if(!snapshot.ready)return;const {builds:_old,...rest}=snapshot.data;void _old;const builds=nextBuilds(snapshot.data.builds,route,slug,patch);bump({...rest,...(builds?{builds}:{})});}};
}
