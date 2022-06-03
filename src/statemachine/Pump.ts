import S from '~/const/StateKeys';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class PumpState implements Omit<IState, 'name'> {
    private static timer;
    private static presses;
    private static readonly maxPresses = 10;

    static onEnter(this: Player) {
        PumpState.presses = PumpState.maxPresses;
        this.progress.setVisible(true)

        this._keyE.on('up', () => {
            if (PumpState.timer)
                PumpState.timer.remove();

            PumpState.timer = this.scene.time.addEvent({
                delay: 500,                // ms
                callback: () => this.stateMachine.setState(S.Idle),
                callbackScope: this,
                loop: false
            });

            PumpState.presses-= (this.scene.MAX_HEALTH - 1)/(this.scene.MAX_HEALTH - this.scene.player.health);

            this.progress.value = 1 - PumpState.presses/PumpState.maxPresses

            if (this.isHurt && PumpState.presses <= 0 || PumpState.presses == PumpState.maxPresses/2) {
                this.heal();
            }
            if (!this.isHurt) {
                this.stateMachine.setState(S.Idle)
            }
        });
    }

    static onExit(this: Player) {
        this._keyE.off('up')
        this.progress.setVisible(false);
        this.progress.value = 0;
    }
}