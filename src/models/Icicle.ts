import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";
import Player from "~/models/Player";
import GameObject = Phaser.GameObjects.GameObject;


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

        this.body.setSize(this.level*15)
        this.integrity = this.level * 3;
        this.scene.waterLevel -= Icicle.VOLUME;
        this.body.onWorldBounds = true;

        this.scene.physics.add.overlap(this, this.scene.blobs, this.pierceBlob)
        this.scene.physics.world.once('worldbounds', this.collideWalls, this)
        this.scene.physics.add.collider(this.scene.icicles, this, this.annihilate)
    }

    private annihilate(...both) {
        both.forEach(icicle => icicle.break())
    }

    private pierceBlob(icicle, blob: GameObject) {
        icicle.body.setSize(icicle.level*9, icicle.level*9)
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

    collideWater(icicle: Icicle) {
        let tol = 30
        if (icicle.angle > tol && icicle.angle < 180-tol) {
            this.body.setVelocityY(0);
            this.break();
        }
    }

    collidePlayer(icicle: Icicle, player: Player) {
        this.scene.cameras.main.shake(100, 0.007);

        let speedToTailX = icicle.body.newVelocity.x * player.flipMul;
        let centerToBackCorner = (icicle.x - player.x) * player.flipMul

        let hitToTailX = speedToTailX <= 0
        let hitToTailY = centerToBackCorner >= -player.body.width / 7
        let hitSlowly  = icicle.body.newVelocity.lengthSq() <= 25

        if ((player.body.touching.left && icicle.body.touching.right || player.body.touching.right && icicle.body.touching.left) &&
            hitToTailX ||
            player.body.touching.up && icicle.body.touching.down && hitToTailY ||
            hitSlowly)
        {
            return;
        }

        this.scene.scene.stop();
        this.scene.scene.start('gameover', {})
    }

    delayedCall(...etc) {
        super.delayedCall(...etc);
        this.setBounce(1);

        if (this.level == 1)    // half the gravity
            this.setAccelerationY(-(this.scene.game.config.physics.arcade?.gravity || 200)/2)
    }
}
