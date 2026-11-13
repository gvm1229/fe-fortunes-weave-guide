import { characterReason } from './character-summary';
import { resolveDoc } from './document-links';
import { scopeMarkdown, scopeTree } from './scope';
import { displayText } from './display';
import fs from 'node:fs';
import path from 'node:path';
import { json, type Part, type Route, type Tree } from './content';
export type ReferenceDoc={path:string;title:string;body:string;tree?:Tree[];profile?:{name:string;portrait:string;className:string;tier:string;reason:string;selected:boolean}};
const names:Record<string,string>={theodora:'세오도라',leda:'레다',dietrich:'디트리히',cai:'카이'};
export function documentsFor(route:Route|'all',part:Part):ReferenceDoc[]{
  const result:ReferenceDoc[]=[];
  const derived=JSON.parse(fs.readFileSync(path.join(process.cwd(),'content/derived/documents.json'),'utf8')) as Record<string,{body:string}>;
  for(const [rel,{body}] of Object.entries(derived)){
    const owner=rel.match(/^routes\/([^/]+)\//)?.[1];
    if(route!=='all'&&owner&&owner!==route)continue;
    const scoped=scopeMarkdown(body,route,part),title=body.match(/^#\s+(.+)/m)?.[1]||path.basename(rel,'.md');
    if(route==='all'||!Object.entries(names).some(([r,n])=>r!==route&&title.includes(n)))result.push({path:rel,title,body:displayText(scoped)});
  }
  const parity=json<{parity:{exam:Tree[];budgets:Record<string,Tree[]>}}>('derived/presentation').parity;
  const references=json<Record<string,{title:string;tree:Tree[]}>>('derived/reference-documents');
  for(const [rel,doc] of Object.entries(references))result.push({path:rel,title:doc.title,body:'',tree:route==='all'?doc.tree:scopeTree(doc.tree,route,part)});
  result.push({path:'notes/exam.md',title:'시험 안내',body:'',tree:route==='all'?parity.exam:scopeTree(parity.exam,route,part)});
  for(const [owner,tree] of Object.entries(parity.budgets))if(route==='all'||route===owner)result.push({path:`notes/${owner}-budget.md`,title:`${names[owner]} 경험치·육성 예산`,body:'',tree:route==='all'?tree:scopeTree(tree,route,part)});
  const team=json<{team:{baseline:string[];units:Record<string,{reviewUrl:string;portrait:string;class:string;classTier:string}>}}>('source/react-content').team;
  for(const [name,unit] of Object.entries(team.units)){
    const doc=result.find(d=>d.path===resolveDoc(unit.reviewUrl).split('#')[0]);
    if(doc)doc.profile={name,portrait:unit.portrait,className:unit.class,tier:unit.classTier,reason:characterReason(name),selected:team.baseline.includes(name)};
  }
  return result;
}
