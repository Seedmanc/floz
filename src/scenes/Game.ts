import Phaser from 'phaser'
import K from '~/const/const';

export default class GameScene extends Phaser.Scene
{
    wallLeft;
    wallRight;
    waterSurface;
    player;

	constructor()
	{
		super('game')
	}

	preload()
    {
        this.load.image(K.WallLeft, 'left-wall.jpg')
        this.load.image(K.WallRight, 'right-wall.jpg')
        this.load.image(K.Water, 'water.jpg')
        this.load.image(K.Player, 'player.png')
    }

    create()
    {
        this.physics.world.setBoundsCollision();

        this.wallLeft = this.physics.add.staticImage(0, 0,K.WallLeft).setOrigin(0,0).body.updateFromGameObject();

        this.wallRight = this.physics.add.staticImage(this.scale.width, this.scale.height,K.WallRight).setOrigin(1,1);
        this.wallRight.setY(this.scale.height - (this.scale.height - this.wallRight.height)/2 ).body.updateFromGameObject();

        this.waterSurface = this.physics.add.staticImage(0, 0,K.Water).setOrigin(0,0);
        this.waterSurface.setY(this.scale.height - this.waterSurface.height).body.updateFromGameObject();

        this.player = this.physics.add.image(this.scale.width/2, this.scale.height/2, K.Player).setCollideWorldBounds(true);
        this.physics.add.collider(this.waterSurface, this.player);
    }

    update() {

    }
}
