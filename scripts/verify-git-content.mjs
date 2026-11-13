import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const read=path=>JSON.parse(readFileSync(path));
const staged=process.argv.includes('--staged');
const output=execFileSync('git',staged?['ls-files','--stage','-z']:['ls-tree','-r','-z','HEAD'],{encoding:'utf8'});
const entries=new Map(output.split('\0').filter(Boolean).map(line=>{const [meta,path]=line.split('\t');return [path,meta.split(' ')[staged?1:2]];}));
const files=[...read('content/transfer-manifest.json').sourceFiles,...read('content/media-manifest.json')];
for(const file of files){
 const bytes=readFileSync(file.target);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.target+' 원본 대조');
 const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 assert.equal(entries.get(file.target),blob,file.target+' Git 저장 내용');
}
const report={status:'passed',host:'Windows / Node.js / Git',scope:staged?'index':'HEAD',files:files.length,method:'원본 SHA-256과 현재 파일을 대조하고, 파일 바이트로 만든 Git blob ID를 Git에 저장된 ID와 비교',limits:'지정한 원본 자료·미디어의 저장 바이트만 검증. 실행 동작과 원격 푸시는 별도 확인.'};
writeFileSync('docs/git-content-verification.json',JSON.stringify(report,null,2));
console.log('통과: 원본 자료·미디어 '+files.length+'개와 Git 저장 내용 일치');
