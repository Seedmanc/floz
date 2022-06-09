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
    wallRight!: Image;
    waterSurface!: Image
    source!: Image
    player!: Player;
    blobs!: Group
    bullets!: Group;
    shards!: Group;
    waterLevel!: number;
    icicles!: Group
    walls!: StaticGroup
    UI!: UI;

    debug!: Phaser.GameObjects.Text;
    toggleDebug!: Phaser.Input.Keyboard.Key;

    readonly MAX_HEALTH = 3;
    readonly INFLOW_SPEED = 1/3300;
    readonly BLOBS_TOP = 50*2;
    readonly WATER_TO_POINTS = 1/10;

	constructor()
	{
		super('game')
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

        this.setDebug()
    }

    setDebug() {
        this.debug = this.add.text( 0,0  , 'debug', {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: 'red',
            fontStyle: 'normal'
        });
        this.physics.world.drawDebug = !!this.game.config.physics.arcade?.debug;
        this.debug.setVisible(this.physics.world.drawDebug);
        this.toggleDebug = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    makeLevel() {
        this.walls = this.physics.add.staticGroup()
        this.wallRight = this.walls.create(this.scale.width, 0, K.WallRight)
            .setOrigin(1,0)
        this.wallRight.y = this.wallRight.width;
        this.wallRight.body.updateFromGameObject()['checkCollision'].up = false;

        this.source = this.physics.add.staticImage(this.scale.width, this.wallRight.y+1, K.Source).setOrigin(1, 1)
        this.source.body.setCircle(this.source.width).setOffset(-this.source.width/2,-this.source.height/2)
        this.source.setDepth(-1)

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
        this.icicles = this.physics.add.group({allowGravity: true, classType: Icicle });
        this.shards = this.physics.add.group({allowGravity: true, classType: Shard });
    }

    addInteractions() {
        this.physics.add.collider(this.player, this.waterSurface);
        this.physics.add.collider(this.player, this.UI)
        this.physics.add.overlap(this.player, this.waterSurface, () => {
            if (this.player.body.embedded && this.player.body.checkCollision.down)
                this.player.body.setVelocityY(-25)
        })
        this.physics.add.collider(this.player, this.walls )
    }

    win() {
        this.UI.addScore(Math.round((this.scale.height - this.waterSurface.displayHeight - this.BLOBS_TOP) * this.WATER_TO_POINTS) +
            this.player.health / this.WATER_TO_POINTS);
        this.scene.stop();
        this.scene.start('gameover', {score: this.UI.value})
    }

    lose() {
        this.player.body.checkCollision.down = false;

        window.setTimeout(() => {
            this.scene.stop();
            this.scene.start('gameover', {})
        }, 1000)
    }

    raiseWater() {
        if (this.waterSurface.displayHeight < this.scale.height - this.BLOBS_TOP*2) {
            this.waterSurface.setScale(1,1 + this.waterLevel * this.INFLOW_SPEED).body.updateFromGameObject();
            this.waterLevel++;
            this.UI.y = this.scale.height - this.waterSurface.displayHeight;
        } else {
            this.lose()
        }
    }

    update() {
	    this.raiseWater()

        this.player.stateMachine.update();

        if (this.player.y > this.scale.height - this.waterSurface.displayHeight/2 && this.player.body.checkCollision.down) {
            this.lose();
        }

        this.updateDebug();
    }

    private updateDebug() {
        if (Phaser.Input.Keyboard.JustDown(this.toggleDebug)) {
            if (!this.physics.world.debugGraphic)
                this.physics.world.createDebugGraphic();
            if (this.physics.world.drawDebug) {
                this.physics.world.drawDebug = false;
                this.physics.world.debugGraphic.clear();
            } else {
                this.physics.world.drawDebug = true;
            }
            this.debug.setVisible(this.physics.world.drawDebug);
        }
    }
}
