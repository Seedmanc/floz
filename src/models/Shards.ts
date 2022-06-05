import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Icicle from "~/models/Icicle";


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
        this.speed = {...icicle.body.velocity};
        this.setAlpha(0.7)

        this.scene.physics.add.collider(this, this.scene.shards, this.separate, undefined, this);
        this.scene.physics.add.collider(this, this.scene.UI);
        this.scene.physics.add.overlap(this, this.scene.shards, this.separate, undefined, this);
        this.scene.physics.add.overlap(this, this.scene.walls, this.contain, undefined, this);
        this.scene.physics.add.overlap(this, this.scene.waterSurface, this.overlapWater, undefined, this);
    }

    delayedCall() {
        super.delayedCall();
        this.setBounce(0.33, 0.1).setDragX(80);

        this.body.velocity.x = this.speed.x/2;
        this.body.velocity.y = this.speed.y/2;
    }

    collideWater() {
        this.setAccelerationX(0).setDragX(120);

        if (!this.timer) {
            this.timer = this.scene.time.addEvent({
                delay: this.LIFE * 1000,
                callback: () => {
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
        player.body.velocity.x =  Phaser.Math.Average([player.body.velocity.x, 50 * Math.sign(player.x-shard.x)]);
    }

    collideWalls() {}

    private overlapWater() {
        if (this.y > this.scene.scale.height - this.scene.waterSurface.displayHeight)
            this.setVelocityY(Math.min(-20, this.body.velocity.y))
    }

    private separate(s1, s2) {
        s1.setAccelerationX(15 * Math.sign(s1.x-s2.x))
        s2.setAccelerationX(-15* Math.sign(s1.x-s2.x));
    }

    private contain() {
        this.body.x = Math.min(this.body.x, this.scene.scale.width - this.scene.walls.getChildren()[1].body['width'] - this.body.width - 1)
    }
}
