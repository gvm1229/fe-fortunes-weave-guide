import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const routes = {카이:'kai',세오도라:'theodora',디트리히:'dietrich',레다:'leda','3부':'part3'};
const tokens = ['bg','rail','surface','surface-2','primary','secondary','secondary-soft','accent','text','muted','line'];
let css = '/* docs/design-spec.md §1에서 생성. npm run design:tokens */\n', count = 0;
for (const line of readFileSync('docs/design-spec.md','utf8').split('\n')) {
  const cells=line.split('|').slice(1,-1).map(s=>s.trim());
  const match=cells[0]?.match(/^(카이|세오도라|디트리히|레다|3부) (밝게|어둡게)$/);
  if(!match)continue;
  const route=routes[match[1]],dark=match[2]==='어둡게',values={};
  for(const [i,token] of tokens.entries()){
    const colors=cells[i+1].match(/#[A-Fa-f0-9]{6}/g);assert.ok(colors?.length,token);
    values[token]=colors[0];if(colors[1])values[token+'-fg']=colors[1];
  }
  // 지정되지 않은 rail-fg: 밝게는 primary-fg, 어둡게는 text.
  values['rail-fg']=dark?values.text:values['primary-fg'];
  css+=`${dark?'.dark ':''}[data-route="${route}"],html${dark?'.dark':':not(.dark)'} body:has(.app-shell[data-route="${route}"]){${Object.entries(values).map(([k,v])=>`--${k}:${v}`).join(';')}}\n`;count++;
}
assert.equal(count,10);writeFileSync('app/route-colors.css',css);console.log('명세 색상 10세트 생성');
