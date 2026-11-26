// 2026-11-15 내 상태 검사: 새 브라우저에서 축복 단계를 올리면 해당 구매 체크가 자동 완료(눌러 바꿀 수 없음)되고,
// 사용자 규칙: [U25] 내 상태(축복·가호·파편·골드) 편집·가져오기 · [U72] 인물 육성 기록 · [U35] 가져오는 동안 화면 전체를 막는 창과 돌아가는 표시.
// 내보내기 파일에 status가 들어가며, 지우기 뒤 가져오기로 되돌아온다. 서랍은 폰·태블릿·데스크톱(어두운 화면만, 2026-11-27)에서 넘치지 않는다.
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
process.env.TEMP = process.env.TMP = resolve('.tmp');
const base = process.env.BROWSER_BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
let n = 0;
try {
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1440, 900]]) for (const scheme of ['dark']) {
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
    const lay = await sheet.evaluate(el => ({ over: el.scrollWidth - el.clientWidth, small: [...el.querySelectorAll('.stepper .button, .status-amount input')].filter(b => { const r = b.getBoundingClientRect(); return r.width && (r.width < 32 || r.height < 32); }).length, right: Math.max(...[...el.querySelectorAll('.status-list li')].map(li => li.getBoundingClientRect().right)) - el.getBoundingClientRect().right }));
    assert.ok(lay.over <= 0 && lay.right <= 0.5, `${w} 서랍 가로 넘침 ${JSON.stringify(lay)}`); assert.equal(lay.small, 0, `${w} 누를 크기 32px 미만([U55] yuphastemple 단추 36px)`);
    await p.keyboard.press('Escape'); await sheet.waitFor({ state: 'hidden' });
    assert.ok(await step.isChecked(), '축복 단계로 구매 체크 자동 완료'); assert.ok(await step.isDisabled(), '자동 완료는 눌러 바꿀 수 없음');
    assert.match(await p.locator('#prep-boons .status-summary').textContent(), /남은 추천 축복 12개 · 3,800파편 · 보유 1,000 → 2,800 부족/);
    const saved = JSON.parse(await p.evaluate(() => localStorage.getItem('fortunes-weave-checklist-v1')));
    assert.deepEqual(saved.status, { boons: { 'class-exp': 1 }, gods: { '아우로라': 1 }, shards: 1000, gold: 500 });
    assert.ok(!Object.hasOwn(saved.checks, 'prep-boons--class-exp-i'), '자동 완료는 체크 기록에 쓰지 않음');
    if (w === 1440 && scheme === 'dark') {
      await p.locator('.route-head .backup-menu summary').click();
      const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: '내보내기' }).click()]);
      const file = JSON.parse(readFileSync(await dl.path(), 'utf8')); assert.deepEqual(file.status, saved.status, '내보내기에 내 상태');
      await p.getByRole('button', { name: '기록 지우기' }).click(); await p.waitForTimeout(200);
      assert.equal(await step.isChecked(), false, '지우기 뒤 미완료');
      // 가져오는 동안 전체 화면을 막는 창(2026-11-15 사용자 지시): 열린 모달 + 뒤 화면 클릭이 창에 걸림 + 불러오는 아이콘.
      // 성공한 가져오기는 0.6초 뒤 스스로 닫힌다. 바쁜 관문에서는 아래 Escape 확인이 그보다 늦어 경주가 났다. 이 검사에서만 파일 읽기를 3초 늦춰 가져오는 중에 누른다(제품 시간은 그대로).
      await p.evaluate(() => { const read = File.prototype.text; File.prototype.text = function () { File.prototype.text = read; return new Promise(r => setTimeout(r, 3000)).then(() => read.call(this)); }; });
      await p.locator('.route-head .backup-menu input[type=file]').setInputFiles(await dl.path());
      const ov = p.locator('dialog.import-overlay'); await ov.waitFor({ state: 'visible' });
      const blocked = await p.evaluate(() => { const d = document.querySelector('dialog.import-overlay'); const el = document.elementFromPoint(20, innerHeight - 20); return { open: d.open, modal: d.matches(':modal'), hit: el === d || d.contains(el), spinner: !!d.querySelector('.import-spinner'), busy: d.getAttribute('aria-busy') }; });
      assert.deepEqual(blocked, { open: true, modal: true, hit: true, spinner: true, busy: 'true' }, '가져오기 중 화면 막기');
      await ov.evaluate(d => { d.closes = 0; d.addEventListener('close', () => d.closes++); }); // 잠깐 닫혔다 다시 열려도 잡는다.
      await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); // 잇달아 누르면 Chrome이 막은 창도 닫는다.
      assert.deepEqual(await ov.evaluate(d => [d.open, d.getAttribute('aria-busy'), d.closes]), [true, 'true', 0], '가져오기 중 Escape를 거듭 눌러도 닫히지 않음(잠깐 닫힘 포함)');
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
  // [U72] 인물 육성 기록(2026-11-27): 서랍 '내 기록' 입력·저장·내보내기·가져오기·기록 지우기·루트별 분리.
  // 체크 칸을 누르고 저장소를 비우는 단계라 사용자 실제 기록이 있는 3000번 서버에서는 멈춘다(P05, Fable 검토 14).
  if (/localhost:3000|127\.0\.0\.1:3000/.test(base)) throw new Error('[U72] 육성 기록 검사는 localhost:3000(사용자 미리보기)에서 돌리지 않습니다. BROWSER_BASE_URL에 검사용 서버를 주세요.');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); p.on('dialog', d => d.accept());
    const KEY = 'fortunes-weave-checklist-v1', stored = async () => JSON.parse(await p.evaluate(k => localStorage.getItem(k), KEY));
    const nav = (v) => p.getByRole('navigation', { name: '공략 화면' }).getByRole('button', { name: v, exact: true });
    const openSheet = async (route, name) => { await p.goto(base + route); await p.locator('.route-head').waitFor(); await p.waitForTimeout(400); await nav('인물').click(); await p.locator(`.person-card[data-person="${name}"] .person-card-open`).click(); const d = p.getByRole('dialog'); await d.waitFor(); await d.locator('[data-build-editor] select:not([disabled])').first().waitFor(); return d; };
    let d = await openSheet('/theodora/1/', '세오도라');
    const lv = d.getByLabel('레벨(1~99)');
    await lv.fill('0'); await lv.press('Tab'); assert.equal(await lv.inputValue(), '1', '[U72] 레벨 0 → 1');
    await lv.focus(); await lv.press('ArrowUp'); await p.waitForTimeout(100); assert.equal(await lv.inputValue(), '2', '[U72] ↑ 키로 +1');
    await lv.fill('99'); await lv.press('Enter'); await d.getByRole('button', { name: '레벨 올리기' }).click(); assert.equal(await lv.inputValue(), '99', '[U72] 99 위로 안 감');
    await lv.fill('22'); await lv.press('Enter');
    await d.getByLabel('창술 등급', { exact: true }).selectOption('C'); await d.getByLabel(/^메모/).fill('검사 메모'); await d.getByLabel(/^메모/).press('Tab'); await p.waitForTimeout(200);
    assert.deepEqual((await stored()).builds, { theodora: { theodora: { level: 22, skills: { spear: 'C' }, note: '검사 메모' } } }, '[U72] 저장 값');
    assert.ok(await d.locator('[data-character-header] .y-skill-rank').count() === 1 && /Lv 22/.test(await d.locator('[data-character-header] .y-card-class').textContent()), '[U72] 머리 카드에 레벨·등급');
    // 등급 칸: 320px에서 S+가 칸 안에 들어간다(화살표 없음, Fable 검토 7).
    await p.setViewportSize({ width: 320, height: 640 }); await d.getByLabel('창술 등급', { exact: true }).selectOption('S+');
    const sel = await d.getByLabel('창술 등급', { exact: true }).evaluate(e => ({ fit: e.scrollWidth <= e.clientWidth, h: e.getBoundingClientRect().height, w: e.getBoundingClientRect().width, font: getComputedStyle(e).fontSize, ap: getComputedStyle(e).appearance }));
    assert.ok(sel.fit && sel.h >= 32 && Math.round(sel.w) === 44 && sel.font === '16px' && sel.ap === 'none', '[U72] 등급 칸 ' + JSON.stringify(sel));
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '[U72] 320 서랍 가로 넘침');
    await d.getByLabel('창술 등급', { exact: true }).selectOption('C'); await p.setViewportSize({ width: 1440, height: 900 });
    await p.keyboard.press('Escape');
    // 새로 고친 뒤 유지, 체크 칸을 눌러도 육성 기록 유지.
    await p.reload(); await p.locator('.route-head').waitFor(); await p.waitForTimeout(400);
    await p.locator('.checklist input[type=checkbox]:not([disabled])').first().check(); await p.waitForTimeout(200);
    assert.equal((await stored()).builds?.theodora?.theodora?.level, 22, '[U72] 체크 뒤 육성 기록 유지');
    // 내보내기 파일에 builds. 저장소를 비우고 그 파일을 가져오면(서랍을 연 채로도) 화면이 돌아온다.
    await p.locator('.route-head .backup-menu summary').click();
    const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: '내보내기' }).click()]);
    const exported = JSON.parse(readFileSync(await dl.path(), 'utf8')); assert.deepEqual(exported.builds?.theodora?.theodora, { level: 22, skills: { spear: 'C' }, note: '검사 메모' }, '[U72] 내보내기에 builds');
    // '기록 지우기'는 체크·내 상태만 지운다.
    await p.getByRole('button', { name: '기록 지우기' }).click(); await p.waitForTimeout(200);
    const cleared = await stored(); assert.deepEqual(cleared.checks, {}, '[U72] 기록 지우기 체크'); assert.equal(cleared.builds?.theodora?.theodora?.level, 22, '[U72] 기록 지우기 뒤 육성 기록 유지');
    // builds 없는 파일 가져오기 → 체크는 파일 것, 육성 기록 유지. builds: {}도 같다.
    for (const [name, extra] of [['old.json', {}], ['empty.json', { builds: {} }]]) {
      await p.locator('.route-head .backup-menu input[type=file]').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ schemaVersion: 1, revision: 1, checks: { 'imported-check': true }, ...extra })) });
      await p.locator('dialog.import-overlay').waitFor({ state: 'hidden' }); await p.waitForTimeout(200);
      const s = await stored(); assert.ok(s.checks['imported-check'] === true && s.builds?.theodora?.theodora?.level === 22, `[U72] ${name} 가져오기 뒤 육성 기록 유지 ${JSON.stringify(s.builds)}`);
    }
    // 저장소를 비운 뒤 내보낸 파일 가져오기 → 서랍을 연 채로 레벨 칸이 따라온다(Fable 검토 11).
    await p.evaluate(k => localStorage.removeItem(k), KEY); await p.reload(); await p.locator('.route-head').waitFor(); await p.waitForTimeout(400);
    d = await openSheet('/theodora/1/', '세오도라'); assert.equal(await d.getByLabel('레벨(1~99)').inputValue(), '', '[U72] 빈 저장소 레벨 빈칸');
    await p.keyboard.press('Escape'); await nav('할 일').click(); await p.locator('.route-head .backup-menu summary').click();
    await p.locator('.route-head .backup-menu input[type=file]').setInputFiles(await dl.path()); await p.locator('dialog.import-overlay').waitFor({ state: 'hidden' });
    await nav('인물').click(); await p.locator('.person-card[data-person="세오도라"] .person-card-open').click(); d = p.getByRole('dialog'); await d.waitFor();
    assert.equal(await d.getByLabel('레벨(1~99)').inputValue(), '22', '[U72] 가져온 뒤 서랍 복원'); assert.equal(await d.getByLabel('창술 등급', { exact: true }).inputValue(), 'C');
    await p.keyboard.press('Escape');
    // 1·2부는 한 기록, 다른 루트·3부는 따로(Q4).
    d = await openSheet('/theodora/2/', '세오도라'); assert.equal(await d.getByLabel('레벨(1~99)').inputValue(), '22', '[U72] 2부도 같은 기록');
    await p.keyboard.press('Escape');
    await p.goto(base + '/part3/3/'); await p.locator('.route-head').waitFor(); await nav('인물').click(); await p.locator('.person-card:has(.y-card-en) .person-card-open').first().click(); d = p.getByRole('dialog'); await d.waitFor();
    assert.equal(await d.getByLabel('레벨(1~99)').inputValue(), '', '[U72] 3부는 따로');
    await p.keyboard.press('Escape');
    n++; await ctx.close();
  }
  console.log(`통과: 내 상태·육성 기록 ${n}개 화면`);
} finally { await browser.close(); }
