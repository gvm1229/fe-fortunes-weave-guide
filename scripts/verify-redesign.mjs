import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import { progressStage } from '../lib/progress.ts';

assert.equal(progressStage(0,0),'started');
assert.equal(progressStage(49,100),'started');
assert.equal(progressStage(50,100),'advancing');
assert.equal(progressStage(99,100),'advancing');
assert.equal(progressStage(100,100),'complete');
mkdirSync('.tmp',{recursive:true});
const source=readFileSync('components/game-text.tsx','utf8')
 .replace("import people from '@/content/data/people-display.json';",'const people='+readFileSync('content/data/people-display.json','utf8')+';')
 .replace("import classes from '@/assets/classes/manifest.json';",'const classes='+readFileSync('assets/classes/manifest.json','utf8')+';')
 .replace("import items from '@/assets/items/manifest.json';",'const items='+readFileSync('assets/items/manifest.json','utf8')+';')
 .replace("import { personPortrait } from '@/lib/portraits';",'const timeskip='+readFileSync('content/source/timeskip-portraits.json','utf8')+';'+readFileSync('lib/portraits.ts','utf8').split('export function personPortrait')[1].split('export const lordFiles')[0].replace(/^/, 'function personPortrait'));
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const file=resolve('.tmp/game-text-check.mjs');writeFileSync(file,compiled);
const {GameText}=await import(pathToFileURL(file));
const text='지원 3 · 명성 6 · 1,000G · 라돈 꼬치고기 · 반짝반짝어 · 옥강 · 뇌석 · 검술 C · 백마술 B';
const $=load(renderToStaticMarkup(createElement(GameText,{text,withSkills:true})),null,false);
assert.equal($.root().text(),text,'아이콘을 넣어도 원문 보존');
assert.equal($('.game-icon-bond').length,1);assert.equal($('.game-icon-renown').length,1);
assert.equal($('.game-icon-gold').length,1);
// 2026-11-14: 물고기·광석은 공식 물품 그림(assets/items)으로 바뀌었다. 종류는 재료(초록) 배지다.
assert.equal($('.game-badge[data-kind=material]').length,4,'꼬치고기·반짝반짝어·옥강·뇌석은 재료');assert.equal($('.game-icon-meat').length,0,'꼬치고기는 물고기');
assert.deepEqual($('img').map((_,e)=>$(e).attr('src')).get().filter(s=>s.includes('/skills/')),['/assets/skills/sword.webp','/assets/skills/white-magic.webp']);
assert.ok($('.game-badge[data-kind=material] img').get().every(e=>$(e).attr('src').startsWith('/assets/items/')),'재료는 공식 그림');
const sun=load(renderToStaticMarkup(createElement(GameText,{text:'태양 열매 10개 · 선더 소드 · 적극적'})),null,false);
assert.equal(sun.root().text(),'태양 열매 10개 · 선더 소드 · 적극적');assert.deepEqual(sun('.game-badge').map((_,e)=>sun(e).text()).get(),['태양 열매 10개','선더 소드'],'두 글자 이하 이름은 낱말 속에서 잡지 않는다');
console.log('통과: 진행률 경계·원문 보존·지원/명성/금화/물고기/광석/기능 아이콘');

const names=load(renderToStaticMarkup(createElement(GameText,{text:'세오도라·소피아 병사 경기병',part:'3'})),null,false);
assert.equal(names.root().text(),'세오도라·소피아 병사 경기병');
assert.equal(names('.named-person img').length,2);assert.equal(names('.named-class img').length,2);
assert.ok(names('.named-person img').map((_,e)=>names(e).attr('src')).get().every(src=>src.includes('post-timeskip')));
console.log('통과: 인물명·병종명 그림과 3부 초상화 시기');

const skipped=load(renderToStaticMarkup(createElement(GameText,{text:'시로코 학습표 · 시로코 경기병 · 경기병',skip:new Set(['시로코'])})),null,false);
assert.equal(skipped.root().text(),'시로코 학습표 · 시로코 경기병 · 경기병');
assert.equal(skipped('.named-person img').length,0,'skip 인물은 그림 없음');assert.equal(skipped('.named-class img').length,1,'같은 글 안 반복 병종은 그림 1개');
console.log('통과: 같은 묶음의 인물·병종 그림 중복 제거');

const badges=load(renderToStaticMarkup(createElement(GameText,{text:'지원 3 · 명성 6 · 1,000G · 검술 C · 라돈 꼬치고기 ×3 · 세오도라 가디언',withSkills:true})),null,false);
assert.equal(badges.root().text(),'지원 3 · 명성 6 · 1,000G · 검술 C · 라돈 꼬치고기 ×3 · 세오도라 가디언','배지도 원문 보존');
assert.deepEqual(badges('.game-badge').map((_,e)=>badges(e).text()).get(),['지원 3','명성 6','1,000G','검술 C','라돈 꼬치고기 ×3','세오도라','가디언']);
assert.deepEqual(badges('.game-badge').map((_,e)=>badges(e).attr('data-kind')).get(),['bond','renown','gold','skill','material','person','class']);
assert.equal(badges('.named-person.game-badge').length,1);assert.equal(badges('.named-class.game-badge').length,1);
console.log('통과: 그림이 붙는 말은 값과 함께 배지 하나');
