export function resolveDoc(url: string, current = 'notes/index.md') {
  let decoded: string;
  try { decoded = decodeURIComponent(url); } catch { decoded = url; }
  const [pathname, fragment] = decoded.split('#');
  if (!pathname) return current.split('#')[0] + (fragment ? '#' + fragment : '');
  const path = pathname.replace(/\.html$/, '.md');
  const rooted = path.startsWith('/') || /^(notes|routes)\//.test(path) || ['progress.md','개인화 사용법.md','theodora-progress-import.md'].includes(path);
  const parts = (rooted ? path : current.split('#')[0].slice(0, current.split('#')[0].lastIndexOf('/') + 1) + path).split('/');
  const result: string[] = [];
  for (const part of parts) { if (part === '..') result.pop(); else if (part && part !== '.') result.push(part); }
  let resolved=result.join('/');
  resolved=resolved.replace(/^notes\/backups\/[^/]+\/(?=notes\/|routes\/)/,'');
  return resolved + (fragment ? '#' + fragment : '');
}

export function headingId(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
}
import actions from '../content/action-links.json' with { type: 'json' };
export function guideHref(url:string,current?:string){
  const resolved=resolveDoc(url,current),[path,fragment]=resolved.split('#');
  if((url.startsWith('#')||/(?:personalized|guide)\.md$/.test(path))&&fragment&&(actions as Record<string,string>)[fragment])return (actions as Record<string,string>)[fragment];
  if(/(?:^|\/)personalized-team\.md$/.test(path))return '/team/';
  if(/(?:^|\/)(?:personalized|guide)\.md$/.test(path))return '/theodora/1/';
  return null;
}
