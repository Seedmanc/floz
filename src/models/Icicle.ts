import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";


export default class Icicle extends Projectile
{
    level: number = 1;
    integrity: number;
    readonly VOLUME = 50;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Ice)
        this.body.setSize(this.level*10,this.level*10)//.onWorldBounds = true
        this.integrity = this.level * 2;
        this.scene.waterLevel -= this.VOLUME;

        this.scene.physics.add.overlap(this, this.scene.blobs, this.pierceBlob)
        this.scene.physics.world.on('worldbounds', this.collideWalls, this)
    }

    pierceBlob(_, blob) {
        Blob.drop(null, blob)
    }

    break() {
        let shard = this.scene.shards.create(this.x, this.y).body;
        shard.velocity.x = this.body.velocity.x/2;
        shard.velocity.y = this.body.velocity.y/2;

        this.scene.icicles.killAndHide(this.disableBody(true,true));
    }

    collideWalls(body) {
        let icicle = body.gameObject || body;

        if (!--icicle.integrity)
            icicle.break();
    }

    collideWater(icicle) {
        this.body.setVelocityY(0);
        this.break();
    }

    collidePlayer(projectile, player) {
        this.scene.scene.stop('game');
        this.scene.scene.start('gameover', {})
    }

    delayedCall() {
        super.delayedCall();
        this.setBounce(1);
    }
}
