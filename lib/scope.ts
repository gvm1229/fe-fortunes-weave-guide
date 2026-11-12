import type { Tree } from './content';
const routeNames:Record<string,string>={theodora:'세오도라',leda:'레다',dietrich:'디트리히',kai:'카이'};
export function scopeTree(nodes:Tree[],route:string,part:string):Tree[]{
  function text(n:Tree):string{return typeof n==='string'?n:n.children.map(text).join('');}
  function visit(n:Tree):Tree|null{
    if(typeof n==='string')return n;
    const a=n.attrs;
    for(const k of ['data-weekly-route','data-buying-route','data-material-route'])if(a[k]&&a[k]!==(part==='2'?'war':part==='3'?'part3':route))return null;
    for(const k of ['data-route','data-roster-route','data-modal-routes'])if(a[k]&&!a[k].split(' ').includes(route))return null;
    for(const k of ['data-goal-phase','data-modal-parts'])if(a[k]&&!a[k].split(' ').includes(part))return null;
    if(a['data-modal-all-only'])return null;
    if(['p','li','tr','h2','h3','h4'].includes(n.tag)){
      const value=text(n);
      if(Object.entries(routeNames).some(([r,name])=>r!==route&&new RegExp(`${name}\\s*(?:[12]부|루트|판|시작)`).test(value)))return null;
    }
    return {...n,children:n.children.map(visit).filter((x):x is Tree=>x!==null)};
  }
  return nodes.map(visit).filter((x):x is Tree=>x!==null);
}

export function scopeMarkdown(body:string,route:string,part:string){
  const names=routeNames;
  if(route==='all')return body;
  const lines=body.split('\n');const result:string[]=[];let excludedAt=0;
  for(const line of lines){
    const heading=line.match(/^(#{1,6})\s+(.+)/);
    if(heading){
      const level=heading[1].length;if(excludedAt&&level<=excludedAt)excludedAt=0;
      const owners=Object.entries(names).filter(([,n])=>heading[2].startsWith(n)).map(([r])=>r);
      const phase=heading[2].match(/^(?:세오도라|레다|디트리히|카이)?\s*([123])부/);
      if(!excludedAt&&((owners.length&&!owners.includes(route))||(phase&&phase[1]!==part)))excludedAt=level;
    }
    if(excludedAt)continue;
    // Comparisons stay on /team. Source Markdown is preserved byte-for-byte.
    const mentions=Object.entries(names).filter(([,n])=>line.includes(n)).map(([r])=>r);
    if(mentions.some(r=>r!==route))continue;
    const phase=line.match(/^\s*(?:[-*]\s*)?(?:\*\*)?([123])부\s*:/);
    if(phase&&phase[1]!==part)continue;
    result.push(line);
  }
  return result.join('\n');
}
