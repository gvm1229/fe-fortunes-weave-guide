import { json, type Tree } from './content';
import { examFor, charioteerGoal, charioteerPart2Goal, type Exam } from './character-data';
import manifest from '@/assets/classes/manifest.json';
export type Scenario={id:string;title:string;description:string;swaps:Record<string,string>};
export type TeamUnit={name:string;role:string;class:string;classSlug:string;classTier:string;portrait:string;female:boolean;favorite?:boolean;reviewUrl:string;classReason:string;overviewReason:string;growthGoal:{via:string;skill:string;rank:string;unlock:string}|null;displayGroupRank:number;displayPriority:number;loss?:string;weapons:{label:string;icon:string}[];usableWeapons?:{label:string;icon:string}[];specialtyIcons:{skill:string;icon:string}[];signatureWeapons:{name:string;icon:string;rank:string;note:string}[];route?:string;exam?:Exam};
type Section={tree:Tree[]};
type TeamSource={team:{baseline:string[];units:Record<string,TeamUnit>;proposal:{scenarios:Scenario[];trials:{id:string;outgoing:string;incoming:string;label:string}[];roleTradeoffs:Record<string,string>}};teamSections:Record<'spells'|'routes'|'details',Section>;teamWhite:Record<string,Section>;routeTeams:Record<string,{intro:Section;parts:Record<string,Section>}>};
export type RouteSpell={id:string;name:string;rank:string;title:string};
export type RouteUnit={name:string;portrait:string;reason:string;className:string;classTier:string;classSlug?:string;weapons:{skill:string;icon:string}[];white?:{allowed:boolean;title:string;spells:RouteSpell[];notes:string[]};goal:string[]};
export type RoutePart={title:string;count:string;note:string;units:RouteUnit[]};
export type RouteIntro={title:string;priority:string[];notes:string[]};
const classes=manifest.classes as Record<string,{file:string;tier:string;slug?:string;weapons?:string[]}>;
const skillIcon:Record<string,string>={'검술':'sword','창술':'lance','도끼술':'axe','궁술':'bow','격투술':'brawl','흑마술':'black-magic','백마술':'white-magic'};
function text(n:Tree):string{return typeof n==='string'?n:n.children.map(text).join('');}
function els(n:Tree):Exclude<Tree,string>[]{return typeof n==='string'?[]:n.children.filter((c):c is Exclude<Tree,string>=>typeof c!=='string');}
function find(n:Tree,test:(e:Exclude<Tree,string>)=>boolean):Exclude<Tree,string>|undefined{for(const c of els(n)){if(test(c))return c;const f=find(c,test);if(f)return f;}return undefined;}
function findAll(n:Tree,test:(e:Exclude<Tree,string>)=>boolean,out:Exclude<Tree,string>[]=[]){for(const c of els(n)){if(test(c))out.push(c);findAll(c,test,out);}return out;}
const clean=(s:string)=>s.replace(/\s+/g,' ').replace(/^[\s·]+|[\s·]+$/g,'').trim();
/** 루트 편성 원본 조각(77개 카드가 같은 모양)을 카드 자료로 바꾼다. 글은 그대로 두고 백마법 표기만 백마술로 바꾼다. */
function routeUnit(li:Exclude<Tree,string>,route:string,part:string,cai:Record<string,Record<string,{classes:string[]}>>):RouteUnit{
  const body=els(li).find(e=>e.tag==='div')!,img=els(li).find(e=>e.tag==='img');
  const name=clean(text(find(body,e=>e.tag==='b')!));
  const reason=clean(text(els(body).find(e=>e.tag==='p')!||''));
  const classButton=find(body,e=>e.tag==='button'&&!!e.attrs['data-class-name']);
  let className=classButton?.attrs['data-class-name']||'',classTier=clean(text(find(body,e=>e.tag==='small')||'')),classSlug=classButton?.attrs['data-class-slug'];
  let weapons=findAll(find(body,e=>e.attrs['aria-label']==='병과 사용 가능 무기')||'',e=>e.tag==='span'&&els(e).some(i=>i.tag==='img')).map(s=>({skill:clean(text(s)).replace('백마법','백마술'),icon:els(s).find(i=>i.tag==='img')!.attrs.src}));
  const override=route==='cai'?cai[name]?.[part]?.classes.at(-1):undefined;
  if(override&&classes[override]){className=override;classTier=classes[override].tier;classSlug=classes[override].slug;weapons=(classes[override].weapons||[]).map(skill=>({skill,icon:`assets/skills/${skillIcon[skill]||'sword'}.webp`}));}
  const whiteNode=find(body,e=>!!e.attrs['data-white-person']);
  const white=whiteNode?{allowed:whiteNode.attrs['data-white-allowed']==='true',title:clean(text(find(whiteNode,e=>e.tag==='strong')||'')).replace('백마법','백마술'),spells:findAll(whiteNode,e=>e.tag==='button'&&!!e.attrs['data-spell-jump']).map(b=>({id:b.attrs['data-spell-jump'],name:clean(b.children.filter(c=>typeof c==='string').join('')),rank:clean(text(els(b).find(e=>e.tag==='b')||'')),title:b.attrs.title||''})),notes:findAll(whiteNode,e=>e.tag==='p'||e.tag==='small'||e.tag==='li').map(e=>clean(text(e)).replace('백마법','백마술')).filter(Boolean)}:undefined;
  const after=whiteNode?els(body).slice(els(body).indexOf(whiteNode)+1):els(body).slice(-1);
  let goal=after.flatMap(e=>e.tag==='ul'?els(e).map(li=>clean(text(li))):[clean(text(e))]).filter(Boolean).map(g=>g.replace('백마법','백마술'));
  // 전차병 시험 목표는 1부만(2부는 이미 전차병, 검토 4 M2). 이유 글은 활을 쓰는 전차병에 맞춘 글로(content/cai-charioteer.json).
  if(override&&part==='1')goal=[charioteerGoal()];
  else if(override)goal=goal.map(g=>charioteerPart2Goal(g)||g);
  const teamReason=override?(cai[name] as {reason?:{team:string}}).reason?.team:undefined;
  return {name,portrait:img?.attrs.src||'',reason:(teamReason||reason).replace('백마법','백마술'),className,classTier,classSlug,weapons,white,goal};
}
function routePart(tree:Tree[],route:string,part:string,cai:Record<string,Record<string,{classes:string[]}>>):RoutePart|undefined{
  const section=tree.find((n):n is Exclude<Tree,string>=>typeof n!=='string'&&n.tag==='section');if(!section)return undefined;
  const head=els(section).find(e=>e.tag==='div');
  return {title:clean(text(find(head||'',e=>e.tag==='h3')||'')),count:clean(text(find(head||'',e=>e.tag==='span')||'')),note:clean(text(els(section).find(e=>e.tag==='p')||'')),units:els(els(section).find(e=>e.tag==='ul')||'').filter(e=>e.tag==='li').map(li=>routeUnit(li,route,part,cai))};
}
function routeIntro(tree:Tree[]):RouteIntro{
  const h2=tree.find((n):n is Exclude<Tree,string>=>typeof n!=='string'&&n.tag==='h2'),ul=tree.find((n):n is Exclude<Tree,string>=>typeof n!=='string'&&n.tag==='ul');
  const notes:string[]=[];let current='';for(const c of ul?.children||[]){if(typeof c==='string')current+=c;else if(c.tag==='br'){notes.push(current);current='';}}notes.push(current);
  return {title:clean(text(h2||'')),priority:findAll(ul||'',e=>e.tag==='b').map(b=>clean(text(b))),notes:notes.map(clean).filter(n=>n&&n!=='우선')};
}
export function teamData(){
  const source=json<{parity:TeamSource}>('derived/presentation').parity;
  const origins=Object.values(json<{routes:Record<string,Record<string,{baseRoute?:string}>>}>('data/unit-readiness').routes);
  const cai=json<{people:Record<string,Record<string,{classes:string[]}>>}>('cai-charioteer').people;
  const units=Object.fromEntries(Object.entries(source.team.units).map(([name,unit])=>[name,{...unit,route:origins.map(p=>p[name]?.baseRoute).find(Boolean),exam:examFor(unit.class)}]));
  const routeParts=Object.fromEntries(Object.entries(source.routeTeams).map(([route,t])=>[route,{intro:routeIntro(t.intro.tree),parts:Object.fromEntries((['1','2'] as const).map(p=>[p,routePart(t.parts[p]?.tree||[],route,p,cai)]))}]));
  return {...source.team,units,sections:source.teamSections,white:source.teamWhite,routeTeams:source.routeTeams,routeParts};
}
