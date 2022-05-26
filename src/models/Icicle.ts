import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";


export default class Icicle extends Projectile
{
    level: number = 1;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Ice)
        this.body.setSize(this.level*10,this.level*10)

        this.scene.physics.add.overlap(this, this.scene.blobs, this.pierceBlob)
    }

    pierceBlob(_, blob) {
        Blob.drop(null, blob)
        this.level--;
    }

    collideWalls() {}

    collideWater(icicle) {
        this.scene.icicles.killAndHide(icicle['disableBody'](true,true));
    }

    collidePlayer(projectile, player) {
        this.scene.scene.stop('game');
        this.scene.scene.start('gameover', {})
    }
}
