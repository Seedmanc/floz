import S from '~/const/StateKeys';
import Player from '~/models/Player';

export module ChargeState {
    export function onEnter(this: Player) {
        this._inputs.on('pointerup', (pointer) => {
            if (pointer.getDuration() > 1000)
                this.shoot(true)
            this.stateMachine.setState(S.Idle)
        });
    }
    export function onExit(this: Player) {
        this._inputs.off('pointerup')
        this._reticicle.setVisible(false)
    }
    export function onUpdate(this: Player) {
        if (this._inputs.activePointer.getDuration() > 1000)
            this._reticicle.setVisible(true)
    }
}