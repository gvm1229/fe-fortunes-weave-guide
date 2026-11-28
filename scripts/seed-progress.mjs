// 진행 기록 데이터베이스에 처음 기록 넣기(2026-11-28, 한 번만). 이미 기록이 있으면 넣지 않는다.
//   node scripts/seed-progress.mjs <env 파일(MONGODB_URI)> <checklist JSON> [DB 이름, 기본 fefw]
import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';
const [envFile, jsonFile, dbName = 'fefw'] = process.argv.slice(2);
if (!envFile || !jsonFile) { console.error('사용: node scripts/seed-progress.mjs <env> <json> [db]'); process.exit(1); }
const env = Object.fromEntries(readFileSync(envFile, 'utf8').split(/\r?\n/).filter(l => /^[A-Z_]+=/.test(l)).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')]; }));
const raw = readFileSync(jsonFile, 'utf8'), data = JSON.parse(raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw);
if (data.schemaVersion !== 1 || !data.checks) throw new Error('checklist JSON 형식이 아닙니다.');
const client = new MongoClient(env.MONGODB_URI);
try {
  await client.connect();
  const col = client.db(dbName).collection('progress');
  const now = await col.findOne({ _id: 'main' });
  if (now) console.log(`이미 기록이 있습니다(revision ${now.revision}). 넣지 않았습니다.`);
  else {
    const updatedAt = new Date().toISOString();
    await col.insertOne({ _id: 'main', revision: data.revision, updatedAt, data: { ...data, updatedAt } });
    console.log(`넣었습니다 · ${dbName} · revision ${data.revision} · 체크 ${Object.keys(data.checks).length}개`);
  }
} finally { await client.close(); }
