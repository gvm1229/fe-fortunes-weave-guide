export function progressStage(value:number,max:number) {
  if(max>0&&value>=max)return 'complete';
  return max>0&&value/max>=0.5?'advancing':'started';
}
