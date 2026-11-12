import { scopeMarkdown } from './scope';
import { displayText } from './display';
import fs from 'node:fs';
import path from 'node:path';
import type { Part, Route } from './content';
export type ReferenceDoc={path:string;title:string;body:string};
const names:Record<string,string>={theodora:'세오도라',leda:'레다',dietrich:'디트리히',kai:'카이'};
export function documentsFor(route:Route|'all',part:Part):ReferenceDoc[]{
  const root=path.join(process.cwd(),'content/notes');const result:ReferenceDoc[]=[];
  function walk(dir:string){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())walk(full);else if(e.name.endsWith('.md')){const rel='notes/'+path.relative(root,full).replaceAll('\\','/');const body=fs.readFileSync(full,'utf8');const scoped=scopeMarkdown(body,route,part);const title=body.match(/^#\s+(.+)/m)?.[1]||e.name.replace('.md','');if(route==='all'||!Object.entries(names).some(([r,n])=>r!==route&&title.includes(n)))result.push({path:rel,title,body:displayText(scoped)});}}}
  walk(root);return result;
}
