import Player from "~/models/Player";
import PumpState from "~/statemachine/Pump";

export default abstract class Cooldown {
    private static tween: Phaser.Tweens.Tween;

    static run(player: Player, duration: number, valueSetter: Function) {
        return new Promise(resolve =>
           this.tween = player.scene.tweens.addCounter({
                from: duration,
                duration: duration * 50,
                to: 0,
                onUpdate: tween => valueSetter.bind(player.progress)(tween.getValue()/PumpState.maxPresses/10),
                onComplete: resolve
            })
        )
    }
}