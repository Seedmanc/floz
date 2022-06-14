import Phaser from 'phaser'
import K from "~/const/TextureKeys";
import UI from "~/models/UI";
import {bgColor} from "~/main";

export default class GameoverScene extends Phaser.Scene
{
    #win!: boolean;
    private score;
    private highscore;

	constructor()
	{
		super('gameover')
	}

	init(obj) {
	    this.#win = obj && !!obj.score;
	    this.score = obj.score;
        this.highscore = localStorage.getItem('floz-highscore');
    }

	preload()
    {
        if (!this.#win)
            this.load.image(K.Dead, 'ded.png')
        else
            this.load.image(K.Won, 'fullbody100.png')
    }

    create()
    {
        let ui = new UI(this, this.scale.width/2, this.scale.height/2);
        ui.toggleHP(!this.#win)
        ui.setScore(this.score);

        let element;

        if (this.#win) {
            element = ui;
            let UI = this.add.existing(ui).setPosition(775 - ui.body.width/2, 125-ui.body.height/2);
            this.add.image(this.scale.width/2, this.scale.height/2, K.Won).setOrigin(0.5, 0.5);

            this.add.text(UI.x - UI.body.width*0.8, UI.y + UI.body.height*1.8, ' Restart ', {
                fontFamily: 'Quicksand',
                fontSize: '48px',
                color: '#fff',
                backgroundColor: '#8585858F',
                shadow: {stroke: true, blur: 9, color: bgColor, fill: true}
            })  .setInteractive({cursor: 'pointer'})
                .setOrigin(0, 0)
                .on('pointerup', () => {
                    this.scene.stop();
                    this.scene.start('game');
                })

            if (this.highscore && this.score > this.highscore) {
                localStorage.setItem('floz-highscore', this.score);
                let text = this.add.text(UI.x - UI.body.width*0.7 , UI.y + UI.body.height,
                    "You've beaten your highscore of " + this.highscore + '!', {
                    fontFamily: 'Quicksand',
                    fontSize: '24px',
                    color: '#fff',
                    align: 'center',
                    wordWrap: { width: 200 },
                    shadow: {stroke: true, blur: 9, color: '#8585858F', fill: true}
                })
            } else if (!this.highscore)
                localStorage.setItem('floz-highscore', this.score);
        } else
           element = this.add.image(this.scale.width/2, this.scale.height/2, K.Dead);

        element.setInteractive({ cursor: 'pointer' })

        element.on('pointerup', () => {
            this.scene.stop();
            this.scene.start('game');
        })
    }

}
