import Phaser from 'phaser'
import GameScene from './scenes/Game'
import GameoverScene from "~/scenes/Gameover";

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
			debug: true
		}
	},
	scene: [GameScene, GameoverScene]
}

export default new Phaser.Game(config)