'use client';
import { ThemeProvider, useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
export function Themes({ children }: { children: React.ReactNode }) { useImageLoaded(); return <ThemeProvider attribute="class" defaultTheme="system" enableSystem><TooltipProvider delayDuration={300}>{children}</TooltipProvider></ThemeProvider>; }
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  return <Button className="icon-button" aria-label="화면 테마 바꾸기" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}><Sun size={24} className="theme-light"/><Moon size={24} className="theme-dark"/></Button>;
}
