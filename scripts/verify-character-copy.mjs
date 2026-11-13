import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const copy=read('content/character-copy.json');
const source=readFileSync('lib/character-summary.ts','utf8').replace("import copy from '../content/character-copy.json';",'const copy='+JSON.stringify(copy)+';');
mkdirSync('.tmp',{recursive:true});const file=resolve('.tmp/character-copy-check.mjs');
writeFileSync(file,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText);
const {characterSummary,characterReason}=await import(pathToFileURL(file));
const presentation=read('content/derived/presentation.json').records;const readiness=presentation['unit-readiness'].routes,goals=presentation['phase-goals'].routes;
const evidence=[];
for(const [route,people]of Object.entries(readiness))for(const [name,ready]of Object.entries(people))for(const part of ['1','2','3']){
 const summary=characterSummary({name,route,readiness:ready,goal:goals[route][name][part]},part);
 assert.ok(!JSON.stringify(summary).includes('[object Object]'),name+' 값 직렬화');
 assert.ok(summary.reason,`${route} ${name}: 이유 누락`);
 assert.ok(summary.reason.length<150,`${name}: 긴 이유`);
 assert.ok(summary.battle.length<150,`${name}: 긴 출격 설명`);
 assert.ok(summary.goals.length&&summary.stop.length,`${name}: 목표·종료 누락`);
 if(name==='자스민')assert.match(summary.battle,/투입하지 않습니다/);
 if(['이오','알렉산드라'].includes(name))assert.ok(summary.caution.length);
 evidence.push({route,name,part,...summary});
}
assert.equal(evidence.length,183);
const team=read('content/source/react-content.json').team;
for(const name of Object.keys(team.units))assert.ok(characterReason(name),name+' 팀 설명');
writeFileSync('docs/character-copy-review.json',JSON.stringify({routeCharacters:61,phaseDescriptions:183,teamCandidates:Object.keys(team.units).length,source:'unit-readiness + phase-goals + authored character-copy',descriptions:evidence},null,2));
console.log('통과: 루트별 61명 × 3부 = 183개 설명, 팀 후보 34명, 보존·수집 예외');
