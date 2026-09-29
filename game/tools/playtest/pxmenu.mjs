// Checks the start menu pages, saving, and Continue from the title. Screenshots each page.
export default async ({ page, shot, wait }) => {
  const press = async (k) => { await page.keyboard.down(k); await wait(70); await page.keyboard.up(k); await wait(260); };
  const menu = () => page.evaluate(() => { const m = window.game.scene.getScene('Menu'); return { on: window.game.scene.isActive('Menu'), page: m.page, msg: m.message }; });
  await page.waitForFunction(() => window.game?.scene.getScene('Overworld')?.player && !window.game.scene.getScene('Overworld').busy, null, { timeout: 60000 });
  await wait(800);
  await press('Tab');
  await shot('root');
  for (const [i, name] of [[0, 'journal'], [1, 'bag'], [2, 'ragul']]) {
    for (let k = 0; k < i; k++) await press('ArrowDown');
    await press('KeyZ');
    await shot(name);
    console.log(name, JSON.stringify(await menu()));
    await press('KeyX');
    for (let k = 0; k < i; k++) await press('ArrowUp');
  }
  for (let k = 0; k < 3; k++) await press('ArrowDown');
  await press('KeyZ');
  await press('KeyZ');
  await shot('saved');
  console.log('save', JSON.stringify(await menu()));
  await press('KeyX');
  await press('KeyX');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('efil.px.save.1') || 'null')?.meta);
  console.log('meta', JSON.stringify(saved));
  // Continue from the title.
  await page.goto('http://localhost:5173/');
  await page.waitForFunction(() => window.game?.scene.isActive('Title') || window.game?.scene.isActive('Language'), null, { timeout: 60000 });
  if (await page.evaluate(() => window.game.scene.isActive('Language'))) {
    await shot('language');
    await press('KeyZ');
    await press('ArrowDown');
    await press('KeyZ');
    await page.waitForFunction(() => window.game.scene.isActive('Title'), null, { timeout: 20000 });
  }
  await wait(600);
  await shot('title');
  await press('Enter');
  await page.waitForFunction(() => window.game?.scene.getScene('Overworld')?.player, null, { timeout: 60000 });
  await wait(1200);
  const where = await page.evaluate(() => { const w = window.game.scene.getScene('Overworld'); return { map: w.map.def.id, x: w.player.tx, y: w.player.ty, flags: window.__efil_state().flags }; });
  console.log('continued', JSON.stringify(where));
  await shot('continued');
};
