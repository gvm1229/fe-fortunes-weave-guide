// 2026-11-14 사용자 결정: 이전 프로젝트(fe-fortunes-weave-guide-main)는 읽기 전용이며 더 이상 가져오지 않는다. 이 저장소의 content/가 정본이다(루트 ID cai).
if(!process.argv.includes('--force-legacy-import')){console.error('transfer는 중단됐습니다: 이전 프로젝트는 읽기 전용 참고입니다. content/를 직접 고치고 npm run derive:checklist로 파생 파일을 갱신하세요.');process.exit(1);}
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, existsSync } from 'node:fs';
import { resolve, relative, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
const source = resolve(process.argv[2] || '../fe-fortunes-weave-guide-main');
const read = p => JSON.parse(readFileSync(resolve(source, p), 'utf8'));
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const files = [];
function copyFile(file, target = `content/${file}`) {
  mkdirSync(resolve(target, '..'), { recursive: true });
  cpSync(resolve(source, file), target);
  files.push({ source: file, target, sha256: hash(target) });
}
function copyTree(dir, destination) {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(resolve(source, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) copyTree(path, `${destination}/${entry.name}`);
    else if ((dir.startsWith('data') && entry.name.endsWith('.json') && !entry.name.includes('backup')) || ((dir.startsWith('notes') || dir.startsWith('routes')) && entry.name.endsWith('.md'))) {
      const target = `${destination}/${entry.name}`;
      cpSync(resolve(source, path), target);
      files.push({ source: path, target, sha256: hash(target) });
    }
  }
}
copyTree('data', 'content/data'); copyTree('notes', 'content/notes');
for (const file of ['progress.md', 'theodora-progress-import.md', 'theodora-progress-import.json', '개인화 사용법.md']) if (existsSync(resolve(source,file))) copyFile(file);
copyTree('routes','content/routes');
copyFile('personalized-app/README.md');
// Preserve the local evidence linked by personal documents, without importing archive pages.
for(const doc of files.filter(f=>f.source.endsWith('.md'))){
  for(const [,url] of readFileSync(doc.target,'utf8').matchAll(/\]\(([^\s)]+)(?:[^)]*)\)/g)){
    if(/^(https?:|#|mailto:)/.test(url))continue;
    const file=posix.normalize(posix.join(posix.dirname(doc.source),decodeURIComponent(url.split('#')[0])));
    if(!/^(notes|routes)\//.test(file)||!/\.(json|png|jpe?g|webp)$/.test(file)||!existsSync(resolve(source,file)))continue;
    if(!files.some(f=>f.source===file))copyFile(file,`content/attachments/${file}`);
  }
}
copyFile('personalized-app/src/content.json', 'content/source/react-content.json');
copyFile('personalized-app/src/timeskip-portraits.json', 'content/source/timeskip-portraits.json');
cpSync(resolve(source, 'data/checklist.json'), 'content/checklist-seed.json');
const old = read('personalized-app/src/content.json');
const playbook = read('data/playbook.json');
// Generated markup is only decoded to semantic data for display-parity evidence.
// Canonical actions, goals, roles, recruitment and documents remain the source of app content.
function semantic(html) {
  const $ = load(html, null, false);
  function visit(n) {
    if (n.type === 'text') return n.data;
    if (!n.tagName || ['script','style','svg','path','input','iframe','object','embed'].includes(n.tagName)) return null;
    const attrs = Object.fromEntries(Object.entries(n.attribs || {}).filter(([k,v]) => /^(href|src|alt|title|id|colspan|rowspan|scope|data-[\w-]+|aria-label)$/.test(k) && !(/^(href|src|data-reference-url)$/.test(k) && /^(?:\s*(?:javascript|data|vbscript):|\/\/)/i.test(v))));
    return { tag: n.tagName, attrs, children: (n.children || []).map(visit).filter(x => x !== null) };
  }
  return $.root().contents().toArray().map(visit).filter(x => x !== null);
}
const supplements = {
  people: old.people.map(({ html, ...p }) => ({ ...p, tree: semantic(html) })),
  stages: old.stages.map(s => ({ id: s.id, blocks: s.blocks.filter(b => !playbook.groups.some(g => g.id === b.id)).map(b => ({ id: b.id, title: b.title, tree: semantic(b.html) })) })),
  prep: semantic(old.prep), materials: semantic(old.materials), exam: semantic(old.exam),
  budgets: Object.fromEntries(Object.entries(old.budgets).map(([k,v]) => [k, semantic(v)])),
  team: old.team,
  teamSections: Object.fromEntries(Object.entries(old.teamSections).map(([key,html]) => [key, {tree:semantic(html)}])),
  teamWhite: Object.fromEntries(Object.entries(old.team.units).map(([name,unit]) => [name, {tree:semantic(unit.whiteHighlightHtml || '')}])),
  routeTeams: Object.fromEntries(['theodora','leda','dietrich','cai'].map(route => {
    const $=load(old.teamSections.routes,null,false),panel=$(`#panel-${route}`);
    return [route,{intro:{tree:semantic(panel.find('.route-intro').html()||'')},parts:Object.fromEntries(['1','2','3'].map(part=>[part,{tree:semantic(panel.find(`[data-content-phase="${part}"]`).html()||'')}]))}];
  })),
};
const referenceDocuments={};
function referenceHtml(dir){for(const entry of readdirSync(resolve(source,dir),{withFileTypes:true})){
  const file=`${dir}/${entry.name}`;
  if(entry.isDirectory())referenceHtml(file);
  else if(file.endsWith('.html')&&!existsSync(resolve(source,file.replace(/\.html$/,'.md')))){
    copyFile(file,`content/reference-source/${file}`);
    const $=load(readFileSync(resolve(source,file),'utf8'));
    const main=$('.reference-content, .reading-document, main').first();
    const body=main.length?main:$('body');
    body.find('script,style,.reference-toolbar,.side-nav,.hero,.footer').remove();
    referenceDocuments[file.replace(/\.html$/,'.md')]={title:$('h1').first().text()||$('title').text(),tree:semantic(body.html()||'')};
  }
}}
referenceHtml('notes');
writeFileSync('content/source/reference-documents.json',JSON.stringify(referenceDocuments));
mkdirSync('content', { recursive: true });
writeFileSync('content/display-parity.json', JSON.stringify(supplements));
const ids = [...new Set([...playbook.groups, ...playbook.retiredGroups].flatMap(g => [g.id, ...g.actions.map(a => a.id)]).concat(playbook.retiredActions.map(a => a.id)))];
const missing = old.allTaskIds.filter(id => !ids.includes(id));
if (missing.length) throw new Error(`정본에서 찾지 못한 역사 ID: ${missing.join(',')}`);
writeFileSync('content/check-ids.json', JSON.stringify(ids));
const evidence = {
  schemaVersion: 1,
  sourceFiles: files,
  generatedSourceSha256: hash(resolve(source, 'personalized-app/src/content.json')),
  activeActions: playbook.groups.reduce((n,g) => n + g.actions.length, 0),
  checkIds: old.allTaskIds.length,
  peopleByRoute: Object.fromEntries(['theodora','leda','dietrich','cai'].map(r => [r, old.people.filter(p => p.route === r).length])),
  peopleByStage: Object.fromEntries(old.stages.map(s => [s.id, old.people.filter(p => s.id === 'part3-plan' ? p.roles['3'] : p.route === s.id.split('-')[0] && p.roles[s.id.includes('-war-') ? '2' : '1']).length])),
  recruitAssignments: read('data/recruit-all-plan.json').assignments.length,
  referenceDocs: files.filter(x => x.source.startsWith('notes/')&&x.source.endsWith('.md')).length,
  oldBlockCounts: Object.fromEntries(old.stages.map(s => [s.id, s.blocks.length])),
};
writeFileSync('content/transfer-manifest.json', JSON.stringify(evidence, null, 2));
// The complete media tree includes videos and images referenced only by generated markup.
const mediaFiles=[];
function inventory(dir){for(const e of readdirSync(resolve(source,dir),{withFileTypes:true})){const file=`${dir}/${e.name}`;if(e.isDirectory())inventory(file);else {
  const sha256=hash(resolve(source,file));
  const target=/\.(md|json)$/.test(file)&&existsSync(file)&&hash(file)!==sha256?`content/source-assets/${file}`:file;
  mkdirSync(resolve(target,'..'),{recursive:true});cpSync(resolve(source,file),target);
  mediaFiles.push({source:file,target,sha256});
}}}
inventory('assets');
writeFileSync('content/media-manifest.json',JSON.stringify(mediaFiles,null,2));
const actionLinks={};
for(const stage of old.stages){const route=stage.id==='part3-plan'?'part3':stage.id.split('-')[0],part=stage.id==='part3-plan'?'3':stage.id.includes('-war-')?'2':'1',base=`/${route}/${part}/`;
  actionLinks[stage.id]=base;
  for(const block of stage.blocks){if(block.id)actionLinks[block.id]=base+'#'+block.id;for(const [,id]of block.html.matchAll(/\bid="([^"]+)"/g))actionLinks[id]=base+'#'+id;}
}
writeFileSync('content/action-links.json',JSON.stringify(actionLinks));
// Keep original relative paths and their adjacent SOURCES.md/manifest files.
const media = new Set();
for (const f of files.filter(x => x.target.endsWith('.json'))) {
  for (const m of readFileSync(f.target,'utf8').matchAll(/assets\/[\w./%+ -]+\.(?:png|webp|jpg|jpeg|svg|otf|woff2?)/g)) media.add(m[0]);
}
for (const file of media) if (!existsSync(file) && existsSync(resolve(source, file))) {
  const folder = file.slice(0,file.lastIndexOf('/'));
  mkdirSync(folder,{recursive:true}); cpSync(resolve(source,file),file);
  for (const name of ['SOURCES.md','manifest.json']) if (existsSync(resolve(source,folder,name)) && !existsSync(`${folder}/${name}`)) cpSync(resolve(source,folder,name),`${folder}/${name}`);
}
console.log(JSON.stringify({ ...evidence, sourceFiles: files.length, source: relative(process.cwd(), source) }, null, 2));
