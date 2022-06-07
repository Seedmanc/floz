import Player from "~/models/Player";

export default abstract class TailSwatX {
    private static tween: Phaser.Tweens.Tween;

    static add(player: Player) {
        let back;
        this.tween = player.scene.tweens.add({
            targets: player._tail,
            rotation: Math.PI/4,
            duration: 250,
            ease: "Expo.easeOut",
            paused: true,
             onComplete: () => back.play()
        })
        back =
            player.scene.tweens.add({
                targets: player._tail,
                rotation: 0,
                duration: 500,
                ease: "Back",
                easeParams: [4],
                paused: true,
            })
    }

    static play() {
        this.tween.play();
    }
}