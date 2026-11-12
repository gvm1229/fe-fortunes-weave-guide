import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
for(const dir of ['assets/design/emblems','assets/portraits/pre-timeskip/large']){
  const manifest=JSON.parse(readFileSync(`${dir}/manifest.json`,'utf8'));
  assert.equal(Object.keys(manifest).length,4);
  for(const item of Object.values(manifest)){
    assert.equal(new URL(item.source).hostname,'www.nintendo.com');
    for(const path of [item.path,`public/${item.path}`])assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),item.sha256,`${path}: 공식 다운로드 원본 바이트`);
  }
}
for(const name of ['cai','dietrich','theodora','leda'])for(const dir of ['assets/design','public/assets/design'])assert.equal(existsSync(`${dir}/emblem-${name}.webp`),false,'잘라 만든 문장 제거');
const home=readFileSync('components/home.tsx','utf8');assert.ok(!home.includes('route-emblems-source')&&!home.includes('/assets/design/emblem-'));
const stages=JSON.parse(readFileSync('content/derived/checklist.json','utf8')).stages;
for(const stage of stages.filter(s=>s.id!=='part3-plan'))assert.ok(!JSON.stringify(stage).includes('/post-timeskip/'),`${stage.id}: 타임스킵 전 그림`);
const people=JSON.parse(readFileSync('content/data/people-display.json','utf8'));
for(const p of Object.values(people))assert.ok(!p.portrait.includes('/post-timeskip/'),'1·2부 인물 얼굴');
console.log('통과: 공식 그림 8개 원본·공개 사본 바이트, 잘라 만든 문장 0개, 1·2부 그림 시대');
