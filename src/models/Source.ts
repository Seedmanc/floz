import K from "~/const/TextureKeys";
import Phaser, {BlendModes} from "phaser";
import GameScene from "~/scenes/Game";
import Shard from "~/models/Shards";
import Sprite = Phaser.Physics.Arcade.Sprite;


export default class Source extends Sprite
{
    scene!: GameScene
    body!: Phaser.Physics.Arcade.Body

    freezeLevel = 0;
    private thawTimer;
    private shards: Shard[] = [];
    private splash: Phaser.GameObjects.Particles.ParticleEmitter;

    get flowMul() {
        return 1-this.freezeLevel/2
    }

    constructor(scene: GameScene)
    {
        super(scene, scene.scale.width , scene.wallRight.y+1, K.Source)

        this.scene.physics.add.existing(this.setOrigin(1, 1));
        scene.add.existing(this)

        this.setDepth(-1).setImmovable(true)
        this.body.setAllowGravity(false).setOffset(-1, 0);
        this.body.setCircle(this.width)

        this.splash = this.scene.particles.createEmitter({
            x: () => scene.scale.width - this.flowMul * 80,
            y: () => scene.scale.height - scene.waterSurface.displayHeight - 5,
            blendMode: BlendModes.SCREEN,
            scale: { start: 0.2, end: 0 },
            speed: { min: -100, max: 100 },
            quantity: 2
        }).setEmitZone({
            source: new Phaser.Geom.Line(0, 0, 80, 0),
            type: 'edge',
            quantity: 10
        });

        setTimeout(() => this.scene.physics.add.collider(this, this.scene.icicles, this.freeze, this.canCollide, this))
    }

    private canCollide(_, icicle) {
        return icicle.y < this.displayHeight;
    }

    private freeze(_, icicle) {
        if (this.freezeLevel > 1 || icicle.y > this.displayHeight*0.75)
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

        if (this.freezeLevel == 2)
            this.splash.stop()

        this.thawTimer = setTimeout(() => this.thaw(), this.freezeLevel*5000)
    }

    private thaw() { // todo animate water restarting
        this.freezeLevel = 0;
        this.thawTimer = null;
        this.setFrame(0);
        this.scene?.wallRight.setFrame(0);
        this.shards.forEach(shard => shard.setVisible(true).body.setAllowGravity(true));
        this.shards = [];
        this.splash.start()
    }

}
