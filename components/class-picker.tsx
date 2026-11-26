'use client';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X } from 'lucide-react';
import { allowedClasses, classIcon, licenses, type YClass } from '@/lib/yuphas-classes';
import { skillKo } from './yuphas';
import type { YuphasProfile } from '@/lib/yuphas-profile';
/**
 * 병종 고르기 창(2026-11-27 사용자 요청, U72): yuphastemple "Choose a class" 창을 옮겼다(docs/fixes-round-plan.md §A3·§F5).
 * 인물 서랍 안에서 Radix Dialog를 겹쳐 연다. Esc·막 누름·✕는 바꾸지 않고 이 창만 닫고, 닫히면 초점이 병종 단추로 돌아간다.
 * 그 인물이 고를 수 있는 병종만(고유 병종 하나, 성별 전용, 못 타는 인물은 기마·비행 제외). 3부 증서 묶음도 가리지 않고 머리에 '3부 해금'을 적는다.
 * 칩은 yuphastemple로 가는 단추가 아니라 고르는 단추라서 한국어 이름(없으면 영어)을 쓰고 영어 이름은 title·검색어로만 쓴다(U65 해석).
 */
const WEAPONS = ['sword', 'spear', 'axe', 'bow', 'gauntlet', 'black_magic', 'white_magic'] as const;
const weaponKo: Record<string, string> = { sword: skillKo.Sword, spear: skillKo.Spear, axe: skillKo.Axe, bow: skillKo.Bow, gauntlet: skillKo.Gauntlet, black_magic: skillKo['Black Magic'], white_magic: skillKo['White Magic'] };
const COLUMNS: [string, string][] = [['infantry', '보병'], ['ranged', '원거리'], ['magic', '마법'], ['armor', '중갑'], ['riding', '기마']];
const fold = (s: string) => s.normalize('NFKC').toLowerCase();
export function ClassPicker({ profile, value, onPick, children }: { profile: YuphasProfile; value?: string; onPick: (slug: string | undefined) => void; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild>{children}</Dialog.Trigger>
    {open && <PickerBody profile={profile} value={value} onPick={(slug) => { onPick(slug); setOpen(false); }} />}
  </Dialog.Root>;
}
function PickerBody({ profile, value, onPick }: { profile: YuphasProfile; value?: string; onPick: (slug: string | undefined) => void }) {
  const [weapon, setWeapon] = useState<string>('all');
  const [query, setQuery] = useState('');
  const selected = useRef<HTMLButtonElement>(null), search = useRef<HTMLInputElement>(null);
  const all = useMemo(() => allowedClasses(profile.slug), [profile.slug]);
  const boon = new Set(profile.skills.filter((s) => s.state === 'boon').map((s) => s.id));
  const q = fold(query.trim());
  const shown = all.filter((c) => (weapon === 'all' || (c.license !== 'default' && c.weapons.includes(weapon))) && (!q || fold([c.ko, c.en, licenses.find((l) => l.id === c.license)?.ko, licenses.find((l) => l.id === c.license)?.en].filter(Boolean).join(' ')).includes(q)));
  const chip = (c: YClass) => <button key={c.slug} type="button" className="class-chip" aria-pressed={c.slug === value} title={c.en} ref={c.slug === value ? selected : undefined} onClick={() => onPick(c.slug)}>
    <span className="class-chip-icon"><img src={classIcon(c.slug, profile.gender)} alt="" loading="lazy" />{c.moves[0] !== 'infantry' && <img className="class-chip-move" src={`/yuphas/icons/skills/${c.moves[0]}-flat.png`} alt="" />}</span>
    <span className="class-chip-name">{c.ko || c.en}</span>
    <span className="class-chip-weapons" aria-hidden="true">{c.weapons.map((w) => <img key={w} src={`/yuphas/icons/skills/${w}${boon.has(w as never) ? '_boon' : ''}.png`} alt="" />)}</span>
  </button>;
  const own = shown.filter((c) => c.license === 'default');
  return <Dialog.Portal>
    <Dialog.Overlay className="class-picker-overlay" />
    <Dialog.Content className="class-picker" aria-describedby={undefined} onOpenAutoFocus={(e) => { e.preventDefault(); (selected.current || search.current)?.focus(); }}>
      <div className="class-picker-head">
        <Dialog.Title className="class-picker-title">병종 고르기</Dialog.Title>
        <div className="class-picker-tabs" role="group" aria-label="무기로 거르기">
          <button type="button" aria-pressed={weapon === 'all'} onClick={() => setWeapon('all')}>전체</button>
          {WEAPONS.map((w) => <button key={w} type="button" aria-pressed={weapon === w} aria-label={weaponKo[w]} title={weaponKo[w]} onClick={() => setWeapon(w)}><img src={`/yuphas/icons/skills/${w}.png`} alt="" /></button>)}
        </div>
        <label className="class-picker-search"><Search size={18} aria-hidden="true" /><input ref={search} type="search" aria-label="병종 검색" placeholder="이름·증서로 찾기" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <Dialog.Close className="class-picker-close" aria-label="닫기"><X size={18} aria-hidden="true" /></Dialog.Close>
      </div>
      <p className="sr-only" aria-live="polite">{shown.length}개 병종</p>
      <div className="class-picker-body">
        <div className="class-picker-own">{value && <button type="button" className="class-chip class-chip-clear" onClick={() => onPick(undefined)}><span className="class-chip-name">기록 지우기</span></button>}{own.map(chip)}</div>
        {licenses.filter((l) => l.id !== 'default').map((l) => {
          const list = shown.filter((c) => c.license === l.id);
          if (!list.length) return null;
          const headText = [`${l.ko} 증서`, l.level != null ? `Lv ${l.level}` : '', l.renown != null ? `명성 ${l.renown}` : '', 'part3' in l && l.part3 ? '3부 해금' : '', 'single' in l && l.single ? '한 번에 1명' : ''].filter(Boolean).join(' · ');
          return <section key={l.id} className="class-group" aria-label={headText}><h3>{headText}</h3>
            <div className="class-cols">{COLUMNS.map(([col, ko]) => { const cs = list.filter((c) => c.column === col); return cs.length ? <div key={col} className="class-col" data-col={ko}>{cs.map(chip)}</div> : <div key={col} className="class-col" data-empty="true" aria-hidden="true" />; })}</div>
          </section>;
        })}
        {!shown.length && <p className="class-picker-none">맞는 병종이 없습니다.</p>}
      </div>
    </Dialog.Content>
  </Dialog.Portal>;
}
