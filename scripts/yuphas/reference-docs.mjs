// 화면에서 뺀 근거·기록용 글을 docs/reference/*.md로 모은다(2026-11-27 사용자 결정, docs/yuphas-integration-research.md §4.1).
// 자료(content/derived·content/notes)는 그대로 두고, 화면은 그릴 때 거른다. 이 스크립트는 같은 조각을 문서로 옮겨 적는다.
//   node scripts/yuphas/reference-docs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { REPO, R } from './lib.mjs';

const OUT = `${REPO}/docs/reference`;
fs.mkdirSync(OUT, { recursive: true });
const write = (name, text) => { fs.writeFileSync(`${OUT}/${name}`, text.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'); console.log('docs/reference/' + name); };
const flat = (n) => typeof n === 'string' ? n : (n.children || []).map(flat).join('');
/** 파생 자료 나무 → 읽을 수 있는 마크다운(제목·목록·표·문단). */
function md(nodes, depth = 0) {
  let out = '';
  for (const n of nodes) {
    if (typeof n === 'string') { out += n; continue; }
    const t = n.tag, kids = n.children || [];
    if (/^h[2-5]$/.test(t)) out += `\n\n${'#'.repeat(Math.min(6, Number(t[1]) + 1))} ${flat(n).trim()}\n\n`;
    else if (t === 'li') out += `\n${'  '.repeat(depth)}- ${md(kids, depth + 1).trim()}`;
    else if (t === 'ul' || t === 'ol') out += md(kids, depth) + '\n';
    else if (t === 'tr') out += `\n| ${kids.filter((c) => typeof c !== 'string').map((c) => md([c]).replace(/\s*\n\s*/g, ' ').replace(/\|/g, '/').trim()).join(' | ')} |`;
    else if (t === 'table') out += '\n' + md(kids) + '\n\n';
    else if (t === 'p' || t === 'summary' || t === 'figcaption') out += `\n\n${md(kids).trim()}\n\n`;
    else if (t === 'br') out += '\n';
    else if (t === 'img') out += n.attrs?.alt ? `[그림: ${n.attrs.alt}]` : '';
    else if (t === 'a' && n.attrs?.href && /^https?:/.test(n.attrs.href)) out += `[${flat(n).trim()}](${n.attrs.href})`;
    else out += md(kids, depth);
  }
  return out;
}
const head = (title, note) => `# ${title}\n\n${note}\n`;

// 1. 인물 원문 기록(인물 카드·서랍의 "원문 기록" 접이)
{ const people = R('content/derived/presentation.json').parity.people;
  let text = head('인물 원문 기록', '화면의 인물 카드·인물 서랍에 있던 접이 "원문 기록"(원본 공략 조각)을 옮겼다(2026-11-27). 원본 자료: content/derived/presentation.json `parity.people`.');
  for (const p of people) text += `\n## ${p.name} · ${p.route}\n\n${md(p.tree).trim()}\n`;
  write('people-original.md', text); }

// 2. 팀 비교 근거 탭
{ const sec = R('content/derived/presentation.json').parity.teamSections.details.tree;
  write('team-comparison.md', head('팀 비교 근거', '팀 화면의 넷째 탭 "비교 근거"(선택한 편성 설명·근거와 판단의 한계·확인한 원문·후보별 손익 등)를 옮겼다(2026-11-27). 팀 화면 탭은 이제 최종 25인·백마술·루트 편성 셋이다. 원본 자료: content/derived/presentation.json `parity.teamSections.details`.') + '\n' + md(sec).trim()); }

// 3. 그림 출처·입수 원문 링크(할 일 묶음 아래)
{ const c = R('content/derived/checklist.json'), rows = [];
  const walk = (n, block) => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach((x) => walk(x, block)); return; }
    const id = n.id && (n.notes || n.actions || n.heading) ? n.id : block;
    if (n.tag === 'a' && /^(그림 출처|입수 원문)/.test(flat(n).trim()) && n.attrs?.href) rows.push([id, flat(n).trim(), n.attrs.href]);
    for (const v of Object.values(n)) if (v && typeof v === 'object' && v !== n.attrs) walk(v, id); };
  walk(c, '');
  let text = head('그림 출처·입수 원문 링크', `할 일 묶음 아래에 있던 "그림 출처"·"입수 원문" 링크 ${rows.length}개를 옮겼다(2026-11-27). 물품 입수처는 이제 yuphastemple 물품 단추(영어 이름)가 대신한다. 그림 파일 자체의 출처는 assets/*/manifest.json·assets/design/SOURCES.md.`);
  text += '\n| 묶음 | 링크 | 주소 |\n|---|---|---|\n' + rows.map((r) => `| ${r[0]} | ${r[1]} | ${r[2]} |`).join('\n');
  write('image-sources.md', text); }

// 4. 확인 꼬리말(화면에는 "미확인" 한 낱말)
{ const files = ['content/derived/checklist.json', 'content/display-overrides.json', 'content/data/playbook.json'], seen = new Set(), rows = [];
  const re = /[^"。.]*(?:한 곳에서만 확인|출처 한 곳|단일 출처|Anna's Notebook 초안, 미검증|확인되지 않았다)[^"。.]*[.。]?/g;
  for (const f of files) for (const m of fs.readFileSync(`${REPO}/${f}`, 'utf8').matchAll(re)) { const s = m[0].trim(); if (!seen.has(s)) { seen.add(s); rows.push([f, s]); } }
  let text = head('확인되지 않은 내용(원문 꼬리말)', '할 일 글의 확인 꼬리말("원래 공략 한 곳에서만 확인됐다", "(단일 출처)", "Anna\'s Notebook 초안, 미검증", "확인되지 않았다")은 화면에서 한 낱말 "미확인"으로 줄였다(2026-11-27, lib/display.ts `verificationTail`). 자료의 원문은 그대로이며 아래가 그 문장 전부다.');
  text += '\n| 파일 | 원문 |\n|---|---|\n' + rows.map((r) => `| ${r[0]} | ${r[1].replace(/\|/g, '/')} |`).join('\n');
  write('unverified.md', text); }

// 5. 지원 대화 근거(순서 잠금 근거 열 + "## 근거" 절)
{ const doc = fs.readFileSync(`${REPO}/content/notes/support-pairs-by-route.md`, 'utf8');
  const lock = doc.match(/## 순서 잠금[\s\S]*?(?=\n## )/)?.[0] || '', basis = doc.match(/\n## 근거[\s\S]*$/)?.[0] || '';
  write('support-evidence.md', head('루트별 지원 대화 근거', '"루트별 지원 대화" 문서의 순서 잠금 표 근거 열과 "## 근거" 절을 옮겼다(2026-11-27). 화면은 이 열·절을 그리지 않고, 파일 content/notes/support-pairs-by-route.md는 그대로다(검사 U36·U39가 읽음).') + '\n' + lock.replace(/^## /m, '## ') + '\n' + basis.replace(/^\n/, '')); }

// 7. 준비 탭에서 뺀 공통 기준·운영 안내(2026-11-27 사용자 결정 Q2, U69). 화면은 그림 다섯 묶음만(lib/prep.ts). 같은 글은 한 번만 적는다.
{ const { scopeTree } = await import('../../lib/scope.ts');
  const P = R('content/derived/presentation.json').parity;
  const keep = /^(장을 넘기기 전|이번 주|남은 미영입 대상|다음 로드 선행 식사|2부에는 주간 식사 없음|3부는 출격할 세 명만)/;
  const names = { theodora: '세오도라', leda: '레다', dietrich: '디트리히', cai: '카이', part3: '3부' };
  const seen = new Set();
  let text = head('준비 탭 공통 기준·운영 안내', '준비 탭을 그림 다섯 묶음(가호 봉사·이번 주 식사·시험 단계·장을 넘기기 전·바로가기)으로 다시 그리면서 화면에서 뺀 글을 옮겼다(2026-11-27, 사용자 결정). 자료 content/derived/presentation.json(parity.prep·exam·stages)은 그대로다. 같은 글이 여러 루트에 나오면 처음 한 번만 적었다.');
  const sections = (nodes, out = []) => { for (const n of nodes) { if (typeof n === 'string') continue; if (n.tag === 'section' && n.children.some((c) => typeof c !== 'string' && c.tag === 'h3')) out.push(n); else sections(n.children || [], out); } return out; };
  const add = (title, body) => { body = body.trim(); if (!body || seen.has(body)) return ''; seen.add(body); return (title ? `### ${title}\n\n` : '') + body + '\n\n'; };
  for (const [route, part, stage] of [['theodora', '1', 'theodora-plan'], ['leda', '1', 'leda-plan'], ['dietrich', '1', 'dietrich-plan'], ['cai', '1', 'cai-plan'], ['theodora', '2', 'theodora-war-plan'], ['leda', '2', 'leda-war-plan'], ['dietrich', '2', 'dietrich-war-plan'], ['cai', '2', 'cai-war-plan'], ['part3', '3', 'part3-plan']]) {
    let body = '';
    for (const s of sections(scopeTree(P.prep, route, part))) { const title = flat(s.children.find((c) => typeof c !== 'string' && c.tag === 'h3')).trim(); if (!keep.test(title)) body += add('', md([s])); }
    body += add('시험 기준', md(scopeTree(P.exam, route, part)));
    for (const b of P.stages.find((x) => x.id === stage)?.blocks || []) body += add(b.title, md(scopeTree(b.tree, route, part)));
    if (body) text += `\n## ${names[route]} ${part}부\n\n` + body;
  }
  write('prep-common.md', text); }

// 6. 목차
{ const notes = `${REPO}/content/notes`, list = [];
  const walkDir = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const p = path.join(d, e.name); if (e.isDirectory()) walkDir(p); else if (e.name.endsWith('.md')) { const t = fs.readFileSync(p, 'utf8').match(/^# (.+)$/m)?.[1] || e.name; list.push([path.relative(REPO, p).replaceAll('\\', '/'), t]); } } };
  walkDir(notes);
  let text = head('참고 문서 목차', '사이트의 "참고 문서" 화면을 없앴다(2026-11-27). 문서 파일은 content/notes/에 그대로 있고(검사가 해시로 지킨다), 이 목차로 찾아간다. 플레이어용 문서(루트별 지원 대화, 병종, 시험 안내)는 사이트의 단추에서 계속 열린다.');
  text += '\n## 화면에서 옮긴 근거·기록\n\n- [인물 원문 기록](people-original.md)\n- [팀 비교 근거](team-comparison.md)\n- [그림 출처·입수 원문 링크](image-sources.md)\n- [확인되지 않은 내용](unverified.md)\n- [준비 탭 공통 기준·운영 안내](prep-common.md)\n- [루트별 지원 대화 근거](support-evidence.md)\n- [이름 검토 목록](name-review.md)\n';
  text += `\n## content/notes (${list.length}건)\n\n` + list.map(([p, t]) => `- [${t.replace(/[[\]]/g, '')}](../../${p})`).join('\n');
  write('README.md', text); }
