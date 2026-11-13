import { flushSync } from 'react-dom';
/** 같은 화면 안의 상태 전환(탭·편성안)을 View Transition으로 감싼다. 지원하지 않거나 동작 줄이기면 바로 바꾼다. */
export function withViewTransition(update: () => void) {
  if (typeof document === 'undefined' || !('startViewTransition' in document) || matchMedia('(prefers-reduced-motion: reduce)').matches) { update(); return; }
  document.startViewTransition(() => flushSync(update));
}
