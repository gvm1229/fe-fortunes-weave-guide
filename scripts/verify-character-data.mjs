import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const goals=read('content/data/phase-goals.json').routes;
const details=read('content/data/class-details.json').classes;
const manifest=read('assets/classes/manifest.json').classes;
const kai=read('content/kai-charioteer.json');
const avoid=read('content/data/final-roster.json').avoidDefault;
assert.equal(avoid.length,10,'지양 10명');
const paths=[];
for(const [route,people]of Object.entries(goals))for(const [name,phases]of Object.entries(people))for(const part of ['1','2','3'])paths.push([route,name,part,(route==='kai'&&kai.people[name]?.[part]?.classes)||phases[part]?.classes||[]]);
for(const [route,name,part,classes]of paths)for(const c of classes){assert.ok(manifest[c],`${route}/${name} ${part}부 병종 그림 없음: ${c}`);assert.ok(details[c],`${route}/${name} ${part}부 시험 자료 없음: ${c}`);}
for(const [name,phases]of Object.entries(kai.people)){assert.ok(goals.kai[name],`카이 루트 인물 아님: ${name}`);assert.ok(!kai.excluded.includes(name));assert.ok(phases['1'].classes.includes('전차병')&&phases['2'].classes.includes('전차병'),`${name} 전차병 경로`);assert.equal(phases['2'].next,goals.kai[name]['3'].classes.at(-1),`${name} 3부 최종 병종 유지`);}
for(const name of kai.excluded)assert.ok(goals.kai[name]['1'].classes.some(c=>/프리스트|비숍/.test(c)),`${name} 마법·회복 담당`);
for(const [name,phases]of Object.entries(goals.kai))if(!kai.excluded.includes(name)&&!['알렉산드라'].includes(name)){const c=[...(kai.people[name]?.['1']?.classes||phases['1'].classes),...(kai.people[name]?.['2']?.classes||phases['2'].classes)];assert.ok(c.includes('전차병'),`카이 루트 ${name}은 전차병 경로가 있어야 함`);}
assert.deepEqual(goals.theodora['세오도라']['3'].classes,['홀리 랜서']);
assert.deepEqual(manifest['홀리 랜서'].weapons.includes('백마술'),true);
console.log(`통과: 인물 병종 경로 ${paths.length}개 · 그림·시험 자료 연결 · 카이 루트 전차병 ${Object.keys(kai.people).length}명 · 지양 ${avoid.length}명`);
