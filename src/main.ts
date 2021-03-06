import Phaser from 'phaser'
import GameScene from './scenes/Game'
import GameoverScene from "~/scenes/Gameover";
import PreloadScene from "~/scenes/Preload";
import CircularProgressPlugin from 'phaser3-rex-plugins/plugins/circularprogress-plugin.js';

let placeholder = document.querySelector('.canvas-placeholder')
placeholder?.parentNode?.removeChild(placeholder!);

export const bgColor = '#a0c4e4';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1000,
	height: 1000,
	backgroundColor: bgColor,
	parent: 'game',
	fps: {
		target: 60
	},
	scale: {
		mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
		autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
	},
	input: { mouse: { target: window } },
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
			fps: 60,
			debug: false,
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