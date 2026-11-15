// 2026-11-15 내 상태 검사: 새 브라우저에서 축복 단계를 올리면 해당 구매 체크가 자동 완료(눌러 바꿀 수 없음)되고,
// 사용자 규칙: [U25] 내 상태(축복·가호·파편·골드) 편집·가져오기 · [U35] 가져오는 동안 화면 전체를 막는 창과 돌아가는 표시.
// 내보내기 파일에 status가 들어가며, 지우기 뒤 가져오기로 되돌아온다. 서랍은 폰·태블릿·데스크톱, 밝게·어둡게에서 넘치지 않는다.
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
let n = 0;
try {
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1440, 900]]) for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, acceptDownloads: true }); const p = await ctx.newPage();
    p.on('dialog', d => d.accept());
    await p.goto(base + '/theodora/1/'); await p.locator('.route-head').waitFor(); await p.waitForTimeout(500);
    assert.equal(await p.locator('.status-summary').count(), 0, '빈 상태는 요약 없음');
    const step = p.locator('#prep-boons--class-exp-i');
    assert.equal(await step.isChecked(), false, '처음엔 미완료');
    if (w < 600) { await p.locator('.route-head .backup-menu summary').click(); await p.locator('.route-head .status-menu-item').click(); } else await p.locator('.route-head .status-button').click();
    const sheet = p.getByRole('dialog', { name: '내 상태' }); await sheet.waitFor();
    await sheet.getByRole('button', { name: '병과 경험치 증가 단계 올리기' }).click();
    await sheet.getByRole('button', { name: '아우로라 가호 레벨 올리기' }).click();
    await sheet.getByLabel('인과의 파편').fill('1000'); await sheet.getByLabel('골드').fill('500');
    const lay = await sheet.evaluate(el => ({ over: el.scrollWidth - el.clientWidth, small: [...el.querySelectorAll('.stepper .button, .status-amount input')].filter(b => { const r = b.getBoundingClientRect(); return r.width && (r.width < 44 || r.height < 44); }).length, right: Math.max(...[...el.querySelectorAll('.status-list li')].map(li => li.getBoundingClientRect().right)) - el.getBoundingClientRect().right }));
    assert.ok(lay.over <= 0 && lay.right <= 0.5, `${w} 서랍 가로 넘침 ${JSON.stringify(lay)}`); assert.equal(lay.small, 0, `${w} 누를 크기 44px 미만`);
    await p.keyboard.press('Escape'); await sheet.waitFor({ state: 'hidden' });
    assert.ok(await step.isChecked(), '축복 단계로 구매 체크 자동 완료'); assert.ok(await step.isDisabled(), '자동 완료는 눌러 바꿀 수 없음');
    assert.match(await p.locator('#prep-boons .status-summary').textContent(), /남은 추천 축복 12개 · 3,800파편 · 보유 1,000 → 2,800 부족/);
    const saved = JSON.parse(await p.evaluate(() => localStorage.getItem('fortunes-weave-checklist-v1')));
    assert.deepEqual(saved.status, { boons: { 'class-exp': 1 }, gods: { '아우로라': 1 }, shards: 1000, gold: 500 });
    assert.ok(!Object.hasOwn(saved.checks, 'prep-boons--class-exp-i'), '자동 완료는 체크 기록에 쓰지 않음');
    if (w === 1440 && scheme === 'light') {
      await p.locator('.route-head .backup-menu summary').click();
      const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: '내보내기' }).click()]);
      const file = JSON.parse(readFileSync(await dl.path(), 'utf8')); assert.deepEqual(file.status, saved.status, '내보내기에 내 상태');
      await p.getByRole('button', { name: '기록 지우기' }).click(); await p.waitForTimeout(200);
      assert.equal(await step.isChecked(), false, '지우기 뒤 미완료');
      // 가져오는 동안 전체 화면을 막는 창(2026-11-15 사용자 지시): 열린 모달 + 뒤 화면 클릭이 창에 걸림 + 불러오는 아이콘.
      await p.locator('.route-head .backup-menu input[type=file]').setInputFiles(await dl.path());
      const ov = p.locator('dialog.import-overlay'); await ov.waitFor({ state: 'visible' });
      const blocked = await p.evaluate(() => { const d = document.querySelector('dialog.import-overlay'); const el = document.elementFromPoint(20, innerHeight - 20); return { open: d.open, modal: d.matches(':modal'), hit: el === d || d.contains(el), spinner: !!d.querySelector('.import-spinner'), busy: d.getAttribute('aria-busy') }; });
      assert.deepEqual(blocked, { open: true, modal: true, hit: true, spinner: true, busy: 'true' }, '가져오기 중 화면 막기');
      await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); assert.ok(await ov.evaluate(d => d.open), '가져오기 중 Escape를 거듭 눌러도 닫히지 않음');
      await ov.waitFor({ state: 'hidden' }); assert.ok(await step.isChecked(), '가져오기 뒤 다시 완료');
      assert.match(await p.locator('.import-toast').textContent(), /가져왔습니다 · 체크 \d+개 · 내 상태 포함/);
      assert.ok(await p.evaluate(() => document.activeElement?.matches('.route-head .backup-menu summary')), '가져온 뒤 초점은 기록 관리');
      // 깨진 파일: 막는 창에 이유를 보이고 기존 기록은 그대로.
      const before = await p.evaluate(() => localStorage.getItem('fortunes-weave-checklist-v1'));
      await p.locator('.route-head .backup-menu summary').click();
      await p.locator('.route-head .backup-menu input[type=file]').setInputFiles({ name: 'broken.json', mimeType: 'application/octet-stream', buffer: Buffer.from('{oops') });
      await ov.getByRole('alert').waitFor(); assert.match(await ov.textContent(), /가져오지 못했습니다.*JSON 파일이 아니거나/);
      assert.equal(await p.evaluate(() => localStorage.getItem('fortunes-weave-checklist-v1')), before, '실패해도 기존 기록 유지');
      await ov.getByRole('button', { name: '확인' }).click(); await ov.waitFor({ state: 'hidden' });
      // 앞에 BOM이 붙은 파일(메모장 등으로 저장)도 가져온다.
      await p.locator('.route-head .backup-menu summary').click();
      await p.locator('.route-head .backup-menu input[type=file]').setInputFiles({ name: 'bom.json', mimeType: 'text/plain', buffer: Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from(before)]) });
      await ov.waitFor({ state: 'visible' }); await ov.waitFor({ state: 'hidden' }); assert.match(await p.locator('.import-toast').textContent(), /가져왔습니다/, 'BOM 파일 가져오기');
      await p.locator('.route-head .status-button').click(); await sheet.waitFor();
      assert.equal(await sheet.getByLabel('골드').inputValue(), '500');
      await sheet.getByRole('button', { name: '병과 경험치 증가 단계 낮추기' }).click(); await p.keyboard.press('Escape');
      assert.equal(await step.isChecked(), false, '단계를 낮추면 다시 미완료');
    }
    n++; await ctx.close();
  }
  console.log(`통과: 내 상태 ${n}개 화면`);
} finally { await browser.close(); }
