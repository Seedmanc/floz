import K from "~/const/TextureKeys";
import Phaser from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";
import S from "~/const/StateKeys";
import Image = Phaser.Physics.Arcade.Image;


export default class Bullet extends Projectile
{
    defaultScale = 0.5;
    static readonly VOLUME = 25;
    static readonly IMPULSE = 600;
    static readonly GROUP = 'bullets';

    get canCollideSource() {
        return this.y >= this.scene.source.y * 0.95 &&
            this.x <= this.scene.wallRight.getTopLeft().x+this.displayWidth;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, ...etc)
    {
        super(scene, x, y, K.Blob, ...etc)

        this.setScale(this.defaultScale).refreshBody().setDepth(-1)
            .body.setCircle(18).setOffset(7,7)

        this.body.customSeparateY = true;
       // TODO ? this.body.customSeparateX = true;
        if (!this.scene.player.stateMachine.isCurrentState(S.Pumping))
            this.scene.waterLevel -= Bullet.VOLUME;

        this.setDepth(this.scene.wallRight.depth);

        this.scene.physics.add.overlap(this, this.scene.blobs, Blob.drop)
    }

    collideWalls(bullet: Bullet, wall: Image) {
        if (bullet.x > this.scene.wallRight.getTopLeft().x + bullet.displayWidth)
            return;

        bullet.setScale(0.25, 0.75).setDepth(-1)
        let direction = Math.sign(this.body.velocity.y);

        if (wall == this.scene.wallLeft) {
            bullet.setX(wall.width + bullet.displayWidth/6)
                .setRotation(direction *-0.1)
        } else {
            bullet.setX(this.scene.scale.width - wall.width - bullet.displayWidth/6)
                .setRotation(direction * 0.1);
        }
        this.scene.bullets.kill(bullet)
        bullet.body.setDragY(150);
    }

    collideWater(bullet: Bullet) {
        this.scene.bullets.killAndHide(bullet.disableBody(true,true));
        this.scene.waterLevel+= Bullet.VOLUME;
    }

    collideSource() {
        //TODO
    }

    collidePlayer(projectile, player) {
        //TODO
    }
}
