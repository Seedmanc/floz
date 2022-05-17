import Phaser from 'phaser'
import K from "~/const/const";

export default class GameoverScene extends Phaser.Scene
{
    win;
    score;

	constructor()
	{
		super('gameover')
	}

	init(obj) {
	    this.win = obj.win;
	    this.score = obj.score;
    }

	preload()
    {
        this.load.image(K.Dead, 'ded.png')
    }

    create()
    {
        let text = this.win ?
            this.add.image(this.scale.width/2, this.scale.height/2, K.Score) :
            this.add.image(this.scale.width/2, this.scale.height/2, K.Dead);
        text.setInteractive()
        if (this.win)
            this.add.text(this.scale.width/2+50, this.scale.height/2 , this.score, {
                fontFamily: 'Quicksand',
                fontSize: '32px',
                color: '#5D7B95',
                fontStyle: 'normal',
                rtl: true,
                shadow: { color: '#8FA8BE', fill: true, offsetX: 1, offsetY: 2, blur: 1, stroke: false }});
        text.on('pointerup', () => {
            this.scene.stop('gameover');
            this.scene.start('game');
        })
    }

}
