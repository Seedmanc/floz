import K from "~/const/const";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";


export default class Icicle extends Phaser.Physics.Arcade.Sprite
{
    scene: GameScene
    body!: Phaser.Physics.Arcade.Body
    level: number = 1;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, K.Ice)
        this.scene = <GameScene>scene;

        scene.add.existing(this);
        scene.physics.add.existing(this)
        this  .setCollideWorldBounds(true)
        this .body.setSize(this.level*10,this.level*10)
    }

    preUpdate() {
        this['rotation'] = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

}
