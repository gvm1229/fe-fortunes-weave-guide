'use client';
import { ThemeProvider, useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function Themes({ children }: { children: React.ReactNode }) { return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>{children}</ThemeProvider>; }
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return <Button variant="outline" aria-label="화면 테마 바꾸기" onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}><Sun size={20} className="theme-light"/><Moon size={20} className="theme-dark"/><Monitor size={20} className="theme-system"/><span>화면 테마</span></Button>;
}
