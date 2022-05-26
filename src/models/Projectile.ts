import Phaser from "phaser";
import GameScene from "~/scenes/Game";

export default abstract class Projectile extends Phaser.Physics.Arcade.Sprite {
    scene: GameScene
    body!: Phaser.Physics.Arcade.Body

    protected constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
        super(scene, x, y, textureKey)

        this.scene = <GameScene>scene;
        scene.add.existing(this);
        scene.physics.add.existing(this)
        this.setCollideWorldBounds(true)

        this.scene.physics.add.collider(this, this.scene.walls, this.collideWalls, undefined, this)
        this.scene.physics.add.collider(this, this.scene.waterSurface, this.collideWater, undefined, this)
        this.scene.physics.add.collider(this, this.scene.player, this.collidePlayer, undefined, this)
    }

    protected preUpdate() {
        this['rotation'] = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    abstract collideWalls(projectile, wall)
    abstract collideWater(projectile, water)
    abstract collidePlayer(projectile, player)
}