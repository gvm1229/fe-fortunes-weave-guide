import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chapterTitle,oldCounts,emptyCounts,imageKind,safeTree} from './checklist-source.mjs';
const source=readFileSync(resolve(process.argv[2]||'content/source/react-content.json'));
const old=JSON.parse(source),derived=JSON.parse(readFileSync('content/derived/checklist.json','utf8'));
assert.equal(derived.sourceSha256,createHash('sha256').update(source).digest('hex'));
assert.deepEqual(safeTree('<script>alert(1)</script><img src="javascript:x" onerror="x"><button onclick="x">위치</button>'),[{tag:'img',attrs:{},children:[]},{tag:'button',attrs:{},children:['위치']}]);
const rows=[];const add=(a,b)=>{for(const key in a)a[key]+=b[key];};
for(const stage of old.stages){const target=derived.stages.find(s=>s.id===stage.id);assert.ok(target);let chapter='시작 전';const counts=new Map();
  for(const [index,block]of stage.blocks.entries()){
    chapter=chapterTitle(block.title,chapter);if(!counts.has(chapter))counts.set(chapter,{old:emptyCounts(),expected:emptyCounts(),rendered:emptyCounts()});
    const ch=target.chapters.find(c=>c.title===chapter),item=ch.blocks.find(b=>b.id===(block.id||`${stage.id}-source-${index}`));assert.ok(item,block.id);
    const actual=emptyCounts();actual.portraits=item.portraits.length;
    function walk(nodes){for(const n of nodes){if(typeof n==='string')continue;if(n.tag==='img')actual[imageKind(n.attrs.src)]++;if(n.attrs['data-map-link']||n.tag==='button'&&(n.attrs['data-recruit-material']||n.attrs['data-acquisition-modal']))actual.locations++;walk(n.children);}}
    walk(item.heading);walk(item.notes);Object.values(item.actions).forEach(walk);
    const blockActual={...actual};if(ch.event?.blockId===item.id)blockActual[imageKind(ch.event.src)]++;assert.deepEqual(blockActual,oldCounts(block.html,true),`${stage.id} ${chapter} ${item.id} 묶음 불일치`);
    const expected=oldCounts(block.html,true);const sum=counts.get(chapter);add(sum.old,oldCounts(block.html));add(sum.expected,expected);add(sum.rendered,actual);
  }
  for(const [title,row]of counts){const event=target.chapters.find(c=>c.title===title).event;if(event)row.rendered[imageKind(event.src)]++;assert.deepEqual(row.rendered,row.expected,`${stage.id} ${title} 그림/위치 버튼 불일치`);rows.push({route:stage.id==='part3-plan'?'part3':stage.id.split('-')[0],part:stage.id==='part3-plan'?'3':stage.id.includes('-war-')?'2':'1',chapter:title,...row});}
}
writeFileSync('docs/image-parity.json',JSON.stringify({host:'Windows / Node.js',portraitPolicy:'같은 원본 묶음에서 같은 얼굴은 한 번',rows},null,2));
console.log(`통과: ${rows.length}개 루트·부·장 원본 그림/위치 버튼 대조`);
