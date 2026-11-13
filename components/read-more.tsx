'use client';
import { useEffect, useId, useRef, useState } from 'react';
export function ReadMore({children}:{children:React.ReactNode}){
  const [open,setOpen]=useState(false),[long,setLong]=useState(false),id=useId(),body=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const element=body.current;if(!element)return;
    let frame=0;
    const measure=()=>{
      const limit=parseFloat(getComputedStyle(element).lineHeight)*3,top=element.getBoundingClientRect().top;
      let preview=limit;
      if(element.scrollHeight>limit+1){
        const lines:DOMRect[]=[];
        const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()){
          if(!walker.currentNode.textContent?.trim())continue;
          const range=document.createRange();range.selectNodeContents(walker.currentNode);
          for(const rect of range.getClientRects())if(rect.height&&rect.top-top<limit)lines.push(rect);
        }
        // 글자의 중간을 자르지 않고 제한 높이 안의 마지막 온전한 줄에서 접는다.
        let previous;
        do{previous=preview;for(const line of lines)if(line.top-top<preview-1&&line.bottom-top>preview+1)preview=Math.max(0,line.top-top);}while(preview<previous);
      }
      element.style.setProperty('--preview-height',`${preview}px`);
      setLong(!!element.querySelector('.image-open')||element.scrollHeight>preview+1);
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    const observer=new ResizeObserver(schedule);observer.observe(element);schedule();
    let disposed=false;document.fonts.ready.then(()=>{if(!disposed)schedule();});
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();};
  },[]);
  return <div className="readable-group" data-expanded={open}><div className="readable-body" id={id} ref={body}>{children}</div>{long&&<button className="button prose-toggle" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>{open?'접기':'자세히'}</button>}</div>;
}
