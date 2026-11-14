import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { checked, validateChecks } from '../lib/check-state.ts';
import { scopeTree, scopeMarkdown } from '../lib/scope.ts';
import './verify-image-parity.mjs';
import './verify-readability.mjs';
import './verify-design-assets.mjs';
import './verify-feature-parity.mjs';
import './verify-redesign.mjs';
import './verify-character-copy.mjs';
import './verify-character-data.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const manifest=read('content/transfer-manifest.json');
const playbook=read('content/data/playbook.json');
const overrides=read('content/display-overrides.json');
for(const id of Object.keys(overrides.actions))assert.ok(playbook.groups.some(g=>g.actions.some(a=>a.id===id)),`없는 수정 ID ${id}`);
const parity=read('content/display-parity.json');
const ids=read('content/check-ids.json');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(playbook.groups.flatMap(g=>g.actions).length,1858);
assert.equal(new Set(ids).size,2817);
assert.equal(read('content/data/recruit-all-plan.json').assignments.length,63);
assert.equal(playbook.stages.length,9);
{const old=read('content/source/react-content.json');assert.deepEqual(new Set(ids),new Set(old.allTaskIds));const actionIds=[...old.stages.flatMap(s=>s.blocks.flatMap(b=>[...b.html.matchAll(/data-task-id="([^"]+)"/g)].map(m=>m[1])))];assert.deepEqual(new Set(actionIds),new Set(playbook.groups.flatMap(g=>g.actions.map(a=>a.id))));}
assert.equal(read('content/data/final-roster.json').final25Example.length,25);
assert.equal(manifest.referenceDocs,318);
for(const f of manifest.sourceFiles){assert.ok(existsSync(f.target),f.target);assert.equal(hash(f.target),f.sha256,`이전 파일 변경: ${f.target}`);}
assert.equal(hash('content/source/react-content.json'),manifest.generatedSourceSha256,'생성 화면 대조 사본 변경');
assert.deepEqual(read('content/checklist-seed.json'),read('content/data/checklist.json'));
for(const [route,count]of Object.entries(manifest.peopleByRoute))assert.equal(parity.people.filter(p=>p.route===route).length,count,route);
for(const [stage,count]of Object.entries(manifest.peopleByStage)){const part=stage.includes('-war-')?'2':stage==='part3-plan'?'3':'1';assert.equal(parity.people.filter(p=>(part==='3'||p.route===stage.split('-')[0])&&p.roles[part]).length,count,stage);}
for(const [stage,count]of Object.entries(manifest.oldBlockCounts))assert.equal(parity.stages.find(s=>s.id===stage).blocks.length+playbook.groups.filter(g=>g.stage===stage).length,count,`표시 블록 ${stage}`);
for(const g of playbook.groups)for(const a of g.actions){assert.ok(ids.includes(a.id),a.id);assert.equal(typeof a.inheritLegacy,'boolean',a.id);}
const files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())walk(p);else if(/\.(json|md)$/.test(p))files.push(p);}}
walk('content');
const media=new Set();const missing=new Set();
for(const f of files){const text=(f.endsWith('/timeskip-portraits.json')?JSON.stringify(Object.values(read(f))):readFileSync(f,'utf8')).replaceAll('\\"','"').replace(/https?:\/\/[^\s"'<>]+/g,'');for(const m of text.matchAll(/assets\/[\w./%+ -]+\.(?:png|webp|jpg|jpeg|svg|otf|woff2?)/g)){const p=decodeURIComponent(m[0]);media.add(p);if(!existsSync(p))missing.add(p);}}
assert.deepEqual([...missing],[],`없는 미디어: ${[...missing].join(', ')}`);
const policy=read('content/data/modal-scope-plan.json');for(const name of [...policy.contextual,...policy.common])assert.ok(existsSync(`content/notes/${name}.md`),name);
assert.equal(checked({id:'child',inheritLegacy:true},'parent',{parent:true}),true);
assert.equal(checked({id:'child',inheritLegacy:true},'parent',{parent:true,child:false}),false);
assert.equal(checked({id:'child',inheritLegacy:false},'parent',{parent:true}),false);
assert.deepEqual(scopeTree([{tag:'section',attrs:{'data-buying-route':'leda'},children:['다른 자료']}],'theodora','1'),[]);
assert.deepEqual(scopeTree([{tag:'section',attrs:{'data-weekly-route':'war'},children:['2부']}],'theodora','1'),[]);
assert.equal(scopeMarkdown('## 세오도라 1부\n현재\n## 레다 1부\n다른 자료','theodora','1').trim(),'## 세오도라 1부\n현재');
assert.throws(()=>validateChecks({schemaVersion:1,revision:0,checks:{a:'true'}}));
assert.throws(()=>validateChecks({schemaVersion:1,revision:-1,checks:{}}));
const seed=read('content/checklist-seed.json');assert.deepEqual(validateChecks(JSON.parse(JSON.stringify(seed))),seed);
// 장 묶음에는 그 장의 할 일만(2026-11-14 사용자 지시). 제목이 "현재 7장", "레다 2부 3장", "3부 2구간"처럼 장으로 시작하면 그 장에 있어야 한다.
for(const st of read('content/derived/checklist.json').stages)for(const ch of st.chapters)for(const b of ch.blocks){const m=b.title.match(/^(?:현재\s*)?(?:(?:세오도라|레다|디트리히|카이)\s*)?(?:\d+부\s*)?(\d+)(?:~\d+)?\s*(장|구간)/);if(m)assert.equal(ch.title,m[1]+m[2],`${st.id} ${b.title}이 ${ch.title}에 있음`);}
console.log(JSON.stringify({status:'passed',host:'Windows / Node.js',activeActions:1858,checkIds:2817,recruitAssignments:63,referenceDocs:318,peopleByStage:manifest.peopleByStage,sourceFiles:manifest.sourceFiles.length,referencedMedia:media.size,sourceCompared:'content/source 사본',checks:'개별 false 우선·상속 거부·형식 검사·JSON 왕복 통과'},null,2));
