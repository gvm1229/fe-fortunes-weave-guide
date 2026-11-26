// 인물 육성 기록 검사(2026-11-27 사용자 요청, [U72]). 브라우저 없이 Node만 쓴다(배포 관문 scripts/release.mjs DATA).
// 1) 병종 고르기 창 자료 content/data/yuphas-classes.json: 60개·증서별 개수·그림 파일·인물별로 고를 수 있는 병종(yuphastemple 창 규칙).
// 2) 준비 탭 시험 단계가 같은 증서 표를 읽는지.
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { allowedFor } from '../lib/class-rules.ts';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const data = read('content/data/yuphas-classes.json');
const people = read('content/data/yuphas-characters.json').characters;

// 1. 병종 60개(God·DLC 인물 전용 4개 제외), 슬러그 유일, 증서별 개수 2/5/12/16/1/16/8.
assert.equal(data.classes.length, 60, '[U72] 병종 60개');
assert.equal(new Set(data.classes.map((c) => c.slug)).size, 60, '[U72] 병종 슬러그 유일');
const by = {}; for (const c of data.classes) by[c.license] = (by[c.license] || 0) + 1;
assert.deepEqual(by, { default: 2, beginner: 5, specialty: 12, advanced: 16, elephant: 1, master: 16, divine: 8 }, '[U72] 증서별 병종 수');
for (const c of data.classes) {
  for (const g of c.gender ? [c.gender] : ['female', 'male']) assert.ok(existsSync(`public/yuphas/classes/${g}/${c.slug}.webp`), `[U72] ${c.slug} ${g} 그림`);
  assert.ok(['infantry', 'ranged', 'magic', 'armor', 'riding'].includes(c.column), `[U72] ${c.slug} 열 ${c.column}`);
  assert.equal(typeof c.mounted, 'boolean', `[U72] ${c.slug} mounted`);
}
// 2. 인물 62명: 고를 수 있는 병종 1개 이상·고유 병종 포함, 남성에 여성 전용 없음, 못 타는 인물에 기마·비행 없음.
assert.equal(Object.keys(data.characters).length, 62, '[U72] 인물 62명');
for (const [slug, ch] of Object.entries(data.characters)) {
  const list = allowedFor(data.classes, ch), slugs = list.map((c) => c.slug);
  assert.ok(list.length > 0 && slugs.includes(ch.unique), `[U72] ${slug} 고유 병종 ${ch.unique}`);
  assert.equal(list.filter((c) => c.license === 'default').length, 1, `[U72] ${slug} 고유 병종 하나`);
  if (ch.gender === 'male') assert.ok(!slugs.includes('wing-soldier') && !slugs.includes('celestial-trooper'), `[U72] ${slug} 남성에 여성 전용 병종`);
  if (ch.noRide) assert.ok(!list.some((c) => c.mounted), `[U72] ${slug} 못 타는 인물에 기마·비행 병종`);
  assert.equal(list.length, ch.noRide ? list.length : (ch.gender === 'male' ? 57 : 59), `[U72] ${slug} 병종 수(yuphastemple 창 실측: 여성 59·남성 57)`);
}
assert.deepEqual(Object.entries(data.characters).filter(([, v]) => v.noRide).map(([k]) => k).sort(), ['goliath', 'orchel'], '[U72] 못 타는 인물');
assert.ok(Object.values(people).every((p) => data.characters[p.slug]), '[U72] yuphas-characters 인물 모두');
// 3. 준비 탭 시험 단계는 이 증서 표를 읽는다(두 곳의 값이 어긋나지 않게, Fable 검토 10).
{ const prep = readFileSync('lib/prep.ts', 'utf8'); assert.ok(prep.includes('classData.licenses') && !/level: 5, renown: 1/.test(prep), '[U72] 준비 탭 시험 단계 = yuphas-classes.json licenses'); }
assert.deepEqual(data.licenses.filter((l) => l.level != null).map((l) => [l.id, l.level, l.renown]), [['beginner', 5, 1], ['specialty', 20, 4], ['advanced', 35, 8], ['elephant', 35, null], ['master', 45, null], ['divine', 45, null]], '[U72] 증서 레벨·명성(yuphastemple 창 머리)');

console.log('통과: 병종 60개·인물 62명 병종 조건·시험 단계 표');
