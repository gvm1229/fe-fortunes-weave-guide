import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { deriveChecklist } from './checklist-source.mjs';
const source=readFileSync(resolve(process.argv[2]||'../fe-fortunes-weave-guide-main','personalized-app/src/content.json'));
const old=JSON.parse(source),playbook=JSON.parse(readFileSync('content/data/playbook.json','utf8'));
mkdirSync('content/derived',{recursive:true});
writeFileSync('content/derived/checklist.json',JSON.stringify({sourceSha256:createHash('sha256').update(source).digest('hex'),stages:deriveChecklist(old,playbook)}));
console.log('9개 루트·부 원본 그림과 위치 버튼 표시 자료 생성');
