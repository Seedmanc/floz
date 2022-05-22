import Phaser from 'phaser'
import K from '~/const/const';
import Player from "~/models/Player";
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Icicle from "~/models/Icicle";
import Blob from "~/models/Blob";
import Group = Phaser.Physics.Arcade.Group;
import Image = Phaser.Physics.Arcade.Image;
import UI from "~/models/UI";

export default class GameScene extends Phaser.Scene
{
    wallLeft!: Image
    waterSurface!: Image
    player!: Player;
    blobs!: Group
    bullets!: Group;
    score!: Phaser.GameObjects.Text;
    waterLevel!: number;
    icicles!: Group
    walls!: StaticGroup
    UI!: UI;

    private readonly INFLOW_SPEED = 1/2500;
    private readonly BLOBS_TOP = 50*2;
    private readonly WATER_TO_POINTS = 1/10;

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
        this.load.image(K.Blob, 'blob.png')
        this.load.image(K.Score, 'score.png')
        this.load.image(K.HP, 'hp.jpg')
        this.load.image(K.HpBar, 'hpbar.png')
        this.load.image(K.Ice, 'ice.png')
    }

    init() {
	    this.waterLevel = 0;
    }

    create()
    {
        this.input.mouse.disableContextMenu();
        this.physics.world.setBoundsCollision();

        this.walls = this.physics.add.staticGroup( )
        this.walls.create(this.scale.width, this.scale.height, K.WallRight).setOrigin(1,0.5)
           .setY(this.scale.height - (this.scale.height  )/2 ).body.updateFromGameObject();

        this.waterSurface = this.physics.add.staticImage(0, 0,K.Water).setOrigin(0,1);
        this.waterSurface.setY(this.scale.height ).body.updateFromGameObject();

        this.wallLeft = this.walls.create(0, 0, K.WallLeft).setOrigin(0,0);
        this.wallLeft.body.updateFromGameObject();

        this.player = new Player(this, this.scale.width/2, this.scale.height-this.waterSurface.height*2.1);
        this.add.existing(this.player)

        this.physics.add.collider(this.waterSurface, this.player);

        this.blobs = this.physics.add.group({ immovable: true, allowGravity: false , classType: Blob});
        for(let i=0; i<3; i++) {
            for (let j=0; j<12-i; j++) {
                let size = 50;
                this.blobs.create(this.scale.width/2-size*12/2+j*size + i*size/2 + size/2 , size*2 + size * i/1.1)
            }
        }

        this.UI = this.add.existing(new UI(this, this.wallLeft.width/2, this.scale.height-this.waterSurface.height));


        this.bullets = this.physics.add.group({allowGravity: true });
        this.icicles = this.physics.add.group({allowGravity: true, classType: Icicle });

        this.physics.add.collider(this.bullets, this.walls, this.slideDown,undefined, this)
        this.physics.add.collider(this.bullets, this.blobs , this.dropBlob, undefined,this)
        this.physics.add.overlap(this.player, this.blobs, this.hitPlayer, undefined, this)
        this.physics.add.collider(this.waterSurface, this.blobs, this.hitWater, undefined, this)
        this.physics.add.collider(this.player, this.walls )
        this.physics.add.collider(this.icicles, this.walls )
        this.physics.add.overlap(this.icicles, this.waterSurface, (w,icicle) => this.icicles.killAndHide(icicle['disableBody'](true,true)) )
        this.physics.add.overlap(this.icicles, this.blobs, this.cutBlob, undefined, this);
        this.physics.add.collider(this.icicles, this.player, () => {
            this.scene.stop('game');
            this.scene.start('gameover')
        }, undefined, this);
    }


    slideDown(bullet, wall) {
        bullet.setScale(0.25,0.75 )
        if (wall == this.wallLeft)
            bullet.setX(this.wallLeft.width+bullet.displayWidth/4)
        else
            bullet.setX(this.scale.width - this.walls.getChildren()[0]['width'] - bullet.displayWidth/4)
        this.bullets.kill(bullet)
        bullet.body.setDragY(175);
    }

    dropBlob(bullet, blob) {
        this.bullets.killAndHide(bullet);
        bullet.active = false;
        bullet.disableBody(true, true);
        blob.drop()
    }

    cutBlob(bullet, blob) {
        blob.drop()
    }

    hitPlayer(player, blob) {
        blob.kill()
        player.damage()
	    this.UI.updateHP(this.player.health);
	    if (this.player.health == 0) {
            this.scene.stop('game');
            this.scene.start('gameover')
        }
    }

    hitWater(_, blob) {
	    this.UI.addScore( blob.VOLUME/10)
	    blob.kill();
        this.waterLevel += blob.VOLUME;
	    this.player.y -= this.waterSurface.height ** 2 * this.INFLOW_SPEED  +1;

	    if (this.blobs.countActive() == 0) {
            this.UI.addScore(Math.round((this.scale.height - this.waterSurface.displayHeight - this.BLOBS_TOP) * this.WATER_TO_POINTS) + this.player.health / this.WATER_TO_POINTS);
            this.scene.stop('game');
            this.scene.start('gameover', {score: this.UI.value})
        }
    }

    update() {
	    this.raiseWater()

        if (this.player.y > this.scale.height - this.waterSurface.displayHeight/2) { //TODO fix drowning
            this.scene.stop('game');
            this.scene.start('gameover')
        }
    }

    private raiseWater() {
        if (this.waterSurface.displayHeight < this.scale.height - this.BLOBS_TOP*2) {
            this.waterSurface.setScale(1,1 + this.waterLevel * this.INFLOW_SPEED).body.updateFromGameObject();
            this.waterLevel++;
            this.UI.y = this.scale.height - this.waterSurface.displayHeight;
        } else {
            this.scene.stop('game');
            this.scene.start('gameover')
        }
    }
}
