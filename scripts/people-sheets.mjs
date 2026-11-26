// 인물 탭 카드를 하나씩 눌러 인물 서랍을 열고 fn(dialog, 이름)을 부른 뒤 닫는다(2026-11-27 인물 탭 → 머리 카드 격자, 표·선물은 서랍에만).
// 인물 탭이 이미 열려 있어야 한다. names를 주면 그 이름만 연다.
export async function eachPersonSheet(page, fn, names) {
  const cards = page.locator('.people-grid .person-card');
  const all = await cards.evaluateAll(es => es.map(e => e.dataset.person));
  const out = [];
  for (const name of all) {
    if (names && !names.includes(name)) continue;
    await page.locator(`.people-grid .person-card[data-person="${name}"] .person-card-open`).click();
    const dialog = page.getByRole('dialog'); await dialog.waitFor(); await page.waitForTimeout(150);
    out.push(await fn(dialog, name));
    await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'detached' });
  }
  return out;
}
