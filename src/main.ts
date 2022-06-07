import Phaser from 'phaser'
import GameScene from './scenes/Game'
import GameoverScene from "~/scenes/Gameover";
import PreloadScene from "~/scenes/Preload";
import CircularProgressPlugin from 'phaser3-rex-plugins/plugins/circularprogress-plugin.js';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1000,
	height: 1000,
	backgroundColor: '#bad3ec',
	fps: {
		target: 60
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
			fps: 60,
			debug: true,
			overlapBias: 6
		}
	},
	plugins: {
		global: [{
			key: 'rexCircularProgressPlugin',
			plugin: CircularProgressPlugin,
			start: true
		}]
	},
	scene: [PreloadScene, GameScene, GameoverScene]
}

export default new Phaser.Game(config)