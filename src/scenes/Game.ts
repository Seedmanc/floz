import Phaser from 'phaser'
import K from '~/const/const';

export default class GameScene extends Phaser.Scene
{
    wallLeft;
    wallRight;
    waterSurface;
    player;
    blobs;
    bullets;
    score;
    value;
    hpBar;
    health;
    waterLevel;

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
    }

    init() {
	    this.health = 2;
	    this.value = 0;
	    this.waterLevel = 0;
    }

    create()
    {
        this.physics.world.setBoundsCollision();

        this.wallRight = this.physics.add.staticImage(this.scale.width, this.scale.height,K.WallRight).setOrigin(1,1);
        this.wallRight.setY(this.scale.height - (this.scale.height - this.wallRight.height)/2 ).body.updateFromGameObject();

        this.waterSurface = this.physics.add.staticImage(0, 0,K.Water).setOrigin(0,1);
        this.waterSurface.setY(this.scale.height ).body.updateFromGameObject();

        this.wallLeft = this.physics.add.staticImage(0, 0,K.WallLeft).setOrigin(0,0);
        this.wallLeft.body.updateFromGameObject();

        this.player = this.physics.add.image(this.scale.width/2, this.scale.height-this.waterSurface.height*1.57, K.Player).setCollideWorldBounds(true);
        this.physics.add.collider(this.waterSurface, this.player);

        this.player. setDragX(200)

        this.blobs = this.physics.add.group({/* runChildUpdate: true,*/ immovable: true, allowGravity: false });
        for(let i=0; i<3; i++) {
            for (let j=0; j<12-i; j++) {
                let size = 50;
                this.blobs.create(this.scale.width/2-size*12/2+j*size + i*size/2 + size/2 , size*2 + size * i/1.1, K.Blob).body.setCircle(21).setOffset(4,4)
            }
        }
        let hp = this.add.image(this.wallLeft.width/2 , this.scale.height-this.waterSurface.height-100, K.HP);
        this.hpBar = this.add.image(this.wallLeft.width/2 , this.scale.height-this.waterSurface.height-21, K.HpBar);
        this.hpBar.setOrigin(0.5,1).setScale(1,this.health);

        let score = this.add.image(this.wallLeft.width/2 , this.scale.height-this.waterSurface.height -100- hp.height, K.Score);
        this.score = this.add.text(score.x+120/3, score.y  , this.value, {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#5D7B95',
            fontStyle: 'normal',
            rtl: true,
            shadow: { color: '#8FA8BE', fill: true, offsetX: 1, offsetY: 2, blur: 1, stroke: false }
        });

        this.bullets = this.physics.add.group({allowGravity: false });
        this.input.on('pointerup', this.shoot, this);

        this.input.activePointer.x = this.scale.width/2;
        this.input.activePointer.y = this.scale.height/2;
        this.physics.add.collider( this.bullets, this.wallLeft, this.slideDown,undefined, this)
        this.physics.add.collider(this.bullets, this.wallRight , this.slideDown, undefined,this)
        this.physics.add.collider(this.bullets, this.blobs , this.dropBlob, undefined,this)
        this.physics.add.collider(this.player, this.blobs, this.hitPlayer, undefined, this)
        this.physics.add.collider(this.waterSurface, this.blobs, this.hitWater, undefined, this)
        this.physics.add.collider(this.player, this.wallLeft )
        this.physics.add.collider(this.player, this.wallRight )
    }

    shoot() {
        let bullet = this.bullets.create(this.player.x , this.player.y, K.Blob).setScale(0.5).refreshBody().setDepth(-1);
        bullet.body.setCircle(18).setOffset(7,7)
        bullet.outOfBoundsKill = true;
        bullet.checkWorldBounds = true;
        bullet.rotation = this.player.rotation;
        let angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.x, this.input.activePointer.y);
        bullet.body.velocity.x = Math.cos(angle) * 350;
        bullet.body.velocity.y = Math.sin(angle) * 350;
        this.player.body.setVelocityX( -Math.cos(angle)* 300 )
    }

    slideDown(  etc, bullet) {
	    this.bullets.kill(bullet)
        bullet.setAccelerationY(200);
    }

    dropBlob(bullet, blob) {
        this.bullets.killAndHide(bullet);
        bullet.active = false;
        bullet.disableBody(true, true);
        blob.setAccelerationY(200)
    }

    hitPlayer(player, blob) {
	    this.blobs.killAndHide(blob)
	    blob.disableBody(true, true);
	    blob.setPosition(0,0)
        blob.active = false
        this.health--;
	    this.hpBar.setScale(1, this.health);
	    if (this.health == 0) {
            this.scene.stop('game');
            this.scene.start('gameover', {win: false})
        }
    }

    hitWater(water, blob) {
	    this.value += 10;
	    this.score.text = this.value;
	    this.blobs.killAndHide(blob);
	    blob.disableBody(true, true)
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

    }
}
