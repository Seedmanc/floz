import S from '~/const/StateKeys';
import K from "~/const/TextureKeys";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";
import { ChargeState } from '~/statemachine/Charge';
import HurtState from '~/statemachine/Hurt';
import IdleState from '~/statemachine/Idle';
import StateMachine from '~/statemachine/StateMachine';
import Text = Phaser.GameObjects.Text;
import PumpState from "~/statemachine/Pump";
import Icicle from "~/models/Icicle";
import Bullet from "~/models/Bullet";
import UIPlugins from "phaser3-rex-plugins/templates/ui/ui-plugin";
import TailSwatX from '~/tweens/TailSwatX';
import TailSwatY from '~/tweens/TailSwatY';
import CircularProgress = UIPlugins.CircularProgress;
import TailWobble from "~/tweens/TailWobble";
import Blinking from "~/tweens/Blinking";
import {bgColor} from "~/main";
import Blob from "~/models/Blob";


export default class Player extends Phaser.GameObjects.Container
{
    scene!: GameScene
    body!: Phaser.Physics.Arcade.Body
    stateMachine: StateMachine
    pumpText!: Text;
    health: number;
    progress!: CircularProgress;
    flipMul = 1;
    waterToll = 0;

    readonly WATERLINE = 30

    private hand!: Phaser.GameObjects.Sprite
    private _sprite!: Phaser.GameObjects.Sprite
    _reticicle!: Phaser.GameObjects.Image
    _tail!: Phaser.GameObjects.Sprite
    _inputs: Phaser.Input.InputPlugin;
    _keyE: Phaser.Input.Keyboard.Key;

    get isHurt() {
        return  this.scene.MAX_HEALTH - this.health;
    }

    private get aimAngle(): number {
        let r = Phaser.Math.Angle.Between(this.x, this.y, this._inputs.activePointer.x, this._inputs.activePointer.y);

        if (r < Math.PI && r > Math.PI/2 )
             r = Math.max(0.75*Math.PI, r)
        else if (r > 0 && r < Math.PI/2)
            r = Math.min(Math.PI/5, r)

        return r;
    }

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y)
        this.health = this.scene.MAX_HEALTH;

        this.addParts(scene);
        scene.physics.add.existing(this)
        scene.add.existing(this)

        this.body
            .setSize(this._sprite.width * 0.8, this._sprite.height * 0.89)
            .setOffset(this._sprite.width * -0.4, -this._sprite.height * 0.4)
            .setCollideWorldBounds(true)
            .setDragX(200).setBounceX(0.25)

        this._keyE = scene.input.keyboard.addKey('e');
        this._inputs = scene.input;

        this.stateMachine = new StateMachine(this, 'player')
        this.addStates()

        this.scene.physics.add.overlap(this, this.scene.waterSurface, () => {
           let belowWater = Math.min( 0, this.scene.waterSurface.getTopCenter().y - (this.y + this.body.height/2))

           if (belowWater <= -this.WATERLINE) {
               this.damage();
               this.waterToll += Blob.VALUE;
           }
           if (this.body.embedded && this.body.checkCollision.down)
               this.body.setVelocityY(-this.WATERLINE*1.4)
        });
    }

    tryPump() {
        console.info('hurt', this.isHurt, 'cooldown', PumpState.isCooldown)
        if (this.isHurt && !PumpState.isCooldown) {
            this.stateMachine.setState(S.Pumping);
            this._keyE.off('up', this.tryPump, this);
            this.pumpText.off('pointerdown', this.tryPump, this)
        }
    }

    shoot(projectile: typeof Icicle | typeof Bullet) {
        let angle = this.aimAngle;

        this.scene[projectile.GROUP].create(
            this.body.center.x + this._reticicle.x*this.flipMul,
            this.y + this._reticicle.y,
            String(angle), projectile.IMPULSE
        )

        this.body.setVelocityX(-Math.cos(angle) * projectile.IMPULSE/2)
        if (this.health > 1)
          TailWobble.play()
    }

    damage(amount = 1) {
        TailWobble.play(-0.2)
        if (this.stateMachine.isCurrentState(S.Hurt))
            return;

        this.scene.cameras.main.shake(100, 0.01);
        this.health = Math.max(this.health - amount, 0);
        this.scene.UI.updateHP(this.health);
        this.stateMachine.setState(S.Hurt)
//TODO reset charging
        if (this.health == 0) {
            this.scene.lose()
        }
        this.adjustSoaking()
    }

    heal(stages = 1) {
        let turns = Math.round(this.waterToll/Bullet.VOLUME/this.isHurt)

        for (let i = 0; i < turns; i++) {
            this.spawnDroplets(i);
            this.waterToll -= Bullet.VOLUME;
        }

        this.health++;
        this.scene.UI.updateHP(this.health);
        this.pumpText.setVisible(!!this.isHurt);

        this.adjustSoaking()
    }

    private spawnDroplets(i: number) {
        let side = i%2;
        // @ts-ignore
        this.scene.bullets.create(this.x + (side ? 1 : -1)*this.body.width/2, this.y+this.body.height/3, (side ? -Math.PI/4 : -3*Math.PI/4) + i/20,
            Bullet.IMPULSE/Phaser.Math.Between(2,4))
    }

    private addParts(scene) {
        this._sprite = scene.add.sprite(0, 0,  K.Player)
            .setOrigin(0.5, 0.5);
        this.add(this._sprite)

        this.hand = scene.add.sprite(-5, -10,  K.Hand)
            .setOrigin(0.9, 0.9);
        this.add(this.hand)

        this._reticicle = scene.add.image(this.hand.x, this.hand.y, K.Ice)
            .setScale(0.9)
            .setOrigin(0.5, 0.5)
        this.add(this._reticicle);

        this._tail = scene.add.sprite(1, 19, K.Tail, 0)
            .setOrigin(0.2, 0.95)
        this.add(this._tail);
        TailWobble.add(this);
        TailSwatX.add(this);
        TailSwatY.add(this);

        this.addPumpButton()
    }

    private adjustSoaking() {
        this.body
            .setDragX(200 + 150*this.isHurt)
            .setSize(this.body.width, this._sprite.height*0.89 - 6*this.isHurt);
        this._tail.setFrame(this.isHurt);
    }

    private addPumpButton() {
        this.progress = this.scene.add['rexCircularProgress']({
            x: 20, y: -20,
            radius: 16,
            trackColor: Phaser.Display.Color.HexStringToColor('#a9a9a7').color,
            barColor: Phaser.Display.Color.HexStringToColor('#dadfe2').color,
            centerColor: Phaser.Display.Color.HexStringToColor(bgColor).color,
            anticlockwise: true,
            value: 0
        })
            .setVisible(false);
        this.add(this.progress);

        this.pumpText = this.scene.add.text(5, -36  , '(e)', {
            fontFamily: 'Comic Neue',
            fontSize: '25px',
            color: '#6069d2',
            stroke: '#266AA754',
            strokeThickness: 2,
            shadow: { color: '#266AA7', fill: false, blur: 10 }
        })
            .setVisible(false)
            .setInteractive({
                hitArea: new Phaser.Geom.Circle(-12, 12, 50),
                useHandCursor: true,
                hitAreaCallback: Phaser.Geom.Circle.Contains
            });

        this.add(this.pumpText);
        Blinking.add(this.pumpText);
    }

    private addStates() {
        this.stateMachine
            .addState(S.Idle, IdleState)
            .addState(S.Charging, ChargeState)
            .addState(S.Hurt, HurtState)
            .addState(S.Pumping, PumpState)
            .setState(S.Idle)
    }

    private preUpdate()
    {
        this.flipBody()
        this.adjustHand();
        this.adjustReticicle()
    }

    private flipBody() {
        this.pumpText.flipX = this._inputs.activePointer.x > this.x
        this.flipMul = this.pumpText.flipX ? -1 : 1;

        this.setScale(this.flipMul, 1)
        this.body.setOffset(  this._sprite.width * -0.4 + this.body.width/2 - this.body.halfWidth * this.flipMul, this.body.offset.y)
    }

    private adjustReticicle() {
        this._reticicle.rotation = this.aimAngle * this.flipMul
        this._reticicle.setOrigin(this._reticicle.originX, 0.375 + 0.25 * this.flipMul)

        this._reticicle.x = Math.cos( this.aimAngle ) * this.body.width * this.flipMul /1.45 + this.hand.x
        this._reticicle.y = Math.sin( this.aimAngle ) * this.body.height/1.45 + this.hand.y
    }

    private adjustHand() {
        let shiftAngle = this.flipMul > 0 ? 180 : -45;
        this.hand.rotation = (this.aimAngle - shiftAngle) * this.flipMul;
    }

}
