
import Player from "~/models/Player";

export default abstract class TailSwatY {
    private static tween: Phaser.Tweens.Tween;
    private static angle;

    static add(player: Player) {
        let back;
        this.tween = player.scene.tweens.add({
            targets: player._tail,
            props: {
                scaleX: 0.8,
                scaleY: 1.2,
                rotation: function() {return TailSwatY.angle}
            },
            duration: 250,
            ease: "Expo.easeOut",
            paused: true,
             onComplete: () => back.play()
        })
        back =
            player.scene.tweens.add({
                targets: player._tail,
                props: {
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0
                },
                duration: 500,
                ease: "Back",
                easeParams: [2],
                paused: true,
            })
    }

    static play(angle: number = 0) {
        this.angle = angle;
        this.tween.play();
    }
}