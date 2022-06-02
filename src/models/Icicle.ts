import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";


export default class Icicle extends Projectile
{
    level: number = 1;
    integrity: number;
    static readonly VOLUME = 50;
    static readonly IMPULSE = 800;
    static readonly GROUP = 'icicles';

    constructor(scene: Phaser.Scene, x: number, y: number, ...etc)
    {
        super(scene, x, y, K.Ice, ...etc)

        this.body.setSize(this.level*10,this.level*10)
        this.integrity = this.level * 3;
        this.scene.waterLevel -= Icicle.VOLUME;
        this.body.onWorldBounds = true;

        this.scene.physics.add.overlap(this, this.scene.blobs, this.pierceBlob)
        this.scene.physics.world.once('worldbounds', this.collideWalls, this)
        this.scene.physics.add.collider(this.scene.icicles, this, this.collideWalls, undefined, this)
    }

    private pierceBlob(_, blob) {
        Blob.drop(null, blob)
    }

    private break() {
        // @ts-ignore
        this.scene.shards.create(this);
        this.scene.icicles.killAndHide(this.disableBody(true,true));
    }

    collideWalls(body) {
        let icicle = body.gameObject || body;
        if (!--icicle.integrity)
            icicle.break();
    }

    collideWater(icicle) {
        if (icicle.angle > 45 && icicle.angle < 135) {
            this.body.setVelocityY(0);
            this.break();
        }
    }

    collidePlayer(projectile, player) {
        this.scene.cameras.main.shake(100, 0.01);
        if (this.scene.physics.world.drawDebug)
            return;
        this.scene.scene.stop('game');
        this.scene.scene.start('gameover', {})
    }

    delayedCall(...etc) {
        super.delayedCall(...etc);
        this.setBounce(1);

        if (this.level == 1)    // half the gravity
            this.setAccelerationY(-(this.scene.game.config.physics.arcade?.gravity || 200)/2)
    }
}
