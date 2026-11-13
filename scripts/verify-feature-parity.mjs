import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { resolveDoc, guideHref, headingId } from '../lib/document-links.ts';
import { treeText } from './readability.mjs';
import { displayText } from '../lib/display.ts';

const read=p=>JSON.parse(readFileSync(p,'utf8'));
const old=read('content/source/react-content.json'),parity=read('content/display-parity.json');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const compact=text=>text.replace(/\s/g,'');
let fragments=0,buttons=0,images=0;
function compare(html,tree,label){
  const $=load(html,null,false);$('script,style,svg,path,input,iframe,object,embed').remove();
  assert.equal(compact(treeText(tree)),compact($.root().text()),label+' 전체 글자');
  const sourceImages=$('img').map((_,e)=>$(e).attr('src')).get(),sourceButtons=$('button').map((_,e)=>compact($(e).text())).get();
  const actualImages=[],actualButtons=[];
  function walk(nodes){for(const n of nodes){if(typeof n==='string')continue;if(n.tag==='img')actualImages.push(n.attrs.src);if(n.tag==='button')actualButtons.push(compact(treeText(n.children)));walk(n.children);}}
  walk(tree);assert.deepEqual(actualImages,sourceImages,label+' 그림');assert.deepEqual(actualButtons,sourceButtons,label+' 버튼');
  fragments++;buttons+=actualButtons.length;images+=actualImages.length;
}
for(const person of old.people)compare(person.html,parity.people.find(p=>p.id===person.id).tree,person.id);
for(const key of ['prep','materials','exam'])compare(old[key],parity[key],key);
for(const [key,html] of Object.entries(old.budgets))compare(html,parity.budgets[key],key+' 예산');
for(const [key,html] of Object.entries(old.teamSections))compare(html,parity.teamSections[key].tree,'팀 '+key);
for(const [name,unit] of Object.entries(old.team.units))compare(unit.whiteHighlightHtml||'',parity.teamWhite[name].tree,name+' 백마법');
assert.deepEqual(parity.team,old.team,'팀 원본 전체 속성');
assert.deepEqual(old.team.baseline,read('content/data/final-roster.json').final25Example.map(p=>p.name));
for(const scenario of old.team.proposal.scenarios)for(const trials of [[],...old.team.proposal.trials.map(t=>[t]),old.team.proposal.trials]){
  const swaps={...scenario.swaps};for(const t of trials)swaps[t.outgoing]=t.incoming;
  const names=old.team.baseline.map(n=>swaps[n]||n);assert.equal(new Set(names).size,25);names.forEach(name=>assert.ok(old.team.units[name],name));
}
const manifest=read('content/transfer-manifest.json');
const inventory=new Set(manifest.sourceFiles.map(f=>f.source));
// 2026-11-14: 이전 프로젝트는 읽기 전용 참고이며 이 저장소는 content/ 사본만 정본으로 쓴다(cai 이름 변경 뒤 원본과 글자가 다르다).
for(const f of manifest.sourceFiles)assert.ok(inventory.has(f.source));
const media=read('content/media-manifest.json');
for(const file of media){assert.equal(hash(file.target),file.sha256,file.target);}
const refs=read('content/source/reference-documents.json'),derivedRefs=read('content/derived/reference-documents.json');
for(const [path,doc]of Object.entries(refs)){
  const html=readFileSync('content/reference-source/'+path.replace(/\.md$/,'.html'),'utf8'),$=load(html);
  const main=$('.reference-content, .reading-document, main').first(),body=main.length?main:$('body');body.find('script,style,.reference-toolbar,.side-nav,.hero,.footer').remove();
  compare(body.html()||'',doc.tree,path);assert.equal(compact(treeText(derivedRefs[path].tree)),compact(treeText(doc.tree)),path+' 표시 문서');
}
const docs=read('content/derived/documents.json');
for(const unit of Object.values(old.team.units)){
  if(unit.reviewUrl){const review=resolveDoc(unit.reviewUrl).split('#')[0];assert.ok(docs[review]||refs[review],review);}
  assert.ok(docs['notes/classes/'+unit.classSlug+'.md'],unit.classSlug);
}
assert.equal(resolveDoc('/notes/classes/soldier.html#시험'),'notes/classes/soldier.md#시험');
assert.equal(resolveDoc('../progress.md','routes/theodora/progress.md'),'routes/progress.md');
assert.equal(resolveDoc('#현재','progress.md'),'progress.md#현재');
assert.equal(headingId('3부 · 지원 C'),'3부--지원-c');
assert.equal(guideHref('personalized.html#theodora-plan'),'/theodora/1/');
assert.equal(guideHref('../personalized-team.html','notes/example.md'),'/team/');
assert.equal(displayText('앞 루트1·2부를 연속 완료한 실제 가호/게이지 확인 · 이전 예상 목표를 달성값으로 쓰지 않음'),'앞 루트에서 넘겨받은 실제 가호·게이지 확인 · 이전 예상 목표를 달성값으로 쓰지 않음');
const transitions=old.stages.flatMap(s=>s.blocks).flatMap(b=>[...b.html.matchAll(/data-task-id="([^"]*--start-[^"]*)"/g)].map(m=>m[1]));
const overrides=read('content/display-overrides.json');for(const id of transitions)assert.ok(!overrides.actions[id],'루트 순서 정본을 덮는 표시: '+id);
const report={status:'passed',host:'Codex / Windows / Node.js',sourceFiles:manifest.sourceFiles.length,mediaFiles:media.length,personalDocuments:Object.keys(docs).length,generatedDocuments:Object.keys(refs).length,fragments,buttons,images,teamCandidates:Object.keys(old.team.units).length,scenarioTrialCombinations:12,excluded:'참고 보관·archive: 2026-11-13 사용자 확인',limits:'원본과 복사본의 일치 및 개인화 표시 자료의 보존 검사. 실제 게임 정보의 정확성·사용자 브라우저 기록 자동 동기화는 증명하지 않음.'};
writeFileSync('docs/feature-parity.json',JSON.stringify(report,null,2));console.log(report);
