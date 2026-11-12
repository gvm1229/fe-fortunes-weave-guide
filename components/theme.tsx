'use client';
import { ThemeProvider, useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function Themes({ children }: { children: React.ReactNode }) { return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>{children}</ThemeProvider>; }
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  return <Button className="icon-button" aria-label="화면 테마 바꾸기" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}><Sun size={24} className="theme-light"/><Moon size={24} className="theme-dark"/></Button>;
}
