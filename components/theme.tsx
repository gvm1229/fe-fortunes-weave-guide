'use client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect } from 'react';
/** 초상화가 다 받아지기 전에는 통일 배경(청록) 대신 옅은 바탕을 보인다(검토 L4). load는 버블되지 않으므로 캡처로 듣는다. */
function useImageLoaded() {
  useEffect(() => {
    const mark = (img: HTMLImageElement) => { if (img.complete && img.naturalWidth) img.dataset.loaded = ''; };
    const onLoad = (e: Event) => { if (e.target instanceof HTMLImageElement) e.target.dataset.loaded = ''; };
    document.addEventListener('load', onLoad, true);
    document.querySelectorAll('img').forEach(mark);
    return () => document.removeEventListener('load', onLoad, true);
  }, []);
}
// 2026-11-27 사용자 결정: 어두운 화면만 쓴다. <html class="dark">는 app/layout.tsx에 고정(테마 바꾸기 없음).
export function Themes({ children }: { children: React.ReactNode }) { useImageLoaded(); return <TooltipProvider delayDuration={300}>{children}</TooltipProvider>; }
