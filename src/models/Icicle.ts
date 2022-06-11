import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";
import Player from "~/models/Player";
import TailSwatX from '~/tweens/TailSwatX';
import TailSwatY from '~/tweens/TailSwatY';
import TailWobble from '~/tweens/TailWobble';
import GameObject = Phaser.GameObjects.GameObject;
import Shard from "~/models/Shards";


export default class Icicle extends Projectile
{
    level: number = 1;
    integrity: number;
    static readonly VOLUME = 50;
    static readonly IMPULSE = 800;
    static readonly GROUP = 'icicles';
    private timer;

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

    break(): Shard {
        // @ts-ignore
        let shard = this.scene.shards.create(this);
        this.scene.icicles.killAndHide(this.disableBody(true,true));
        return shard;
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
        if (this.timer)
            return;
        this.timer = window.setTimeout(() => this.timer = null, 500);

        let speedToTailX = icicle.body.newVelocity.x * player.flipMul;
        let centerToBackCorner = (icicle.x - player.x) * player.flipMul
        let hitToTailX = speedToTailX <= 0
        let hitToTailY = centerToBackCorner >= -player.body.width / 7
        let hitSlowly  = icicle.body.newVelocity.lengthSq() <= 25

        //TODO relative speed to player
        if ((icicle.body.touching.right || icicle.body.touching.left) && hitToTailX && this.scene.player.isHurt < 2 || // horizontal
            icicle.body.touching.down && hitToTailY && !this.scene.player.isHurt ||  // vertical
            hitSlowly)
        {
            this.scene.cameras.main.shake(200, 0.00003 * icicle.body.newVelocity.lengthSq());

            if (hitToTailX && !icicle.body.touching.down)
                TailSwatX.play();
            else if (hitToTailY)
                TailSwatY.play((centerToBackCorner-20)/150);    // try to aim for the icicle
            else
                TailWobble.play(-icicle.body.newVelocity.lengthSq()/100)
            return;
        }

        icicle.break(); // TODO pass through
        this.scene.cameras.main.shake(500, 0.01);
        this.scene.lose();
    }

    delayedCall(...etc) {
        super.delayedCall(...etc);
        this.setBounce(1);

        this.scene.physics.add.overlap(this, this.scene.walls, icicle => icicle['break']())
        if (this.level == 1)    // half the gravity
            this.setAccelerationY(-(this.scene.game.config.physics.arcade?.gravity || 200)/2)
    }
}
