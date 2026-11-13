import { scopeTree } from './scope';
import { json, presentation, stageId, type Route, type Part, type Tree } from './content';
export type Material={id:string;name:string;quantity:string;place:string;method:string;steps:string[];warning:string;images:{file:string;caption:string}[];info?:unknown};
export type Secondary = { notices:Tree[]; service:unknown; purchases:unknown; gold:unknown; rules:unknown; materials:Material[]; prepTree:Tree[]; materialsTree:Tree[]; exam:Tree[]; blocks:{title:string;tree:Tree[]}[] };
export function secondaryFor(route:Route,part:Part):Secondary{
  const service=presentation<{routes:Record<string,unknown>}>('god-service-plan');
  const purchases=presentation<{routes:Record<string,unknown>;rules:unknown}>('purchase-plan');
  const gold=presentation<{routes:Record<string,unknown>;war:unknown;part3:unknown}>('chapter-gold');
  const materials=json<Record<string,Material&{routeDetails?:Record<string,Partial<Material>>}>>('data/recruit-materials');
  const parity=json<{parity:{notices:Tree[];prep:Tree[];materials:Tree[];exam:Tree[];stages:{id:string;blocks:{title:string;tree:Tree[]}[]}[]}}>('derived/presentation').parity;
  const materialInfo=presentation<Record<string,Record<string,unknown>&{routeDetails?:Record<string,Record<string,unknown>>}>>('recruit-materials');
  const scopedMaterials=Object.entries(materials).map(([id,m])=>{const {routeDetails,...info}=materialInfo[id];return {...m,...m.routeDetails?.[route],id,info:{...info,...routeDetails?.[route]}};});
  return {notices:parity.notices,service:service.routes[route]||'3부에는 실제 반입 상태와 가호를 확인하세요.',purchases:part==='1'?purchases.routes[route]||[]:[],gold:part==='1'?gold.routes[route]:part==='2'?gold.war:gold.part3,rules:purchases.rules,materials:part==='1'?scopedMaterials:[],prepTree:scopeTree(parity.prep,route,part),materialsTree:scopeTree(parity.materials,route,part),exam:scopeTree(parity.exam,route,part),blocks:parity.stages.find(s=>s.id===stageId(route,part))?.blocks.map(b=>({...b,tree:scopeTree(b.tree,route,part)}))||[]};
}
