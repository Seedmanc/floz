import S from '~/const/StateKeys';
import K from "~/const/TextureKeys";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";
import StateMachine from '~/statemachine/StateMachine';


export default class Player extends Phaser.GameObjects.Container
{
    scene: GameScene
    body!: Phaser.Physics.Arcade.Body
    health = 2;
    stateMachine: StateMachine

    private sprite: Phaser.GameObjects.Sprite
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys
    private inputs: Phaser.Input.InputPlugin;


    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y)
        this.scene = <GameScene>scene;

        this.sprite = scene.add.sprite(0, 0,  K.Player)
            .setOrigin(0.5, 0.5)

        this.add(this.sprite)

        scene.physics.add.existing(this)
        scene.add.existing(this)

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setSize(this.sprite.width * 0.8, this.sprite.height * 0.9)
            .setOffset(this.sprite.width * -0.4, -this.sprite.height * 0.4 )
            .setCollideWorldBounds(true)
            .setDragX(200);

        this.cursors = scene.input.keyboard.createCursorKeys()
        this.inputs = scene.input;

        this.stateMachine = new StateMachine(this, 'player')
        this.addStates()
    }

    addStates() {
        this.stateMachine.addState(S.Idle, {
                onUpdate: () => {
                    if (this.inputs.activePointer.getDuration() > 250 && this.inputs.activePointer.isDown)
                        this.stateMachine.setState(S.Charging)
                },
                onEnter: () => {
                    this.inputs.on('pointerup', (pointer) => {
                        if (pointer.leftButtonReleased()) {
                            this.shoot()
                        }
                        else if (game.config.physics.arcade?.debug && pointer.rightButtonReleased())
                            this.shootIce()
                    });
                },
                onExit: () => {
                    this.inputs.off('pointerup')
                }
            })
            .addState(S.Charging, {
                onEnter: () => {
                    this.inputs.on('pointerup', (pointer) => {
                        if (pointer.getDuration() > 1000)
                            this.shootIce()
                        this.stateMachine.setState(S.Idle)
                    });
                },
                onExit: () => {
                    this.inputs.off('pointerup')
                }
            })
            .addState(S.Hurt, {
                onEnter: () => {
                    this.scene.tweens.addCounter({
                        from: 0,
                        to: 100,
                        duration: 100,
                        repeat: 2,
                        yoyo: true,
                        ease: Phaser.Math.Easing.Sine.InOut,
                        onUpdate: tween => {
                            const value = tween.getValue()

                            this.sprite.setAlpha(value/100)
                        },
                        onComplete: () => {
                            this.stateMachine.setState(S.Idle)
                            this.sprite.clearAlpha();
                        }
                    })

                    if (this.health == 0) {
                        this.scene.scene.stop('game');
                        this.scene.scene.start('gameover', {})
                    }
                }
        })
            .setState(S.Idle)
    }

    shoot() {
        let bullet = this.scene.bullets.create(this.x , this.y, K.Blob).setScale(0.5).refreshBody().setDepth(-1)
        bullet.body.setCircle(18).setOffset(7,7)
        bullet.outOfBoundsKill = true;
        bullet.checkWorldBounds = true;
        let angle = Phaser.Math.Angle.Between(this.x, this.y, this.inputs.activePointer.x, this.inputs.activePointer.y);
        bullet.body.velocity.x = Math.cos(angle) * 500;
        bullet.body.velocity.y = Math.sin(angle) * 510;
        this.body.setVelocityX( -Math.cos(angle)* 300 )
        this.scene.waterLevel -= 33;
    }

    shootIce() {
        let bullet = this.scene.icicles.create(this.x , this.y).setBounce(1.1) .setCollideWorldBounds(true)
        let angle = Phaser.Math.Angle.Between(this.x, this.y, this.inputs.activePointer.x, this.inputs.activePointer.y);
        bullet.body.velocity.x = Math.cos(angle) * 800;
        bullet.body.velocity.y = Math.sin(angle) * 800;
        this.body.setVelocityX( -Math.cos(angle) * 500 )
    }

    damage(amount = 1) {
        this.health -= amount;
        this.scene.UI.updateHP(this.health);
        this.stateMachine.setState(S.Hurt)
    }

    private preUpdate()
    {
     //   this.scene.debug.text = this.inputs.activePointer.getDuration()/60
    }

}
