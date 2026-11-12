'use client';
import { useState } from 'react';
import { Sheet,SheetContent,SheetTitle } from './ui/sheet';
export function GuideImage({src,alt='',className='',source=false}:{src:string;alt?:string;className?:string;source?:boolean}){
  const [open,setOpen]=useState(false),[route,setRoute]=useState('');
  return <><button className="image-open" onClick={e=>{setRoute(e.currentTarget.closest('[data-route]')?.getAttribute('data-route')||'');setOpen(true);}} aria-label={`${alt||'그림'} 원본 크기 보기`}><img src={src} alt={alt} className={className} loading="lazy" data-source-image={source||undefined}/></button><Sheet open={open} onOpenChange={setOpen}><SheetContent themeRoute={route}><div className="sheet-heading"><SheetTitle>{alt||'원본 그림'}</SheetTitle></div><div className="sheet-scroll image-original"><img src={src} alt={alt}/><a className="button" href={src} target="_blank" rel="noreferrer">원본 크기 보기</a></div></SheetContent></Sheet></>;
}
