import S from '~/const/StateKeys';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class PumpState implements Omit<IState, 'name'> {
    static timer;

    static onEnter(this: Player) {
        this._keyE.on('up', () => {
            if (PumpState.timer)
                PumpState.timer.remove();

            PumpState.timer = this.scene.time.addEvent({
                delay: 500,                // ms
                callback: () => this.stateMachine.setState(S.Idle),
                callbackScope: this,
                loop: true
            });

            if (this.isHurt)
                this.heal();
        });
    }
    static onExit(this: Player) {
        this._keyE.off('up')
    }
}