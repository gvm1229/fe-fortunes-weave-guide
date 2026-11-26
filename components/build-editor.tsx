'use client';
import { useEffect, useRef, useState } from 'react';
import { ClassPicker } from './class-picker';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useChecks } from './checks';
import { YLink, skillKo } from './yuphas';
import { personUrl } from '@/lib/yuphas';
import { classBySlug, classIcon } from '@/lib/yuphas-classes';
import { NOTE_MAX, RANKS, type Build, type BuildRoute, type Rank } from '@/lib/check-state';
import type { YuphasProfile } from '@/lib/yuphas-profile';
/**
 * 인물 서랍의 '내 기록'(2026-11-27 사용자 요청, U72): 이 루트에서 이 인물의 병종·레벨·숙련 등급·메모.
 * 브라우저 저장소(체크 기록과 다른 열쇠)에 저장하고 기록 관리 → 내보내기 파일에 함께 들어간다. 입력은 루트 화면 서랍에서만(팀 화면 없음).
 * 숫자 칸은 칸을 떠날 때·Enter·▲▼에서만, 메모는 칸을 떠날 때 저장해 글자마다 기록 번호가 오르지 않게 한다. 서랍을 닫으면 남은 글도 저장한다.
 */
const clamp = (n: number) => Math.min(99, Math.max(1, Math.round(n)));
export function useBuild(route: string, slug?: string): Build | undefined {
  const { data } = useChecks();
  return slug ? data.builds?.[route as BuildRoute]?.[slug] : undefined;
}
/**
 * 편집 중인 글을 저장 값에 맞추고(가져오기·다른 탭에서 바뀌면 따라감), 칸이 화면에서 없어질 때(서랍 닫기) 아직 저장하지 않은 글을 저장한다.
 * key로 칸을 다시 만들지 않는다: 다시 만들면 저장할 때마다 초점을 잃었다(2026-11-27 Fable 검토 21 지적 1·2).
 */
function useDraft<T>(value: T | undefined, toText: (v: T | undefined) => string, parse: (text: string) => T | undefined, onSave: (v: T | undefined) => void) {
  const [text, setText] = useState(toText(value));
  const [seen, setSeen] = useState(value);
  if (seen !== value) { setSeen(value); setText(toText(value)); }
  const latest = useRef({ text, value, parse, onSave });
  useEffect(() => { latest.current = { text, value, parse, onSave }; });
  useEffect(() => () => { const { text: t, value: v, parse: p, onSave: save } = latest.current; const next = p(t); if (next !== v) save(next); }, []);
  return [text, setText] as const;
}
const levelText = (v?: number) => (v ? String(v) : '');
const parseLevel = (raw: string) => { const n = parseInt(raw, 10); return raw.trim() === '' || Number.isNaN(n) ? undefined : clamp(n); };
function LevelField({ value, disabled, onSave }: { value?: number; disabled: boolean; onSave: (v: number | undefined) => void }) {
  const [text, setText] = useDraft(value, levelText, parseLevel, onSave);
  const commit = (raw: string) => { const next = parseLevel(raw); setText(levelText(next)); if (next !== value) onSave(next); };
  const step = (d: number) => { const n = clamp((parseInt(text, 10) || value || (d > 0 ? 0 : 2)) + d); setText(String(n)); if (n !== value) onSave(n); };
  return <span className="build-level"><label htmlFor="build-level-input">Lv</label>
    <input id="build-level-input" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={text} disabled={disabled} aria-label="레벨(1~99)" placeholder="–"
      onChange={(e) => setText(e.target.value.replace(/\D/g, ''))} onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(e.currentTarget.value); else if (e.key === 'ArrowUp') { e.preventDefault(); step(1); } else if (e.key === 'ArrowDown') { e.preventDefault(); step(-1); } }} />
    {/* ▲▼ 단추는 누를 곳 32×32px(U55), 가로로 나란히. 키보드는 칸에서 ↑↓. */}
    <span className="build-steps"><button type="button" tabIndex={-1} disabled={disabled} aria-label="레벨 내리기" onClick={() => step(-1)}><ChevronDown size={16} aria-hidden="true" /></button><button type="button" tabIndex={-1} disabled={disabled} aria-label="레벨 올리기" onClick={() => step(1)}><ChevronUp size={16} aria-hidden="true" /></button></span>
  </span>;
}
const noteText = (v?: string) => v || '';
const parseNote = (t: string) => t.trim() || undefined;
function NoteField({ value, disabled, onSave }: { value?: string; disabled: boolean; onSave: (v: string | undefined) => void }) {
  const [text, setText] = useDraft(value, noteText, parseNote, onSave);
  return <input className="build-note" type="text" maxLength={NOTE_MAX} value={text} disabled={disabled} placeholder="메모" aria-label={`메모(${NOTE_MAX}자 이하)`}
    onChange={(e) => setText(e.target.value)} onBlur={() => { const v = parseNote(text); if (v !== value) onSave(v); }} />;
}
export function BuildEditor({ route, profile }: { route: string; profile: YuphasProfile }) {
  const checks = useChecks(), build = useBuild(route, profile.slug), disabled = !checks.ready;
  const save = (patch: Partial<Build> | null) => checks.setBuild(route as BuildRoute, profile.slug, patch);
  const picked = classBySlug(build?.classId);
  const button = <button type="button" className="build-class" disabled={disabled} data-recorded={picked ? true : undefined} aria-label={`병종 고르기, 지금 ${picked ? picked.ko || picked.en : '기록 없음'}`}>
    {picked ? <img src={classIcon(picked.slug, profile.gender)} alt="" /> : profile.cls?.icon && <img src={profile.cls.icon} alt="" />}
    <span>{picked ? picked.ko || picked.en : '병종 고르기'}</span>
    {(picked?.moves || []).filter((m) => m !== 'infantry').map((m) => <img key={m} className="y-move-icon" src={`/yuphas/icons/skills/${m}-flat.png`} alt="" />)}
    <ChevronDown size={18} aria-hidden="true" />
  </button>;
  return <div className="build-editor" data-build-editor>
    <div className="build-row"><ClassPicker profile={profile} value={build?.classId} onPick={(classId) => save({ classId })}>{button}</ClassPicker>
      <LevelField value={build?.level} disabled={disabled} onSave={(level) => save({ level })} /></div>
    <ul className="build-skills" aria-label="숙련 등급">{profile.skills.map((s) => {
      const value = build?.skills?.[s.id] || '', label = skillKo[s.skill];
      return <li key={s.id} data-state={s.state}><img src={s.icon} alt={`${label}${s.state === 'boon' ? ' 장점' : s.state === 'bane' ? ' 약점' : ''}`} title={label} />
        <select aria-label={`${label} 등급`} value={value} disabled={disabled} data-empty={!value || undefined} onChange={(e) => save({ skills: { [s.id]: (e.target.value || undefined) as Rank | undefined } })}>
          <option value="">{profile.ranks[s.id] || '–'}</option>{RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select></li>;
    })}</ul>
    <NoteField value={build?.note} disabled={disabled} onSave={(note) => save({ note })} />
    <div className="build-foot"><YLink en={`${profile.en} · Builder`} href={personUrl(profile.slug, 'builder')} />
      {build && <button type="button" className="text-link build-clear" disabled={disabled} onClick={() => { if (window.confirm(`${profile.en}의 이 루트 육성 기록(병종·레벨·숙련 등급·메모)을 지울까요?`)) save(null); }}>이 인물 기록 지우기</button>}</div>
  </div>;
}
