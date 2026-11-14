'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { validateChecks, type CheckState } from '@/lib/check-state';
const key='fortunes-weave-checklist-v1';
// 사이트에는 체크 기록을 넣지 않는다(2026-11-14 사용자 지시). 처음 여는 브라우저는 빈 기록에서 시작하고, 기록은 그 브라우저 저장소와 JSON 백업에만 있다.
const empty:CheckState={schemaVersion:1,revision:0,checks:{}};
const initial={data:empty,ready:false,status:'체크 기록을 불러오는 중입니다.',error:false};
let snapshot=initial;
const listeners=new Set<()=>void>();
function emit(){listeners.forEach(fn=>fn());}
function load(){
  if(snapshot.ready)return;
  try{const raw=localStorage.getItem(key);const data=raw===null?empty:validateChecks(JSON.parse(raw));if(raw===null)localStorage.setItem(key,JSON.stringify(data));snapshot={data,ready:true,status:'이 브라우저의 체크 기록을 불러왔습니다.',error:false};}
  catch{snapshot={...snapshot,ready:false,status:'기록을 읽거나 저장할 수 없습니다. JSON으로 백업하고 브라우저 저장 설정을 확인하세요. 기존 기록은 덮어쓰지 않았습니다.',error:true};}
  emit();
}
function subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
function save(data:CheckState){
  try{localStorage.setItem(key,JSON.stringify(data));snapshot={data,ready:true,status:'체크를 이 브라우저에 저장했습니다.',error:false};}
  catch{snapshot={...snapshot,status:'저장하지 못했습니다. 체크는 바뀌지 않았습니다. 저장 공간을 확인한 뒤 다시 시도하세요.',error:true};}
  emit();
}
export function useChecks(){
  const state=useSyncExternalStore(subscribe,()=>snapshot,()=>initial);
  useEffect(()=>{load();const sync=(e:StorageEvent)=>{if(e.key===key){snapshot=initial;load();}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  return {...state,toggle:(id:string,value:boolean)=>{if(snapshot.ready)save({...snapshot.data,checks:{...snapshot.data.checks,[id]:value},revision:snapshot.data.revision+1,updatedAt:new Date().toISOString()});},importData:(value:unknown)=>{const data=validateChecks(value);save({...data,revision:Math.max(data.revision,snapshot.data.revision)+1,updatedAt:new Date().toISOString()});},retry:()=>{snapshot=initial;load();}};
}
