import Phaser from 'phaser'
import K from "~/const/ResourceKeys";
import UI from "~/models/UI";
import {bgColor} from "~/main";
import Credits from "~/models/Credits";
import BaseSound = Phaser.Sound.BaseSound;

export default class GameoverScene extends Phaser.Scene
{
    #win!: boolean;
    private score;
    private highscore;
    private music!: BaseSound;
    private reward!: number;
    private readonly MAX_REWARD = 5;

	constructor()
	{
		super('gameover')
	}

	init(obj) {
	    this.#win = obj && !!obj.score;
	    this.score = obj.score;
        this.highscore = localStorage.getItem('floz-highscore');
        this.reward = Number(localStorage.getItem('floz-reward')) || 0;
    }

	preload()
    {
        if (this.#win) {
            for (let i = 0; i<= this.MAX_REWARD; i++)
                this.load.image('win' + i, 'win' + i + '.jpg')
        } else {
            this.load.audio(K.Dead, 'drowned.mp3');
            this.load.image(K.Dead, 'ded.png')
        }
    }

    create()
    {   let element;
        this.sound.stopAll();

        if (this.#win) {
            let ui = this.add.existing((new UI(this, 950 - 120/2, 125-120/2)).toggleHP(!this.#win).setScore(this.score));
            element = ui;

            this.add.text(ui.x - ui.body.width*0.8, ui.y + ui.body.height*1.8, ' Restart ', {
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
                    let text = this.add.text(ui.x - ui.body.width * 0.7, ui.y + ui.body.height,
                        "You've beaten your highscore of " + this.highscore + '!', {
                            fontFamily: 'Quicksand',
                            fontSize: '24px',
                            color: '#fff',
                            align: 'center',
                            wordWrap: {width: 200},
                            shadow: {stroke: true, blur: 8, color: '#00000080', fill: true}
                        })
                    this.sound.play(K.Score);
                    this.reward++;
                    localStorage.setItem('floz-reward', this.reward);

                    if (this.reward > this.MAX_REWARD)
                        this.reward = Phaser.Math.Between(1, this.MAX_REWARD)
            } else {
                this.sound.play(K.Over);
                if (!this.highscore)
                    localStorage.setItem('floz-highscore', this.score);
            }
            this.reward = Math.min(this.reward, this.MAX_REWARD);
            this.add.image(this.scale.width/2, this.scale.height/2, 'win'+this.reward)
                .setOrigin(0.5, 0.5).setSize(1000,1000).setDepth(-1);

            this.add.existing(new Credits(this, this.scale.width/2, this.scale.height - 2));
        } else {
            element = this.add.image(this.scale.width/2, this.scale.height/2, K.Dead);
            (this.music = this.sound.add(K.Dead)).play()
        }

        element.setInteractive({ cursor: 'pointer' })

        element.on('pointerup', () => {
            this.music.stop()
            this.scene.stop();
            this.scene.start('game');
        })
    }

}
