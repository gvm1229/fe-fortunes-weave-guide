import people from '@/content/data/people-display.json';
import classes from '@/assets/classes/manifest.json';
import { personPortrait } from '@/lib/portraits';
import { Fragment } from 'react';
import { Heart, Sparkles, Coins, Fish, Gem, Beef, Gift } from 'lucide-react';
const symbols={bond:Heart,renown:Sparkles,gold:Coins,fish:Fish,ore:Gem,meat:Beef,gift:Gift};
export function GameIcon({kind}:{kind:keyof typeof symbols}) {
  const Icon=symbols[kind];
  return <Icon className={`game-icon game-icon-${kind}`} size={22} aria-hidden="true"/>;
}
const skills:Record<string,string>={'검술':'sword','창술':'lance','도끼술':'axe','궁술':'bow','격투술':'brawl','지휘술':'authority','기마술':'riding','비행술':'flying','중갑술':'armor','보병술':'infantry','검':'sword','창':'lance','도끼':'axe','활':'bow','격투':'brawl','흑마술':'black-magic','백마술':'white-magic','지휘':'authority','기마':'riding','비행':'flying','중갑':'armor','보병':'infantry'};
const basePattern=/(지원|유대|명성|[\d,]+G|골드|라돈 잉어|라돈 꼬치고기|반짝반짝어|물고기|생선|꼬치고기|고기|자철광석|철광석|은광석|금광석|광석|옥강|뇌석|선물|검술|창술|도끼술|궁술|격투술|지휘술|기마술|비행술|중갑술|보병술|흑마술|백마술|(?:흑마술|백마술|격투|지휘|기마|비행|중갑|보병|도끼|검|창|활)(?=\s*[SABCDE](?:\+)?))/g;
const portraits=people as Record<string,{portrait:string}>;
const classImages=classes.classes as Record<string,{file:string}>;
const names=[...Object.keys(portraits),...Object.keys(classImages)].sort((a,b)=>b.length-a.length);
const pattern=new RegExp('('+names.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+'|'+basePattern.source.slice(1,-1)+')','g');
const fileName=(src:string)=>src.replace(/^\/+/,'').replace(/^assets\/portraits\/post-timeskip\//,'assets/portraits/');
export const portraitNames=new Map<string,string>(Object.entries(portraits).map(([name,v])=>[fileName(v.portrait),name]));
export const classNamesByFile=new Map<string,string>(Object.entries(classImages).map(([name,v])=>[fileName(v.file),name]));
/** 그림 경로·대체 글로 인물·병종 이름을 찾는다. 같은 묶음의 중복 그림을 막는 데 쓴다. */
export function imageName(src:string,alt?:string):string|undefined{const f=fileName(src);return portraitNames.get(f)||classNamesByFile.get(f)||(alt?alt.replace(/ (초상화|병종).*$/,'').trim():undefined)||undefined;}
/** 글에 나오는 인물·병종 이름(그림이 붙는 이름). */
export function namesInText(text:string):string[]{return text.split(pattern).filter(w=>w&&(portraits[w]||classImages[w]));}
export function GameText({text,withSkills=false,part='1',skip}:{text:string;withSkills?:boolean;part?:string;skip?:ReadonlySet<string>}) {
  const shown=new Set<string>();
  return <>{text.replaceAll('백마법','백마술').split(pattern).map((word,i)=>{
    if(!word)return null;
    if((portraits[word]||classImages[word])&&(skip?.has(word)||shown.has(word)))return classImages[word]&&!portraits[word]?<strong key={i}>{word}</strong>:word;
    if(portraits[word]||classImages[word])shown.add(word);
    if(portraits[word])return <span className="named-person" key={i}><img src={'/'+personPortrait(portraits[word].portrait,part,word)} alt="" loading="lazy"/>{word}</span>;
    if(classImages[word])return <span className="named-class" key={i}><img src={'/'+classImages[word].file} alt="" loading="lazy"/><strong>{word}</strong></span>;
    if(withSkills&&skills[word])return <Fragment key={i}><img className="game-skill" src={`/assets/skills/${skills[word]}.webp`} alt="" loading="lazy"/>{word}</Fragment>;
    const kind=word==='지원'||word==='유대'?'bond':word==='명성'?'renown':word==='골드'||/^[\d,]+G$/.test(word)?'gold':/^(라돈 잉어|라돈 꼬치고기|반짝반짝어|물고기|생선|꼬치고기)$/.test(word)?'fish':/광석$|^(옥강|뇌석)$/.test(word)?'ore':/^고기$/.test(word)?'meat':word==='선물'?'gift':null;
    return kind?<Fragment key={i}><GameIcon kind={kind}/>{word}</Fragment>:word;
  })}</>;
}
