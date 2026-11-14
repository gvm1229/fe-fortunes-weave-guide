'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** 오른쪽 아래 둥근 "맨 위로" 버튼. 글자 없이 아이콘만, 이름은 툴팁·화면 낭독기용(2026-11-14 사용자 지시). */
export function ToTop() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const update = () => setShown(window.scrollY > 600);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  const top = () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  return <button type="button" className="to-top" data-shown={shown} aria-label="맨 위로" title="맨 위로" tabIndex={shown ? 0 : -1} aria-hidden={!shown} onClick={top}><ArrowUp size={24} aria-hidden="true"/></button>;
}
