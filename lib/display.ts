export function displayText(text:string){
  return text.replace(/(세오도라|레다|디트리히|카이)\s*([123])부/g,'$1 $2부').replace(/([123])부(\d+)장/g,'$1부 $2장').replace(/(최종|현재)(\d+)(명|인)/g,'$1 $2$3').replace(/(명성|지원)(\d+)/g,'$1 $2');
}
