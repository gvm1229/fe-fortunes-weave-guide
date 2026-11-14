import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './redesign.css';
import './team.css';
import { Themes } from '@/components/theme';
const pretendard = localFont({ src: [{ path: '../assets/fonts/Pretendard-Regular.otf', weight: '400' }, { path: '../assets/fonts/Pretendard-SemiBold.otf', weight: '600' }, { path: '../assets/fonts/Pretendard-Bold.otf', weight: '700' }], display: 'swap', variable: '--font-pretendard' });
export const metadata: Metadata = { title: '만자천홍 · 나의 공략', description: '루트별로 한 걸음씩 따라가는 개인 공략', icons: { icon: 'data:,' } }; // 아이콘 그림은 사양에 없다. 빈 아이콘으로 /favicon.ico 404만 막는다.
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko" suppressHydrationWarning><body className={pretendard.variable}><Themes>{children}</Themes></body></html>; }
