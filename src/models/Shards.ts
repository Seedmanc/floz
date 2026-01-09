import K from "~/const/ResourceKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Icicle from "~/models/Icicle";
import Player from "~/models/Player";
import Source from "~/models/Source";


export default class Shard extends Projectile
{
    static readonly VOLUME = Icicle.VOLUME;
    readonly LIFE = 10;

    protected readonly canRotate = false

    private timer;
    private readonly speed;

    constructor(scene: Phaser.Scene, icicle: Icicle)
    {
        super(scene, icicle.x, icicle.y, K.Shards)
        this.body.setSize(this.body.width/2, this.body.height/2).setOffset(12, 0)
        this.speed = icicle.body.velocity.clone();
        this.setAlpha(0.75)

        this.scene.physics.add.collider(this, this.scene.shards, this.separate, undefined, this);
        this.scene.physics.add.collider(this, this.scene.UI, shard => shard.destroy());
        this.scene.physics.add.overlap(this, this.scene.shards, this.separate, undefined, this);
        this.scene.physics.add.overlap(this, this.scene.waterSurface, this.overlapWater, undefined, this);
    }

    delayedCall() {
        super.delayedCall();
        this.setBounce(0.33, 0.1).setDragX(80);
        this.body.velocity = this.speed.scale(0.5);
    }

    collideWater() {
        Source.waterfallRepulsor(this.setAccelerationX(0).setDragX(100))

        if (!this.timer) {
            this.scene.sound.play(K.Slop, {pan: this.Xpos});
            this.timer = this.scene.time.addEvent({
                delay: this.LIFE * 1000,
                callback: () => {
                    if (this?.body) {
                        this.scene?.shards.killAndHide(this);
                        this.disableBody(true, true);
                    }
                    this.scene.bullets.create(this.x, this.y)
                }
            })
            this.scene.waterLevel += Shard.VOLUME/2
        }
    }

    collidePlayer(shard: Shard, player: Player) {
        player.body.velocity.x = Phaser.Math.Average([player.body.velocity.x, 50 * Math.sign(player.x-shard.x)]);
        this.scene.sound.stopByKey(K.WallLeft)
        this.collideWater()
    }

    collideWalls() {}
    collideSource() {}

    private overlapWater() {
        if (this.y > this.scene.scale.height - this.scene.waterSurface.displayHeight)
            this.setVelocityY(Math.min(-20, this.body.velocity.y))
    }

    private separate(s1, s2) {
        s1.setAccelerationX(15 * Math.sign(s1.x-s2.x))
        s2.setAccelerationX(-15* Math.sign(s1.x-s2.x));
    }
}
