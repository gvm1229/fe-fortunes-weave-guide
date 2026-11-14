import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
/**
 * 내보낸 조각 미리 읽기 파일은 out/team/__next.team/__PAGE__.txt처럼 폴더로 나뉘지만
 * 브라우저는 out/team/__next.team.__PAGE__.txt를 요청한다(404). 점으로 이은 이름으로 복사해 둔다.
 */
export function flattenPrefetch(out = 'out') {
  if (!existsSync(out)) return 0;
  let copied = 0;
  const flatten = (page, dir, parts) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, e.name); if (e.isDirectory()) flatten(page, p, [...parts, e.name]); else { copyFileSync(p, join(page, [...parts, e.name].join('.'))); copied++; } } };
  const walk = dir => { for (const e of readdirSync(dir, { withFileTypes: true })) { if (!e.isDirectory()) continue; const p = join(dir, e.name); if (e.name.startsWith('__next.')) flatten(dir, p, [e.name]); else walk(p); } };
  walk(out);
  return copied;
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) console.log(`미리 읽기 조각 ${flattenPrefetch(process.argv[2])}개를 점 이름으로 복사`);
