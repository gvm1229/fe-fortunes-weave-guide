// content/가 정본이 된 뒤(2026-11-14) 사본 파일을 고치면 이 스크립트로 해시 목록을 갱신한다. 이전 프로젝트는 읽지 않는다.
import fs from 'node:fs';import crypto from 'node:crypto';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const m=JSON.parse(fs.readFileSync('content/transfer-manifest.json','utf8'));let n=0;
for(const f of m.sourceFiles){const h=hash(f.target);if(h!==f.sha256){f.sha256=h;n++;}}
m.generatedSourceSha256=hash('content/source/react-content.json');
fs.writeFileSync('content/transfer-manifest.json',JSON.stringify(m,null,2)+'\n');
console.log(`해시 갱신 ${n}개`);
