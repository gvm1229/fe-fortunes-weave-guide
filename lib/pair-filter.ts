// 「루트별 지원 대화」처럼 '대화' 열(예: "티아라–보나파르트")이 있는 Markdown 표를 인물로 거른다(2026-11-15 사용자 지시).
const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
const isTable = (line: string) => line.trim().startsWith('|');
const isRule = (line: string) => /^\|?\s*:?-{3,}/.test(line.trim());

type Table = { start: number; end: number; col: number };
function tables(lines: string[]): Table[] {
  const out: Table[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!isTable(lines[i]) || !lines[i + 1] || !isRule(lines[i + 1])) continue;
    let end = i + 2; while (end < lines.length && isTable(lines[end])) end++;
    const col = cells(lines[i]).indexOf('대화');
    if (col >= 0) out.push({ start: i, end, col });
    i = end - 1;
  }
  return out;
}
const pairOf = (line: string, col: number) => (cells(line)[col] || '').split(/[–—-]/).map(s => s.trim()).filter(Boolean);

/** 표의 '대화' 열에 나오는 인물(이 화면에 보이는 문서 기준, 가나다순). */
export function pairNames(body: string): string[] {
  const lines = body.split('\n'), names = new Set<string>();
  for (const t of tables(lines)) for (let i = t.start + 2; i < t.end; i++) for (const n of pairOf(lines[i], t.col)) names.add(n);
  return [...names].sort((a, b) => a.localeCompare(b, 'ko'));
}

/** 고른 인물이 한 명이라도 든 줄만 남긴다. 남는 줄이 없는 표는 안내 한 줄로 바꾼다. */
export function filterPairs(body: string, selected: string[]): string {
  if (!selected.length) return body;
  const want = new Set(selected), lines = body.split('\n'), list = tables(lines), out: string[] = [];
  let i = 0;
  for (const t of list) {
    out.push(...lines.slice(i, t.start));
    const rows = lines.slice(t.start + 2, t.end).filter(l => pairOf(l, t.col).some(n => want.has(n)));
    out.push(...(rows.length ? [lines[t.start], lines[t.start + 1], ...rows] : ['_고른 인물의 대화가 이 표에는 없습니다._']));
    i = t.end;
  }
  out.push(...lines.slice(i));
  return out.join('\n');
}
