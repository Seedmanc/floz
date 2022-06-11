import K from "~/const/TextureKeys";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";
import Sprite = Phaser.Physics.Arcade.Sprite;
import Shard from "~/models/Shards";


export default class Source extends Sprite
{
    scene!: GameScene
    body!: Phaser.Physics.Arcade.Body

    freezeLevel = 0;
    private thawTimer;
    private shards: Shard[] = [];

    constructor(scene: GameScene)
    {
        super(scene, scene.scale.width , scene.wallRight.y+1, K.Source)

        this.scene.physics.add.existing(this.setOrigin(1, 1));
        scene.add.existing(this)

        this.setDepth(-1).setImmovable(true)
        this.body.setAllowGravity(false);
        this.body.setCircle(this.width) .setOffset( -1,0).checkCollision.up=false

        setTimeout(() => this.scene.physics.add.collider(this, this.scene.icicles, this.freeze, undefined, this))
    }

    private freeze(_, icicle) {
        if (this.freezeLevel > 1 || icicle.y > this.displayHeight)
            return;

        if (this.freezeLevel < 2)
            this.shards.push(icicle.break());
        setTimeout(() => {
            this.shards.forEach(shard => shard
                .setVelocity(0,0)
                .setAcceleration(0,0)
                .setVisible(false)
                .setPosition(shard.x, this.y)
                .body.setAllowGravity(false)
            )
        })

        if (this.thawTimer) {
            window.clearTimeout(this.thawTimer)
            this.thawTimer = null
        }
        this.setFrame(++this.freezeLevel)
        this.scene.wallRight.setFrame(this.freezeLevel);

        this.thawTimer = setTimeout(() => this.thaw(), this.freezeLevel*5000)
    }

    private thaw() {
        this.freezeLevel = 0;
        this.thawTimer = null;
        this.setFrame(0);
        this.scene.wallRight.setFrame(0);
        this.shards.forEach(shard => shard.setVisible(true).body.setAllowGravity(true));
        this.shards = [];
    }

}
