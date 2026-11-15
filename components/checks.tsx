'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { validateChecks, validateStatus, sanitizeStatus, type CheckState, type Status } from '@/lib/check-state';
import { limits, effectiveChecks, emptyStatus } from '@/lib/status';
const key='fortunes-weave-checklist-v1';
// 사이트에는 체크 기록을 넣지 않는다(2026-11-14 사용자 지시). 처음 여는 브라우저는 빈 기록에서 시작하고, 기록은 그 브라우저 저장소와 JSON 백업에만 있다.
const empty:CheckState={schemaVersion:1,revision:0,checks:{}};
const initial={data:empty,ready:false,status:'체크 기록을 불러오는 중입니다.',error:false};
let snapshot=initial;
/** 저장소 값은 느슨하게 읽는다(모르는 축복은 버림). 가져오기 파일만 엄격하게 검사한다. */
function readStored(value:unknown):CheckState{const d=validateChecks(value);return d.status?{...d,status:sanitizeStatus(d.status,limits)}:d;}
const listeners=new Set<()=>void>();
function emit(){listeners.forEach(fn=>fn());}
function load(){
  if(snapshot.ready)return;
  try{const raw=localStorage.getItem(key);const data=raw===null?empty:readStored(JSON.parse(raw));if(raw===null)localStorage.setItem(key,JSON.stringify(data));snapshot={data,ready:true,status:'이 브라우저의 체크 기록을 불러왔습니다.',error:false};}
  catch{snapshot={...snapshot,ready:false,status:'기록을 읽거나 저장할 수 없습니다. JSON으로 백업하고 브라우저 저장 설정을 확인하세요. 기존 기록은 덮어쓰지 않았습니다.',error:true};}
  emit();
}
function subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
/** 저장에 성공하면 true. 가져오기는 실패를 알 수 있게 이 값을 본다. */
function save(data:CheckState):boolean{
  let ok=true;
  try{localStorage.setItem(key,JSON.stringify(data));snapshot={data,ready:true,status:'체크를 이 브라우저에 저장했습니다.',error:false};}
  catch{ok=false;snapshot={...snapshot,status:'저장하지 못했습니다. 체크는 바뀌지 않았습니다. 저장 공간을 확인한 뒤 다시 시도하세요.',error:true};}
  emit();return ok;
}
export function useChecks(){
  const state=useSyncExternalStore(subscribe,()=>snapshot,()=>initial);
  useEffect(()=>{load();const sync=(e:StorageEvent)=>{if(e.key===key){snapshot=initial;load();}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  const bump=(data:CheckState)=>save({...data,revision:snapshot.data.revision+1,updatedAt:new Date().toISOString()});
  // effective: 저장된 체크 + 내 상태의 축복 단계로 끝난 구매 체크(2026-11-15). 화면의 완료·진행률·날짜는 이것을 쓴다.
  return {...state,effective:effectiveChecks(state.data.checks,state.data.status),
    setStatus:(patch:Partial<Status>)=>{if(!snapshot.ready)return;const next={...emptyStatus,...snapshot.data.status,...patch};bump({...snapshot.data,status:validateStatus(next,limits)});},
    toggle:(id:string,value:boolean)=>{if(snapshot.ready)save({...snapshot.data,checks:{...snapshot.data.checks,[id]:value},revision:snapshot.data.revision+1,updatedAt:new Date().toISOString()});},importData:(value:unknown)=>{const data=validateChecks(value,limits);/* 내 상태가 없는 예전 파일은 지금의 내 상태를 지우지 않는다. */if(!save({...data,...(!data.status&&snapshot.data.status?{status:snapshot.data.status}:{}),revision:Math.max(data.revision,snapshot.data.revision)+1,updatedAt:new Date().toISOString()}))throw new Error('이 브라우저에 저장하지 못했습니다. 저장 공간이나 사생활 보호 모드를 확인하세요.');},retry:()=>{snapshot=initial;load();},clear:()=>{if(snapshot.ready)save({...empty,revision:snapshot.data.revision+1,updatedAt:new Date().toISOString()});}};
}
