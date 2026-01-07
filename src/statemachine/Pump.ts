import S from '~/const/StateKeys';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';
import Cooldown from "~/tweens/Cooldown";
import K from "~/const/ResourceKeys";

export default abstract class PumpState implements Omit<IState, 'name'> {
    private static timer;
    private static presses;

    static readonly maxPresses = 10;
    static isCooldown: boolean;

    static onEnter(this: Player) {
        PumpState.presses = PumpState.maxPresses;
        PumpState.checkTime(this)

        this.progress.setVisible(true)
        this.pumpText.text = ' e '

        this._keyE.on('down',  () => {
            PumpState.checkTime(this)
            PumpState.pump(this)
        });

        this.pumpText.on('pointerdown', () => {
            PumpState.checkTime(this)
            PumpState.pump(this)
        })

        this.pumping.play(S.Pumping+'', true)
        this.hand.setVisible(false)
        this._tail.setPosition(6,24)
    }

    private static checkTime(player: Player) {
        if (PumpState.timer)
            PumpState.timer.remove();

        PumpState.timer = player.scene.time.addEvent({
            delay: 333,                // ms
            callback: () => player.stateMachine.setState(S.Idle),
            callbackScope: this,
            loop: false
        });
    }

    private static pump(player: Player) {
        PumpState.presses -= (player.scene.MAX_HEALTH - 1)/(player.scene.MAX_HEALTH - player.scene.player.health);
        player.progress.value = 0.95 - PumpState.presses/PumpState.maxPresses

        if (player.isHurt && PumpState.presses < 0 || PumpState.presses == PumpState.maxPresses/2) {
            player.heal();
        }
        let pumpSnd = player.sfx[K.Pump]
        if (!pumpSnd.isPlaying)
            pumpSnd.play({pan: player.Xpos})
        if (!player.isHurt) {
            player.stateMachine.setState(S.Idle)
        }
    }

    static onExit(this: Player) {
        this._keyE.off('down')
        this.pumping.stop();
        this.handAndTail()

        PumpState.isCooldown = true;

        this.pumpText.setVisible(false)
        let penaltyTime = (PumpState.maxPresses - PumpState.presses) * 10
        this.progress.setAlpha(0.75)

        Cooldown.run(this, penaltyTime, this.progress.setValue)
            .then(() => {
                PumpState.isCooldown = false;
                this.progress.setVisible(false);
                this.pumpText.setVisible(!!this.isHurt);
                this.progress.setAlpha(1)
            });

        this.pumpText.text = '(e)'
        this.pumpText.off('pointerdown')
    }
}