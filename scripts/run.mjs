import { mkdirSync, cpSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { flattenPrefetch } from './flatten-prefetch.mjs';
const temp = resolve('.tmp');
mkdirSync(temp, { recursive: true });
process.env.TEMP = process.env.TMP = temp;
cpSync('assets', 'public/assets', { recursive: true });
// 체크 기록(checklist.json)과 진행 가져오기 파일은 공개하지 않는다(2026-11-14 사용자 지시: 사이트에 진행 기록 없음).
// 2026-11-15(Fable 검토 12 H1): 원본 자료 JSON·검증 기록·작업 화면 사진(content/attachments)에는 개인 진행이 섞여 있어 공개하지 않는다.
rmSync('public/reference-data', { recursive: true, force: true }); rmSync('public/reference-files', { recursive: true, force: true });
rmSync('public/reference-data/checklist.json', { force: true }); rmSync('public/reference-files/theodora-progress-import.json', { force: true });
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', process.argv[2], '--webpack'], { stdio: 'inherit', env: process.env });
if (process.argv[2] === 'build' && result.status === 0) console.log(`미리 읽기 조각 ${flattenPrefetch()}개를 점 이름으로 복사`);
process.exit(result.status ?? 1);
