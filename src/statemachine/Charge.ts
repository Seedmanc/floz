import S from '~/const/StateKeys';
import Player from '~/models/Player';

export module ChargeState {
    export function onEnter(this: Player) {
        this._inputs.on('pointerup', (pointer) => {
            if (pointer.getDuration() > 1000)
                this.shootIce()
            this.stateMachine.setState(S.Idle)
        });
    }
    export function onExit(this: Player) {
        this._inputs.off('pointerup')
    }
}