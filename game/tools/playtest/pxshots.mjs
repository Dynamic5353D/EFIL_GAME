// Screenshots for art review: the map at a few camera spots, a conversation, and the hostel room.
// Also reports the frame rate the game reaches (headless Chromium renders in software, so it is a floor).
export default async ({ page, shot, wait }) => {
  const press = async (k, ms = 70) => { await page.keyboard.down(k); await wait(ms); await page.keyboard.up(k); await wait(200); };
  await page.waitForFunction(() => window.game?.scene.getScene('Overworld')?.player && !window.game.scene.getScene('Overworld').busy, null, { timeout: 60000 });
  await wait(1500);
  const place = (x, y, dir = 'down') => page.evaluate(([x, y, dir]) => {
    const w = window.game.scene.getScene('Overworld');
    w.occupied.delete(`${w.player.tx},${w.player.ty}`);
    w.player.tx = x; w.player.ty = y; w.player.dir = dir; w.player.place();
    w.occupied.add(`${x},${y}`);
    w.cameras.main.centerOn(w.player.sprite.x, w.player.sprite.y - 8);
  }, [x, y, dir]);
  for (const [name, x, y] of [['hostel', 10, 10], ['stall', 20, 14], ['it', 38, 11], ['lawn', 24, 21], ['east', 48, 16]]) {
    await place(x, y);
    await wait(700);
    await shot(name);
  }
  // talk to Richard
  await place(20, 13, 'right');
  await wait(300);
  await press('KeyZ');
  await wait(2500);
  await shot('talk');
  const fps = await page.evaluate(() => new Promise((r) => { const g = window.game; const f0 = g.loop.frame; setTimeout(() => r(((g.loop.frame - f0) / 3).toFixed(1)), 3000); }));
  console.log('fps', fps);
};
