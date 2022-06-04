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
import CircularProgress = UIPlugins.CircularProgress;


export default class Player extends Phaser.GameObjects.Container
{
    scene!: GameScene
    body!: Phaser.Physics.Arcade.Body
    stateMachine: StateMachine
    pumpText!: Text;
    health: number;
    progress!: CircularProgress;

    private hand: Phaser.GameObjects.Sprite
    _sprite: Phaser.GameObjects.Sprite
    _reticicle: Phaser.GameObjects.Image
    _tail: Phaser.GameObjects.Sprite
    _inputs: Phaser.Input.InputPlugin;
    _keyE: Phaser.Input.Keyboard.Key;

    get isHurt() {
        return  this.scene.MAX_HEALTH - this.health;
    }

    private get aimAngle(): number {
        return this.hand.rotation + this.hand.getData('shiftAngle')
    }

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y)
        this.health = this.scene.MAX_HEALTH;

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

        this._tail = scene.add.sprite(1, 19, K.Tail)
            .setOrigin(0.3, 0.95)
        this.add(this._tail);

        this.addPumpButton()

        scene.physics.add.existing(this)
        scene.add.existing(this)

        this.body.setSize(this._sprite.width * 0.8, this._sprite.height * 0.89)
            .setOffset(this._sprite.width * -0.4, -this._sprite.height * 0.4)
            .setCollideWorldBounds(true)
            .setDragX(200).setBounceX(0.25)
            .setMaxVelocityY(10);

        this._keyE = scene.input.keyboard.addKey('e');
        this._inputs = scene.input;

        this.stateMachine = new StateMachine(this, 'player')
        this.addStates()
    }

    tryPump() {
        if (this.isHurt && !PumpState.isCooldown) {
            this.stateMachine.setState(S.Pumping);
            this._keyE.off('up', this.tryPump, this);
            this.pumpText.off('pointerdown', this.tryPump, this)
        }
    }

    shoot(isIcicle?: boolean) {
        let Projectile = isIcicle ? Icicle : Bullet;
        let angle = this.aimAngle;

        this.scene[Projectile.GROUP].create(this.x + this._reticicle.x, this.y + this._reticicle.getCenter().y  , String(angle), Projectile.IMPULSE)
        let momentum = -Math.cos(angle) * Projectile.IMPULSE/2;
        this.body.setVelocityX(momentum)

        this.scene.tweens.add({
            targets: this.scene.player._tail,
            rotation: momentum / -3000,
            duration: 250,
            hold: 250,
            yoyo: true,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.scene.player._tail,
                    rotation: momentum / 5000,
                    duration: 333,
                    yoyo: true,
                })
            }
        })
    }

    damage(amount = 1) {
        if (this.stateMachine.isCurrentState(S.Hurt))
            return;

        this.scene.cameras.main.shake(100, 0.01);
        this.health -= amount;
        this.scene.UI.updateHP(this.health);
        this.stateMachine.setState(S.Hurt)
//TODO reset charging
        if (this.health == 0) {
            this.scene.scene.stop('game');
            this.scene.scene.start('gameover', {})
        }
        this.adjustBuoyancy()
    }
    heal(amount = 1) {
        this.health += amount;
        this.scene.UI.updateHP(this.health);
        this.pumpText.setVisible(!!this.isHurt);

        this.adjustBuoyancy()

        // @ts-ignore
        this.scene.bullets.create(this.x + this.body.width/2, this.y+this.body.height/3, -Math.PI/4, Bullet.IMPULSE/3)
        // @ts-ignore
        this.scene.bullets.create(this.x - this.body.width/2, this.y+this.body.height/3, -3*Math.PI/4, Bullet.IMPULSE/3)
    }

    private adjustBuoyancy() {
        this.body
            .setDragX(200 + 150*this.isHurt)
            .setSize(this._sprite.width * 0.8, this._sprite.height * 0.89 - 6 * this.isHurt )
    }

    private addPumpButton() {
        this.progress = this.scene.add['rexCircularProgress']({
            x: 30, y: -9,
            radius: 16,
            trackColor: Phaser.Display.Color.HexStringToColor('#a9a9a7').color,
            barColor: Phaser.Display.Color.HexStringToColor('#dadfe2').color,
            centerColor: Phaser.Display.Color.HexStringToColor('#a0c4e4').color,
            anticlockwise: true,
            value: 0
        }).setVisible(false);
        this.add(this.progress);

        this.pumpText = this.scene.add.text(13, -25  , '(e)', {
            fontFamily: 'Comic Neue',
            fontSize: '25px',
            color: '#6069d2',
            stroke: '#266AA754',
            strokeThickness: 2,
            shadow: { color: '#266AA7', fill: false, blur: 10 }
        })
            .setVisible(false)
            .setInteractive({hitArea: new Phaser.Geom.Circle(-12, 12, 50), useHandCursor: true, hitAreaCallback: Phaser.Geom.Circle.Contains});

        this.add(this.pumpText);

        this.scene.tweens.add({
            targets: this.pumpText,
            alpha: { value: 0, duration: 250 },
            yoyo: true,
            loop: -1
        })
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
        let angle = Phaser.Math.Angle.Between(this.x, this.y, this._inputs.activePointer.x, this._inputs.activePointer.y);

        if (angle > 0.75*Math.PI || angle < Math.PI/5) { // except lower ~quarter of a circle
            this._sprite.flipX = this._inputs.activePointer.x > this.x;
            this.adjustHand();
            this.hand.rotation = angle - this.hand.getData('shiftAngle'); // I have no idea what's going on here
            this.adjustReticicle()
            this.adjustTail()
        }

    }

    private adjustReticicle() {
        this._reticicle.rotation = this.aimAngle;
        this._reticicle.setOrigin(0.5,this.hand.flipX ? 0 : 0.5)

        this._reticicle.x = Math.cos( this.aimAngle ) * this.body.width /1.45 + this.hand.x
        this._reticicle.y = Math.sin( this.aimAngle ) * this.body.height/1.45 + this.hand.y
    }

    private adjustHand() {
        this.hand.flipX = this._sprite.flipX;

        let flip = this.hand.flipX ? 1 : -1;

        this.hand.setOrigin(0.5 - 0.4 * flip, 0.9);
        this.hand.x = 5 * flip;
        this.hand.setData('shiftAngle', (180+22.5) + 22.6 * flip); // 45/2
    }

    private adjustTail() {
        this._tail.flipX = this._sprite.flipX;

        this._tail.setOrigin(this._tail.flipX ? 0.7 : 0.3, 0.95)
    }

}
