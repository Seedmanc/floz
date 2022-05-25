import K from "~/const/TextureKeys";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";


export default class Blob extends Phaser.Physics.Arcade.Sprite
{
    scene: GameScene
    level: number = 1;
    readonly VOLUME = 100;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Blob)
        this.scene = <GameScene>scene;

        scene.add.existing(this);
        scene.physics.add.existing(this)
        this.body.setCircle(21).setOffset(4,4)
    }

    static drop(blob, bullet?) {
        blob.setAccelerationY(200)

        if (bullet) {
            blob.scene.bullets.killAndHide(bullet);
            bullet.active = false;
            bullet.disableBody(true, true);
        }
    }

    kill() {
        this.scene.blobs.killAndHide(this)
        this.disableBody(true, true);
        this.setPosition(0,0)
        this.active = false
        this.destroy()
    }

}
