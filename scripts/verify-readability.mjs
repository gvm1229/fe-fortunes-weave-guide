import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {deriveChecklist} from './checklist-source.mjs';
import {treeText,preservedText,sentences,spaceAmounts} from './readability.mjs';
import {markdownTree,markdownText} from './markdown-presentation.mjs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const raw=deriveChecklist(read(resolve(process.argv[2]||'content/source/react-content.json')),read('content/data/playbook.json'));
const actual=read('content/derived/checklist.json').stages;
let trees=0,sentenceCount=0,paragraphs=0;
const failures=[];
function goldBaseline(nodes){return nodes.map(n=>{
  if(typeof n==='string')return n;
  if(n.tag==='table'&&treeText(n.children.find(c=>typeof c!=='string'&&c.tag==='thead')?.children||[]).replace(/\s/g,'')==='용도준비액'){
    const body=n.children.find(c=>typeof c!=='string'&&c.tag==='tbody');
    return {...n,children:(body?.children||[]).filter(c=>typeof c!=='string'&&c.tag==='tr').map(row=>{
      const cells=row.children.filter(c=>typeof c!=='string'&&c.tag==='td'),usage=cells[0]?.children||[],notes=usage.filter(c=>typeof c!=='string'&&c.tag==='small');
      return {...row,children:[...usage.filter(c=>typeof c==='string'||c.tag!=='small'),...(cells[1]?.children||[]),...notes]};
    })};
  }
  return {...n,children:goldBaseline(n.children)};
});}
function compare(before,after,label){
  before=goldBaseline(before);
  assert.equal(preservedText(after),preservedText(before),`${label}: 원문 문자·숫자 보존`);
  const original=sentences(spaceAmounts(treeText(before))).length,derived=sentences(treeText(after)).length;
  assert.equal(derived,original,`${label}: 문장 수 보존`);trees++;sentenceCount+=original;
  function inspect(nodes){for(const n of nodes){if(typeof n==='string')continue;if(n.tag==='p'){paragraphs++;if(sentences(treeText(n.children)).length>2)failures.push(label);}inspect(n.children);}}
  inspect(after);
}
for(const [i,s]of raw.entries())for(const [j,c]of s.chapters.entries())for(const [k,b]of c.blocks.entries()){
  const a=actual[i].chapters[j].blocks[k],label=`${s.id}/${c.title}/${b.id}`;
  for(const key of ['heading','notes'])compare(b[key],a[key],`${label}/${key}`);
  for(const id in b.actions)compare(b.actions[id],a.actions[id],`${label}/${id}`);
}
const source=read('content/display-parity.json'),presentation=read('content/derived/presentation.json');
function compareParity(before,after,label='parity'){
  if(!before||typeof before!=='object')return;
  for(const [key,value]of Object.entries(before)){
    if(['tree','prep','materials','exam'].includes(key)&&Array.isArray(value))compare(value,after[key],`${label}/${key}`);
    else if(value&&typeof value==='object')compareParity(value,after[key],`${label}/${key}`);
  }
}
compareParity(source,presentation.parity);
let recordSentences=0;
function compareRecord(before,after,label){
  if(typeof before==='string'){
    const text=typeof after==='string'?after:after.$prose.join(' ');
    assert.equal(text.replace(/\s/g,''),before.replace(/\s/g,''),`${label}: 문자열 보존`);
    assert.equal(sentences(spaceAmounts(before)).length,sentences(text).length,`${label}: 자료 문장 수 보존`);
    recordSentences+=sentences(text).length;
  }else if(before&&typeof before==='object')for(const [key,v]of Object.entries(before))compareRecord(v,after[key],`${label}/${key}`);
  else assert.equal(after,before,label);
}
for(const [name,value]of Object.entries(presentation.records))compareRecord(read(`content/data/${name}.json`),value,name);
assert.deepEqual(failures,[],'3문장 이상인 파생 문단');
let documentCount=0,documentSentences=0;
for(const [path,item]of Object.entries(read('content/derived/documents.json'))){
  const source=readFileSync(`content/${path}`,'utf8');assert.equal(item.sourceSha256,createHash('sha256').update(source).digest('hex'),path);
  const before=markdownText(markdownTree(source)),tree=markdownTree(item.body),after=markdownText(tree);
  assert.equal(after.replace(/\s/g,''),before.replace(/\s/g,''),`${path}: 문서 원문 보존`);
  assert.equal(sentences(spaceAmounts(before)).length,sentences(spaceAmounts(after)).length,`${path}: 문서 문장 수 보존`);
  function inspect(n){if(n.type==='paragraph')assert.ok(sentences(markdownText(n)).length<=2,`${path}: 문단 2문장`);n.children?.forEach(inspect);}
  inspect(tree);documentCount++;documentSentences+=sentences(spaceAmounts(after)).length;
}
const report={status:'passed',host:'Codex / Windows / Node.js',trees,sentenceCount,recordSentences,documentCount,documentSentences,paragraphs,paragraphViolations:failures.length,method:'원문과 파생 자료의 공백 제외 문자·숫자·문장 수를 각각 대조. 표의 새 머리글과 파생 금액 행 복사본은 대조에서 제외. 원문 파일은 수정하지 않음.'};
writeFileSync('docs/sentence-preservation.json',JSON.stringify(report,null,2));
console.log(`통과: 원문 ${sentenceCount+recordSentences+documentSentences}문장 보존, 문서 ${documentCount}개, 3문장 이상 문단 0개`);
