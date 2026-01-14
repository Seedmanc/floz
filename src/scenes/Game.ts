import Phaser from 'phaser'
import K from '~/const/ResourceKeys';
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
import Source from "~/models/Source";
import S from "~/const/StateKeys";
import PumpState from "~/statemachine/Pump";
import Wave from "~/models/Wave";

function debounce(func, wait) {
    let inThrottle;
    return function() {
        // @ts-ignore
        const context = this;
        const args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
}}

export default class GameScene extends Phaser.Scene
{
    wallLeft!: Image
    wallRight!: Image;
    waterSurface!: Image
    source!: Source
    player!: Player;
    blobs!: Group
    bullets!: Group;
    waves!: Group;
    shards!: Group;
    waterLevel!: number;
    icicles!: Group
    walls!: StaticGroup
    UI!: UI;
    particles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
    debug!: Phaser.GameObjects.Text;
    toggleDebug!: Phaser.Input.Keyboard.Key;

    private playBounce = debounce(() =>this.sound.play(K.WallLeft, {pan: this.player.Xpos, volume: 1, detune: (Math.random()-0.5)*1000}), 500);

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
	    PumpState.isCooldown = false;
    }

    create()
    {
        this.scale.lockOrientation('portrait')
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
            fontSize: '24px',
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

        this.particles = this.add.particles(K.Blob)
        this.source = new Source(this)

        this.waterSurface = this.physics.add.staticImage(0, this.scale.height, K.Water).setOrigin(0,1);
        this.waterSurface.body.updateFromGameObject();

        this.wallLeft = this.walls.create(0, 0, K.WallLeft).setOrigin(0,0);
        this.wallLeft.body.updateFromGameObject();

        this.blobs = this.physics.add.group({ immovable: true, allowGravity: false, classType: Blob});
        for(let i=0; i<3; i++) {
            for (let j=0; j<12-i; j++) {
                let size = 50;
                let b = this.blobs.create(this.scale.width/2-size*12/2+j*size + i*size/2 + size/2 , size*2 + size * i/1.1)
                    b.rotation = Phaser.Math.Between(0, Math.PI*2);
                if (Math.random() > 0.66)
                    b.setTexture(K.Blob2)
            }
        }

        this.UI = this.add['UI'](this.wallLeft.width/2, this.scale.height-this.waterSurface.height);
    }

    addEntities() {
        this.player = new Player(this, this.scale.width/2, this.scale.height-this.waterSurface.height*1.5);
        this.bullets = this.physics.add.group({allowGravity: true , classType: Bullet });
        this.waves = this.physics.add.group({allowGravity: false , classType: Wave });
        this.icicles = this.physics.add.group({allowGravity: true, classType: Icicle });
        this.shards = this.physics.add.group({allowGravity: true, classType: Shard });
    }

    addInteractions() {
        this.physics.add.collider(this.player, this.waterSurface, Source.waterfallRepulsor);
        this.physics.add.collider(this.player, this.UI)
        this.physics.add.collider(this.player, this.walls, (player,wall) => {
            if (!this.physics.overlap(this.player, this.shards) && !this.sound.get(K.WallLeft)?.isPlaying)
                this.playBounce()
            // @ts-ignore
            if (wall.x < this.game.config.width/2)
                this.player.scene.sound.stopByKey(K.Move)
        })
        this.physics.add.collider(this.shards, this.bullets)
    }

    win() {
        this.bullets.getChildren().filter(el => el.active).forEach(_ => this.waterLevel+= Bullet.VOLUME)
        this.shards.getChildren().filter(el => el.active).forEach(_ => this.waterLevel+= Shard.VOLUME/2)
        this.icicles.getChildren().filter(el => el.active).forEach(_ => this.waterLevel+= Icicle.VOLUME)
        this.raiseWater()
        window.setTimeout(() => {
            this.UI.addScore(Math.round((this.scale.height - this.waterSurface.displayHeight - this.BLOBS_TOP) * this.WATER_TO_POINTS) +
                this.player.health / this.WATER_TO_POINTS);
            this.scene.stop();
            this.scene.start('gameover', {score: this.UI.value})
        }, 500)
    }

    lose() {
        this.player.stateMachine.setState(S.Drowning)
    }

    raiseWater() { // TODO refactor
        if (this.waterSurface.displayHeight < this.scale.height - this.BLOBS_TOP*2) {
            if (this.source.freezeLevel < 2)
                this.waterLevel += this.source.flowMul;

            this.waterSurface.setScale(1,1 + this.waterLevel * this.INFLOW_SPEED).body.updateFromGameObject();
            this.UI.y = this.scale.height - this.waterSurface.displayHeight;
        } else {
            this.lose()
        }
    }

    update() {
	    this.raiseWater()
        this.player.stateMachine.update();
        this.updateDebug();
    }

    private updateDebug() {
        if (Phaser.Input.Keyboard.JustDown(this.toggleDebug) && this.toggleDebug.shiftKey) {
            this.UI.setScore(0)
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
