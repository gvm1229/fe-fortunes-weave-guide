import { scopeTree } from './scope';
import { json, stageId, type Route, type Part, type Tree } from './content';
export type Material={id:string;name:string;quantity:string;place:string;method:string;steps:string[];warning:string;images:{file:string;caption:string}[]};
export type Secondary = { service:unknown; purchases:unknown; gold:unknown; rules:unknown; materials:Material[]; prepTree:Tree[]; materialsTree:Tree[]; exam:Tree[]; blocks:{title:string;tree:Tree[]}[] };
export function secondaryFor(route:Route,part:Part):Secondary{
  const service=json<{routes:Record<string,unknown>}>('data/god-service-plan');
  const purchases=json<{routes:Record<string,unknown>;rules:unknown}>('data/purchase-plan');
  const gold=json<{routes:Record<string,unknown>;war:unknown;part3:unknown}>('data/chapter-gold');
  const materials=json<Record<string,Material&{routeDetails?:Record<string,Partial<Material>>}>>('data/recruit-materials');
  const parity=json<{prep:Tree[];materials:Tree[];exam:Tree[];stages:{id:string;blocks:{title:string;tree:Tree[]}[]}[]}>('display-parity');
  return {service:service.routes[route]||'3부에는 실제 반입 상태와 가호를 확인하세요.',purchases:part==='1'?purchases.routes[route]||[]:[],gold:part==='1'?gold.routes[route]:part==='2'?gold.war:gold.part3,rules:purchases.rules,materials:part==='1'?Object.entries(materials).map(([id,m])=>({...m,...m.routeDetails?.[route],id})):[],prepTree:scopeTree(parity.prep,route,part),materialsTree:scopeTree(parity.materials,route,part),exam:scopeTree(parity.exam,route,part),blocks:parity.stages.find(s=>s.id===stageId(route,part))?.blocks.map(b=>({...b,tree:scopeTree(b.tree,route,part)}))||[]};
}
