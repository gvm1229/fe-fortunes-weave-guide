import fs from 'node:fs';
import { SCR, REPO, readJson } from './lib.mjs';
const rows = readJson(`${SCR}/gen/review.json`);
const short = (s) => s.replace('content/data/', '').replace('assets/items/manifest.json', '물품 목록(manifest)').replace('yuphas gifts.json (liked lists of our characters)', 'yuphas 선호 목록').replace('yuphas data.json (our characters)', 'yuphas 인물 병종');
const KIND = { character: '인물', location: '장소', class: '병종', gift: '선물', meal: '음식', weapon: '무기', spell: '마법', material: '재료', fish: '물고기', ore: '광석', meat: '고기', consumable: '소모품', seal: '증서', other: '기타' };
const esc = (s) => String(s).replace(/\|/g, '\\|');
const table = (list) => ['| 한국어 | 영어 | 종류 | 쓰는 곳 | 이유 |', '|---|---|---|---|---|',
  ...list.sort((a, b) => (a.kind || '').localeCompare(b.kind || '') || a.ko.localeCompare(b.ko, 'ko')).map((r) => `| ${esc(r.ko)} | ${esc(r.en)} | ${KIND[r.kind] || r.kind} | ${esc([...new Set(r.usedIn.map(short))].join(', '))} | ${esc(r.why)} |`)].join('\n');
const temp = rows.filter((r) => r.wikiTemp && !/링크 없음|다름/.test(r.why));
const rest = rows.filter((r) => !temp.includes(r));
const md = `# 이름 검토 목록 (사용자 확인용)

만든 날: 2026-11-27 · 정본: [content/data/yuphas-names.json](../../content/data/yuphas-names.json) · 검사: \`node scripts/yuphas-links-check.mjs\`

이 목록은 화면에 나오지 않는다. 게임 화면에서 다른 이름을 보시면 알려 주시는 대로 이름표를 고친다(P09: 확인 안 된 것은 미확인으로 둔다).

- **임시 표기**: 한국어 팬 도감(fire-emblem-fortunes-weave.turam.dev)이 그 쪽에 "한국어: 임시 표기"라고 적은 이름. 게임 화면 이름인지 모른다.
- **미확인·못 맞춘 것**: 도감에 같은 제목이 없거나, 우리 표기와 도감 제목이 다르거나, yuphastemple에서 같은 영어 이름을 못 찾은 것. 링크가 없는 줄은 화면에서 한국어 이름만 보인다.
- "yuphas 선호 목록" = 인물 선호 선물·음식 목록(content/data/yuphas-characters.json)에만 나오는 이름.

## 1. 임시 표기 한국어 (${temp.length}개)

링크는 모두 열린다(응답 200). 한국어만 확인이 필요하다.

${table(temp)}

## 2. 미확인·못 맞춘 이름 (${rest.length}개)

${table(rest)}
`;
fs.mkdirSync(`${REPO}/docs/reference`, { recursive: true });
fs.writeFileSync(`${REPO}/docs/reference/name-review.md`, md);
console.log('temp', temp.length, 'rest', rest.length);
