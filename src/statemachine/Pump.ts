import S from '~/const/StateKeys';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class PumpState implements Omit<IState, 'name'> {
    private static timer;
    private static presses;
    private static readonly maxPresses = 10;

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
    }

    private static checkTime(player: Player) {
        if (PumpState.timer)
            PumpState.timer.remove();

        PumpState.timer = player.scene.time.addEvent({
            delay: 400,                // ms
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
        if (!player.isHurt) {
            player.stateMachine.setState(S.Idle)
        }
    }

    static onExit(this: Player) {
        this._keyE.off('down')
        this.progress.setVisible(false);
        this.progress.value = 0;
        this.pumpText.text = '(e)'
        this.pumpText.off('pointerdown')
    }
}