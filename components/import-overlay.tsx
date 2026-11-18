'use client';
// 가져오는 동안 화면 전체를 막는다(2026-11-15 사용자 지시: 가져오기 중에는 아무것도 누를 수 없게, 불러오는 아이콘을 보인다).
// 모달 <dialog>는 나머지 화면을 inert로 만들어 마우스·키보드 조작을 모두 막는다. 가져오는 중에는 Escape로도 닫히지 않는다.
// Chrome은 막은 Escape를 두 번째에 잠깐 닫았다(다시 열기 전 약 20ms 동안 뒤 화면이 열림). 가져오는 중에는 closedby="none"으로 Escape 닫기 자체를 끈다. 아래 onCancel·onClose는 closedby를 모르는 브라우저용.
// 실패하면 같은 창에 이유를 보이고 '확인'으로 닫는다(목록 맨 위의 오류 문구는 스크롤 중이면 보이지 않았다).
import { useEffect, useRef } from 'react';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { Button } from './ui/button';
export type ImportPhase = { state: 'idle' } | { state: 'busy' } | { state: 'error'; message: string };
export function ImportOverlay({ phase, onClose }: { phase: ImportPhase; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (phase.state !== 'idle' && !d.open) d.showModal();
    // 닫으면 브라우저가 초점을 숨은 파일 칸(닫힌 기록 관리 메뉴 안)으로 돌려 잃는다. 기록 관리 단추로 옮긴다.
    if (phase.state === 'idle' && d.open) { d.close(); document.querySelector<HTMLElement>('.route-head .backup-menu summary')?.focus(); }
  }, [phase.state]);
  // 가져오는 동안 탭을 닫거나 새로 고치려 하면 브라우저가 한 번 묻는다.
  useEffect(() => { if (phase.state !== 'busy') return; const stop = (e: BeforeUnloadEvent) => { e.preventDefault(); }; addEventListener('beforeunload', stop); return () => removeEventListener('beforeunload', stop); }, [phase.state]);
  return <dialog ref={ref} className="import-overlay" aria-labelledby="import-overlay-title" aria-busy={phase.state === 'busy'} closedby={phase.state === 'busy' ? 'none' : 'closerequest'} onCancel={e => { if (phase.state === 'busy') e.preventDefault(); else onClose(); }} onClose={() => { /* Chrome은 Escape를 거듭 누르면 막아도 닫는다. 가져오는 중이면 바로 다시 연다. */ if (phase.state === 'busy' && ref.current && !ref.current.open) ref.current.showModal(); else if (phase.state === 'error') onClose(); }}>
    {phase.state === 'error' ? <div className="import-overlay-box" role="alert">
      <TriangleAlert size={40} aria-hidden="true" />
      <p id="import-overlay-title" className="import-overlay-title">가져오지 못했습니다</p>
      <p>{phase.message}</p>
      <p className="muted">이 브라우저의 기존 기록은 그대로입니다.</p>
      <Button onClick={onClose} autoFocus>확인</Button>
    </div> : <div className="import-overlay-box" role="status">
      <LoaderCircle size={48} aria-hidden="true" className="import-spinner" />
      <p id="import-overlay-title" className="import-overlay-title">기록을 가져오는 중입니다</p>
      <p className="muted">끝날 때까지 창을 닫거나 다른 곳을 누르지 마세요.</p>
    </div>}
  </dialog>;
}
