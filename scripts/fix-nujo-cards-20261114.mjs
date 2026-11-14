// 검토 7 M1: 누조 인물 카드가 6·10·11장 즉시 영입·궁술 육성을 권하던 자료를 12장 영입만으로 바꾼다.
import { readFileSync, writeFileSync as w0 } from 'node:fs';
const writeFileSync = (p, d) => { for (let k = 0; k < 40; k++) { try { return w0(p, d); } catch (e) { if (!['UNKNOWN', 'EBUSY', 'EPERM'].includes(e.code)) throw e; const t = Date.now(); while (Date.now() - t < 250) {} } } return w0(p, d); };
const edit = (path, fn) => { const raw = readFileSync(path, 'utf8'), j = JSON.parse(raw); fn(j); const nl = raw.includes('\r\n') ? '\r\n' : '\n', ind = raw.match(/\n( +)"/)?.[1].length || 0; writeFileSync(path, JSON.stringify(j, null, ind).replace(/\n/g, nl) + (raw.endsWith('\n') ? nl : '')); };
const cond = { theodora: '명성 6 · 지원 1 · 철의 활 3', dietrich: '명성 9 · 지원 1 · 철의 활 2', cai: '명성 6 · 지원 2 · 철의 활 3' };
const reason = '선더 소드 지참품 확보(12장 영입) · 투자 없음';
const plan = r => `12장 · ${cond[r]} · 지참품의 선더 소드 확인 뒤 영입`;
edit('content/data/unit-readiness.json', j => {
  for (const r of Object.keys(cond)) {
    const u = j.routes[r]['누조']; if (!u) throw new Error('readiness ' + r);
    Object.assign(u, {
      kind: '보존·수집', merge: '최종 성장 자료 아님 · 선더 소드 지참품', reason,
      joinTargetChapter: 12, joinPlan: plan(r),
      joinSteps: [`12장에 ${cond[r]}을 갖추고 지참품의 선더 소드를 확인한 뒤 스카우트`, '12장 전에 영입하면 선더 소드가 없다 · 일찍 영입하지 않는다'],
      schedule: '영입만 · 출격·시험·훈련 없음', floorRequired: false, floorLabel: '영입만 · 육성 없음',
      middleClass: null, middleExam: null, middleBy: null, skillsBy: null, part1Skills: null, growthClass: null, battleClass: null,
      starts: { 1: '12장 영입 뒤 지참품의 선더 소드 확인', 2: '투자 없음', 3: '투자 없음' },
      stops: { 1: '출격·시험·훈련 없음', 2: '출격·시험·훈련 없음', 3: '출격·시험·훈련 없음' },
      investmentLane: '보존·수집',
    });
    if (u.investmentLaneByPhase) u.investmentLaneByPhase = { 1: '보존·수집', 2: '보존·수집', 3: '보존·수집' };
    if (u.scheduleByPhase) u.scheduleByPhase = { 1: '영입만 · 출격·시험·훈련 없음', 2: '투자 없음', 3: '투자 없음' };
  }
});
edit('content/data/training-priorities.json', j => {
  for (const r of Object.keys(cond)) { const t = j.routes[r]['누조']; for (const p of ['1', '2', '3']) t[p] = { goals: [], note: '영입만 한다. 경험치·훈련·시험에 투자하지 않는다.', investmentGate: '투자 없음' }; }
});
edit('content/data/roster-selection.json', j => {
  for (const r of ['theodora', 'dietrich']) { const p = j.routes[r].people['누조']; p.roles = { 1: '수집', 2: '수집', 3: '수집' }; p.reasons = { 1: reason, 2: reason, 3: reason }; p.recruitDecision = plan(r); p.investmentByPhase = { 1: '투자 없음', 2: '투자 없음', 3: '투자 없음' }; }
});
edit('content/character-copy.json', j => {
  j.reasons['누조'] = '선더 소드를 들고 오므로 네 루트 모두 12장에 영입합니다. 출격·훈련·시험에는 쓰지 않습니다.';
  for (const k of Object.keys(j.routeReasons)) if (k.endsWith(':누조')) delete j.routeReasons[k];
});
console.log('누조 카드 자료 정리');
