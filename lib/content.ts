import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import overrides from '@/content/display-overrides.json';
import { scopeTree } from './scope';
import { displayText } from './display';
import { personPortrait } from './portraits';
import type { Chapter } from './checklist';
export type Route = 'theodora' | 'leda' | 'dietrich' | 'kai' | 'part3';
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
  { id: 'kai', label: '카이', description: '마지막 루트까지 빠짐없이' },
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
export type Person = { id:string; name: string; route: Route; role: string; kind:string; order:string; portrait: string; gifts:string[]; classes: string[]; goal: unknown; readiness: unknown; recruitment: unknown; gates: unknown; joinLabel?:string; details?: Tree[] };
type Goals = Record<string, Record<string, Record<string, unknown>>>;
export function peopleFor(route: Route, part: Part): Person[] {
  const goals = json<{ routes: Goals }>('data/phase-goals').routes;
  const selections = json<{routes: Record<string,{people:Record<string,{roles:Record<string,string>}>}>}>('data/roster-selection').routes;
  const portraits = json<Record<string,{portrait:string;gifts?:string[]}>>('data/people-display');
  const ready = json<{routes: Record<string,Record<string,unknown>>}>('data/unit-readiness').routes;
  const gates = json<{characters: Record<string,{routes:Record<string,unknown>;gates: {route:string}[]}>}>('data/recruitment-gates').characters;
  const display = json<{parity:{people: {id:string;name:string;route:Route;kind:string;order:string;tree:Tree[]}[]}}>('derived/presentation').parity.people;
  const readableGoals=presentation<{routes:Goals}>('phase-goals').routes;
  const readableReady=presentation<{routes:Record<string,Record<string,unknown>>}>('unit-readiness').routes;
  const readableGates=presentation<{characters:Record<string,{routes:Record<string,unknown>;gates:{route:string}[]}>}>('recruitment-gates').characters;
  const assignments=json<{assignments:{name:string;route:string;prerequisite:string;deadline:{chapter:string}}[]}>('data/recruit-all-plan').assignments;
  return display.filter(p => route === 'part3' || p.route === route).map(p => {
    const goal = goals[p.route]?.[p.name]?.[part] as {classes?:string[]} | undefined;
    const assignment=assignments.find(a=>a.name===p.name&&a.route===p.route),automatic=assignment&&(/자동/.test(assignment.prerequisite)||assignment.prerequisite==='진영장');
    const joinLabel=automatic?(assignment.deadline.chapter==='1장'?'시작 동료':`자동 합류 ${assignment.deadline.chapter}`):undefined;
    return { id:p.id,name:p.name,route:p.route,role:selections[p.route]?.people[p.name]?.roles[part] || '미확인',kind:p.kind,order:p.order,portrait:personPortrait(portraits[p.name]?.portrait || '',part,p.name),gifts:portraits[p.name]?.gifts||[],classes:goal?.classes || [],goal:readableGoals[p.route]?.[p.name]?.[part] || '미확인',readiness:readableReady[p.route]?.[p.name] || ready[p.route]?.[p.name] || '미확인',recruitment:readableGates[p.name]?.routes[p.route] || gates[p.name]?.routes[p.route] || '미확인',gates:readableGates[p.name]?.gates.filter(g=>g.route===p.route) || [],joinLabel,details:scopeTree(p.tree,p.route,part) };
  });
}
