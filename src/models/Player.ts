import K from "~/const/const";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";


export default class Player extends Phaser.GameObjects.Container
{
    scene: GameScene
    body!: Phaser.Physics.Arcade.Body
    health = 2;

    private sprite: Phaser.GameObjects.Sprite
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys
    private inputs: Phaser.Input.InputPlugin;


    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y)
        this.scene = <GameScene>scene;

        this.sprite = scene.add.sprite(0, 0,  K.Player)
            .setOrigin(0.5, 0.5)

        this.createAnimations()

        this.add(this.sprite)

        scene.physics.add.existing(this)
        scene.add.existing(this)

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setSize(this.sprite.width * 0.8, this.sprite.height * 0.9)
            .setOffset(this.sprite.width * -0.4 , -this.sprite.height*0.4 )
            .setCollideWorldBounds(true)
            .setDragX(200);

        this.cursors = scene.input.keyboard.createCursorKeys()
        this.inputs = scene.input;

        this.inputs.on('pointerup', (pointer) => {
            if (pointer.leftButtonReleased())
                this.shoot()
            else if (pointer.rightButtonReleased())
                this.shootIce()
        });
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
    }

    private createAnimations()
    {

    }

}
