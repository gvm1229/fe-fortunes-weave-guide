/** 확인 꼬리말은 화면에서 한 낱말 "미확인"으로 줄인다(2026-11-27 사용자 결정). 원문은 자료에 그대로 두고 docs/reference/unverified.md에 모았다.
 *  없앤 화면(팀 화면의 전체 참고 문서)을 가리키는 안내 문장도 화면에서 뺀다(U66, 문서 목차는 docs/reference/README.md). */
/**
 * 출처 사이트 이름(근거 글)은 화면에 그리지 않는다(U66, 2026-11-27 Fable 검토 21 지적 5). 자료 원문은 그대로 두고 설명은 docs/reference/unverified.md.
 * 괄호 안이 출처뿐이면 괄호째 지우고, 초안·미검증·추정이면 "(미확인)" 한 낱말(U46), 다른 글이 섞이면 출처 이름만 뺀다.
 * 괄호 밖은 이름을 빼고, 조사가 붙은 이름("Game8은")은 "공략 자료는"처럼 읽히게 바꾼다.
 */
const SOURCE='(?:Game8|GameWith|Anna[\'’]s Notebook|allthings\\.how|altema|RPG Site|KeenGamer|Fextralife|Serenes Forest|Serenes|hyperwiki)';
const hasSource=new RegExp(SOURCE);
const sourceRun=new RegExp(`${SOURCE}(?:\\s*[·,]\\s*${SOURCE})*`,'g');
const particle:Record<string,string>={은:'는',이:'가',과:'와'};
/** 이름 + 조사 → "공략 자료" + 맞춘 조사(받침 없는 말이라 은→는, 이→가, 과→와). */
const withParticle=new RegExp(`${sourceRun.source}(의|은|는|에서|에|이|가|와|과|로)(?=[\\s.,·)]|$)\\s*`,'g');
const named=(_m:string,p:string)=>`공략 자료${particle[p]||p} `;
export function stripSources(text:string){
  if(!hasSource.test(text))return text;
  return text
    .replace(/(^|[.。]\s+)([^.。\n]*출처는.*?다[.。])\s*/g,(m,start:string,sentence:string)=>hasSource.test(sentence)?start:m)
    .replace(/(\s*)\(([^()]*)\)/g,(m,space:string,inner:string)=>{
      if(!hasSource.test(inner))return m;
      if(/초안|미검증|추정/.test(inner))return `${space}(미확인)`;
      // 조사가 붙은 이름("Game8은 4장 표기")은 먼저 "공략 자료는"으로 바꿔 조사만 남지 않게 한다(Fable 재검토 B).
      const rest=inner.replace(withParticle,named).replace(sourceRun,'').replace(/^\s*(?:확인|기준|설명|표기)(?=$|[\s·,])/,'').replace(/한국어 도감|로컬 도감/g,'').replace(/^[\s·,]+|[\s·,]+$/g,'').replace(/\s*[·,]\s*(?=[·,])/g,'');
      return rest?`${space}(${rest})`:'';
    })
    .replace(withParticle,named)
    .replace(new RegExp(`${sourceRun.source}(?=[\\s.,·)]|$)\\s*(?:기준\\s*)?`,'g'),'')
    .replace(/^[\s·,]+/,'').replace(/\s+([.,)])/g,'$1').replace(/ {2,}/g,' ');
}
/**
 * 문서(마크다운)의 출처 목록은 화면에서 뺀다(U66, Fable 재검토 K): "출처:" 줄과 바로 뒤 목록(빈 줄·다른 문단 전까지),
 * 출처 사이트와 "…대조했다/확인했다." 같은 검증 기록 문장, "출처"를 말하는 문장(표 줄 밖), "원문" 말투. 파일(content/notes)은 그대로.
 */
export function stripSourceLists(md:string){
  return md.replace(/^[ \t]*(?:\*\*)?출처(?:\*\*)?\s*[:：][^\n]*\n(?:[ \t]*\n)*(?:[ \t]*[-*+] [^\n]*\n?)*/gm,'')
    .replace(/(^|[.。]\s+)([^.。\n]*(?:대조|검증|확인|검토)했다[.。])[ \t]*/gm,(m,start:string,sentence:string)=>hasSource.test(sentence)?start:m)
    .split('\n').filter(line=>!/^\s*[-*+]\s.*출처/.test(line)).map(line=>/^\s*\|/.test(line)?line:line
      .replace(/(?<=^|[.。]\s+|^\s*[-*+]\s+)[^.。\n]*출처[^.。\n]*(?:[.。]|$)[ \t]*/g,'')).join('\n');
}
/** 근거 글 "원문…" 말투는 화면에서 줄인다(U66, Fable 재검토 I). 자료는 그대로. */
function stripEvidenceWords(text:string){
  if(!text.includes('원문'))return text;
  return text.replace(/\s*·?\s*원문 검증과 사용자 저장 미실측 구별/g,'')
    .replace(/원문은 ([^,]+?)(?:을|를) 설명하지만, .*?확인이 필요하다\./g,'$1(미확인).')
    .replace(/된다는 원문 설명입니다\./g,'된다(미확인).')
    .replace(/원문에 구체 수치는 없습니다\./g,'구체 수치는 미확인입니다.')
    .replace(/원문 (?=추천)/g,'')
    .replace(/원문의 /g,'');
}
export function verificationTail(text:string){
  return stripEvidenceWords(stripSources(text)).replace(/\((?:원래 공략 한 곳에서만 확인|출처 한 곳|단일 출처)\)/g,'(미확인)').replace(/\([^()]*Anna's Notebook 초안, 미검증\)/g,'(미확인)').replace(/[^.。]*팀 화면의 전체 참고 문서에서 확인한다\.\s*/g,'').replace(/(?:은|는|이|가) (?:원래 공략 한 곳에서만 확인됐다|아직 확인되지 않았다|확인되지 않았다)(?=[.。]|$)/g,': 미확인');
}
export function displayText(text:string){
  return verificationTail(text).replace(/(세오도라|레다|디트리히|카이)\s*([123])부/g,'$1 $2부').replace(/([123])부(\d+)장/g,'$1부 $2장').replace(/(최종|현재)(\d+)(명|인)/g,'$1 $2$3').replace(/(명성|지원)(\d+)/g,'$1 $2').replaceAll('백마법','백마술');
}
