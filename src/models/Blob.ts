import K from "~/const/ResourceKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Player from "~/models/Player";
import Bullet from "~/models/Bullet";


export default class Blob extends Projectile
{
    static Value_ = 100
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
        if (bullet || !blob.canRotate)
            blob.scene.sound.play(K.Po, {
                pan: blob.body.x/1000-0.5,
                volume: (blob.volume/blob.VALUE)**2,
                rate: blob.VALUE/blob.volume
            });
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
        let U =  (blob.volume-blob.VALUE)*(blob.body.velocity.y)/500
        this.scene.UI.addScore( (blob.VALUE)/10 + Math.round((blob.volume - blob.VALUE)/Bullet.VOLUME/2))
        blob.kill();
        let size = (blob.volume-Bullet.VOLUME)/blob.VALUE

        this.scene.waterLevel += (blob.volume - Bullet.VOLUME);
        this.scene.sound.play(K.Blob, {
            pan: this.Xpos,
            rate: 1.25/size+ (0.5-Math.random())/2,
            volume: 1.5*size+ (0.5-Math.random())/2
        }) ;

        if (this.scene.blobs.countActive() == 0) {
            this.scene.win()
            return;
        }
        let extra = this.scene.source.freezeLevel > 0 ? 0.5 : 0
        this.scene.bullets.create(blob.x-blob.body.radius/2, blob.y ).setVelocityY(-U*(3.25-extra))
        let wave1 = this.scene.waves.create(blob.x-blob.body.radius*2, blob.y+blob.body.radius/1.5).setVelocityX(-U*(2.25+extra));
        let wave2 = this.scene.waves.create(blob.x+blob.body.radius, blob.y+blob.body.radius/1.5).setVelocityX(U*(2.25+extra));
        [wave1, wave2].forEach(w => w.defaultScale+=U/300)
    }

    collidePlayer(blob: Blob, player: Player) {
        blob.kill()
        player.damage(Math.round((blob.volume-Bullet.VOLUME-1)/blob.VALUE))
        this.scene.UI.addScore(  - (blob.volume - blob.VALUE)/Bullet.VOLUME )
        player.waterToll += blob.volume;
        player.sfx[K.Blob2].play({pan: player.Xpos, rate: 0.75});
        if (this.scene.blobs.countActive() == 0) {
            this.scene.win()
        }
    }
}
