import K from "~/const/ResourceKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Player from "~/models/Player";
import createDampedOscillation from "~/tweens/WaveWobble";


export default class Wave extends Projectile
{   defaultScale = 0.3;

    constructor(scene: Phaser.Scene, x: number, y: number, ...etc)
    {
        super(scene, x, y, K.Wave, ...etc)

        this.setScale(this.defaultScale).refreshBody().setDepth(-1)
            .body.setCircle(20).setOffset(10,15)
        this.scene.physics.add.collider(this, this.scene.waves, (wave1:any,wave2:any) => {
            this.collideWalls(wave1);
            this.collideWalls(wave2);
        }, undefined, this)
        this.scene.physics.add.overlap(this, this.scene.shards, (w,s:any) => s.melt())
    }

    collideWalls(wave: Wave) {
        this.scene.waves.killAndHide(wave.disableBody(true,true));
    }

    collideWater(wave: Wave) {}

    collidePlayer(projectile, player:Player) {
        this.collideWalls(projectile)
        let div =player.waterToll/300
        let mul = (0.5+this.defaultScale)**2
        setTimeout(() => player.wobble = createDampedOscillation(this.scene, player, {
            duration: (2000 - 1000*div)*mul,
            amplitude: (15 - 10*div)*mul,
            frequency: (2 - div)*mul,
            decayRate: 1.0,
            onComplete: null
        }) );
    }
}
