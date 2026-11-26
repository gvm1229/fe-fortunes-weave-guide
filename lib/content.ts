import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import overrides from '@/content/display-overrides.json';
import { scopeTree } from './scope';
import { displayText } from './display';
import { personPortrait } from './portraits';
import type { Chapter } from './checklist';
import { characterData, type CharacterData } from './character-data';
import { yuphasProfile, type YuphasProfile } from './yuphas-profile';
export type Route = 'theodora' | 'leda' | 'dietrich' | 'cai' | 'part3';
export type Part = '1' | '2' | '3';
export type Action = { id: string; category: string; text: string; inheritLegacy: boolean };
export type Group = { id: string; stage: string; title: string; people: string[]; actions: Action[]; notes: { category: string; text: string }[]; figures: string[]; referenceLinks?: { url: string; label: string }[]; spoiler?: boolean };
export type Tree = string | { tag: string; attrs: Record<string,string>; children: Tree[] };
export function json<T = Record<string, unknown>>(name: string): T { return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', name + '.json'), 'utf8')) as T; }
export function presentation<T>(name:string):T{return json<{records:Record<string,T>}>('derived/presentation').records[name];}
export const routes: { id: Route; label: string; description: string }[] = [
  { id: 'theodora', label: '세오도라', description: '현재 전력을 지키며 다음 준비' },
  { id: 'leda', label: '레다', description: '영입과 육성을 한 걸음씩' },
  { id: 'dietrich', label: '디트리히', description: '새 여정의 기준을 다시 확인' },
  { id: 'cai', label: '카이', description: '마지막 루트까지 빠짐없이' },
  { id: 'part3', label: '3부', description: '모인 동료들과 마지막 준비' },
];
export function stageId(route: Route, part: Part) { return route === 'part3' ? 'part3-plan' : `${route}${part === '2' ? '-war' : ''}-plan`; }
export function groupsFor(route: Route, part: Part) {
  const titles=overrides.groups as Record<string,string>,texts=overrides.actions as Record<string,string>;
  const notes=overrides.notes as Record<string,Group['notes']>;
  return json<{groups: Group[]}>('data/playbook').groups.filter(g => g.stage === stageId(route, part)).map(g=>({...g,title:displayText(titles[g.id]||g.title),notes:(notes[g.id]||g.notes).map(n=>({...n,text:displayText(n.text)})),actions:g.actions.map(a=>({...a,text:displayText(texts[a.id]||a.text)}))}));
}
export function chaptersForRoute(route:Route,part:Part):Chapter[]{return json<{stages:{id:string;chapters:Chapter[]}[]}>('derived/checklist').stages.find(s=>s.id===stageId(route,part))!.chapters;}
export function routeParams() { return routes.flatMap(r => (r.id === 'part3' ? ['3'] : ['1','2']).map(part => ({ route: r.id, part }))); }
export function validScope(route: string, part: string): route is Route { return routeParams().some(p => p.route === route && p.part === part); }
export type CheapGift = { name:string; cost:number|null; icon?:string; reaction:string; url?:string };
export type Person = { id:string; name: string; route: Route; role: string; kind:string; order:string; portrait: string; gifts:string[]; cheapGifts:CheapGift[]; classes: string[]; goal: unknown; readiness: unknown; recruitment: unknown; gates: unknown; joinLabel?:string; joinPlan?:string; badge?:string; details?: Tree[]; data: CharacterData; yuphas?: YuphasProfile };
type Goals = Record<string, Record<string, Record<string, unknown>>>;
export function peopleFor(route: Route, part: Part): Person[] {
  const goals = json<{ routes: Goals }>('data/phase-goals').routes;
  const selections = json<{routes: Record<string,{people:Record<string,{roles:Record<string,string>}>}>}>('data/roster-selection').routes;
  const portraits = json<Record<string,{portrait:string;gifts?:string[]}>>('data/people-display');
  // 싸게 살 수 있는 선호 선물(지원 대화를 모두 보려면 지원 1 영입 동료도 선물로 인연을 올린다).
  const affordable = json<{otherCosts?:Record<string,number|string>;people:Record<string,{cheap:string[];reactions?:Record<string,string>}>;items:Record<string,{korean?:string;english:string;cost:number|null;icon?:string;reaction:string;url?:string}>}>('data/affordable-gifts');
  // 같은 물품도 인물마다 반응이 다르면 reactions가 정한다(2026-11-15 추가 13명).
  const cheapGifts = (name:string):CheapGift[] => (affordable.people[name]?.cheap||[]).filter(id=>affordable.items[id]).map(id=>{const i=affordable.items[id];return {name:i.korean||i.english,cost:i.cost,icon:i.icon,reaction:affordable.people[name].reactions?.[id]||i.reaction,url:i.url};});
  // 「비싼 선물」에는 500G 이하로 살 수 있는 물품을 빼서 싼 선물과 겹치지 않게 한다(검토 11 M2).
  const cheapCost=new Map([...Object.values(affordable.items).filter(i=>i.korean&&i.cost!=null).map(i=>[i.korean as string,i.cost as number] as const),...Object.entries(affordable.otherCosts||{}).filter(([,v])=>typeof v==='number').map(([k,v])=>[k,v as number] as const)]);
  const expensive=(name:string)=>(portraits[name]?.gifts||[]).filter(g=>!((cheapCost.get(g)??Infinity)<=500));
  const ready = json<{routes: Record<string,Record<string,unknown>>}>('data/unit-readiness').routes;
  const gates = json<{characters: Record<string,{routes:Record<string,unknown>;gates: {route:string}[]}>}>('data/recruitment-gates').characters;
  const display = json<{parity:{people: {id:string;name:string;route:Route;kind:string;order:string;tree:Tree[]}[]}}>('derived/presentation').parity.people;
  const readableGoals=presentation<{routes:Goals}>('phase-goals').routes;
  const readableReady=presentation<{routes:Record<string,Record<string,unknown>>}>('unit-readiness').routes;
  const readableGates=presentation<{characters:Record<string,{routes:Record<string,unknown>;gates:{route:string}[]}>}>('recruitment-gates').characters;
  const assignments=json<{assignments:{name:string;route:string;prerequisite:string;reason?:string;deadline:{chapter:string}}[]}>('data/recruit-all-plan').assignments;
  const cards = display.filter(p => route === 'part3' || p.route === route).map(p => {
    const goal = goals[p.route]?.[p.name]?.[part] as {classes?:string[]} | undefined;
    const assignment=assignments.find(a=>a.name===p.name&&a.route===p.route),automatic=assignment&&(/자동/.test(assignment.prerequisite)||assignment.prerequisite==='진영장');
    const data=characterData(p.route,p.name,part);
    const joinLabel=automatic?(assignment.deadline.chapter==='1장'?'시작 동료':`자동 합류 ${assignment.deadline.chapter}`):undefined;
    return { id:p.id,name:p.name,route:p.route,role:selections[p.route]?.people[p.name]?.roles[part] || '미확인',kind:p.kind,order:p.order,portrait:personPortrait(portraits[p.name]?.portrait || '',part,p.name),gifts:expensive(p.name),cheapGifts:cheapGifts(p.name),classes:data.classes.length?data.classes:goal?.classes || [],goal:data.goalText?{...(readableGoals[p.route]?.[p.name]?.[part] as object|undefined),text:data.goalText}:readableGoals[p.route]?.[p.name]?.[part] || '미확인',readiness:readableReady[p.route]?.[p.name] || ready[p.route]?.[p.name] || '미확인',recruitment:readableGates[p.name]?.routes[p.route] || gates[p.name]?.routes[p.route] || '미확인',gates:readableGates[p.name]?.gates.filter(g=>g.route===p.route) || [],joinLabel,details:scopeTree(p.tree,p.route,part),data,yuphas:yuphasProfile(p.name) };
  });
  // 카드가 없던 지원 대화용 영입 동료(2026-11-15 사용자 지시: 13명 모두 서랍과 선물). 육성 자료 없이 영입·대화·선물만 보인다.
  // 2026-11-15 Fable 검토 11 M3: 다른 루트에 카드가 있어도 이 루트에서 영입하면 같은 꼴의 카드를 단다(울턴드 던전 회복·융합용 사본 포함).
  const routeKo:Record<string,string>={theodora:'세오도라',leda:'레다',dietrich:'디트리히',cai:'카이'};
  const recruitOnly = json<{cards:{route:Exclude<Route,'part3'>;name:string;chapter:string;pairs:string[];pairs3:string[];note?:string}[]}>('data/recruit-only-cards').cards.filter(c => route === 'part3' || c.route === route).map((c):Person => {
    const assignment=assignments.find(a=>a.name===c.name&&a.route===c.route),automatic=!!assignment&&/자동/.test(assignment.prerequisite);
    const dungeon=!!c.note&&/던전/.test(c.note),merge=!!c.note&&/능력 융합/.test(c.note);
    const later=c.pairs3.length?`3부에 볼 대화 상대를 위해 영입합니다: ${c.pairs3.join(', ')}.`:'';
    // 3부 화면은 3부 대화를, 1·2부 화면은 그 루트의 1·2부 대화를 먼저 보인다(검토 11 L4).
    const talks=part==='3'?(later||`1·2부에 ${routeKo[c.route]}에서 지원 대화를 보려고 영입한 동료입니다.`):c.pairs.length?`이 루트에서 지원 대화를 보려고 영입합니다: ${c.pairs.join(', ')}.`:`이 루트에서 1·2부에 볼 지원 대화는 없습니다. ${later}`.trim();
    const reasonText=[dungeon&&'던전 반복 전투에서 매 전투 상시 회복을 하려고 영입합니다.',talks,merge&&'3부 능력 융합 후보이기도 합니다.'].filter(Boolean).join(' ');
    return { id:`person-${c.route}-recruit-${c.name}`,name:c.name,route:c.route,role:'수집',kind:'보존·수집',order:`9-${parseInt(c.chapter,10)}`,portrait:personPortrait(portraits[c.name]?.portrait || '',part,c.name),gifts:expensive(c.name),cheapGifts:cheapGifts(c.name),classes:[],goal:{},readiness:{},recruitment:readableGates[c.name]?.routes[c.route] || gates[c.name]?.routes[c.route] || '미확인',gates:readableGates[c.name]?.gates.filter(g=>g.route===c.route) || [],joinLabel:automatic?`자동 합류 ${c.chapter}`:undefined,joinPlan:automatic?undefined:`할 일 목록 ${c.chapter}에서 영입합니다.`,badge:dungeon?'던전 회복용 영입':undefined,details:[],data:{...characterData(c.route,c.name,part),avoid:true,classes:[],finalClasses:[],skills:[],reasonText},yuphas:yuphasProfile(c.name) };
  });
  return [...cards, ...recruitOnly];
}
