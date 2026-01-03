import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Player from "~/models/Player";
import Bullet from "~/models/Bullet";


export default class Blob extends Projectile
{
    //level: number = 1;
    VALUE = 100;
    volume = this.VALUE;
    canRotate = false

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Blob)
        this.body.setCircle(21).setOffset(4,4).customSeparateX = true; // avoid stopping falling blob when hitting it with droplet
        this.body.angle = Math.random()*2*Math.PI;
    }

    static drop(bullet, blob) {
        blob.setAccelerationY(200)
        blob.canRotate = true;

        if (bullet) {
            blob.volume += Bullet.VOLUME;
            blob.defaultScale = Math.sqrt((blob.volume-Bullet.VOLUME)/blob.VALUE);
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
        this.scene.UI.addScore( (blob.VALUE)/10 + Math.round((blob.volume - blob.VALUE)/Bullet.VOLUME/2))
        blob.kill();

        this.scene.waterLevel += blob.volume;

        if (this.scene.blobs.countActive() == 0) {
            this.scene.win()
        }
    }

    collidePlayer(blob: Blob, player: Player) {
        blob.kill()
        player.damage(Math.round((blob.volume-Bullet.VOLUME-1)/blob.VALUE))
        this.scene.UI.addScore(  - (blob.volume - blob.VALUE)/Bullet.VOLUME )
        player.waterToll += blob.volume;
        if (this.scene.blobs.countActive() == 0) {
            this.scene.win()
        }
    }
}
