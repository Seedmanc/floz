import Phaser from 'phaser'
import K from "~/const/const";

export default class GameoverScene extends Phaser.Scene
{
	constructor()
	{
		super('gameover')
	}

	preload()
    {
        this.load.image(K.Dead, 'ded.png')
    }

    create()
    {
        let text = this.add.image(this.scale.width/2, this.scale.height/2, K.Dead);
        text.setInteractive()
        text.on('pointerup', () => {
            this.scene.stop('gameover');
            this.scene.start('game');
        })
    }

}
