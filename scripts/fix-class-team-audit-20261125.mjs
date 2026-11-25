// 2026-11-25 병종·팀 자료 사실 검사 반영(한 번만 실행). 근거: docs/fact-audit-2026-11-25.md 「병종·팀 자료」
// 각 항목은 한국어 도감(turam.dev)·GameWith(또는 yuphastemple·altema) 두 곳 이상이 같은 값이다.
import { readFileSync, writeFileSync } from 'node:fs';
const fail = m => { throw new Error(m); };
const load = p => { const raw = readFileSync(p, 'utf8'); return { p, raw, j: JSON.parse(raw) }; };
const save = ({ p, raw, j }) => { const nl = raw.includes('\r\n') ? '\r\n' : '\n'; const ind = /^\{\r?\n {2}"/.test(raw) ? 2 : 0; writeFileSync(p, JSON.stringify(j, null, ind).replace(/\n/g, nl) + (raw.endsWith('\n') || raw.endsWith('\r\n') ? nl : '')); };
const log = [];

const CD = load('content/data/class-details.json'); const C = CD.j.classes;
const skill = (cls, name) => C[cls].skills.find(s => s.name === name) || fail(`${cls} ${name}`);
Object.assign(skill('드래곤 마스터', '전투 기술 장비 +1'), { name: '전투 기술 장비 +2', effect: '장비 가능한 전투 기술 수 +2.' });
Object.assign(skill('배틀 마스터', '전투 기술 장비 +2'), { name: '전투 기술 장비 +3', effect: '장비 가능한 전투 기술 수 +3.' });
C['그레이트 나이트'].skills.push({ name: '후공 수비 +5', effect: '후공 전투 시 물리 내성 +5.', originalName: 'Defense +5 (defending)', originalEffect: 'Grants physical resistance +5 when attacked first.' });
C['발키리움'].skills.push({ name: '마법 명중 +5', effect: '마법 장비 시 명중 +5.', originalName: 'Magic Hit +5', originalEffect: 'When using magic, grants Hit +5.' });
{ const m = C['포레스트 나이트'].master[0]; if (m.originalName !== "Hunter's Eye") fail('forest master'); m.name = '사냥꾼의 눈'; }
C['칼라드리오스'].required = '기마술 D, 흑마술 B'; C['칼라드리오스'].conditionNotes = [];
for (const k of ['드래곤 마스터', '배틀 마스터']) if (C[k].conflicts) { delete C[k].conflicts; }
save(CD); log.push('병종 6곳: 드래곤 마스터 +2·배틀 마스터 +3·그레이트 나이트 후공 수비 +5·발키리움 마법 명중 +5·포레스트 나이트 사냥꾼의 눈·칼라드리오스 기마술 D+흑마술 B');

const SW = load('content/data/team-signature-weapons.json');
(SW.j.items['qiankun-circles'] || fail('qiankun')).rank = 'C';
(SW.j.items['guandao'] || fail('guandao')).rank = 'B';
save(SW); log.push('건곤권 격투술 C(검술 D도 필요)·언월도 창술 B(검술 D도 필요)');

const SL = load('content/data/team-signature-learning.json');
if (!SL.j.people['아나톨리아']?.selectedSpells?.excalibur) fail('anatolia excalibur'); delete SL.j.people['아나톨리아'].selectedSpells.excalibur;
save(SL); log.push('아나톨리아 엑스칼리버 습득 삭제(트론 A가 마지막)');

const WH = load('content/data/team-white-highlights.json'); const S = WH.j.spells;
{ const x = S['세오도라'].find(s => s.name === '매직 실드' && s.rank === 'A') || fail('theo ward'); x.name = '배리어'; }
{ const x = S['오르헬'].find(s => s.name === '엔젤') || fail('orhel seraphim'); x.rank = 'D'; }
{ const x = S['오르헬'].find(s => s.name === '스타라이트') || fail('orhel starlight'); x.rank = 'E'; }
save(WH); log.push('세오도라 백마술 A 배리어·오르헬 엔젤 D·스타라이트 E(처음부터 가짐)');
console.log(log.join('\n'));
