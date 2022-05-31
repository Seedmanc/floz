import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Icicle from "~/models/Icicle";


export default class Shard extends Projectile
{
    static readonly VOLUME = Icicle.VOLUME;
    readonly LIFE = 10;

    private timer;
    private readonly speed;

    constructor(scene: Phaser.Scene, icicle: Icicle)
    {
        super(scene, icicle.x, icicle.y, K.Shards)
        this.body.setSize(this.body.width/2, this.body.height/2).setOffset(12, 0)
        this.speed = {...icicle.body.velocity};
        this.setAlpha(0.7)
        this.canRotate = false;

        this.scene.physics.add.collider(this, this.scene.shards, this.slide, undefined, this);
        this.scene.physics.add.overlap(this, this.scene.walls, this.contain, undefined, this);
        this.scene.physics.add.overlap(this, this.scene.shards, this.separate, undefined, this);
    }

    contain() {
        this.body.x = Math.max(this.body.x, this.scene.wallLeft.body.width+1)
        this.body.x = Math.min(this.body.x, this.scene.scale.width - this.scene.walls.getChildren()[1].body['width'] - this.body.width - 1)
    }

    slide(s1, s2) {
        if (s1.body.touching.up || s2.body.touching.up || s1.body.blocked.up || s2.body.blocked.up) {
            this.separate(s1, s2)
        }
    }

    separate(s1, s2) {
        s1.setAccelerationX(15 * Math.sign(s1.x-s2.x))
        s2.setAccelerationX(-15* Math.sign(s1.x-s2.x));
    }

    delayedCall() {
        super.delayedCall();
        this.setBounce(0.33, 0.1).setDragX(80);

        this.body.velocity.x = this.speed.x/2;
        this.body.velocity.y = this.speed.y/2;
    }

    collideWalls() {}

    collideWater() {
        this.body.setMaxVelocityY(30)
        this.setAccelerationX(0).setDragX(120);

        if (this.y > this.scene.scale.height - this.scene.waterSurface.displayHeight)
           this.setVelocityY(-20)

        if (!this.timer) {
            this.timer = this.scene.time.addEvent({
                delay: this.LIFE * 1000,
                callback: () => {
                    if (this.scene.physics.world.drawDebug)
                        return;
                    this.scene.shards.killAndHide(this);
                    this.disableBody(true, true);
                    this.scene.waterLevel += Shard.VOLUME/2;
                },
                callbackScope: this,
            })
            this.scene.waterLevel += Shard.VOLUME/2
        }
    }

    collidePlayer(shard, player) {
        player.body.velocity.x = 25 * Math.sign(player.x-shard.x)
    }
}
