import { Fragment, createElement } from 'react';
import type { Tree } from '@/lib/content';
import { displayText } from '@/lib/display';
import weaponData from '@/content/data/weapon-buy-sources.json';
const itemNames=Object.fromEntries(Object.entries(weaponData.weapons).map(([id,item])=>[id,item.name]));
const labels:Record<string,string>={text:'내용',classes:'병종',next:'다음 목표',entryClass:'가입 병종',entryTier:'가입 단계',entryBasis:'가입 기준',pathNotes:'경로 안내',qualificationsOnly:'자격만 준비',optionalClasses:'선택 병종',role:'역할',reason:'이유',kind:'육성 구분',merge:'기준판',schedule:'운용 일정',floorLabel:'최소 준비',middleClass:'중급 병종',middleExam:'시험 기능',middleBy:'준비 기한',skillsBy:'기능 기한',part1Skills:'1부 기능',joinPlan:'합류 계획',joinTargetChapter:'영입 권장 장',supportStartChapter:'지원 준비 장',starts:'시작 시점',stops:'중단 시점',end:'종료 목표',queue:'봉사 순서',start:'시작 확인',carry:'이월 확인',boons:'축복',god:'신',level:'레벨',effect:'효과',name:'이름',place:'장소',method:'획득 방법',quantity:'수량',steps:'순서',warning:'주의',target:'목표',condition:'조건',users:'사용자',weapon:'무기',chapter:'장',items:'준비 항목',extras:'추가 비용',notes:'안내',afterScheduledSpend:'지출 뒤 여유',label:'항목',amount:'금액',gold:'골드',cost:'비용',renown:'명성',fame:'명성',sup:'지원',init:'가입 병종',localCondition:'추가 조건',prerequisite:'선행 조건',deadline:'기한',dates:'날짜',roleReason:'역할 이유',preparation:'준비',aim:'목표',recruitment:'영입',pathMeaning:'경로의 뜻',usage:'운용',investmentByPhase:'투자 시기',usageByPhase:'부별 운용',fusion:'융합 역할',requirements:'필요 기능',skill:'기능',rank:'등급',priority:'우선순위',current:'현재',total:'합계',reserve:'여유금',support:'지원',renownGate:'명성 조건',routeDetails:'루트별 안내',search:'지도 검색어'};
const hidden=new Set(['source','sources','url','sourceType','reviewed','version','anchor','baseRoute','route','portrait','classIcon','icon','file','images','lowerMasteryRequired','joinIsPlanningTarget','floorRequired','sourceBasis']);
export function Records({value}:{value:unknown}){
  if(value===null||value===undefined||value==='')return null;
  if(typeof value==='boolean')return <span>{value?'예':'아니요'}</span>;
  if(typeof value!=='object')return <span>{displayText(itemNames[String(value)]||String(value))}</span>;
  if(Array.isArray(value))return <ul className="record-list">{value.map((v,i)=><li key={i}><Records value={v}/></li>)}</ul>;
  return <dl className="records">{Object.entries(value).filter(([k,v])=>!hidden.has(k)&&v!==null&&v!==undefined&&(!Array.isArray(v)||v.length>0)).map(([k,v])=><Fragment key={k}><dt>{labels[k]||(/^[123]$/.test(k)?`${k}부`:/[가-힣]/.test(k)?k:'추가 안내')}</dt><dd><Records value={v}/></dd></Fragment>)}</dl>;
}
const allowed=new Set(['section','article','div','p','span','strong','b','em','small','h2','h3','h4','h5','ul','ol','li','dl','dt','dd','table','thead','tbody','tr','th','td','figure','figcaption','br','details','summary','a','img']);
export function Semantic({nodes,route,part,onDoc,hidePortraits=false}:{nodes:Tree[];route:string;part:string;onDoc?:(url:string)=>void;hidePortraits?:boolean}){
  const seen=new Set<string>();
  function render(n:Tree,i:number):React.ReactNode {
    if(typeof n==='string')return displayText(n);
    const a=n.attrs;
    if(n.tag==='tr'||n.tag==='li')seen.clear();
    if(n.tag==='br')return <br key={i}/>;
    for(const key of ['data-weekly-route','data-material-route','data-route','data-roster-route','data-modal-routes'])if(a[key]&&route!=='all'&&!a[key].split(' ').includes(route))return null;
    for(const key of ['data-goal-phase','data-modal-parts'])if(a[key]&&!a[key].split(' ').includes(part))return null;
    if(a['data-modal-all-only']&&route!=='all')return null;
    if(n.tag==='img'){
      if(!a.src||hidePortraits&&a.src.includes('/portraits/'))return null;
      if(a.src.includes('/gods/')){if(seen.has(a.src))return null;seen.add(a.src);}
      return <img key={i} src={`/${a.src.replace(/^\/+/, '')}`} alt={a.alt||''} title={a.title} loading="lazy" className={a.src.includes('/classes/')||a.src.includes('/skills/')?'inline-icon':a.src.includes('/gods/')?'god-portrait':''}/>;
    }
    if(n.tag==='a'&&a.href){if(/^(https?:|#)/.test(a.href))return <a key={i} href={a.href} target={a.href.startsWith('http')?'_blank':undefined} rel="noreferrer">{n.children.map(render)}</a>;return <button key={i} className="text-link" onClick={()=>onDoc?.(a.href!)}>{n.children.map(render)}</button>;}
    return createElement(allowed.has(n.tag)?n.tag:'div',{key:i},n.children.map(render));
  }
  return <div className="semantic">{nodes.map(render)}</div>;
}
