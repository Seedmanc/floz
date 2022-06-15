import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Player from "~/models/Player";
import Bullet from "~/models/Bullet";


export default class Blob extends Projectile
{
    //level: number = 1;
    static readonly VALUE = 100;
    volume = Blob.VALUE;
    canRotate = false

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Blob)
        this.body.setCircle(21).setOffset(4,4).customSeparateX = true; // TODO
    }

    static drop(bullet, blob) {
        blob.setAccelerationY(200)
        blob.canRotate = true;

        if (bullet) {
            blob.volume += Bullet.VOLUME;
            blob.defaultScale = Math.sqrt((blob.volume-Bullet.VOLUME)/Blob.VALUE);
            blob.scene.bullets.killAndHide(bullet);
            bullet.active = false;
            bullet.disableBody(true, true);
        }
    }

    kill() {
        this.scene.blobs.killAndHide(this)
        this.disableBody(true, true);
    }

    collideSource(){}
    collideWalls(){}

    collideWater(blob: Blob, water) {
        this.scene.UI.addScore( Blob.VALUE/10)
        blob.kill();

        this.scene.waterLevel += blob.volume;

        if (this.scene.blobs.countActive() == 0) {
            this.scene.win()
        }
    }

    collidePlayer(blob: Blob, player: Player) {
        blob.kill()
        player.damage(Math.round((blob.volume-Bullet.VOLUME-1)/Blob.VALUE))
        player.waterToll += blob.volume;
    }
}
