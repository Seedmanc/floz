import K from "~/const/TextureKeys";
import Phaser, {BlendModes} from "phaser";
import GameScene from "~/scenes/Game";
import Shard from "~/models/Shards";
import Sprite = Phaser.Physics.Arcade.Sprite;
import GameObject = Phaser.GameObjects.GameObject;
import Player from "~/models/Player";


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
    }

    static waterfallRepulsor<G extends GameObject & any>(that: G): G {
        let flowMul = that.scene.source.flowMul
        // @ts-ignore
        let force = (that instanceof Player) ? 6 : 2

        return that.scene.source.flowMul && that.x > that.scene.waterSurface.getCenter().x*1.5 ?
            that.body.setGravityX(-force * Math.max(0, that.x-that.scene.waterSurface.getCenter().x * (1.65 - 0.15*flowMul)))
                  :
            that.body.setGravityX(0) ;
    }

    canCollide(icicle) {
        return icicle.y < this.displayHeight;
    }

    freeze(icicle) {
        if (this.freezeLevel > 1 || icicle.y > this.displayHeight*0.75)
            return;

        if (this.freezeLevel < 2)
            this.shards.push(icicle.break());
        setTimeout(() => {
            this.shards.forEach(shard => shard
                .disableBody(true,true)
                .setPosition(shard.x*1.04, this.y)
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
        this.shards.forEach(shard => shard?.enableBody(false,0,0,true,true));
        this.shards = [];
        this.splash.start()
    }

}
