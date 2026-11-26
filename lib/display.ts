/** 확인 꼬리말은 화면에서 한 낱말 "미확인"으로 줄인다(2026-11-27 사용자 결정). 원문은 자료에 그대로 두고 docs/reference/unverified.md에 모았다.
 *  없앤 화면(팀 화면의 전체 참고 문서)을 가리키는 안내 문장도 화면에서 뺀다(U66, 문서 목차는 docs/reference/README.md). */
/**
 * 출처 사이트 이름(근거 글)은 화면에 그리지 않는다(U66, 2026-11-27 Fable 검토 21 지적 5). 자료 원문은 그대로 두고 설명은 docs/reference/unverified.md.
 * 괄호 안이 출처뿐이면 괄호째 지우고, 초안·미검증·추정이면 "(미확인)" 한 낱말(U46), 다른 글이 섞이면 출처 이름만 뺀다.
 * 괄호 밖은 이름을 빼고, 조사가 붙은 이름("Game8은")은 "공략 자료는"처럼 읽히게 바꾼다.
 */
const SOURCE='(?:Game8|GameWith|Anna[\'’]s Notebook|allthings\\.how|altema|RPG Site|KeenGamer)';
const hasSource=new RegExp(SOURCE);
const sourceRun=new RegExp(`${SOURCE}(?:\\s*[·,]\\s*${SOURCE})*`,'g');
const particle:Record<string,string>={은:'는',이:'가',과:'와'};
export function stripSources(text:string){
  if(!hasSource.test(text))return text;
  return text
    .replace(/(^|[.。]\s+)([^.。\n]*출처는.*?다[.。])\s*/g,(m,start:string,sentence:string)=>hasSource.test(sentence)?start:m)
    .replace(/(\s*)\(([^()]*)\)/g,(m,space:string,inner:string)=>{
      if(!hasSource.test(inner))return m;
      if(/초안|미검증|추정/.test(inner))return `${space}(미확인)`;
      const rest=inner.replace(sourceRun,'').replace(/^\s*(?:확인|기준|설명|표기)(?=$|[\s·,])/,'').replace(/한국어 도감|로컬 도감/g,'').replace(/^[\s·,]+|[\s·,]+$/g,'').replace(/\s*[·,]\s*(?=[·,])/g,'');
      return rest?`${space}(${rest})`:'';
    })
    .replace(new RegExp(`${sourceRun.source}(의|은|는|에서|에|이|가|와|과|로)?(?=[\\s.,·)]|$)\\s*(?:기준\\s*)?`,'g'),(_m,p?:string)=>p?`공략 자료${particle[p]||p} `:'')
    .replace(/^[\s·,]+/,'').replace(/\s+([.,)])/g,'$1').replace(/ {2,}/g,' ');
}
export function verificationTail(text:string){
  return stripSources(text).replace(/\((?:원래 공략 한 곳에서만 확인|출처 한 곳|단일 출처)\)/g,'(미확인)').replace(/\([^()]*Anna's Notebook 초안, 미검증\)/g,'(미확인)').replace(/[^.。]*팀 화면의 전체 참고 문서에서 확인한다\.\s*/g,'').replace(/(?:은|는|이|가) (?:원래 공략 한 곳에서만 확인됐다|아직 확인되지 않았다|확인되지 않았다)(?=[.。]|$)/g,': 미확인');
}
export function displayText(text:string){
  return verificationTail(text).replace(/(세오도라|레다|디트리히|카이)\s*([123])부/g,'$1 $2부').replace(/([123])부(\d+)장/g,'$1부 $2장').replace(/(최종|현재)(\d+)(명|인)/g,'$1 $2$3').replace(/(명성|지원)(\d+)/g,'$1 $2').replaceAll('백마법','백마술');
}
