import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Icicle from "~/models/Icicle";


export default class Shard extends Projectile
{
    readonly VOLUME = 50;

    private timer;
    private readonly speed;

    constructor(scene: Phaser.Scene, icicle: Icicle)
    {
        super(scene, icicle.x, icicle.y, K.Shards)
        this.body.setOffset(0,-10)
        this.speed = {...icicle.body.velocity};
        this.setAlpha(0.8)
        this.canRotate = false;

        this.scene.physics.add.collider(this, this.scene.shards);
    }

    delayedCall() {
        super.delayedCall();
        this.setBounce(0.33, 0.1).setDragX(100);

        this.body.velocity.x = this.speed.x/2;
        this.body.velocity.y = this.speed.y/2;
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
