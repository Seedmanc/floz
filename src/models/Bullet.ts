import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";


export default class Bullet extends Projectile
{
    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Blob)
        this.setScale(0.5).refreshBody().setDepth(-1)
            .body.setCircle(18).setOffset(7,7)

        this.scene.physics.add.overlap(this, this.scene.blobs, Blob.drop)
    }

    collideWalls(bullet, wall) {
        bullet.setScale(0.25, 0.75).setRotation(0);
        if (wall == this.scene.wallLeft)
            bullet.setX(this.scene.wallLeft.width+bullet.displayWidth/4)
        else
            bullet.setX(this.scene.scale.width - this.scene.walls.getChildren()[0]['width'] - bullet.displayWidth/4)
        this.scene.bullets.kill(bullet)
        bullet.body.setDragY(175);
    }

    collideWater(bullet) {
        this.scene.bullets.killAndHide(bullet['disableBody'](true,true));
        this.scene.waterLevel+=33;
    }

    collidePlayer(projectile, player) {
        //TODO
    }
}
