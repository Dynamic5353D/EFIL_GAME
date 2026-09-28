import Phaser from 'phaser';

class SmokeScene extends Phaser.Scene {
  constructor() { super('Smoke'); }
  preload() { this.load.image('bg', 'assets/bg/winter_path.webp'); }
  create() {
    const bg = this.add.image(640, 360, 'bg');
    bg.setScale(Math.max(1280 / bg.width, 720 / bg.height));
    this.add.text(640, 360, 'EFIL — scaffold OK', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);
    console.log('Phaser', Phaser.VERSION);
  }
}

new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'game',
  backgroundColor: '#05070d',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 720 },
  scene: [SmokeScene],
});
