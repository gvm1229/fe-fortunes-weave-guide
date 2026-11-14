// 2026-11-15 사용자 결정: 개인 진행 문서(progress.md·루트별 progress.md·백업 사본)는 사이트에서 빼고 git 무시 폴더 progress/docs/로 옮긴다.
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
const m = JSON.parse(readFileSync('content/transfer-manifest.json', 'utf8'));
const moved = m.sourceFiles.filter(f => /(^|\/)progress\.md$/.test(f.target)).map(f => f.target);
for (const src of moved) {
  const dst = 'progress/docs/' + src.replace(/^content\//, '');
  if (existsSync(src)) { mkdirSync(dirname(dst), { recursive: true }); renameSync(src, dst); }
}
m.sourceFiles = m.sourceFiles.filter(f => !moved.includes(f.target));
writeFileSync('content/transfer-manifest.json', JSON.stringify(m, null, 2) + '\n');
console.log('옮김 ' + moved.length + '개 → progress/docs/');
