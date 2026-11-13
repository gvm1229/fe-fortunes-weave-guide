import people from '@/content/data/people-display.json';
import classes from '@/assets/classes/manifest.json';
import { personPortrait } from '@/lib/portraits';
import items from '@/assets/items/manifest.json';
import { Fragment } from 'react';
import { Heart, Sparkles, Coins, Fish, Gem, Beef, Gift, Sword, Package } from 'lucide-react';
const symbols={bond:Heart,renown:Sparkles,gold:Coins,fish:Fish,ore:Gem,meat:Beef,gift:Gift};
export function GameIcon({kind}:{kind:keyof typeof symbols}) {
  const Icon=symbols[kind];
  return <Icon className={`game-icon game-icon-${kind}`} size={22} aria-hidden="true"/>;
}
const skills:Record<string,string>={'검술':'sword','창술':'lance','도끼술':'axe','궁술':'bow','격투술':'brawl','지휘술':'authority','기마술':'riding','비행술':'flying','중갑술':'armor','중장술':'armor','보병술':'infantry','검':'sword','창':'lance','도끼':'axe','활':'bow','격투':'brawl','흑마술':'black-magic','백마술':'white-magic','지휘':'authority','기마':'riding','비행':'flying','중갑':'armor','보병':'infantry'};
const skillNames='검술|창술|도끼술|궁술|격투술|지휘술|기마술|비행술|중갑술|중장술|보병술|흑마술|백마술';
const rank=String.raw`\s*[SABCDE]\+?(?:\s*→\s*[SABCDE]\+?)?`;
const materials='라돈 잉어|라돈 꼬치고기|반짝반짝어|물고기|생선|꼬치고기|고기|자철광석|철광석|은광석|금광석|광석|옥강|뇌석|선물';
const count=String.raw`(?:\s*[×x]\s*\d+|\s*\d+(?:개|마리))?`;
/** 그림이 붙는 말과 그 뒤의 값(지원 3, 명성 6, 1,000G, 검술 C, 라돈 꼬치고기 ×3)을 한 조각으로 잡는다. */
const basePattern=new RegExp(String.raw`(?:지원|유대)(?:\s*(?:Lv\.?\s*)?\d+|\s*[SABC](?![가-힣A-Za-z]))?|명성(?:\s*(?:Lv\.?\s*)?\d+)?|[\d,]+G|골드|(?:${materials})${count}|(?:${skillNames})(?:${rank})?|(?:흑마술|백마술|격투|지휘|기마|비행|중갑|보병|도끼|검|창|활)${rank}`,'g');
const portraits=people as Record<string,{portrait:string}>;
const classImages=classes.classes as Record<string,{file:string}>;
const names=[...Object.keys(portraits),...Object.keys(classImages)].sort((a,b)=>b.length-a.length);
type ItemEntry={file:string|null;kind:string;fallback?:string;aliases?:string[]};
/** 공식 물품 그림(assets/items/manifest.json). 게임은 종류·등급별 공용 그림을 쓴다. 별칭도 같은 그림으로 잡는다. */
const itemByName=new Map<string,ItemEntry>();
for(const [name,entry] of Object.entries((items as {items:Record<string,ItemEntry>}).items))for(const n of [name,...(entry.aliases||[])])if(n.length>=2&&!portraits[n]&&!classImages[n]&&!skills[n]&&!itemByName.has(n))itemByName.set(n,entry);
const escape=(n:string)=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/** 두 글자 물품 이름(로카·성수·루나 등)은 다른 낱말 속에서 잡히지 않게 한글 경계를 둔다. */
const itemPattern=Array.from(itemByName.keys()).sort((a,b)=>b.length-a.length).map(n=>(n.length<=2?`(?<![가-힣])${escape(n)}(?![가-힣])`:escape(n))+count).join('|');
const pattern=new RegExp('('+names.map(escape).join('|')+'|'+itemPattern+'|'+basePattern.source+')','g');
const itemNameRe=new RegExp('^('+Array.from(itemByName.keys()).sort((a,b)=>b.length-a.length).map(escape).join('|')+')([\\s\\S]*)$');
const fileName=(src:string)=>src.replace(/^\/+/,'').replace(/^assets\/portraits\/post-timeskip\//,'assets/portraits/');
export const portraitNames=new Map<string,string>(Object.entries(portraits).map(([name,v])=>[fileName(v.portrait),name]));
export const classNamesByFile=new Map<string,string>(Object.entries(classImages).map(([name,v])=>[fileName(v.file),name]));
/** 그림 경로·대체 글로 인물·병종 이름을 찾는다. 같은 묶음의 중복 그림을 막는 데 쓴다. */
export function imageName(src:string,alt?:string):string|undefined{const f=fileName(src);return portraitNames.get(f)||classNamesByFile.get(f)||(alt?alt.replace(/ (초상화|병종).*$/,'').trim():undefined)||undefined;}
/** 글에 나오는 인물·병종 이름(그림이 붙는 이름). */
export function namesInText(text:string):string[]{return text.split(pattern).filter(w=>w&&(portraits[w]||classImages[w]));}
type BadgeKind='bond'|'renown'|'gold'|'material'|'gift'|'skill'|'item'|'person'|'class';
/** 배지 하나: 그림 + 이름 + 값. 글은 원문 조각 그대로(이름·공백·값). */
function Badge({kind,icon,label,rest,className}:{kind:BadgeKind;icon:React.ReactNode;label:string;rest?:string;className?:string}){
  const space=rest?.match(/^\s*/)?.[0]||'',value=rest?.slice(space.length);
  return <span className={'game-badge'+(className?' '+className:'')} data-kind={kind}>{icon}<span className="badge-label">{label}</span>{space}{value&&<b className="badge-value">{value}</b>}</span>;
}
function classify(word:string):{kind:BadgeKind;icon:keyof typeof symbols|'skill';label:string;rest:string}|null{
  let m=word.match(/^(지원|유대)(.*)$/s);if(m)return {kind:'bond',icon:'bond',label:m[1],rest:m[2]};
  m=word.match(/^(명성)(.*)$/s);if(m)return {kind:'renown',icon:'renown',label:m[1],rest:m[2]};
  if(word==='골드'||/^[\d,]+G$/.test(word))return {kind:'gold',icon:'gold',label:word,rest:''};
  m=word.match(new RegExp(`^(${materials})(.*)$`,'s'));
  if(m){const label=m[1],icon:keyof typeof symbols=/^(라돈 잉어|라돈 꼬치고기|반짝반짝어|물고기|생선|꼬치고기)$/.test(label)?'fish':/광석$|^(옥강|뇌석)$/.test(label)?'ore':label==='고기'?'meat':'gift';return {kind:icon==='gift'?'gift':'material',icon,label,rest:m[2]};}
  m=word.match(/^(검술|창술|도끼술|궁술|격투술|지휘술|기마술|비행술|중갑술|중장술|보병술|흑마술|백마술|격투|지휘|기마|비행|중갑|보병|도끼|검|창|활)(.*)$/s);
  if(m&&skills[m[1]])return {kind:'skill',icon:'skill',label:m[1],rest:m[2]};
  return null;
}
export function GameText({text,withSkills=false,part='1',skip}:{text:string;withSkills?:boolean;part?:string;skip?:ReadonlySet<string>}) {
  const shown=new Set<string>();
  return <>{text.replaceAll('백마법','백마술').split(pattern).map((word,i)=>{
    if(!word)return null;
    if((portraits[word]||classImages[word])&&(skip?.has(word)||shown.has(word)))return classImages[word]&&!portraits[word]?<strong key={i}>{word}</strong>:word;
    if(portraits[word]||classImages[word])shown.add(word);
    if(portraits[word])return <Badge key={i} kind="person" className="named-person" icon={<img src={'/'+personPortrait(portraits[word].portrait,part,word)} alt="" loading="lazy"/>} label={word}/>;
    if(classImages[word])return <Badge key={i} kind="class" className="named-class" icon={<img src={'/'+classImages[word].file} alt="" loading="lazy"/>} label={word}/>;
    const it=word.match(itemNameRe);
    if(it){const entry=itemByName.get(it[1])!,kind=/^(fish|ore|meat|material)$/.test(entry.kind)?'material':entry.kind==='gift'?'gift':'item';
      const Fallback={gem:Gem,box:Package,sword:Sword,fish:Fish,ore:Gem,meat:Beef,gift:Gift,coin:Coins}[entry.fallback||'']||Package;
      return <Badge key={i} kind={kind} icon={entry.file?<img src={'/'+entry.file} alt="" loading="lazy" width={22} height={22}/>:<Fallback className="game-icon game-icon-item" size={22} aria-hidden="true"/>} label={it[1]} rest={it[2]}/>;}
    const c=classify(word);
    if(!c)return word;
    if(c.kind==='skill')return withSkills?<Badge key={i} kind="skill" icon={<img className="game-skill" src={`/assets/skills/${skills[c.label]}.webp`} alt="" loading="lazy"/>} label={c.label} rest={c.rest}/>:<Fragment key={i}>{word}</Fragment>;
    return <Badge key={i} kind={c.kind} icon={<GameIcon kind={c.icon as keyof typeof symbols}/>} label={c.label} rest={c.rest}/>;
  })}</>;
}
