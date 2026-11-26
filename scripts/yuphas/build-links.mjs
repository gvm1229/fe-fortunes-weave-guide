// 화면용 작은 이름표 content/data/yuphas-links.json을 만든다(브라우저가 받는 양을 줄이려고 정본에서 필요한 칸만 뽑는다).
// 정본: content/data/yuphas-names.json(이름·슬러그), content/data/yuphas-images.json(물품 아이콘).
// 링크는 slug가 있고 linkVerified인 이름만 만든다. 한국어 등급이 unverified여도 우리 글의 이름이 열쇠이므로 링크는 둔다(이름표 규칙).
//   node scripts/yuphas/build-links.mjs          — 다시 만든다
//   node scripts/yuphas/build-links.mjs --check  — 지금 파일이 정본과 같은지만 본다(배포 관문)
import fs from 'node:fs';
import { REPO, R } from './lib.mjs';

const names = R('content/data/yuphas-names.json');
const images = R('content/data/yuphas-images.json');
const out = { reviewed: names.reviewed, site: names.site, note: 'scripts/yuphas/build-links.mjs가 만든 파일. 고치지 말고 정본(yuphas-names.json)을 고친 뒤 다시 만든다.', items: {}, people: {}, classes: {} };
const icon = (ko) => images.items[ko]?.yuphasTypeIcon || null;
for (const [ko, r] of Object.entries(names.items)) {
  if (!r.slug || !r.linkVerified) continue;
  const row = [r.en, r.slug, r.kind, icon(ko)];
  for (const k of [ko, ...(r.aliases || [])]) out.items[k] ||= row;
}
for (const [ko, r] of Object.entries(names.people)) if (r.slug && r.linkVerified) out.people[ko] = [r.en, r.slug];
for (const [ko, r] of Object.entries(names.classes)) if (r.slug && r.linkVerified) out.classes[ko] = [r.en, r.slug];
const text = JSON.stringify(out) + '\n';
const file = `${REPO}/content/data/yuphas-links.json`;
if (process.argv.includes('--check')) {
  const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (now !== text) { console.error('yuphas-links.json이 정본과 다릅니다: node scripts/yuphas/build-links.mjs'); process.exit(1); }
  console.log(`yuphas-links.json 정본과 같음 · 물품 ${Object.keys(out.items).length} · 인물 ${Object.keys(out.people).length} · 병종 ${Object.keys(out.classes).length}`);
} else {
  fs.writeFileSync(file, text);
  console.log(`yuphas-links.json · 물품 ${Object.keys(out.items).length} · 인물 ${Object.keys(out.people).length} · 병종 ${Object.keys(out.classes).length}`);
}
