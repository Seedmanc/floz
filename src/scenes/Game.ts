import Phaser from 'phaser'
import K from '~/const/const';
import Player from "~/models/Player";
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Icicle from "~/models/Icicle";
import Blob from "~/models/Blob";
import Group = Phaser.Physics.Arcade.Group;
import Image = Phaser.Physics.Arcade.Image;

export default class GameScene extends Phaser.Scene
{
    wallLeft!: Image
    waterSurface!: Image
    player!: Player;
    blobs!: Group
    bullets!: Group;
    score!: Phaser.GameObjects.Text;
    value!: number;
    hpBar!: Phaser.GameObjects.Image;
    health!: number;
    waterLevel!: number;
    icicles!: Group
    walls!: StaticGroup

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
	    this.health = 2;
	    this.value = 0;
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
        let hp = this.add.image(this.wallLeft.width/2 , this.scale.height-this.waterSurface.height-100, K.HP);
        this.hpBar = this.add.image(this.wallLeft.width/2 , this.scale.height-this.waterSurface.height-21, K.HpBar);
        this.hpBar.setOrigin(0.5,1).setScale(1,this.health);

        let score = this.add.image(this.wallLeft.width/2 , this.scale.height-this.waterSurface.height -100- hp.height, K.Score);
        this.score = this.add.text(score.x+120/3, score.y  , this.value+'', {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#5D7B95',
            fontStyle: 'normal',
            rtl: true,
            shadow: { color: '#8FA8BE', fill: true, offsetX: 1, offsetY: 2, blur: 1, stroke: false }
        });

        this.bullets = this.physics.add.group({allowGravity: true });
        this.icicles = this.physics.add.group({allowGravity: true, classType: Icicle });

        this.input.activePointer.x = this.scale.width/2;
        this.input.activePointer.y = this.scale.height/2;
        this.physics.add.collider( this.bullets, this.walls, this.slideDown,undefined, this)
        this.physics.add.collider(this.bullets, this.blobs , this.dropBlob, undefined,this)
        this.physics.add.collider(this.player, this.blobs, this.hitPlayer, undefined, this)
        this.physics.add.collider(this.waterSurface, this.blobs, this.hitWater, undefined, this)
        this.physics.add.collider(this.player, this.walls )
        this.physics.add.collider(this.icicles, this.walls )
        this.physics.add.overlap(this.icicles, this.waterSurface, (w,icicle) => this.icicles.killAndHide(icicle['disableBody'](true,true)) )
        this.physics.add.overlap(this.icicles, this.blobs, this.cutBlob, undefined, this);
        this.physics.add.collider(this.icicles, this.player, () => {
            this.scene.stop('game');
            this.scene.start('gameover', {win: false})
        }, undefined, this);
    }


    slideDown(  obj1: Phaser.GameObjects.GameObject, obj2) {
        let bullet  = [obj1, obj2].find(obj => obj.texture.key == K.Blob)
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
        this.health--;
	    this.hpBar.setScale(1, this.health);
	    if (this.health == 0) {
            this.scene.stop('game');
            this.scene.start('gameover', {win: false})
        }
    }

    hitWater(water, blob) {
	    this.value += 10;
	    this.score.text = this.value+'';
	    blob.kill();
        this.waterLevel+=100;
	    this.player.y -=2;
	    if (this.blobs.countActive() == 0) {
	        this.value += Math.round((this.scale.height - this.waterSurface.displayHeight-100)/10);
            this.scene.stop('game');
            this.scene.start('gameover', {win: true, score: this.value})
        }
    }

    update() {
	    if (this.waterSurface.displayHeight < this.scale.height - 50*4) {
            this.waterSurface.setScale(1,1+this.waterLevel/2500).body.updateFromGameObject();
            this.waterLevel ++ ;
        } else {
            this.scene.stop('game');
            this.scene.start('gameover', {win: false})
        }
	    if (this.player.y > this.scale.height - this.waterSurface.displayHeight/2) {
            this.scene.stop('game');
            this.scene.start('gameover', {win: false})
        }

	    this.icicles.getChildren().forEach(c => {
	        c['rotation'] = Math.atan2(c.body.velocity.y, c.body.velocity.x)
        })
    }
}
