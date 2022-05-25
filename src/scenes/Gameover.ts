import Phaser from 'phaser'
import K from "~/const/TextureKeys";
import UI from "~/models/UI";

export default class GameoverScene extends Phaser.Scene
{
    #win!: boolean;
    private score;

	constructor()
	{
		super('gameover')
	}

	init(obj) {
	    this.#win = obj && !!obj.score;
	    this.score = obj.score;
    }

	preload()
    {
        this.load.image(K.Dead, 'ded.png')
    }

    create()
    {
        let ui = new UI(this, this.scale.width/2, this.scale.height/2);
        ui.toggleHP(!this.#win)
        ui.setScore(this.score);

        let element;

        if (this.#win) {
            element = ui;
            this.add.existing(ui);
        } else
           element = this.add.image(this.scale.width/2, this.scale.height/2, K.Dead);

        element.setInteractive({ cursor: 'pointer' })

        element.on('pointerup', () => {
            this.scene.stop('gameover');
            this.scene.start('game');
        })
    }

}
