'use client';
import { useEffect, useId, useRef, useState } from 'react';
export function ReadMore({children}:{children:React.ReactNode}){
  const [open,setOpen]=useState(false),[long,setLong]=useState(false),id=useId(),body=useRef<HTMLDivElement>(null);
  useEffect(()=>{const element=body.current;if(!element)return;const measure=()=>setLong(!!element.querySelector('.image-open')||element.scrollHeight>parseFloat(getComputedStyle(element).lineHeight)*3+1);const observer=new ResizeObserver(measure);observer.observe(element);measure();return ()=>observer.disconnect();},[]);
  return <div className="readable-group" data-expanded={open}><div className="readable-body" id={id} ref={body}>{children}</div>{long&&<button className="button prose-toggle" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>{open?'접기':'자세히'}</button>}</div>;
}
