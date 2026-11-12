import type { Tree, Group } from './content';
export type SourceBlock={id:string;group:boolean;title:string;heading:Tree[];portraits:{src:string;name:string}[];actions:Record<string,Tree[]>;notes:Tree[]};
export type Chapter={title:string;event:{src:string;alt:string}|null;blocks:SourceBlock[]};
export function chapterGroups(chapter:Chapter,groups:Group[]){const ids=new Set(chapter.blocks.filter(b=>b.group).map(b=>b.id));return groups.filter(g=>ids.has(g.id));}
export function walkTree(nodes:Tree[],visit:(node:Exclude<Tree,string>)=>void){for(const node of nodes)if(typeof node!=='string'){visit(node);walkTree(node.children,visit);}}
