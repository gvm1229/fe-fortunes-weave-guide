'use client';
/**
 * 화면 아래 고정 바닥: 게임 날짜만 가운데에 "1449/10/16"처럼 보인다(2026-11-14 사용자 지시).
 * 날짜는 처음으로 체크가 남은 할 일 기준이라 스크롤해도 바뀌지 않는다. 바뀔 때마다 자동차 주행 기록계처럼 숫자 칸이 굴러간다.
 * 각 숫자 칸은 0~9 세로 띠를 한 칸씩 옮긴다(transform). 움직임 줄이기 설정이면 굴리지 않는다.
 * 낭독기에는 숨긴 글(label)이 바뀔 때 읽힌다(role=status 안의 글 변화).
 */
export function DateOdometer({ value, label }: { value: string; label: string }) {
  return <footer className="date-odometer">
    <span className="sr-only" role="status" aria-live="polite">{label}</span>
    <span className="odometer-face" aria-hidden="true">{[...value].map((ch, i) => /\d/.test(ch)
      ? <span key={i} className="odometer-digit"><span className="odometer-strip" style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>{'0123456789'.split('').map(n => <span key={n}>{n}</span>)}</span></span>
      : <span key={i} className="odometer-sep">{ch}</span>)}</span>
  </footer>;
}
