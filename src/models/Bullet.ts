import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";
import S from "~/const/StateKeys";
import Image = Phaser.Physics.Arcade.Image;


export default class Bullet extends Projectile
{
    defaultScale = 0.5;
    static readonly VOLUME = 33;
    static readonly IMPULSE = 600;
    static readonly GROUP = 'bullets';

    constructor(scene: Phaser.Scene, x: number, y: number, ...etc)
    {
        super(scene, x, y, K.Blob, ...etc)
        this.setScale(this.defaultScale).refreshBody().setDepth(-1)
            .body.setCircle(18).setOffset(7,7)

        this.body.customSeparateY = true;
        if (!this.scene.player.stateMachine.isCurrentState(S.Pumping))
            this.scene.waterLevel -= Bullet.VOLUME;

        this.scene.physics.add.overlap(this, this.scene.blobs, Blob.drop)
    }

    collideWalls(bullet: Bullet, wall: Image) {//TODO from the top
        bullet.setScale(0.25, 0.75)
        let direction = Math.sign(this.body.velocity.y);

        if (wall == this.scene.wallLeft) {
            bullet.setX(this.scene.wallLeft.width+bullet.displayWidth/6)
                .setRotation(direction *-0.1)
        } else {
            bullet.setX(this.scene.scale.width - this.scene.walls.getChildren()[0]['width'] - bullet.displayWidth/6)
                .setRotation(direction * 0.1);
        }
        this.scene.bullets.kill(bullet)
        bullet.body.setDragY(175);
    }

    collideWater(bullet: Bullet) {
        this.scene.bullets.killAndHide(bullet.disableBody(true,true));
        this.scene.waterLevel+= Bullet.VOLUME;
    }

    collidePlayer(projectile, player) {
        //TODO
    }
}
