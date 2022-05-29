import Phaser from 'phaser'
import K from '~/const/TextureKeys';
import Player from "~/models/Player";
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Icicle from "~/models/Icicle";
import game from "../main";
import Blob from "~/models/Blob";
import Group = Phaser.Physics.Arcade.Group;
import Image = Phaser.Physics.Arcade.Image;
import UI from "~/models/UI";
import Bullet from "~/models/Bullet";
import Shard from "~/models/Shards";

export default class GameScene extends Phaser.Scene
{
    wallLeft!: Image
    waterSurface!: Image
    player!: Player;
    blobs!: Group
    bullets!: Group;
    shards!: Group;
    waterLevel!: number;
    icicles!: Group
    walls!: StaticGroup
    UI!: UI;

    debug;

    readonly MAX_HEALTH = 3;
    readonly INFLOW_SPEED = 1/3300;
    readonly BLOBS_TOP = 50*2;
    readonly WATER_TO_POINTS = 1/10;

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
        this.load.image(K.Shards, 'shard.png')
    }

    init() {
	    this.waterLevel = 0;
    }

    create()
    {
        this.input.mouse.disableContextMenu();
        this.physics.world.setBoundsCollision();

        this.makeLevel()
        this.addEntities()
        this.addInteractions()

        if (game.config.physics.arcade?.debug)
            this.debug = this.add.text( 0,0  , 'debug', {
                fontFamily: 'Quicksand',
                fontSize: '32px',
                color: 'red',
                fontStyle: 'normal'
            });
    }

    makeLevel() {
        this.walls = this.physics.add.staticGroup()
        this.walls.create(this.scale.width, this.scale.height/2, K.WallRight).setOrigin(1,0.5)
            .body.updateFromGameObject()['checkCollision'].up = false;

        this.waterSurface = this.physics.add.staticImage(0, this.scale.height, K.Water).setOrigin(0,1);
        this.waterSurface.body.updateFromGameObject();

        this.wallLeft = this.walls.create(0, 0, K.WallLeft).setOrigin(0,0);
        this.wallLeft.body.updateFromGameObject();

        this.blobs = this.physics.add.group({ immovable: true, allowGravity: false , classType: Blob});
        for(let i=0; i<3; i++) {
            for (let j=0; j<12-i; j++) {
                let size = 50;
                this.blobs.create(this.scale.width/2-size*12/2+j*size + i*size/2 + size/2 , size*2 + size * i/1.1)
            }
        }

        this.UI = this.add['UI'](this.wallLeft.width/2, this.scale.height-this.waterSurface.height);
    }

    addEntities() {
        this.player = new Player(this, this.scale.width/2, this.scale.height-this.waterSurface.height*1.6);
        this.bullets = this.physics.add.group({allowGravity: true , classType: Bullet });
        this.icicles = this.physics.add.group({allowGravity: false, classType: Icicle });
        this.shards = this.physics.add.group({allowGravity: true, classType: Shard });
    }

    addInteractions() {
	    //player
        this.physics.add.collider(this.player, this.waterSurface);
        this.physics.add.collider(this.player, this.walls )
    }

    win() {
        this.UI.addScore(Math.round((this.scale.height - this.waterSurface.displayHeight - this.BLOBS_TOP) * this.WATER_TO_POINTS) +
            this.player.health / this.WATER_TO_POINTS);
        this.scene.stop('game');
        this.scene.start('gameover', {score: this.UI.value})
    }

    raiseWater() {
        if (this.waterSurface.displayHeight < this.scale.height - this.BLOBS_TOP*2) {
            this.waterSurface.setScale(1,1 + this.waterLevel * this.INFLOW_SPEED).body.updateFromGameObject();
            this.waterLevel++;
            this.UI.y = this.scale.height - this.waterSurface.displayHeight;
        } else {
            this.scene.stop('game');
            this.scene.start('gameover')
        }
    }


    update() {
	    this.raiseWater()

        this.player.stateMachine.update();

        if (this.player.y > this.scale.height - this.waterSurface.displayHeight/2) {
            alert('Please report this to dev')
            this.scene.stop('game');
            this.scene.start('gameover')
        }
    }
}
