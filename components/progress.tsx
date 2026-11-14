export function Progress({value,max,label}:{value:number;max:number;label:string}) {
  return <progress value={value} max={Math.max(1,max)} aria-label={label}/>;
}
