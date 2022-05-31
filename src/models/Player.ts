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


export default class Player extends Phaser.GameObjects.Container
{
    scene!: GameScene
    body!: Phaser.Physics.Arcade.Body
    stateMachine: StateMachine
    pumpText!: Text;
    health: number;

    private readonly hand: Phaser.GameObjects.Sprite
    readonly _sprite: Phaser.GameObjects.Sprite
    _inputs: Phaser.Input.InputPlugin;
    _keyE: Phaser.Input.Keyboard.Key;

    get isHurt(): boolean {
        return this.health < this.scene.MAX_HEALTH;
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

        this.addPumpButton()

        scene.physics.add.existing(this)
        scene.add.existing(this)

        this.body.setSize(this._sprite.width * 0.8, this._sprite.height * 0.9)
            .setOffset(this._sprite.width * -0.4, -this._sprite.height * 0.4 )
            .setCollideWorldBounds(true)
            .setDragX(200)
            .setMaxVelocityY(10);

        this._keyE = scene.input.keyboard.addKey('e');
        this._inputs = scene.input;

        this.stateMachine = new StateMachine(this, 'player')
        this.addStates()
    }

    tryPump() {
        if (this.isHurt) {
            this.stateMachine.setState(S.Pumping);
            this._keyE.off('up', this.tryPump, this);
        }
    }

    shoot(isIcicle?: boolean) {
        let Projectile = isIcicle ? Icicle : Bullet;
        let angle = this.hand.rotation + this.hand.getData('shiftAngle');

        this.scene[Projectile.GROUP].create(this.x , this.y, String(angle), Projectile.IMPULSE)
        this.body.setVelocityX(-Math.cos(angle) * Projectile.IMPULSE/2)
    }

    damage(amount = 1) {
        if (this.stateMachine.isCurrentState(S.Hurt))
            return;

        this.health -= amount;
        this.scene.UI.updateHP(this.health);
        this.stateMachine.setState(S.Hurt)
//TODO reset charging
        if (this.health == 0) {
            this.scene.scene.stop('game');
            this.scene.scene.start('gameover', {})
        }
    }
    heal(amount = 1) {
        this.health += amount;
        this.scene.UI.updateHP(this.health);
        this.pumpText.setVisible(this.isHurt);
    }


    private addPumpButton() {
        this.pumpText = this.scene.add.text( 10,-20  , '(E)', {
            fontFamily: 'Comic Neue',
            fontSize: '24px',
            color: 'blue',
            fontStyle: 'bold'
        }).setVisible(false);
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
        this._sprite.flipX = this._inputs.activePointer.x > this.x;
        this.adjustHand();

        let angle = Phaser.Math.Angle.Between(this.x, this.y, this._inputs.activePointer.x, this._inputs.activePointer.y);

        if (angle > 0.75*Math.PI || angle < Math.PI/5) { // except lower ~quarter of a circle
            this.hand.rotation = angle - this.hand.getData('shiftAngle');             // I have no idea what's going on here
        }
    }

    private adjustHand() {
        this.hand.flipX = this._sprite.flipX;

        if (this.hand.flipX) {
            this.hand.setOrigin(0.1, 0.9);
            this.hand.x = 5;
            this.hand.setData('shiftAngle', 180+45);
        } else {
            this.hand.setOrigin(0.9, 0.9);
            this.hand.x = -5;
            this.hand.setData('shiftAngle', 180);
        }

    }

}
