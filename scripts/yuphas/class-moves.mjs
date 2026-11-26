// 병종별 이동 방식(보병·기마·비행·중갑) 표 content/data/yuphas-class-moves.json을 만든다.
// 원본: 작업 폴더의 yuphastemple data.json(DATA.classes[].type). 인물 머리의 병종 줄에 이동 아이콘을 붙이는 데만 쓴다(docs/yuphas-pages-teardown.md §1.6).
import fs from 'node:fs';
import { REPO, Y, createSlug } from './lib.mjs';
const D = Y('data.json').DATA;
const move = (type) => { const t = type.join(' '); const out = [/cavalry/.test(t) ? 'riding' : /flying/.test(t) ? 'flying' : 'infantry']; if (/armored/.test(t)) out.push('armor'); return out; };
const out = { note: 'scripts/yuphas/class-moves.mjs가 yuphastemple data.json에서 만든 표(병종 슬러그 → 이동 아이콘).', classes: Object.fromEntries(D.classes.map((c) => [createSlug(c.name), move(c.type || [])])) };
fs.writeFileSync(`${REPO}/content/data/yuphas-class-moves.json`, JSON.stringify(out, null, 1) + '\n');
console.log('병종', Object.keys(out.classes).length);
