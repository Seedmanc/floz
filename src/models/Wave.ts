import K from "~/const/ResourceKeys";
import Phaser from "phaser";
import Projectile from "~/models/Projectile";
import Player from "~/models/Player";


export default class Wave extends Projectile
{
    defaultScale = 0.3;

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
        player.wobble.resetTweenData(false)
        player.wobble.play();
    }
}
