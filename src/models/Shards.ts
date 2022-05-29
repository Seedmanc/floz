import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";


export default class Shard extends Projectile
{
    readonly VOLUME = 50;
    private timer;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Shards)
        this.body.setOffset(0,-10)

        this.setAlpha(0.8)
        this.canRotate = false;

        this.scene.physics.add.collider(this, this.scene.shards);
    }

    delayedCall() {
        super.delayedCall();
        this.setBounce(0.33, 0.1).setDragX(100);
    }

    collideWalls() {}

    collideWater(icicle) {
        if (!this.timer) {
            this.timer = this.scene.time.addEvent({
                delay: 5000,
                callback: () => {
                    this.scene.shards.killAndHide(this);
                    this.disableBody(true, true);
                    this.scene.waterLevel += this.VOLUME/2;
                },
                callbackScope: this,
            })
            this.scene.waterLevel += this.VOLUME/2
        }
    }

    collidePlayer() {}
}
