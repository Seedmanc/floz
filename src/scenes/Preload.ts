import Phaser from 'phaser'
import K from "~/const/TextureKeys";
import WebFontFile from "~/etc/webfont";
import {bgColor} from '~/main';

export default class PreloadScene extends Phaser.Scene
{
    floz!: Phaser.GameObjects.Image;
    start!: Phaser.GameObjects.Text;
    score!: Phaser.GameObjects.Text;
    graphics!: Phaser.GameObjects.Graphics;

	constructor()
	{
		super('preload')
	}
	preload()
    {
        this.load.image(K.WallLeft, 'left-wall.jpg')
        this.load.spritesheet(K.WallRight, 'right-wall.jpg', { frameWidth: 136, frameHeight: 799})
        this.load.image(K.Water, 'water.jpg')
        this.load.spritesheet(K.Player, 'player.png', { frameWidth: 440/4, frameHeight: 111})
        this.load.image(K.Blob, 'blob.png')
        this.load.image(K.Blob2, 'blob2.png')
        this.load.image(K.Score, 'score.png')
        this.load.spritesheet(K.Face, 'face.png', { frameWidth: 500/4, frameHeight: 145})
        this.load.image(K.Ice, 'ice.png')
        this.load.image(K.Shards, 'shard.png')
        this.load.image(K.Hand, 'hand.png')
        this.load.image(K.Floz, 'floz.png')
        this.load.spritesheet(K.Tail, 'tails.png',{ frameWidth: 80, frameHeight: 100})
        this.load.addFile(new WebFontFile(this.load, ['Comic Neue', 'Quicksand']))
        this.load.spritesheet(K.Source, 'source.png',{ frameWidth: 408/3, frameHeight: 136})
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.start = this.add.text(W / 2, H - 100 - 25, ' Start ', {
            fontFamily: 'Quicksand',
            fontSize: '48px',
            color: '#fff',
            backgroundColor: '#8585858F',
            shadow: {stroke: true, blur: 9, color: bgColor, fill: true}
        })  .setInteractive({cursor: 'pointer'})
            .setOrigin(0.5, 1)
            .on('pointerup', () => {
                this.scene.stop();
                this.scene.start('game');
            })

        let controls = this.add.text(W / 2, H / 2, `
                Controls:
Click to shoot a droplet;
Long press to charge an icicle;
Tap E or the character to heal.
        `, {
            fontFamily: 'Quicksand',
            fontSize: '24px',
            color: '#fff',
            shadow: {stroke: true, blur: 9, color: '#858585', fill: true}
        }).setOrigin(0.5, 0.75)

        let highScore = localStorage.getItem('floz-highscore');
        if (highScore)
            this.score = this.add.text(W / 2, H / 2 + controls.height/3, 'Your highscore is: ' + highScore, {
                fontFamily: 'Quicksand',
                fontSize: '32px',
                color: '#fff',
                shadow: {stroke: true, blur: 9, color: '#858585', fill: true}
            }).setOrigin(0.5, 0.5)

        const wallWidth = this.textures.get(K.WallRight).getSourceImage().width / 3

        this.graphics = this.add.graphics();

        this.graphics   //left wall
            .fillStyle(Phaser.Display.Color.GetColor(196, 206, 215), 1)
            .fillRect(0, 0, this.textures.get(K.WallLeft).getSourceImage().width, H);

        this.graphics   //right wall
            .fillRect(W - wallWidth, wallWidth, wallWidth, H)
            .fillCircle(W, wallWidth, wallWidth)


        this.graphics   //water surface
            .fillStyle(Phaser.Display.Color.GetColor(39, 107,168), 1)
            .fillRect(this.textures.get(K.WallLeft).getSourceImage().width, H-100, W, 100)

        this.graphics  // waterfall
            .fillRect(W - wallWidth/2, wallWidth, wallWidth/2, H)
            .fillCircle(W, wallWidth, wallWidth/2)

        this.graphics   // blobs
            .fillStyle(Phaser.Display.Color.GetColor(70, 145,212), 1)
            .beginPath()
            .moveTo(W/2 - 6*50, 85).lineTo(W/2 + 6*50, 85).lineTo(W/2 + 5*50, 85+2.5*50).lineTo(W/2 - 5*50, 85+2.5*50)
            .closePath().fillPath();

        this.graphics   // boat
            .fillStyle(0xdadee1)
            .beginPath()
            .moveTo(W/2 - 55, H - 100 - 20).lineTo(W/2 + 55, H - 100 - 20).lineTo(W/2 + 55 - 20, H - 100).lineTo(W/2 - 55 + 20, H - 100)
            .closePath().fillPath();

        this.floz = this.add.image(W / 2, 85 + 2.5/2*50, K.Floz).setOrigin(0.5, 0.5);
    }

}
