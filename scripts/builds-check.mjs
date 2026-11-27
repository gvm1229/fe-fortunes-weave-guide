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

// 4. 저장·가져오기(lib/check-state.ts): 예전 파일·체크 기록·내 상태를 깨지 않고, 육성 기록을 지우지 않는다.
{ const { validateChecks, validateBuilds, sanitizeBuilds, nextBuilds } = await import('../lib/check-state.ts');
  const base = { schemaVersion: 1, revision: 3, checks: { a: true, 'kai-1': false }, status: { boons: {}, gods: { 칼라: 2 } } };
  const good = { theodora: { loretta: { level: 20, classId: 'wing-soldier', skills: { sword: 'C', spear: 'D+', flying: 'D' }, note: '창술 C+ 되면 시험' }, theodora: { level: 22, classId: 'noble' } }, part3: { cai: { skills: { white_magic: 'S+' } } } };
  // (가) builds 없는 예전 파일 통과·결과에 builds 없음. builds: {}도 없는 것과 같다(가져오기에서 지금 기록 유지).
  for (const file of [base, { ...base, builds: {} }, { ...base, builds: { theodora: {} } }]) assert.ok(!('builds' in validateChecks(file, undefined, true)), '[U72] 빈·없는 builds는 결과에 없음');
  // (나) 올바른 builds 통과·그대로.
  assert.deepEqual(validateChecks({ ...base, builds: good }, undefined, true).builds, good, '[U72] 올바른 builds 그대로');
  // 모르는 인물·병종 슬러그는 가져오기에서도 거절하지 않고 보관한다(자료가 바뀐 뒤 내가 내보낸 파일을 다시 가져올 수 있게, Fable 검토 21 지적 6).
  const renamed = { theodora: { nobody: { level: 1 }, loretta: { classId: 'wing-solder' } } };
  assert.deepEqual(validateChecks({ ...base, builds: renamed }, undefined, true).builds, renamed, '[U72] 모르는 인물·병종 보관');
  // (다) 틀린 값 각각 거절(가져오기 엄격 검사).
  const bad = [{ nowhere: {} }, { theodora: { loretta: { classId: 5 } } }, { theodora: { loretta: { level: 0 } } }, { theodora: { loretta: { level: 100 } } }, { theodora: { loretta: { level: 1.5 } } },
    { theodora: { loretta: { skills: { sword: 'F' } } } }, { theodora: { loretta: { skills: { lance: 'C' } } } }, { theodora: { loretta: { note: 'x'.repeat(201) } } }, { theodora: { loretta: { stats: {} } } }, [], 'x'];
  for (const b of bad) assert.throws(() => validateChecks({ ...base, builds: b }, undefined, true), undefined, '[U72] 거절 ' + JSON.stringify(b).slice(0, 60));
  assert.throws(() => validateBuilds({ theodora: { loretta: { level: 0 } } }), /theodora › loretta의 레벨은 1~99 정수여야 합니다/, '[U72] 이유를 말하는 오류');
  // (라) checks·status 결과는 builds를 더해도 같다.
  const a = validateChecks(base), b2 = validateChecks({ ...base, builds: good }, undefined, true);
  assert.deepEqual([b2.checks, b2.status, b2.revision], [a.checks, a.status, a.revision], '[U72] 체크·내 상태 결과 같음');
  // (마) 저장소 읽기(strict 아님)는 던지지 않고 모양만 고친다. 모르는 인물·병종은 보관(Fable 검토 2).
  const stored = { ...base, builds: { theodora: { 'renamed-slug': { level: 30, classId: 'unknown-class' }, loretta: { level: 0, note: 5, skills: { sword: 'C', spear: 3, lance: 'C', axe: 'F' } }, diego: { note: '  ' + 'x'.repeat(205) + ' ' } }, cai: 'x', nowhere: { loretta: { level: 3 } } } };
  const read = validateChecks(stored);
  assert.deepEqual(read.builds, { theodora: { 'renamed-slug': { level: 30, classId: 'unknown-class' }, loretta: { skills: { sword: 'C' } }, diego: { note: 'x'.repeat(200) } } }, '[U72] 저장소 읽기 모양만 고침·모르는 인물·병종 보관·모르는 루트·숙련·등급 버림·메모 200자');
  assert.equal(sanitizeBuilds('x'), undefined);
  // 저장소 읽기 결과(= 내보내기 파일)를 그대로 가져오면 통과한다.
  assert.deepEqual(validateChecks(JSON.parse(JSON.stringify(read)), undefined, true).builds, read.builds, '[U72] 저장소 읽기 결과 다시 가져오기');
  // 가져오기는 메모 앞뒤 빈칸을 지운다(서랍 저장과 같게, Fable 재검토 F).
  assert.equal(validateChecks({ ...base, builds: { leda: { loretta: { note: '  메모 ' } } } }, undefined, true).builds.leda.loretta.note, '메모', '[U72] 가져오기 메모 다듬기');
  // 읽은 뒤 다른 인물을 고쳐도 모르는 항목이 남는다(다음 저장 때 지워지지 않음).
  const after = nextBuilds(read.builds, 'theodora', 'loretta', { level: 21 });
  assert.deepEqual(after.theodora['renamed-slug'], { level: 30, classId: 'unknown-class' }, '[U72] 고쳐도 모르는 항목 남음');
  // (바) nextBuilds: 빈 칸·숙련·인물·루트 지움, null이면 인물 지움, 모두 비면 undefined({}를 남기지 않음).
  assert.deepEqual(nextBuilds(undefined, 'leda', 'loretta', { level: 5, skills: { sword: 'C' } }), { leda: { loretta: { level: 5, skills: { sword: 'C' } } } });
  assert.deepEqual(nextBuilds({ leda: { loretta: { level: 5, skills: { sword: 'C' } } } }, 'leda', 'loretta', { skills: { sword: undefined }, note: '' }), { leda: { loretta: { level: 5 } } });
  assert.equal(nextBuilds({ leda: { loretta: { level: 5 } } }, 'leda', 'loretta', { level: undefined }), undefined, '[U72] 모두 비면 builds 없음');
  assert.equal(nextBuilds({ leda: { loretta: { level: 5 } } }, 'leda', 'loretta', null), undefined, '[U72] null이면 인물 지움');
  assert.deepEqual(nextBuilds({ leda: { a: { level: 5 } }, cai: { b: { level: 2 } } }, 'leda', 'a', null), { cai: { b: { level: 2 } } });
}

// 5. AI용 복사 글(lib/build-text.ts): 고정 예시 한 명의 글 전체.
{ const { buildText } = await import('../lib/build-text.ts');
  const text = buildText({ routeEn: 'Theodora route', routeKo: '세오도라', date: '2026-11-27', rows: [{ en: 'Loretta', ko: '로레타', level: 20, cls: { en: 'Wing Soldier', ko: '천익병' }, skills: [['Sword', 'C'], ['Spear', 'D+']], boons: ['Sword', 'Spear', 'Flying'], banes: ['Armor'], finalClasses: ['홀리 랜서'], needs: ['창술 B'], note: '창술 C+ 되면 시험' }] });
  assert.equal(text, "Fire Emblem: Fortune's Weave — Theodora route (세오도라) builds, exported 2026-11-27\nSkill ranks: E < E+ < D < D+ < C < C+ < B < B+ < A < A+ < S < S+\n\nLoretta (로레타) | Lv 20 | Wing Soldier (천익병)\n  skills: Sword C, Spear D+ | boon: Sword, Spear, Flying | bane: Armor\n  plan: final class 홀리 랜서 | needs: 창술 B\n  note: 창술 C+ 되면 시험\n", '[U72] AI용 복사 글'); }

console.log('통과: 병종 60개·인물 62명 병종 조건·시험 단계 표·육성 기록 저장·가져오기·AI용 복사 글');
