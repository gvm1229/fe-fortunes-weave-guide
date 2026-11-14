import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const goals=read('content/data/phase-goals.json').routes;
const details=read('content/data/class-details.json').classes;
const manifest=read('assets/classes/manifest.json').classes;
const cai=read('content/cai-charioteer.json');
const avoid=read('content/data/final-roster.json').avoidDefault;
assert.equal(avoid.length,10,'지양 10명');
const paths=[];
for(const [route,people]of Object.entries(goals))for(const [name,phases]of Object.entries(people))for(const part of ['1','2','3'])paths.push([route,name,part,(route==='cai'&&cai.people[name]?.[part]?.classes)||phases[part]?.classes||[]]);
for(const [route,name,part,classes]of paths)for(const c of classes){assert.ok(manifest[c],`${route}/${name} ${part}부 병종 그림 없음: ${c}`);assert.ok(details[c],`${route}/${name} ${part}부 시험 자료 없음: ${c}`);}
for(const [name,phases]of Object.entries(cai.people)){assert.ok(goals.cai[name],`카이 루트 인물 아님: ${name}`);assert.ok(!cai.excluded.includes(name));assert.ok(phases['1'].classes.includes('전차병')&&phases['2'].classes.includes('전차병'),`${name} 전차병 경로`);assert.equal(phases['2'].next,goals.cai[name]['3'].classes.at(-1),`${name} 3부 최종 병종 유지`);}
for(const name of cai.excluded)assert.ok(goals.cai[name]['1'].classes.some(c=>/프리스트|비숍/.test(c)),`${name} 마법·회복 담당`);
for(const [name,phases]of Object.entries(goals.cai))if(!cai.excluded.includes(name)&&!['알렉산드라','누조'].includes(name)){const c=[...(cai.people[name]?.['1']?.classes||phases['1'].classes),...(cai.people[name]?.['2']?.classes||phases['2'].classes)];assert.ok(c.includes('전차병'),`카이 루트 ${name}은 전차병 경로가 있어야 함`);}
// 빈 값은 알려진 목록과 같아야 한다: 신장직은 레벨·명성 없음, 최상급직은 명성 없음, 상급직은 아래 5개만 명성 없음.
const blank=v=>!v||v==='–'||v==='-';
const noRenown=Object.entries(details).filter(([,d])=>blank(d.renown)).map(([c])=>c),noLevel=Object.entries(details).filter(([,d])=>blank(d.recommendedLevel)).map(([c])=>c);
const byTier=t=>Object.entries(details).filter(([,d])=>d.tier===t).map(([c])=>c);
assert.deepEqual(noLevel.sort(),byTier('신장직').sort(),'레벨 빈 값은 신장직만');
assert.deepEqual(noRenown.sort(),[...byTier('신장직'),...byTier('최상급직'),'대장장이','드래군','칼라드리오스','코끼리병','트루바두르'].sort(),'명성 빈 값 목록이 바뀜');
// 최종 25인 팀 카드 병종 = 본 루트의 3부 최종 병종
const units=read('content/derived/presentation.json').parity.team.units,ready=read('content/data/unit-readiness.json').routes;
let matched=0;
for(const [name,unit]of Object.entries(units)){const base=Object.values(ready).map(r=>r[name]?.baseRoute).find(Boolean);if(!base)continue;assert.equal(unit.class,goals[base][name]['3'].classes.at(-1),`${name} 팀 카드 병종과 3부 최종 병종이 다름`);matched++;}
assert.ok(matched>=24,'본 루트가 있는 팀 인물 24명 이상');
assert.deepEqual(goals.theodora['세오도라']['3'].classes,['홀리 랜서']);
assert.deepEqual(manifest['홀리 랜서'].weapons.includes('백마술'),true);
console.log(`통과: 인물 병종 경로 ${paths.length}개 · 그림·시험 자료 연결 · 카이 루트 전차병 ${Object.keys(cai.people).length}명 · 지양 ${avoid.length}명`);
