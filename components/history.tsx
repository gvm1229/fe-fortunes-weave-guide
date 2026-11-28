'use client';
// 변경 기록 보기(2026-11-28 사용자 요청, U76): 언제 무엇을 고쳤는지. 서버가 저장할 때마다 바뀐 칸만 남긴 기록을 새것부터 보여 준다. 보기는 누구나.
import { useState } from 'react';
import { History } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { boons } from '@/lib/status';
import actionLinks from '@/content/action-links.json';

type Change =
  | { type: 'check'; id: string; from: boolean | null; to: boolean | null; label?: string }
  | { type: 'status'; key: string; from: number | null; to: number | null }
  | { type: 'build'; route: string; slug: string; op: 'add' | 'remove' | 'edit'; label?: string };
type Entry = { at: string; revision: number; changes: Change[]; total: number };

const links = actionLinks as Record<string, string>;
const routeName: Record<string, string> = { theodora: '세오도라', leda: '레다', dietrich: '디트리히', cai: '카이', part3: '3부' };
const boonName = Object.fromEntries(boons.map(b => [b.id, b.name]));
const when = (iso: string) => new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
/** 체크 ID의 쪽(루트·부). 주소 /theodora/1/#id → '세오도라 1부'. */
const pageOf = (id: string) => { const m = links[id]?.match(/^\/([a-z0-9]+)\/(\d)\//); return !m ? '' : m[1] === 'part3' ? '3부' : `${routeName[m[1]] || m[1]} ${m[2]}부`; };
const num = (n: number | null) => (n === null ? '없음' : n.toLocaleString('ko-KR'));

function Line({ c, onGo }: { c: Change; onGo: () => void }) {
  if (c.type === 'check') {
    const what = c.to === true ? '완료' : c.to === false ? '해제' : '기록 지움';
    const href = links[c.id];
    const page = pageOf(c.id);
    return <li><b>{what}</b> · {page && <>{page} · </>}{href ? <a href={href} onClick={onGo}>{c.label || c.id}</a> : (c.label || c.id)}</li>;
  }
  if (c.type === 'status') {
    const [group, id] = c.key.split('.');
    const name = c.key === 'shards' ? '인과의 파편' : c.key === 'gold' ? '골드' : group === 'boons' ? `축복 ${boonName[id] || id}` : `가호 ${id}`;
    return <li><b>내 상태</b> · {name}: {num(c.from)} → {num(c.to)}</li>;
  }
  return <li><b>육성 기록</b> · {routeName[c.route] || c.route} · {c.label || c.slug} {c.op === 'add' ? '추가' : c.op === 'remove' ? '삭제' : '수정'}</li>;
}

export function HistoryButton({ route }: { route: string }) {
  const [open, setOpen] = useState(false), [items, setItems] = useState<Entry[]>([]), [more, setMore] = useState(false), [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  async function load(before?: number) {
    setState('loading');
    try {
      const r = await fetch(`/api/history?limit=30${before !== undefined ? `&before=${before}` : ''}`);
      if (!r.ok) throw new Error();
      const body = await r.json() as { items: Entry[]; more: boolean };
      setItems(x => before ? [...x, ...body.items] : body.items); setMore(body.more); setState('idle');
    } catch { setState('error'); }
  }
  return <Sheet open={open} onOpenChange={o => { setOpen(o); if (o) void load(); }}>
    <Button variant="secondary" onClick={e => { e.currentTarget.closest('details')?.removeAttribute('open'); setOpen(true); void load(); }}><History size={20} aria-hidden="true" /> 변경 기록</Button>
    <SheetContent themeRoute={route}><div className="sheet-heading"><SheetTitle>변경 기록</SheetTitle></div><div className="sheet-scroll history-sheet">
      <p className="muted">기록을 고칠 때마다 언제 무엇이 바뀌었는지 남깁니다(새것부터, 한국 시간).</p>
      {state === 'error' && <p role="alert">변경 기록을 불러오지 못했습니다. <Button variant="secondary" onClick={() => void load()}>다시 읽기</Button></p>}
      {state !== 'error' && items.length === 0 && <p>{state === 'loading' ? '불러오는 중입니다.' : '아직 남은 변경 기록이 없습니다.'}</p>}
      <ol className="history-list">{items.map(e => <li key={e.revision}>
        <p className="history-when"><time dateTime={e.at}>{when(e.at)}</time> · 변경 {e.total}건</p>
        <ul>{e.changes.map((c, i) => <Line key={i} c={c} onGo={() => setOpen(false)} />)}{e.total > e.changes.length && <li className="muted">외 {e.total - e.changes.length}건</li>}</ul>
      </li>)}</ol>
      {more && <Button variant="secondary" disabled={state === 'loading'} onClick={() => void load(items.at(-1)?.revision)}>더 보기</Button>}
    </div></SheetContent>
  </Sheet>;
}
