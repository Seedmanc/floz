import K from "~/const/ResourceKeys";
import Phaser, {BlendModes} from "phaser";
import Blob from "~/models/Blob";
import Projectile from "~/models/Projectile";
import Player from "~/models/Player";
import TailSwatX from '~/tweens/TailSwatX';
import TailSwatY from '~/tweens/TailSwatY';
import TailWobble from '~/tweens/TailWobble';
import Shard from "~/models/Shards";
import Vector2 = Phaser.Math.Vector2;
import BaseSound = Phaser.Sound.BaseSound;


export default class Icicle extends Projectile
{
    level: number = 1;
    integrity: number;

    static readonly VOLUME = 50;
    static readonly IMPULSE = 1000;
    static readonly GROUP = 'icicles';
    static sfx: { [key: number]: BaseSound } = {};

    private timer;
    private lastBlobTime = 0;
    private killStreak = 0;
    private blobs: Vector2[] = [];

    protected get canCollideSource(): boolean {
        return this.scene.source.canCollide(this)
    };

    constructor(scene: Phaser.Scene, x: number, y: number, ...etc)
    {
        super(scene, x, y, K.Ice, ...etc)

        this.body.setSize(this.level*15)
        this.integrity = this.level * 3;
        this.scene.waterLevel -= Icicle.VOLUME;
        this.body.onWorldBounds = true;

        // @ts-ignore
        this.scene.physics.add.overlap(this, this.scene.blobs, this.pierceBlob, undefined, this)
        this.scene.physics.world.once('worldbounds', this.collideWalls, this)
        this.scene.physics.add.collider(this.scene.icicles, this, this.annihilate)

        Icicle.sfx[K.Ricochet] = this.scene.sound.add(K.Ricochet);
    }

    private annihilate(...both) {
        both.forEach(icicle => icicle.break())
    }

    private pierceBlob(icicle: Icicle, blob: Blob) {
        icicle.body.setSize(icicle.level*9, icicle.level*9)
        if (!blob.canRotate) {  // active blob to avoid repetition of overlap
            if (this.lastBlobTime && Math.round(performance.now()-this.lastBlobTime) <= 70) {
                this.killStreak++;
                this.blobs.push(blob.body.position.clone())

                if (this.killStreak >= 4) {
                    this.scene.UI.addScore( 1 + Math.round(this.killStreak/4))
                    let emitter = this.scene.particles.setDepth(5).createEmitter({
                        x: 0,
                        y: 0,
                        blendMode: BlendModes.SCREEN,
                        scale: { start: 0.2, end: 0 },
                        speed: { min: -100, max: 100 },
                        quantity: 1
                    })
                    this.blobs.forEach((pos, i) => emitter.explode(i*2, pos.x+blob.body.halfWidth, pos.y+blob.body.halfHeight));
                    this.scene.sound.play(K.Bonus)
                    if (this.blobs.length >= 9)
                        icicle.break();
                    setTimeout(() => emitter.remove(), 2000)
                }
            } else {
                this.blobs = [];
                this.killStreak = 0;
            }
            this.lastBlobTime = performance.now();
        }
        Blob.drop(null, blob)
    }

    break(silent?: boolean): Shard {
        // @ts-ignore
        let shard = this.scene.shards.create(this);
        this.scene.icicles.killAndHide(this.disableBody(true,true));
        if (!silent)
            this.scene.sound.play(K.Break, {pan: this.x/1000-0.5})
        return shard;
    }

    collideWalls(body) {
        let icicle = body.gameObject || body;
        if (!--icicle.integrity)
            icicle.break()
        else
            Icicle.sfx[K.Ricochet].play({pan: this.Xpos})
    }

    collideWater(icicle: Icicle) {
        let tol = 30
        if (icicle.angle > tol && icicle.angle < 180-tol) {
            this.body.setVelocityY(0);
            this.break();
        } else
            this.scene.sound.play(K.Slop, {pan: this.Xpos});
    }

    collidePlayer(icicle: Icicle, player: Player) {
        if (this.timer)
            return;
        this.timer = window.setTimeout(() => this.timer = null, 500);

        let speedToTailX = icicle.body.newVelocity.x * player.flipMul;
        let centerToBackCorner = (icicle.x - player.x) * player.flipMul
        let hitToTailX = speedToTailX <= 0
        let hitToTailY = centerToBackCorner >= -player.body.width / 7
        let hitSlowly  = icicle.body.newVelocity.lengthSq() <= 36

        //TODO relative speed to player
        if ((icicle.body.touching.right || icicle.body.touching.left) && hitToTailX && this.scene.player.isHurt < 2 || // horizontal
            icicle.body.touching.down && hitToTailY && !this.scene.player.isHurt ||  // vertical
            hitSlowly)
        {
            this.scene.cameras.main.shake(250, 0.00001 * icicle.body.newVelocity.lengthSq());

            if (hitToTailX && !icicle.body.touching.down) {
                TailSwatX.play();
                player.sfx[K.Tail].play({pan: player.Xpos, volume: 0.5});
            } else if (hitToTailY) {
                TailSwatY.play((centerToBackCorner - 20) / 150);    // try to aim for the icicle
                player.sfx[K.Tail].play({pan: player.Xpos, volume: 0.5});
                if (!--icicle.integrity)
                    icicle.break();
            } else
                TailWobble.play(-icicle.body.newVelocity.lengthSq()/100)
            return;
        }

        icicle.break(); // TODO detach player from ship
        player.body.setVelocityX(icicle.body.newVelocity.x*25)
        this.scene.cameras.main.shake(500, 0.01);
        this.scene.sound.play(K.Hit, {pan: player.Xpos, volume: 2})
        this.scene.lose();
    }

    protected collideSource(projectile: any, source: any) {
        return this.scene.source.freeze(projectile)
    }

    delayedCall(...etc) {
        super.delayedCall(...etc);
        this.setBounce(1)

        this.scene.physics.add.overlap(this, this.scene.walls, icicle => icicle['break']())
        if (this.level == 1)    // half the gravity
            this.setAccelerationY(-(this.scene.game.config.physics.arcade?.gravity || 200)/2)
    }
}
