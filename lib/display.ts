/** 확인 꼬리말은 화면에서 한 낱말 "미확인"으로 줄인다(2026-11-27 사용자 결정). 원문은 자료에 그대로 두고 docs/reference/unverified.md에 모았다.
 *  없앤 화면(팀 화면의 전체 참고 문서)을 가리키는 안내 문장도 화면에서 뺀다(U65, 문서 목차는 docs/reference/README.md). */
export function verificationTail(text:string){
  return text.replace(/\((?:원래 공략 한 곳에서만 확인|출처 한 곳|단일 출처)\)/g,'(미확인)').replace(/\([^()]*Anna's Notebook 초안, 미검증\)/g,'(미확인)').replace(/[^.。]*팀 화면의 전체 참고 문서에서 확인한다\.\s*/g,'').replace(/(?:은|는|이|가) (?:원래 공략 한 곳에서만 확인됐다|아직 확인되지 않았다|확인되지 않았다)(?=[.。]|$)/g,': 미확인');
}
export function displayText(text:string){
  return verificationTail(text).replace(/(세오도라|레다|디트리히|카이)\s*([123])부/g,'$1 $2부').replace(/([123])부(\d+)장/g,'$1부 $2장').replace(/(최종|현재)(\d+)(명|인)/g,'$1 $2$3').replace(/(명성|지원)(\d+)/g,'$1 $2').replaceAll('백마법','백마술');
}
