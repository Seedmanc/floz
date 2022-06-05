
import Player from "~/models/Player";

export default abstract class TailWobble {
    private static tween: Phaser.Tweens.Tween;
    private static amplitude = 0;

    static add(player: Player) {
        const back =
            player.scene.tweens.add({
                targets: player._tail,
                rotation: {
                    value:  () => -this.amplitude/2
                },
                duration: 333,
                yoyo: true,
                paused: true,
                onComplete: () => this.amplitude = 0
            })
        this.tween = player.scene.tweens.add({
            targets: player._tail,
            rotation: {
                value:  () => this.amplitude = this.amplitude || player.body.velocity.x / -3500 * player.flipMul
            },
            duration: 250,
            hold: 250,
            yoyo: true,
            paused: true,
            onComplete: () => back.play()
        })
    }

    static play(amplitude: number = 0) {
        this.amplitude = amplitude;
        if (this.tween.isPlaying())
            this.tween.restart()
        else
            this.tween.play();
    }
}