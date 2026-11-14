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
assert.equal(playbook.groups.flatMap(g=>g.actions).length,1899);
assert.equal(new Set(ids).size,2881);
assert.equal(read('content/data/recruit-all-plan.json').assignments.length,63);
assert.equal(playbook.stages.length,9);
{const old=read('content/source/react-content.json');assert.deepEqual(new Set(ids),new Set(old.allTaskIds));const actionIds=[...old.stages.flatMap(s=>s.blocks.flatMap(b=>[...b.html.matchAll(/data-task-id="([^"]+)"/g)].map(m=>m[1])))];assert.deepEqual(new Set(actionIds),new Set(playbook.groups.flatMap(g=>g.actions.map(a=>a.id))));}
assert.equal(read('content/data/final-roster.json').final25Example.length,25);
assert.equal(manifest.referenceDocs,318);
for(const f of manifest.sourceFiles){assert.ok(existsSync(f.target),f.target);assert.equal(hash(f.target),f.sha256,`이전 파일 변경: ${f.target}`);}
assert.equal(hash('content/source/react-content.json'),manifest.generatedSourceSha256,'생성 화면 대조 사본 변경');
// 개인 체크 기록은 저장소 밖(git 무시) progress/checklist.json에만 있다. 있으면 검사하고, 없으면(다른 컴퓨터) 건너뛴다.
const progressFile='progress/checklist.json',progress=existsSync(progressFile)?read(progressFile):null;
assert.ok(!existsSync('content/checklist-seed.json')&&!existsSync('content/data/checklist.json')&&!existsSync('content/theodora-progress-import.json'),'체크 기록이 content/에 있음');
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
if(progress)assert.deepEqual(validateChecks(JSON.parse(JSON.stringify(progress))),progress);
// 사이트에는 체크 기록을 넣지 않는다(2026-11-14 사용자 지시). 앱 코드는 체크 원본·진행 가져오기 파일을 읽지 않고, 공개 폴더로도 복사하지 않는다.
{const {readdirSync}=await import('node:fs');const walkSrc=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walkSrc(`${d}/${e.name}`):/\.(tsx?|mjs|js)$/.test(e.name)?[`${d}/${e.name}`]:[]);
 for(const f of ['app','components','lib'].flatMap(walkSrc)){const t=readFileSync(f,'utf8');assert.ok(!/checklist-seed|data\/checklist\.json|theodora-progress-import\.json/.test(t),f+' 체크 기록을 읽음');}
 const run=readFileSync('scripts/run.mjs','utf8');assert.ok(!run.includes("cpSync('content/theodora-progress-import.json'")&&run.includes("rmSync('public/reference-data/checklist.json'"),'run.mjs가 체크 기록을 공개함');}
// 2026-11-14 전원 영입 필수 · 1부 연회 반복 필수(docs/fable-plan-recruit-feast.md 3판 C.2).
{
  const ov=read('content/display-overrides.json'),plan=read('content/data/recruit-all-plan.json'),checklist=read('content/derived/checklist.json');
  const shown=(g,a)=>Object.hasOwn(ov.actions,a.id)?ov.actions[a.id]:a.text, title=g=>Object.hasOwn(ov.groups,g.id)?ov.groups[g.id]:g.title;
  const banned=['선택 영입','영입을 생략','추가 영입하기로 골랐으면','우리가 확인하지 않았다','식당 식사를 반복'];
  for(const g of playbook.groups){for(const w of banned){assert.ok(!title(g).includes(w),g.id+' 제목 '+w);for(const a of g.actions){assert.ok(!shown(g,a).includes(w),a.id+' '+w);assert.ok(!a.category.includes(w),a.id+' 칩 '+w);}}}
  const chapterOf=(stage,id)=>checklist.stages.find(s=>s.id===stage).chapters.find(c=>c.blocks.some(b=>b.id===id))?.title;
  for(const r of ['theodora','leda','dietrich','cai']){
    const fg=playbook.groups.find(g=>g.id===`feast-loop-${r}-part1-20261114`);assert.ok(fg&&fg.actions.length===(r==='theodora'?10:7),r+' 연회 묶음');// 세오도라는 여관 짝 식사·주 넘기기·마지막 회차 3개 더(2026-11-14)
    assert.equal(chapterOf(r+'-plan',fg.id),'12장',r+' 연회 묶음 12장');assert.equal(chapterOf(r+'-plan',`support-talks-${r}-part1-20261112`),'12장',r+' 지원 대화 묶음 12장');
    for(const g of playbook.groups.filter(g=>g.stage===r+'-war-plan'))for(const a of g.actions)assert.ok(!/연회를 반복|식사를 반복/.test(shown(g,a)),a.id+' 2부 연회');
    const audit=playbook.groups.flatMap(g=>g.actions).find(a=>a.id===`team-${r}-recruit-audit--1`);const text=ov.actions[audit.id]||audit.text;
    for(const name of plan.pairCoverage.routeRoster[r])assert.ok(text.includes(name),`${r} 합류 확인에 ${name}`);
    assert.ok(plan.pairCoverage.routeRoster[r].includes('울턴드'),r+' 울턴드');
  }
  const order=checklist.stages.find(s=>s.id==='part3-plan').chapters.flatMap(c=>c.blocks.map(b=>b.id));
  assert.ok(order.indexOf('p3-feast-loop-20261114')>=0&&order.indexOf('p3-feast-loop-20261114')<order.indexOf('p3-merge'),'3부 연회 반복이 융합보다 먼저');
  // 주의 글·골드 블록도 본다(검토 6 M2: 묶음 글만 보면 놓친다).
  const flat=t=>Array.isArray(t)?t.map(flat).join(''):typeof t==='string'?t:t?flat(t.children):'';
  for(const st of checklist.stages)for(const c of st.chapters)for(const b of c.blocks){const t=flat(b.notes)+(Object.hasOwn(ov.groups,b.id)?ov.groups[b.id]:flat(b.heading));for(const w of [...banned,'추가 영입을 고른','선택 편성할 때만','이번 영입을 생략','만찬'])assert.ok(!t.includes(w),`${st.id} ${b.id} 글에 ${w}`);}
  // 덮개: 1·2부 한정 쌍(해결·위험)은 routes 중 한 루트의 명단(+외전 동석)에 두 인물이 모두 있다.
  const pc=plan.pairCoverage,inRoute=(r,n)=>pc.routeRoster[r].includes(n)||(pc.paralogues[r]||[]).includes(n);
  for(const p of pc.pairs.filter(p=>['해결','위험'].includes(p.status))){const [a,b]=p.pair.split('–');assert.ok(p.routes.some(r=>inRoute(r,a)&&inRoute(r,b)),'덮개 '+p.pair);}
  // 명단 두 곳이 같다. 합류 확인 묶음은 12장에 있다.
  const fr=read('content/data/final-roster.json');for(const r of ['theodora','leda','dietrich','cai']){assert.deepEqual(fr.recruitByRoute[r],pc.routeRoster[r],r+' recruitByRoute=routeRoster');assert.equal(chapterOf(r+'-plan',`team-${r}-recruit-audit`),'12장',r+' 합류 확인 12장');}
  // 4·5판: 누조는 네 루트 12장(선더 소드), 이오는 디트리히·카이만, 레다 제스터·골라이어스는 10장, 디트리히 7장 합류 육성 묶음은 7장.
  for(const r of ['theodora','leda','dietrich','cai'])assert.ok(pc.routeRoster[r].includes('누조'),r+' 누조');
  for(const r of ['theodora','leda'])assert.ok(!pc.routeRoster[r].includes('이오'),r+' 이오 없음');
  assert.ok(!Object.hasOwn(read('content/cai-charioteer.json').people,'누조'),'누조는 전차병 아님');
  for(const [st,id,ch] of [['theodora-plan','theo-recruit-nujo','12장'],['leda-plan','recruit-all-leda-nujo-20261114','12장'],['cai-plan','recruit-all-cai-nujo-20261114','12장'],['leda-plan','recruit-all-leda-jester-20261112','10장'],['leda-plan','recruit-all-leda-goliath-20261112','10장'],['dietrich-plan','ready-dietrich-catania','7장'],['dietrich-plan','di-13','9장']])assert.equal(chapterOf(st,id),ch,`${id} ${ch}`);
  for(const g of playbook.groups)for(const a of g.actions)assert.ok(!shown(g,a).includes('누조는 카이 루트에서만'),a.id+' 누조 카이 전용 문구');
  // 12장 연회 반복(2026-11-14 사용자 지시): 장 안에 있는 외전은 반복 회차마다 다시 하지 않는다. 세오도라 티아라(카이 외전)·디에고(오르헬 외전)는 여관 짝 식사로 지원을 올리고 마지막 회차에서만 외전 → 영입.
  {const act=id=>playbook.groups.flatMap(g=>g.actions).find(a=>a.id===id),txt=id=>{const g=playbook.groups.find(g=>g.actions.some(a=>a.id===id));return shown(g,act(id));};
   const T='feast-loop-theodora-part1-20261114',order=playbook.groups.find(g=>g.id===T).actions.map(a=>a.id.split('--')[1]);
   assert.deepEqual(order,['save','recruit','inn-pair','gift','spell','feast','skip-week','reset','target','final-pass'],'세오도라 연회 반복 순서');
   assert.ok(!/티아라·디에고·오르헬 외전/.test(txt(T+'--recruit'))&&/반복 회차에는 외전도 영입도 하지 않는다/.test(txt(T+'--recruit')),'세오도라 반복 회차 외전 제외');
   assert.ok(/여관/.test(txt(T+'--inn-pair'))&&/자동 활동/.test(txt(T+'--skip-week'))&&/마지막 회차에서만 카이 외전 → 오르헬 외전/.test(txt(T+'--final-pass')),'여관 짝 식사·자동 활동·마지막 회차');
   assert.ok(/마지막 회차/.test(txt('recruit-all-theodora-orchel-side-20261112--order'))&&/마지막 회차/.test(txt('recruit-all-theodora-tialla-plan-20261112--side')),'세오도라 외전 일정은 마지막 회차');
   assert.ok(/디에고/.test(txt('feast-loop-leda-part1-20261114--recruit')),'레다 재영입 목록에 디에고');
   assert.equal(chapterOf('leda-plan','dated-leda-orhell-reserve'),'11장','레다 오르헬 외전은 11장(다시 하기 뒤에도 남음)');}
  // 검토 7 L8: 세오도라·레다 1·2부 화면 글(행동·제목·주의 글·골드)에 이오가 없다. 콜로이오스·이오니안 같은 낱말은 제외.
  const io=/(?<!콜로)이오(?!니|스)/;
  for(const g of playbook.groups.filter(g=>/^(theodora|leda)(-war)?-plan$/.test(g.stage))){assert.ok(!io.test(title(g)),g.id+' 제목 이오');for(const a of g.actions)assert.ok(!io.test(shown(g,a)),a.id+' 이오');}
  for(const st of checklist.stages.filter(s=>/^(theodora|leda)(-war)?-plan$/.test(s.id)))for(const c of st.chapters)for(const b of c.blocks)assert.ok(!io.test(flat(b.notes)),`${st.id} ${b.id} 주의·골드 글 이오`);
  // 누조는 카이 훈련 후보가 아니다(영입만).
  for(const st of ['cai-plan','cai-war-plan'])for(const b of read('content/source/react-content.json').stages.find(s=>s.id===st).blocks)assert.ok(!/<span class="training-person">(?:<img[^>]*\/>)?<b>누조<\/b>/.test(b.html),`${st} ${b.id} 누조 훈련 후보`);
  // 골드 표: 항목 합 = 목표, 목표 − 이번 장 지출 = 지출 뒤.
  for(const [r,chs] of Object.entries(read('content/data/chapter-gold.json').routes))for(const ch of chs){assert.equal(ch.items.reduce((s,i)=>s+i.amount,0),ch.target,`${r} ${ch.chapter}장 골드 합`);assert.equal(ch.target-ch.items.filter(i=>i.kind==='due').reduce((s,i)=>s+i.amount,0),ch.afterScheduledSpend,`${r} ${ch.chapter}장 지출 뒤`);}
  // 은퇴한 행동 ID도 체크 ID 목록에 남는다(체크 기록 보존).
  for(const a of [...playbook.retiredActions,...playbook.retiredGroups.flatMap(g=>g.actions)])assert.ok(ids.includes(a.id),'은퇴 ID 보존 '+a.id);
  const checkedIds=Object.entries(progress?.checks||{}).filter(([,v])=>v).map(([k])=>k);
  for(const id of checkedIds)assert.ok(ids.includes(id),'체크 보존 '+id);
}
// 장 묶음에는 그 장의 할 일만(2026-11-14 사용자 지시). 제목이 "현재 7장", "레다 2부 3장", "3부 2구간"처럼 장으로 시작하면 그 장에 있어야 한다.
{const {chapterTitle}=await import('./checklist-source.mjs');for(const [t,c] of [['현재 7장 · Lv17 신규 4명 따라잡기','7장'],['레다 2부 3장 · 실제 미달에 맞춘 군행동','3장'],['3부 2구간 · 골드','2구간'],['11~12장 · 티아라 영입 일정 점검','11장'],['축복 준비 뒤 · 레다 1장 시작','시작 전'],['6장 이후 선택 · 8장 군비증강 미리 대비','6장']])assert.equal(chapterTitle(t,c==='시작 전'?'시작 전':c==='11장'?'10장':c==='6장'?'6장':'0장'),c,t);}
for(const st of read('content/derived/checklist.json').stages)for(const ch of st.chapters)for(const b of ch.blocks){const m=b.title.match(/^(?:현재\s*)?(?:(?:세오도라|레다|디트리히|카이)\s*)?(?:\d+부\s*)?(\d+)(?:~\d+)?\s*(장|구간)/);if(m)assert.equal(ch.title,m[1]+m[2],`${st.id} ${b.title}이 ${ch.title}에 있음`);}
console.log(JSON.stringify({status:'passed',host:'Windows / Node.js',activeActions:1899,checkIds:2881,recruitAssignments:63,referenceDocs:318,peopleByStage:manifest.peopleByStage,sourceFiles:manifest.sourceFiles.length,referencedMedia:media.size,sourceCompared:'content/source 사본',checks:'개별 false 우선·상속 거부·형식 검사·JSON 왕복 통과'},null,2));
