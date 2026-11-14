import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { deriveChecklist } from './checklist-source.mjs';
import { readableTree, readableRecord, treeText } from './readability.mjs';
import { deriveMarkdown } from './markdown-presentation.mjs';
const source=readFileSync(resolve(process.argv[2]||'content/source/react-content.json'));
const old=JSON.parse(source),playbook=JSON.parse(readFileSync('content/data/playbook.json','utf8'));
mkdirSync('content/derived',{recursive:true});
const stages=deriveChecklist(old,playbook);
function collectNotices(nodes,notices){for(const n of nodes){if(typeof n==='string')continue;
  if((n.tag==='p'||n.attrs['data-sentence-list'])&&treeText(n.children).includes('증서 수량은 준비 슬롯')){
    const key=treeText(n.children).replace(/\s/g,'');notices.set(key,{...n,attrs:{...n.attrs}});n.attrs['data-shared-notice']='true';
  }else collectNotices(n.children,notices);
}}
for(const stage of stages){const notices=new Map();for(const chapter of stage.chapters)for(const block of chapter.blocks){
  block.heading=readableTree(block.heading);
  block.notes=readableTree(block.notes,{disclose:true});
  block.actions=Object.fromEntries(Object.entries(block.actions).map(([id,nodes])=>[id,readableTree(nodes,{disclose:true})]));
  collectNotices(block.notes,notices);
}stage.chapters[0].notices=[...notices.values()];}
writeFileSync('content/derived/checklist.json',JSON.stringify({sourceSha256:createHash('sha256').update(source).digest('hex'),stages}));
const parity=JSON.parse(readFileSync('content/display-parity.json','utf8'));
function transform(value){
  if(Array.isArray(value))return value.map(transform);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,['tree','prep','materials','exam'].includes(key)&&Array.isArray(v)?readableTree(v):transform(v)]));
  return value;
}
const records={};
for(const name of ['phase-goals','unit-readiness','recruitment-gates','god-service-plan','purchase-plan','chapter-gold','recruit-materials'])records[name]=readableRecord(JSON.parse(readFileSync(`content/data/${name}.json`,'utf8')));
const readableParity=transform(parity),notices=new Map();
function gather(value){if(Array.isArray(value)){if(value.some(n=>n&&typeof n==='object'&&'tag' in n))collectNotices(value,notices);else value.forEach(gather);}else if(value&&typeof value==='object')Object.values(value).forEach(gather);}
gather(readableParity);readableParity.notices=[...notices.values()];
writeFileSync('content/derived/presentation.json',JSON.stringify({parity:readableParity,records}));
// 최종 25인 범위(최종 25명 + 팀 화면 교체 후보). 할 일 초상화의 금색 테두리와 인물 시트의 배지가 쓴다.
writeFileSync('content/derived/final25.json',JSON.stringify({names:Object.keys(readableParity.team.units)}));
const documents={};
function walkDocuments(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())walkDocuments(path);else if(entry.name.endsWith('.md')){const source=readFileSync(path,'utf8');documents[path.slice('content/'.length)]={sourceSha256:createHash('sha256').update(source).digest('hex'),body:deriveMarkdown(source)};}}}
walkDocuments('content/notes');walkDocuments('content/routes');walkDocuments('content/personalized-app');
for(const name of ['progress.md','theodora-progress-import.md','개인화 사용법.md']){const source=readFileSync(`content/${name}`,'utf8');documents[name]={sourceSha256:createHash('sha256').update(source).digest('hex'),body:deriveMarkdown(source)};}
writeFileSync('content/derived/documents.json',JSON.stringify(documents));
const referenceDocuments=JSON.parse(readFileSync('content/source/reference-documents.json','utf8'));
writeFileSync('content/derived/reference-documents.json',JSON.stringify(Object.fromEntries(Object.entries(referenceDocuments).map(([path,doc])=>[path,{...doc,tree:readableTree(doc.tree)}]))));
console.log('9개 루트·부 원본 그림과 위치 버튼 표시 자료 생성');
