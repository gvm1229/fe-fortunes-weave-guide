import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './redesign.css';
import './team.css';
import { Themes } from '@/components/theme';
const pretendard = localFont({ src: [{ path: '../assets/fonts/Pretendard-Regular.otf', weight: '400' }, { path: '../assets/fonts/Pretendard-SemiBold.otf', weight: '600' }, { path: '../assets/fonts/Pretendard-Bold.otf', weight: '700' }], display: 'swap', variable: '--font-pretendard' });
// 공유 미리보기는 시간 경과 전 네 주인공만 담은 고정 그림(public/og.png, scripts/make-og-image.mjs). 없으면 미리보기가 페이지의 3부(시간 경과 뒤) 초상화를 집는다(2026-11-14 사용자 지시).
const share = { url: '/og.png', width: 1200, height: 630, alt: '만자천홍 개인화 공략 · 세오도라·레다·디트리히·카이' };
export const metadata: Metadata = { metadataBase: new URL('https://fe-fortunes-weave-guide-megi.netlify.app'), title: '만자천홍 · 나의 공략', description: '루트별로 한 걸음씩 따라가는 개인 공략', icons: { icon: 'data:,' }, openGraph: { type: 'website', siteName: '만자천홍 개인화 공략', title: '만자천홍 · 나의 공략', description: '루트별로 한 걸음씩 따라가는 개인 공략', images: [share] }, twitter: { card: 'summary_large_image', images: [share] } }; // 아이콘 그림은 사양에 없다. 빈 아이콘으로 /favicon.ico 404만 막는다.
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko" suppressHydrationWarning><body className={pretendard.variable}><Themes>{children}</Themes></body></html>; }
