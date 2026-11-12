'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="home"><h1>화면을 불러오지 못했습니다</h1><p>체크 기록은 이 오류로 바뀌지 않습니다. 화면을 다시 열어 보세요.</p><Button onClick={reset}>다시 시도</Button><p><Link href="/">루트 선택으로</Link></p></main>;}
