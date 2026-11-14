import type { Group } from './content';

/** 1부의 게임 연도(2026-11-14 사용자 예: "1449/10/16"). 2부·3부 할 일에는 달력 날짜가 없어 바닥 날짜를 보이지 않는다. */
export const PART1_YEAR = 1449;

/**
 * 묶음 제목의 게임 날짜. 범위("3/1~3/7")는 시작일을 쓴다.
 * 기한을 말하는 날짜("~4/10", "4/1까지", "11/6 전", "마감 10/22")는 지금 날짜가 아니므로 쓰지 않는다.
 */
export function titleDate(title: string): { m: number; d: number } | null {
  const m = title.match(/(~\s*|마감\s*)?(\d{1,2})\/(\d{1,2})(?!\d)(\s*(?:까지|마감|전(?![가-힣])))?/);
  if (!m || m[1] || m[4]) return null;
  const month = Number(m[2]), day = Number(m[3]);
  return month >= 1 && month <= 12 && day >= 1 && day <= 31 ? { m: month, d: day } : null;
}

/**
 * 지금 날짜: 루트 순서에서 처음으로 체크가 남은 묶음의 날짜. 그 묶음 제목에 날짜가 없으면 위로 올라가 가장 가까운 날짜를 쓴다.
 * 모두 체크했으면 마지막 묶음 기준. 위에 날짜가 하나도 없으면 null(바닥 날짜를 숨긴다).
 */
export function currentGameDate(ordered: Group[], done: (action: Group['actions'][number], group: Group) => boolean): { m: number; d: number } | null {
  if (!ordered.length) return null;
  let at = ordered.findIndex(g => g.actions.some(a => !done(a, g)));
  if (at < 0) at = ordered.length - 1;
  for (let i = at; i >= 0; i--) { const date = titleDate(ordered[i].title); if (date) return date; }
  return null;
}

export const formatGameDate = (year: number, date: { m: number; d: number }) => `${year}/${String(date.m).padStart(2, '0')}/${String(date.d).padStart(2, '0')}`;
