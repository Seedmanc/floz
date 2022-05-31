import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";


export default class Blob extends Projectile
{
    level: number = 1;
    static readonly VOLUME = 100;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Blob)
        this.body.setCircle(21).setOffset(4,4).customSeparateX = true;
    }

    static drop(bullet, blob) {
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
    }

    collideWalls(){}

    collideWater(blob, water) {
        this.scene.UI.addScore( Blob.VOLUME/10)
        blob.kill();

        this.scene.waterLevel += Blob.VOLUME;
        this.scene.player.y -= water.height ** 2 * this.scene.INFLOW_SPEED;

        if (this.scene.blobs.countActive() == 0) {
            this.scene.win()
        }
    }

    collidePlayer(blob, player) {
        blob.kill()
        player.damage()
    }
}
