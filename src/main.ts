import Phaser from 'phaser'

import GameScene from './scenes/Game'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: '#bad3ec',
	fps: {
		target: 60
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
			fps: 60,
			debug: true
		}
	},
	scene: [GameScene]
}

export default new Phaser.Game(config)
