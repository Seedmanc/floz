import K from "~/const/TextureKeys";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";
import Blob from "~/models/Blob";


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
        this.setCollideWorldBounds(true)
        this.body.setSize(this.level*10,this.level*10)

        this.scene.physics.add.overlap(this, this.scene.blobs, this.pierceBlob)
        this.scene.physics.add.overlap(this, this.scene.waterSurface, icicle => this.scene.icicles.killAndHide(icicle['disableBody'](true,true)))
    }

    preUpdate() {
        this['rotation'] = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    pierceBlob(_, blob) {
        Blob.drop(blob)
        this.level--;
    }

}
