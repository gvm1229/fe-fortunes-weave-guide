import { flushSync } from 'react-dom';
/** 같은 화면 안의 상태 전환(탭·편성안)을 View Transition으로 감싼다. 지원하지 않거나 동작 줄이기면 바로 바꾼다. */
export function withViewTransition(update: () => void) {
  if (typeof document === 'undefined' || !('startViewTransition' in document) || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) { update(); return; }
  const transition = document.startViewTransition(() => flushSync(update));
  // 앞 전환이 새 전환에 밀려 건너뛰어진 것은 오류가 아니다. 상태 변경은 이미 끝났다.
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}
