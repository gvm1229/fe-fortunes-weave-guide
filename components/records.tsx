import { GameText, imageName, classNamesByFile, namesInText } from './game-text';
import { createElement } from 'react';
import type { Tree } from '@/lib/content';
import { displayText } from '@/lib/display';
import weaponData from '@/content/data/weapon-buy-sources.json';
import { ReadMore } from './read-more';
import { GuideImage } from './image-viewer';
import { personPortrait } from '@/lib/portraits';
const itemNames=Object.fromEntries(Object.entries(weaponData.weapons).map(([id,item])=>[id,item.name]));
const labels:Record<string,string>={text:'내용',aliases:'다른 이름',people:'사용 인물',mapKey:'지도 표기',classes:'병종',next:'다음 목표',entryClass:'가입 병종',entryTier:'가입 단계',entryBasis:'가입 기준',pathNotes:'경로 안내',qualificationsOnly:'자격만 준비',optionalClasses:'선택 병종',role:'역할',reason:'이유',kind:'육성 구분',merge:'기준판',schedule:'운용 일정',floorLabel:'최소 준비',middleClass:'중급 병종',middleExam:'시험 기능',middleBy:'준비 기한',skillsBy:'기능 기한',part1Skills:'1부 기능',joinPlan:'합류 계획',joinTargetChapter:'영입 권장 장',supportStartChapter:'지원 준비 장',starts:'시작 시점',stops:'중단 시점',end:'종료 목표',queue:'봉사 순서',start:'시작 확인',carry:'이월 확인',boons:'축복',god:'신',level:'레벨',effect:'효과',name:'이름',place:'장소',method:'획득 방법',quantity:'수량',steps:'순서',warning:'주의',target:'목표',condition:'조건',users:'사용자',weapon:'무기',chapter:'장',items:'준비 항목',extras:'추가 비용',notes:'안내',afterScheduledSpend:'지출 뒤 여유',label:'항목',amount:'금액',gold:'골드',cost:'비용',renown:'명성',fame:'명성',sup:'지원',init:'가입 병종',localCondition:'추가 조건',prerequisite:'선행 조건',deadline:'기한',dates:'날짜',roleReason:'역할 이유',preparation:'준비',aim:'목표',recruitment:'영입',pathMeaning:'경로의 뜻',usage:'운용',investmentByPhase:'투자 시기',usageByPhase:'부별 운용',fusion:'융합 역할',requirements:'필요 기능',skill:'기능',rank:'등급',priority:'우선순위',current:'현재',total:'합계',reserve:'여유금',support:'지원',renownGate:'명성 조건',routeDetails:'루트별 안내',search:'지도 검색어'};
const hidden=new Set(['source','sources','url','sourceType','reviewed','version','anchor','baseRoute','route','portrait','classIcon','icon','file','images','lowerMasteryRequired','joinIsPlanningTarget','floorRequired','sourceBasis']);
export function RecordRows({value,label}:{value:unknown;label:string}){
  const rows:{label:string;value:unknown}[]=[];
  function collect(v:unknown,title:string){
    if(v===null||v===undefined||v==='')return;
    if(Array.isArray(v)){
      if(!v.length)return;
      if(v.some(item=>item&&typeof item==='object'&&!('$prose' in item)))v.forEach((item,i)=>collect(item,`${title} ${i+1}`));
      else rows.push({label:title,value:v});
    }else if(typeof v==='object'&&!('$prose' in v)){
      for(const [key,child]of Object.entries(v))if(!hidden.has(key)){
        if(['sup','support','fame','renown'].includes(key)&&String(child).trim()==='0')continue;
        const displayValue=key==='entryTier'?({0:'초급 전',1:'초급',2:'중급',3:'상급'} as Record<string,string>)[String(child)]:child;
        collect(displayValue,key==='text'?title:labels[key]||(/^[123]$/.test(key)?`${title} ${key}부`:/[가-힣]/.test(key)?key:title));
      }
    }else rows.push({label:title,value:v});
  }
  collect(value,label);
  return rows.map((row,i)=><tr key={i}><th scope="row"><GameText text={row.label}/></th><td><ReadMore><Records value={row.value} disclose={false}/></ReadMore></td></tr>);
}
export function Records({value,disclose=true}:{value:unknown;disclose?:boolean}){return recordNode(value,disclose,new Set(),false);}
/** 한 칸·한 항목 안에서는 같은 얼굴 그림을 한 번만 붙인다. 모음은 그릴 때마다 새로 만든다. */
function recordNode(value:unknown,disclose:boolean,seen:Set<string>,inCell:boolean):React.ReactNode{
  if(value===null||value===undefined||value==='')return null;
  if(typeof value==='boolean')return <span>{value?'예':'아니요'}</span>;
  if(typeof value!=='object'){const t=displayText(itemNames[String(value)]||String(value));return <span><GameText text={t} withSkills skip={textSkip(t,seen)}/></span>;}
  if('$prose' in value){const parts=(value as {$prose:string[]}).$prose,joined=parts.map(displayText).join(' '),content=parts.length>2?<ul>{parts.map((s,i)=>{const t=displayText(s);return <li key={i}><GameText text={t} withSkills skip={textSkip(t,seen)}/></li>;})}</ul>:<p><GameText text={joined} withSkills skip={textSkip(joined,seen)}/></p>;return disclose?<ReadMore>{content}</ReadMore>:content;}
  if(Array.isArray(value))return <ul className="record-list">{value.map((v,i)=><li key={i}>{recordNode(v,disclose,inCell?seen:new Set(),true)}</li>)}</ul>;
  return <table className="records"><tbody>{Object.entries(value).filter(([k,v])=>!hidden.has(k)&&v!==null&&v!==undefined&&(!Array.isArray(v)||v.length>0)).map(([k,v])=><tr key={k}><th scope="row">{labels[k]||(/^[123]$/.test(k)?`${k}부`:/[가-힣]/.test(k)?k:'추가 안내')}</th><td><ReadMore>{recordNode(v,false,inCell?seen:new Set(),true)}</ReadMore></td></tr>)}</tbody></table>;
}
const blockTags=new Set(['h2','h3','h4','h5','li','p','td','th','summary','figcaption']);
function namesIn(n:Tree,acc:Set<string>):Set<string>{if(typeof n!=='string'){if(n.tag==='img'&&n.attrs.src&&/\/(portraits|classes)\//.test(n.attrs.src)){const name=imageName(n.attrs.src,n.attrs.alt);if(name)acc.add(name);}if(n.tag==='button'){const t=flat(n.children);if(classNamesByFile.size&&[...classNamesByFile.values()].includes(t))acc.add(t);}n.children.forEach(c=>namesIn(c,acc));}return acc;}
function flat(nodes:Tree[]):string{return nodes.map(n=>typeof n==='string'?n:flat(n.children)).join('');}
/** 블록 안에 이미 있는 얼굴·병종 그림의 이름을 모아 글 속 그림을 다시 붙이지 않는다. */
/** 가장 바깥 묶음(표 칸·목록 항목·문단·제목)마다 이름 모음을 새로 만들고, 그 안의 묶음은 같은 모음을 함께 쓴다. */
function blockSkip(n:Exclude<Tree,string>,skip:Set<string>,inBlock:boolean):Set<string>{if(!blockTags.has(n.tag)&&!n.attrs['data-face-row'])return skip;return namesIn(n,inBlock?skip:new Set(skip));}
const isBlock=(n:Exclude<Tree,string>)=>blockTags.has(n.tag)||!!n.attrs['data-face-row'];
/** 글 조각을 그릴 때 이미 그림이 붙은 이름을 같은 묶음에서 다시 붙이지 않는다. */
function textSkip(text:string,skip:Set<string>):ReadonlySet<string>{const before=new Set(skip);namesInText(text).forEach(name=>skip.add(name));return before;}
const allowed=new Set(['nav','section','article','div','p','span','strong','b','em','small','h2','h3','h4','h5','ul','ol','li','dl','dt','dd','table','caption','colgroup','col','thead','tbody','tfoot','tr','th','td','figure','figcaption','br','details','summary','a','img']);
export function Semantic({nodes,route,part,onDoc,onSpell,hidePortraits=false,hideGodPortraits=false,changesOnly=false}:{nodes:Tree[];route:string;part:string;onDoc?:(url:string)=>void;onSpell?:(id:string)=>void;hidePortraits?:boolean;hideGodPortraits?:boolean;changesOnly?:boolean}){
  const seen=new Set<string>();
  const enrichSkills=!JSON.stringify(nodes).includes("/skills/");
  function render(n:Tree,i:number,parentSkip:Set<string>=new Set(),inBlock=false):React.ReactNode {
    if(typeof n==='string')return <GameText key={i} text={displayText(n)} part={part} withSkills={enrichSkills} skip={textSkip(displayText(n),parentSkip)}/>;
    const a=n.attrs,skip=blockSkip(n,parentSkip,inBlock),sub=(c:Tree,j:number)=>render(c,j,skip,inBlock||isBlock(n));
    if(changesOnly&&a['data-change']==='keep')return null;
    if(a['data-shared-notice'])return null;
    const children=()=>n.children.filter(child=>!['table','thead','tbody','tfoot','tr','colgroup'].includes(n.tag)||typeof child!=='string'||child.trim()).map(sub);
    if(a['data-face-list'])return <ReadMore key={i}><ul data-face-list>{children()}</ul></ReadMore>;
    if(a['data-readable-group'])return <ReadMore key={i}>{a['data-readable-group']==='prose'?createElement(n.tag,{},children()):children()}</ReadMore>;
    if(!inBlock&&(n.tag==='tr'||isBlock(n)))seen.clear();
    if(n.tag==='br')return <br key={i}/>;
    if(n.tag==='col')return <col key={i}/>;
    for(const key of ['data-weekly-route','data-buying-route','data-material-route'])if(a[key]&&route!=='all'&&a[key]!==(part==='2'?'war':part==='3'?'part3':route))return null;
    for(const key of ['data-route','data-roster-route','data-modal-routes'])if(a[key]&&route!=='all'&&!a[key].split(' ').includes(route))return null;
    for(const key of ['data-goal-phase','data-modal-parts'])if(a[key]&&!a[key].split(' ').includes(part))return null;
    if(a['data-modal-all-only']&&route!=='all')return null;
    if(n.tag==='img'){
      if(!a.src||hidePortraits&&a.src.includes('/portraits/')||hideGodPortraits&&a.src.includes('/gods/'))return null;
      if(a.src.includes('/gods/')||a.src.includes('/portraits/')){if(seen.has(a.src))return null;seen.add(a.src);}
      if(!/\/(portraits|gods|classes|skills|weapons|traits)\//.test(a.src))return <GuideImage key={i} src={`/${a.src.replace(/^\/+/, '')}`} alt={a.alt}/>;
      return <img key={i} src={`/${personPortrait(a.src,part,a.alt?.replace(/ 초상화.*$/,''))}`} alt={a.alt||''} title={a.title} loading="lazy" className={a.src.includes('/classes/')||a.src.includes('/skills/')||a.src.includes('/traits/')?'inline-icon':a.src.includes('/gods/')?'god-portrait':'media-portrait'}/>;
    }
    if(n.tag==='a'&&n.children.some(child=>typeof child!=='string'&&child.tag==='img'&&!/\/(portraits|gods|classes|skills|weapons|traits)\//.test(child.attrs.src||'')))return <span key={i}>{n.children.map(sub)}</span>;
    if(n.tag==='button'){
      const url=a['data-reference-url']||a['data-unit-review']||(a['data-class-slug']?`notes/classes/${a['data-class-slug']}.md`:undefined);
      if(url||a['data-spell-jump'])return <button key={i} className="text-link" title={a.title} onClick={()=>a['data-spell-jump']?onSpell?.(a['data-spell-jump']):onDoc?.(url!)}>{children()}</button>;
      return <span key={i}>{children()}</span>;
    }
    if(n.tag==='a'&&a.href){if(/^https?:/.test(a.href))return <a key={i} href={a.href} target="_blank" rel="noreferrer">{n.children.map(sub)}</a>;return <button key={i} className="text-link" onClick={()=>onDoc?.(a.href!)}>{n.children.map(sub)}</button>;}
    return createElement(allowed.has(n.tag)?n.tag:'div',{key:i,...Object.fromEntries(Object.entries(a).filter(([key])=>key.startsWith('data-')||['id','title','aria-label'].includes(key))),...(a.colspan?{colSpan:Number(a.colspan)}:{}),...(a.rowspan?{rowSpan:Number(a.rowspan)}:{})},children());
  }
  return <div className="semantic">{nodes.map((n,i)=>render(n,i))}</div>;
}
