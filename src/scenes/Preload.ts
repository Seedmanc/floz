import Phaser from 'phaser'
import K from "~/const/TextureKeys";
import UI from "~/models/UI";

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
    }

    create()
    {
        this.scene.stop('preload');
        this.scene.start('game')
    }

}
