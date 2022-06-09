import Phaser from 'phaser'
import K from "~/const/TextureKeys";
import WebFontFile from "~/etc/webfont";

export default class PreloadScene extends Phaser.Scene
{
	constructor()
	{
		super('preload')
	}
	preload()
    {
        this.load.image(K.WallLeft, 'left-wall.jpg')
        this.load.image(K.WallRight, 'right-wall.jpg')
        this.load.image(K.Water, 'water.jpg')
        this.load.image(K.Player, 'player.png')
        this.load.image(K.Blob, 'blob.png')
        this.load.image(K.Score, 'score.png')
        this.load.image(K.HP, 'hp.jpg')
        this.load.image(K.HpBar, 'hpbar.png')
        this.load.image(K.Ice, 'ice.png')
        this.load.image(K.Shards, 'shard.png')
        this.load.image(K.Hand, 'hand.png')
        this.load.spritesheet(K.Tail, 'tails.png',{ frameWidth: 80, frameHeight: 100})
        this.load.addFile(new WebFontFile(this.load, 'Comic Neue'))
        this.load.image(K.Source, 'source.png')
    }

    create()
    {
        this.scene.stop();
        this.scene.start('game')
    }

}
