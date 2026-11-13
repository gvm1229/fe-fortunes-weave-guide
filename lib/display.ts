export function displayText(text:string){
  return text.replace('앞 루트1·2부를 연속 완료한 실제 가호/게이지 확인','앞 루트에서 넘겨받은 실제 가호·게이지 확인').replace(/(세오도라|레다|디트리히|카이)\s*([123])부/g,'$1 $2부').replace(/([123])부(\d+)장/g,'$1부 $2장').replace(/(최종|현재)(\d+)(명|인)/g,'$1 $2$3').replace(/(명성|지원)(\d+)/g,'$1 $2').replaceAll('백마법','백마술');
}
