// yuphastemple 이름표·그림 생성기 공용 함수(docs/yuphas-integration-plan.md 1단계). 작업 파일은 .tmp/yuphas(또는 YUPHAS_WORK)에 둔다.
// 순서: match.mjs → fetch.mjs → finalize.mjs → review-md.mjs → images.mjs → images-map.mjs. ydata/(yuphastemple data/*.json·app.js·index.html 사본)와 kwiki/(한국어 도감 쪽)는 작업 폴더에 둔다.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
export const REPO = fileURLToPath(new URL('../..', import.meta.url)).replace(/[\\/]+$/, '');
export const SCR = process.env.YUPHAS_WORK || `${REPO}/.tmp/yuphas`;
export const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const Y = (f) => readJson(`${SCR}/ydata/${f}`);
export const R = (f) => readJson(`${REPO}/${f}`);
// yuphastemple app.js lines 35-41 and map.js line 17
export const foldAccents = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export const rawSlug = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const createSlug = (t) => rawSlug(foldAccents(t));
export const itemSlug = (n) => createSlug(String(n).replace(/['’]/g, '').replace(/[+]/g, ' plus'));
export const mapSlug = (s) => foldAccents(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const normEn = (s) => foldAccents(String(s ?? '')).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
