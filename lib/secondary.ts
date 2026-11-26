import { scopeTree } from './scope';
import { prepPanels, type PrepPanels } from './prep';
import { json, presentation, type Route, type Part, type Tree } from './content';
export type Material={id:string;name:string;quantity:string;place:string;method:string;steps:string[];warning:string;images:{file:string;caption:string}[];info?:unknown};
export type Secondary = { notices:Tree[]; purchases:unknown; gold:unknown; rules:unknown; materials:Material[]; materialsTree:Tree[]; panels:PrepPanels };
export function secondaryFor(route:Route,part:Part):Secondary{
  const purchases=presentation<{routes:Record<string,unknown>;rules:unknown}>('purchase-plan');
  const gold=presentation<{routes:Record<string,unknown>;war:unknown;part3:unknown}>('chapter-gold');
  const materials=json<Record<string,Material&{routeDetails?:Record<string,Partial<Material>>}>>('data/recruit-materials');
  const parity=json<{parity:{notices:Tree[];prep:Tree[];materials:Tree[]}}>('derived/presentation').parity;
  const materialInfo=presentation<Record<string,Record<string,unknown>&{routeDetails?:Record<string,Record<string,unknown>>}>>('recruit-materials');
  const scopedMaterials=Object.entries(materials).map(([id,m])=>{const {routeDetails,...info}=materialInfo[id];return {...m,...m.routeDetails?.[route],id,info:{...info,...routeDetails?.[route]}};});
  // 준비 탭은 다섯 묶음(lib/prep.ts, 2026-11-27 U69). 공통 기준 글·장별 운영 안내는 화면에서 뺐다(docs/reference/prep-common.md).
  return {notices:parity.notices,purchases:part==='1'?purchases.routes[route]||[]:[],gold:part==='1'?gold.routes[route]:part==='2'?gold.war:gold.part3,rules:purchases.rules,materials:part==='1'?scopedMaterials:[],materialsTree:scopeTree(parity.materials,route,part),panels:prepPanels(route,part,scopeTree(parity.prep,route,part))};
}
