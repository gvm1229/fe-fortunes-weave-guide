// 공유 미리보기 그림(public/og.png, 1200×630). 시간 경과 전 초상화만 쓴다(2026-11-14 사용자 지시: 공유할 때 스포일러 금지).
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
const url = p => 'data:' + ({ webp: 'image/webp', png: 'image/png', otf: 'font/otf' })[p.split('.').pop()] + ';base64,' + readFileSync(p).toString('base64');
const lords = ['theodora', 'leda', 'dietrich', 'cai'].map(n => `assets/portraits/pre-timeskip/large/${n}.webp`);
for (const p of lords) if (/post-timeskip/.test(p)) throw new Error('시간 경과 뒤 초상화 금지');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;src:url('${url('assets/fonts/Pretendard-Bold.otf')}');font-weight:700}
html,body{margin:0}body{width:1200px;height:630px;background:linear-gradient(160deg,#1F3A42,#101C20);font-family:P,sans-serif;color:#F4F3F0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;overflow:hidden}
.row{display:flex;gap:16px;padding:40px 40px 0;height:440px;align-items:flex-end}
.row img{width:265px;height:440px;object-fit:cover;object-position:top;border-radius:20px;background:#16272D}
h1{margin:0 0 56px;font-size:64px;font-weight:700;letter-spacing:-1px}
</style></head><body><div class="row">${lords.map(p => `<img src="${url(p)}">`).join('')}</div><h1>만자천홍 개인화 공략</h1></body></html>`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
await page.evaluate(() => document.fonts.ready);
mkdirSync('public', { recursive: true });
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('public/og.png');
