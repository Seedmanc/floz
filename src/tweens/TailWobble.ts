
import Player from "~/models/Player";

export default abstract class TailWobble {
    private static tween: Phaser.Tweens.Tween;
    private static amplitude = 0;

    static add(player: Player) {
        let back;
        this.tween = player.scene.tweens.add({
            targets: player._tail,
            rotation: {
                value:  () => this.amplitude = this.amplitude || (player.body.velocity.x / -3000 * player.flipMul)
            },
            duration: 300,
            ease: "Expo.easeOut",
            hold: 300,
            paused: true,
            onComplete: () => back.play()
        })
        back =
            player.scene.tweens.add({
                targets: player._tail,
                rotation: () => player.isHurt * 0.13, // TODO fix wobble for 1 hurt
                duration: 600,
                ease: "Back.easeOut",
                easeParams: [6],
                paused: true,
                onComplete: () => this.amplitude = 0
            })
    }

    static play(amplitude: number = 0) {
        this.amplitude = amplitude;
        this.tween.play();
    }
}