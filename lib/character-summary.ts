import copy from '../content/character-copy.json';
import type { Person } from './content';

const reasons:Record<string,string>=copy.reasons;
const routeReasons:Record<string,string>=copy.routeReasons;
const excluded=new Set(['양계','키로이카','밴디츠','마지데','골라이어스','자코네','대도','자스민','센트리온','타호니아']);
export function characterReason(name:string,route?:string){return routeReasons[`${route}:${name}`]||reasons[name]||'';}
export function plainCharacterText(text:string){
  return text.replace(/현재\s*Lv(\d+)/g,'기록 당시 Lv$1').replace(/(\d)부\s*Lv(\d+)\s*강제 없음/g,'$1부에 Lv$2까지 올릴 필요는 없습니다').replaceAll('현재 주력은 실제 출격 성장 유지','현재 출격하는 주력은 전투에서 계속 키웁니다').replaceAll('교대 대상은 중급/필수 기능 준비 뒤 반복 중단','교대할 동료는 중급 병종과 필요한 기능을 갖추면 반복 육성을 멈춥니다').replaceAll('실전 예비.','예비 동료입니다.').replace(/([^·]+) 기준판에 레벨업 배분/g,'$1 능력이 자라는 병종에서 레벨을 올립니다').replace(/권장(\d+)장 실제 합류 뒤/g,'$1장 영입을 계획합니다. 실제 합류 후')
    .replace(/(\d)부(\d)/g,'$1부 $2').replace(/(\d)장 실제 전투까지 출격 성장/g,'$1장 전투까지 출격해 키웁니다')
    .replace(/필수 기능·시험은\s*(\d+)장까지/g,'필요한 기능과 시험은 $1장까지 준비합니다').replace(/실제 출격자는\s*(\d+)장 전투까지 사용/g,'실제 출격 동료는 $1장 전투까지 씁니다').replaceAll('전직·성장 설정 후 군행동','전직과 성장 설정을 마친 뒤 군행동에 투입합니다').replaceAll('기준판','다른 루트의 능력을 합칠 중심 동료').replaceAll('소급 시험 없음','이미 얻은 병종의 낮은 단계 시험은 다시 보지 않습니다')
    .replaceAll('재시험·반복 훈련 생략','같은 시험과 훈련을 반복하지 않습니다').replaceAll('이야기 주력','이야기 전투에 우선 출격')
    .replaceAll('빈칸 채우기용 균등 육성·추가 파밍 없음','모두의 레벨을 맞추려고 반복 전투하지 않습니다')
    .replaceAll('정원 채우기용 반복 육성 없음','출격하지 않을 동료까지 반복 육성하지 않습니다')
    .replaceAll('소급하지 않음','다시 준비하지 않습니다').replaceAll('추가 경험치·유료 훈련·시험 중단','추가 경험치·유료 훈련·시험에 투자하지 않습니다');
}
function words(value:unknown):string{if(typeof value==='string')return value;if(value&&typeof value==='object'&&'$prose' in value)return (value as {$prose:string[]}).$prose.join(' · ');return '';}
export function characterSummary(person:Person,part:string){
  const ready=person.readiness as Record<string,unknown>;
  const goal=person.goal as Record<string,unknown>;
  const lane=String(ready.investmentLane||'');
  const starts=ready.starts as Record<string,string>|undefined;
  const stops=ready.stops as Record<string,string>|undefined;
  const preserve=lane==='보존·수집';
  const blocked=excluded.has(person.name);
  const chapter=ready.joinTargetChapter;
  let battle:string;
  if(blocked)battle='영입만 합니다. 전투·훈련·시험에는 투입하지 않습니다.';
  else if(part==='1')battle=preserve?'합류해도 바로 출격시키지 않습니다. 물품·탈것·대화 확보를 먼저 합니다.':lane==='이야기 주력'?'실제 합류한 뒤 이야기 전투에 우선 출격합니다.':lane==='기능 준비·2부 교대'?'필요한 기능을 준비하고 2부 교대를 대비합니다. 지금 주력을 억지로 빼지 않습니다.':lane==='추가 칸·역할 교대'?'출격 칸이 늘거나 같은 역할의 동료를 교대할 때 투입합니다.':'초반에 역할이 비었거나 주력이 출격할 수 없을 때 투입합니다.';
  else if(part==='2')battle=preserve?'보존 상태를 확인합니다. 실제 출격하기로 정한 경우에만 육성을 재개합니다.':'2부 진입 후 현재 병종과 기능을 확인합니다. 실제 출격 칸과 필요한 역할에 맞춰 투입합니다.';
  else battle=ready.final25?'3부에 정식 합류하고 필요한 병종이 열린 뒤 투입합니다. 최종 25명 편성을 목표로 합니다.':'3부에서는 예비로 둡니다. 주력의 역할이 비었을 때만 투입합니다.';
  const target=blocked?'영입과 지원 대화가 목표입니다. 전투 육성 목표는 없습니다.':part==='1'&&preserve?String(ready.floorLabel||'보존 상태를 확인합니다.'):words(goal.text)||words(ready.floorLabel)||'정해진 목표가 없습니다.';
  return {
    reason:characterReason(person.name,person.route),
    join:part!=='1'?'앞선 부에서 영입·준비한 기록입니다. 이번 부의 실제 합류를 확인합니다.':person.joinLabel?person.joinLabel:chapter?`${chapter}장 영입을 권장하는 계획입니다. 실제 합류 여부는 게임에서 확인합니다.`:'실제 영입 조건과 합류 여부를 게임에서 확인합니다.',
    battle,
    timing:starts?.[part]?plainCharacterText(words(starts[part])).split(' · ').filter(Boolean):[],
    goals:plainCharacterText(target.replace('필요한 B 준비',typeof ready.part1Skills==='string'?ready.part1Skills+' 준비':'필요한 기능 B등급 준비')).split(' · ').filter(Boolean),
    stop:blocked?['출격·훈련·시험에 투자하지 않습니다.']:plainCharacterText(words(stops?.[part])||'실제 출격 계획이 없으면 추가 육성을 멈춥니다.').split(' · ').filter(Boolean),
    caution:person.name==='알렉산드라'?['전용 탈것을 보존합니다. 첫 반입은 비탑승으로 하고, 세오도라에서 보존하는 기준 동료의 상급 시험 합격은 보류합니다.']:person.name==='이오'?['전용 말을 보존합니다. 첫 반입은 비탑승으로 합니다.']:[],
  };
}
