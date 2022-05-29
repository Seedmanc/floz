import Phaser from "phaser";
import GameScene from "~/scenes/Game";
import Icicle from "~/models/Icicle";

export default abstract class Projectile extends Phaser.Physics.Arcade.Image {
    scene: GameScene
    body!: Phaser.Physics.Arcade.Body
    defaultScale = 1;
    canRotate = true;

    readonly VOLUME;

    protected constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
        super(scene, x, y, textureKey)

        this.scene = <GameScene>scene;
        scene.add.existing(this);
        scene.physics.add.existing(this)

        this.scene.physics.add.collider(this, this.scene.walls, this.collideWalls, undefined, this)
        this.scene.physics.add.collider(this, this.scene.waterSurface, this.collideWater, undefined, this)
        window.setTimeout(this.delayedCall.bind(this))
    }

    protected preUpdate() {
        if (this.canRotate)
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)

        if (!(this instanceof Icicle)) {
            this.scaleX = this.defaultScale + this.body.velocity.length()/3000;
            this.scaleY = this.defaultScale - this.body.velocity.length()/2500;
        }
    }

    delayedCall() {
        this.scene.physics.add.collider(this, this.scene.player, this.collidePlayer, undefined, this);
        this.setCollideWorldBounds(true)
    }

    abstract collideWalls(projectile, wall)
    abstract collideWater(projectile, water)
    abstract collidePlayer(projectile, player)
}