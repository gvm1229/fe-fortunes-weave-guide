'use client';
import { usePreference } from './preferences';
import { characterSummary, plainCharacterText } from '@/lib/character-summary';
import { displayText } from '@/lib/display';
import { GameText, GameIcon } from './game-text';
import { ClipboardCopy, Gift, Search } from 'lucide-react';
import { useState } from 'react';
import { buildText } from '@/lib/build-text';
import { classBySlug } from '@/lib/yuphas-classes';
import type { Person } from '@/lib/content';
import { CharacterHeader, YLink } from './yuphas';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useChecks } from './checks';
import type { BuildRoute } from '@/lib/check-state';
import { yuphasItem, giftUrl } from '@/lib/yuphas';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { isFinal25 } from '@/lib/final25';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
export type ClassInfo={file:string;tier:string;slug?:string;weapons?:string[];traits?:string[]};
const skillIcons:Record<string,string>={'검술':'sword','창술':'lance','도끼술':'axe','궁술':'bow','격투술':'brawl','지휘술':'authority','기마술':'riding','비행술':'flying','중갑술':'armor','중장술':'armor','보병술':'infantry','흑마술':'black-magic','백마술':'white-magic'};
const routeNames:Record<string,string>={theodora:'세오도라',leda:'레다',dietrich:'디트리히',cai:'카이',part3:'3부'};
const routeEn:Record<string,string>={theodora:'Theodora route',leda:'Leda route',dietrich:'Dietrich route',cai:'Cai route',part3:'Part 3'};
export function ClassPath({classes,manifest,onDoc}:{classes:string[];manifest:Record<string,ClassInfo>;onDoc?:(url:string)=>void}){return <ol className="class-path">{classes.map(c=><li key={c}><span className="game-badge" data-kind="class">{manifest[c]&&<img src={`/${manifest[c].file}`} alt="" loading="lazy"/>}{onDoc&&manifest[c]?.slug?<button className="text-link" onClick={()=>onDoc(`notes/classes/${manifest[c].slug}.md`)}>{c}</button>:<strong>{c}</strong>}</span><span className="role-chip">{manifest[c]?.tier||'단계 미확인'}</span></li>)}</ol>;}
function Skill({name,value}:{name:string;value?:string}){return <span className="skill-name game-badge" data-kind="skill">{skillIcons[name]&&<img className="game-skill" src={`/assets/skills/${skillIcons[name]}.webp`} alt="" loading="lazy"/>}{name}{value&&<> <b className="badge-value">{value}</b></>}</span>;}
function words(value:unknown):string{if(value===null||value===undefined)return '';if(typeof value==='string'||typeof value==='number')return String(value);if(Array.isArray(value))return value.map(words).filter(Boolean).join(' · ');if(typeof value==='object'&&'$prose' in value)return (value as {$prose:string[]}).$prose.join(' ');return '';}
const norm=(text:string)=>text.replace(/[\s·.,]/g,'');
/** 제목–설명 쌍. 앞 쌍이나 요약 표와 같은 설명은 버린다. */
function pairs(person:Person,part:string,summaryText:string[],classes:Record<string,ClassInfo>){
  const d=person.data,ready=(person.readiness&&typeof person.readiness==='object'?person.readiness:{}) as Record<string,unknown>,goal=(person.goal&&typeof person.goal==='object'?person.goal:{}) as Record<string,unknown>;
  const list:{title:string;lines:string[];keep?:boolean}[]=[];
  const add=(title:string,...lines:(string|undefined)[])=>{const kept=lines.map(l=>l?displayText(plainCharacterText(l)).trim():'').filter(Boolean);if(kept.length)list.push({title,lines:kept,keep:title.endsWith(' 시험')});};
  /** 묶은 쌍 안의 줄 이름표("가입 병종: …"). 중복 비교는 이름표를 뺀 글로 한다. */
  const lab=(label:string,text:string)=>text.trim()?`${label}: ${text.trim()}`:undefined;
  if(!d.avoid){
    // 최종 병종 시험은 3부 카드에만 둔다(검토 L7: 쌍 수 줄이기).
    for(const c of [...new Set([...d.classes,...(part==='3'?d.finalClasses:[])])]){const e=d.exams[c];if(!e)continue;const weapons=e.weapons.length?e.weapons:classes[c]?.weapons||[],unlock=e.unlock.replace(/^[\s·]+/,'');add(`${c} 시험`,[e.tier,/^\d/.test(e.level)?`권장 Lv${e.level}`:'',/^\d/.test(e.renown)?`명성 ${e.renown}`:'',e.required&&`필수 ${e.required}`,e.choice&&`선택 ${e.choice}`].filter(Boolean).join(' · '),weapons.length?`무기 ${weapons.join(' · ')}`:undefined,unlock?`해금 ${unlock}`:undefined,d.steps[c]);}
    // 기능 쌍은 설명이 같아도 지우지 않는다(검토 4 M3: 같은 "3부 최종 병종 시험 전"이라 둘째 기능이 사라졌다).
    for(const s of d.skills){const line=displayText(plainCharacterText([s.when,s.why].filter(Boolean).join('. '))).trim();if(line)list.push({title:`${s.skill} ${s.target} · ${s.kind}`,lines:[line],keep:true});}
    add('기능 메모',d.skillNote);
    // 전차병 안내는 쌍 하나로 묶는다(검토 3 M3: 쌍이 너무 많다).
    if(d.caiAdvice)add('전차병 육성',d.charioteer,part!=='3'?`마스터 기술용으로 잠깐 바꿀 병종: ${d.caiAdvice.dip}`:undefined,`3부 병종 바꾸는 때: ${d.caiAdvice.rule} ${d.caiAdvice.part3}`,`무기 등급: ${d.caiAdvice.weapon}`);
    else add('전차병으로 키우는 이유',d.charioteer);
    // 전차병은 목표 줄이 시험 조건을 이미 보여 준다. 옛 중급·상급 준비 마감은 쓰지 않는다.
    if(part==='1'&&!d.charioteer)add('준비 마감',[ready.middleClass,ready.middleExam,ready.middleBy].map(words).filter(Boolean).join(' · '),[ready.part1Skills,ready.skillsBy].map(words).filter(Boolean).join(' · '));
    // 카이 루트 전차병은 3부에서도 전차병으로 레벨업한다(전차병 육성 쌍). 옛 성장 병종 안내는 쓰지 않는다.
    if(!d.charioteer&&!d.caiAdvice)add('레벨업·실전 병종',[words(ready.growthClass)+(ready.battleClass&&ready.battleClass!==ready.growthClass?` / ${words(ready.battleClass)}`:''),words(ready.swapReason)].filter(Boolean).join(' · '));
    // 육성 시작·육성판은 쌍 하나로(쌍 수 줄이기). 육성판 글은 원문 그대로 둔다.
    {const start=words((ready.starts as Record<string,unknown>|undefined)?.[part]),board=[ready.kind,ready.merge,goal.fusion].map(words).filter(Boolean).join(' · ');
     const lines=[start&&lab('시작',plainCharacterText(start)),board&&lab('육성판',board)].filter((l):l is string=>!!l);if(lines.length)list.push({title:'육성',lines});}
  }
  // 영입 조건·가입 병종·합류 순서는 쌍 하나로(쌍 수 줄이기).
  add('영입·합류',...((Array.isArray(person.gates)?person.gates:[]) as Record<string,unknown>[]).map(g=>lab('영입 조건',words(g.localCondition))),lab('가입 병종',words((person.recruitment as Record<string,unknown>|undefined)?.init)),lab('합류 순서',words(ready.joinSteps)));
  if(part==='1'&&!d.avoid&&!d.charioteer)add('경로 안내',words(goal.pathNotes));
  const seen=new Set(summaryText.map(norm));
  return list.map(p=>({...p,lines:p.lines.filter(l=>{const k=norm(l.replace(/^[^:]{1,12}: /,''));if(seen.has(k)&&!p.keep)return false;seen.add(k);return true;})})).filter(p=>p.lines.length);
}
export function PersonInfo({person,classes,part="1"}:{person:Person;classes:Record<string,ClassInfo>;part?:string}){
  const summary=characterSummary(person,part),d=person.data,self=new Set([person.name]);
  const goals=summary.goals.map(line=>line.replace(/주력 무기 ([SABCDE])/,(m,rank)=>{const main=d.skills.find(s=>s.kind==='주력');return main?`${main.skill} ${rank}`:m;}));
  const detail=pairs(person,part,[summary.reason,summary.join,summary.battle,...goals,...summary.stop,...summary.caution],classes);
  const [open,setOpen]=usePreference<string[]>(`person-open-${person.route}-${part}`,[]);
  const mine=open.filter(k=>k.startsWith(person.name+':'));
  return <><table className="person-summary"><tbody>
    <tr><th scope="row">영입 이유</th><td><GameText text={summary.reason} part={part} skip={self}/></td></tr>
    <tr><th scope="row">합류</th><td>{summary.join}</td></tr>
    <tr><th scope="row">출격</th><td>{summary.battle}</td></tr>
    {!d.avoid&&d.finalClasses.length>0&&<tr><th scope="row">최종 병종</th><td><ol className="class-path">{d.finalClasses.map(c=><li key={c}><span className="game-badge" data-kind="class">{classes[c]&&<img src={`/${classes[c].file}`} alt="" loading="lazy"/>}<strong>{c}</strong></span><Badge>{classes[c]?.tier||'단계 미확인'}</Badge>{(classes[c]?.weapons||[]).map(w=><Skill key={w} name={w}/>)}</li>)}</ol></td></tr>}
    {!d.avoid&&<tr><th scope="row">병종 경로</th><td>{person.classes.length?<ClassPath classes={person.classes} manifest={classes}/>:<span>이 부에서 바꾸는 병종 없음</span>}{d.next&&<p className="next-class">다음: <strong>{d.next}</strong></p>}</td></tr>}
    {!d.avoid&&<tr><th scope="row">필요 기능</th><td>{d.skills.length?<ul className="skill-chips">{d.skills.map(s=><li key={s.skill+s.target}><Skill name={s.skill} value={s.target}/> <Badge variant={s.kind==='주력'?'strong':'default'}>{s.kind}</Badge></li>)}</ul>:'없음'}</td></tr>}
    <tr><th scope="row">목표</th><td><ul className="summary-points">{goals.map((line,i)=><li key={i}><strong><GameText text={line} withSkills part={part} skip={self}/></strong></li>)}</ul></td></tr>
    <tr><th scope="row">멈출 때</th><td><ul className="summary-points">{summary.stop.map((line,i)=><li key={i}><GameText text={line} part={part} skip={self}/></li>)}</ul></td></tr>
    {/* 선물: 싸게 살 수 있는 선호 선물과 비싼 선물. 지원 대화를 모두 보려고 지원 1 영입 동료도 보여 준다(2026-11-14 사용자 지시). */}
    {!person.yuphas&&(person.cheapGifts.length>0||(!person.yuphas&&person.gifts.length>0))&&<tr><th scope="row">선물</th><td>{person.cheapGifts.length>0&&<><p className="gift-label">싸게 살 수 있는 선물</p><ul className="gift-chips">{person.cheapGifts.map(g=><li key={g.name}><span className="game-badge" data-kind="gift">{g.icon?<img src={'/'+g.icon} alt="" loading="lazy"/>:<Gift className="gift-fallback" size={22} aria-hidden="true"/>/* 공식 그림을 못 구한 물품은 일반 선물 아이콘(interface.md 규칙) */}<span className="badge-label">{g.name}</span>{g.cost!=null&&<b className="badge-value">{g.cost.toLocaleString('en-US')}G</b>}</span>{(()=>{const y=yuphasItem(g.name);return y&&person.yuphas?<YLink en={y.en} href={giftUrl(person.yuphas.slug,y.slug)}/>:null;})()}{g.reaction==='매우 좋아함'&&<Badge>매우 좋아함</Badge>}</li>)}</ul></>}{!person.yuphas&&person.gifts.length>0&&<><p className="gift-label">비싼 선물</p><ul className="expensive-gifts">{person.gifts.map(g=><li key={g}><span className="game-badge" data-kind="gift"><Gift className="gift-fallback" size={22} aria-hidden="true"/><span className="badge-label">{g}</span></span></li>)}</ul></>}</td></tr>}
    {!!summary.caution.length&&<tr><th scope="row">보존 주의</th><td>{summary.caution.map(line=><strong key={line}>{line}</strong>)}</td></tr>}
    </tbody></table>
    <Accordion type="multiple" className="person-more" value={mine.map(k=>k.slice(person.name.length+1))} onValueChange={v=>setOpen(prev=>[...prev.filter(k=>!k.startsWith(person.name+':')),...v.map(k=>person.name+':'+k)])}>
      {detail.length>0&&<AccordionItem value="plan"><AccordionTrigger>{d.avoid?'영입 조건':'시험 조건·시기별 계획'}</AccordionTrigger><AccordionContent><dl className="detail-pairs">{detail.map((p,i)=><div key={i}><dt>{p.title}</dt><dd>{p.lines.map((l,j)=><p key={j}><GameText text={l} withSkills part={part} skip={self}/></p>)}</dd></div>)}</dl></AccordionContent></AccordionItem>}
      {/* 원문 기록은 화면에서 뺐다(docs/reference/people-original.md, 2026-11-27). 선호 선물·음식과 지원은 yuphastemple 모양. */}
    </Accordion></>;
}
/** 역할·최종 25인·영입 목적·지원/명성 배지. 카드 머리와 인물 서랍이 함께 쓴다(2026-11-15 검토 11 L3). */
export function PersonTags({person,part}:{person:Person;part:string}){
  const gate=person.recruitment as {sup?:string|number;fame?:string|number};
  return <div className="tags"><Badge variant="strong">{person.role}</Badge>{isFinal25(person.name)&&<span className="final25-badge">최종 25인</span>}{part==='3'&&<Badge>{routeNames[person.route]}에서 준비 · {person.kind}</Badge>}{person.data.avoid&&<Badge>{person.badge||(person.name==='누조'?'선더 소드 지참품용 영입':'지원 대화용 영입')}</Badge>}{person.joinLabel&&<Badge>{part==='1'?person.joinLabel:`1부: ${person.joinLabel}`}</Badge>}{gate?.sup!=='0'&&gate?.sup!==0&&<span className="game-badge" data-kind="bond"><GameIcon kind="bond"/><span className="badge-label">지원</span> <b className="badge-value">{gate?.sup??'미확인'}</b></span>}{gate?.fame!=='0'&&gate?.fame!==0&&<span className="game-badge" data-kind="renown"><GameIcon kind="renown"/><span className="badge-label">명성</span> <b className="badge-value">{gate?.fame??'미확인'}</b></span>}</div>;
}
export function People({people,part,onDoc,onPerson}:{people:Person[];part:string;onDoc:(url:string)=>void;onPerson:(id:string)=>void}){
  // 인물 탭(2026-11-27 사용자 요청, U68): 서랍 머리 카드 격자. 자세한 표·선물·지원은 카드를 눌러 여는 인물 서랍에만 둔다.
  const scope=`people-${people[0]?.route}-${part}`;
  const [query,setQuery]=usePreference<string>(scope+'-query','');const [role,setRole]=usePreference<string>(scope+'-role','전체');
  const roles=['본대','보완','선택','수집'];
  const buildRoute=(part==='3'?'part3':people[0]?.route) as BuildRoute,builds=useChecks().data.builds?.[buildRoute];
  // AI용 복사(2026-11-27 U72): 이 루트에서 기록이 있는 인물 전부를 글로. 복사가 막히면 그 자리에 글 상자를 편다(창을 하나 더 띄우지 않음).
  // 3부 화면은 같은 인물 카드가 루트판마다 있지만 기록은 인물마다 하나라 슬러그로 한 번씩만(Fable 검토 21 지적 3).
  const recorded=people.filter((p,i)=>p.yuphas&&builds?.[p.yuphas.slug]&&people.findIndex(q=>q.yuphas?.slug===p.yuphas!.slug)===i);
  const [copyState,setCopyState]=useState<{message:string;text?:string}>({message:''});
  const copyText=()=>buildText({routeEn:routeEn[buildRoute]||buildRoute,routeKo:routeNames[buildRoute]||buildRoute,date:new Date().toISOString().slice(0,10),rows:recorded.map(p=>{const y=p.yuphas!,b=builds![y.slug],c=classBySlug(b.classId);return {en:y.en,ko:p.name,level:b.level,cls:c?{en:c.en,ko:c.ko}:undefined,skills:y.skills.filter(s=>b.skills?.[s.id]).map(s=>[s.skill,b.skills![s.id]!] as [string,string]),boons:y.skills.filter(s=>s.state==='boon').map(s=>s.skill),banes:y.skills.filter(s=>s.state==='bane').map(s=>s.skill),finalClasses:p.data.finalClasses,needs:p.data.skills.map(s=>`${s.skill} ${s.target}`),note:b.note};})});
  const copy=async()=>{const text=copyText();try{await navigator.clipboard.writeText(text);setCopyState({message:`${recorded.length}명 기록을 복사했습니다.`});}catch{setCopyState({message:'복사가 막혔습니다. 아래 글을 직접 복사하세요.',text});}};
  const list=people.filter(p=>p.name.normalize('NFKC').includes(query.normalize('NFKC').trim())&&(role==='전체'||p.role===role)).sort((a,b)=>roles.indexOf(a.role)-roles.indexOf(b.role)||a.order.localeCompare(b.order,undefined,{numeric:true}));
  return <><div className="filters people-filters"><label className="search"><Search size={22}/><input aria-label="인물 이름 검색" placeholder="이름으로 찾기" value={query} onChange={e=>setQuery(e.target.value)}/></label><ToggleGroup type="single" className="role-tabs" aria-label="역할" value={role} onValueChange={v=>v&&setRole(v)}>{['전체',...roles.filter(r=>people.some(p=>p.role===r))].map(r=><ToggleGroupItem key={r} value={r}>{r}</ToggleGroupItem>)}</ToggleGroup><span className="people-count" aria-live="polite">{list.length}명</span><Button variant="secondary" onClick={()=>onDoc('notes/exam.md')}>시험 안내</Button><Button variant="secondary" className="ai-copy" disabled={!recorded.length} title={recorded.length?undefined:'기록이 없습니다'} onClick={copy}><ClipboardCopy size={20} aria-hidden="true"/> AI용 복사</Button></div>
    {copyState.message&&<p className="ai-copy-status" role="status">{copyState.message}</p>}{copyState.text&&<textarea className="ai-copy-text" readOnly value={copyState.text} aria-label="AI용 육성 기록 글" rows={8} onFocus={e=>e.currentTarget.select()}/>}
    <div className="people-grid">{list.map(p=><article className="person-card" key={`${p.route}-${p.name}`} data-person={p.name}><CharacterHeader name={p.name} profile={p.yuphas&&part==='3'?{...p.yuphas,portrait:''}:p.yuphas} portrait={'/'+p.portrait} lazy build={p.yuphas?builds?.[p.yuphas.slug]:undefined} nameSlot={<button type="button" className="person-card-open" onClick={()=>onPerson(p.id)}>{p.name}</button>}><PersonTags person={p} part={part}/></CharacterHeader></article>)}</div>{!list.length&&<p>맞는 인물이 없습니다. 이름이나 역할을 바꿔 보세요.</p>}</>;
}
