// 배포 관문(2026-11-15, docs/user-rules.md): [P01] 배포 전 Fable 5.2 검토 · [P02] 배포와 함께 git push · [P03] 작은 문제까지 모두 고친 뒤에만 배포(모든 검사 통과·낮음 지적 포함 0).
//   node scripts/release.mjs check   — 사이트 원본을 .tmp/complete-preview로 옮겨 정적 빌드하고, 자료 검사와 모든 브라우저 검사를 돌린다.
//                                      모두 통과하면 .tmp/release-gate.json에 원본 해시와 빌드(out) 해시를 적는다.
//   node scripts/release.mjs deploy  — 커밋 안 된 변경(새 파일 포함, .claude/·.omc/ 제외)이 없고, 원본·빌드 해시가 검사 때와 같고,
//                                      docs/fable-review-*.md 중 하나에 '검토 대상 해시: <해시>'와 '남은 지적(낮음 포함): 0'이 있을 때만
//                                      Netlify에 배포하고 git push 한다.
// 규칙 문서(docs/user-rules.md·AGENTS.md)도 해시에 들어간다. 규칙을 바꾸면 Fable 검토를 다시 받아야 배포할 수 있다.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
const SITE = 'ca844312-b942-4708-a9a2-7bcf0c812fe5', PREVIEW = '.tmp/complete-preview', OUT = join(PREVIEW, 'out'), PORT = 18764, GATE = '.tmp/release-gate.json';
const HASHED = ['app', 'components', 'lib', 'content', 'scripts', 'public', 'package.json', 'next.config.ts', 'docs/user-rules.md', 'AGENTS.md'];
const IGNORED = new Set(['public/assets', 'public/reference-data', 'public/reference-files']);
const CONFIG = ['package.json', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs', 'components.json'];
process.env.TEMP = process.env.TMP = resolve('.tmp');

/** 파일 전체의 해시. 검토 기록(docs/fable-review-*)·HANDOFF는 넣지 않아 검토 기록을 커밋해도 바뀌지 않는다. */
function hashOf(paths) {
  const h = createHash('sha256'), files = [];
  const walk = p => { if (IGNORED.has(p.replaceAll('\\', '/'))) return; const s = statSync(p); if (s.isDirectory()) for (const e of readdirSync(p).sort()) walk(join(p, e)); else files.push(p.replaceAll('\\', '/')); };
  for (const p of paths) if (existsSync(p)) walk(p);
  for (const f of files.sort()) { h.update(f + '\0'); h.update(readFileSync(f)); h.update('\0'); }
  return h.digest('hex').slice(0, 16);
}
const sourceHash = () => hashOf(HASHED);
const run = (cmd, args, opts = {}) => { console.log('\n== ' + [cmd, ...args].join(' ')); const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' && cmd !== process.execPath, ...opts }); if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} 실패(${r.status})`); };
const DATA = ['scripts/verify.mjs', 'scripts/verify-character-copy.mjs', 'scripts/verify-character-data.mjs'];
const BROWSER = ['layout-browser-check', 'button-gap-check', 'status-browser-check', 'header-browser-check', 'feature-browser-check', 'rules-browser-check', 'team-fit-check', 'design-lead-browser-check', 'browser-check', 'corrections-browser-check', 'consistency-browser-check', 'home-visual-check'].map(n => `scripts/${n}.mjs`);

async function check() {
  rmSync(GATE, { force: true });
  const hash = sourceHash();
  for (const f of DATA) run(process.execPath, [f]);
  for (const d of ['app', 'components', 'lib', 'content']) { rmSync(join(PREVIEW, d), { recursive: true, force: true }); cpSync(d, join(PREVIEW, d), { recursive: true }); }
  for (const f of CONFIG) if (existsSync(f)) cpSync(f, join(PREVIEW, f));
  rmSync(join(PREVIEW, 'content/data/checklist.json'), { force: true });
  cpSync('assets', 'public/assets', { recursive: true });
  rmSync('public/reference-data', { recursive: true, force: true }); rmSync('public/reference-files', { recursive: true, force: true });
  run(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--webpack'], { cwd: PREVIEW });
  run(process.execPath, ['../../scripts/flatten-prefetch.mjs', 'out'], { cwd: PREVIEW });
  const server = spawn(process.execPath, ['scripts/serve-static.mjs', OUT, String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    // 포트가 이미 쓰이면(옛 서버가 옛 빌드를 내보내는 중) 검사가 옛 빌드를 보게 되므로 멈춘다.
    await new Promise((ok, fail) => { server.stdout.on('data', d => String(d).includes('serving') && ok()); server.on('exit', c => fail(new Error(`검사 서버가 뜨지 않았다(포트 ${PORT} 사용 중?) 종료 ${c}`))); });
    for (const f of BROWSER) run(process.execPath, [f], { env: { ...process.env, BROWSER_BASE_URL: `http://localhost:${PORT}` } });
  } finally { server.kill(); }
  if (sourceHash() !== hash) throw new Error('검사 중 원본이 바뀌었다. 다시 돌린다.');
  mkdirSync('.tmp', { recursive: true });
  writeFileSync(GATE, JSON.stringify({ hash, out: hashOf([OUT]), data: DATA, browser: BROWSER, at: new Date().toISOString() }, null, 2));
  console.log(`\n통과: 배포 관문 검사 ${DATA.length + BROWSER.length}개 · 원본 해시 ${hash}`);
}

function deploy() {
  const dirty = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).stdout.split('\n').filter(l => l.trim() && !/^\?\? \.(claude|omc)\//.test(l));
  if (dirty.length) throw new Error('커밋 안 된 변경이 있다:\n' + dirty.join('\n'));
  const hash = sourceHash();
  if (!existsSync(GATE)) throw new Error('검사 기록이 없다. node scripts/release.mjs check 먼저.');
  const gate = JSON.parse(readFileSync(GATE, 'utf8'));
  if (gate.hash !== hash) throw new Error(`검사 뒤 원본이 바뀌었다(검사 ${gate.hash}, 지금 ${hash}). check를 다시 돌린다.`);
  if (gate.out !== hashOf([OUT])) throw new Error('검사한 빌드(out)가 바뀌었다. check를 다시 돌린다.');
  const review = readdirSync('docs').filter(f => /^fable-review.*\.md$/.test(f)).map(f => join('docs', f)).find(f => { const t = readFileSync(f, 'utf8'); return t.includes('검토 대상 해시: ' + hash) && /남은 지적\(낮음 포함\): 0(?!\d)/.test(t); });
  if (!review) throw new Error(`Fable 5.2 검토 기록이 없다. docs/fable-review-*.md에 '검토 대상 해시: ${hash}'와 '남은 지적(낮음 포함): 0'이 있어야 한다.`);
  console.log('Fable 검토: ' + review);
  run('npx', ['netlify-cli', 'deploy', '--prod', '--dir', OUT, '--site', SITE, '--no-build']);
  try { run('git', ['push', 'origin', 'main']); } catch (e) { console.error('배포는 끝났지만 git push가 실패했다. 원인을 고치고 git push origin main을 다시 한다.'); throw e; }
  console.log('\n배포·푸시 완료 · 원본 해시 ' + hash);
}

const cmd = process.argv[2];
if (cmd === 'check') await check(); else if (cmd === 'deploy') deploy(); else if (cmd === 'hash') console.log(sourceHash()); else { console.error('사용: node scripts/release.mjs check|deploy|hash'); process.exit(2); }
