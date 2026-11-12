import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
const source = resolve(process.argv[2] || '../fe-fortunes-weave-guide-main');
const read = p => JSON.parse(readFileSync(resolve(source, p), 'utf8'));
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const files = [];
function copyTree(dir, destination) {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(resolve(source, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) copyTree(path, `${destination}/${entry.name}`);
    else if ((dir === 'data' && entry.name.endsWith('.json') && !entry.name.includes('backup')) || (dir.startsWith('notes') && entry.name.endsWith('.md'))) {
      const target = `${destination}/${entry.name}`;
      cpSync(resolve(source, path), target);
      files.push({ source: path, target, sha256: hash(target) });
    }
  }
}
copyTree('data', 'content/data'); copyTree('notes', 'content/notes');
cpSync(resolve(source, 'data/checklist.json'), 'content/checklist-seed.json');
const old = read('personalized-app/src/content.json');
const playbook = read('data/playbook.json');
// Generated markup is only decoded to semantic data for display-parity evidence.
// Canonical actions, goals, roles, recruitment and documents remain the source of app content.
function semantic(html) {
  const $ = load(html, null, false);
  function visit(n) {
    if (n.type === 'text') return n.data;
    if (!n.tagName || ['script','style','svg','path','input','button'].includes(n.tagName)) return null;
    const attrs = Object.fromEntries(Object.entries(n.attribs || {}).filter(([k]) => /^(href|src|alt|title|data-)/.test(k)));
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
};
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
  peopleByRoute: Object.fromEntries(['theodora','leda','dietrich','kai'].map(r => [r, old.people.filter(p => p.route === r).length])),
  peopleByStage: Object.fromEntries(old.stages.map(s => [s.id, old.people.filter(p => s.id === 'part3-plan' ? p.roles['3'] : p.route === s.id.split('-')[0] && p.roles[s.id.includes('-war-') ? '2' : '1']).length])),
  recruitAssignments: read('data/recruit-all-plan.json').assignments.length,
  referenceDocs: files.filter(x => x.source.startsWith('notes/')).length,
  oldBlockCounts: Object.fromEntries(old.stages.map(s => [s.id, s.blocks.length])),
};
writeFileSync('content/transfer-manifest.json', JSON.stringify(evidence, null, 2));
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
