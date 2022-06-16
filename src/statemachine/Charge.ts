import S from '~/const/StateKeys';
import Icicle from '~/models/Icicle';
import Player from '~/models/Player';

export module ChargeState {
    export function onEnter(this: Player) {
        this._inputs.on('pointerup', onPointerUp.bind(this));
        this._inputs.on('pointerupoutside', onPointerUp.bind(this));
    }
    export function onExit(this: Player) {
        this._inputs.off('pointerup')
        this._inputs.off('pointerupoutside')
        this._reticicle.setVisible(false)
    }
    export function onUpdate(this: Player) {
        if (this._inputs.activePointer.getDuration() > 1000)
            this._reticicle.setVisible(true)
    }

    function onPointerUp(this: Player, pointer) {
        pointer.event.stopImmediatePropagation()
        if (pointer.getDuration() > 1000 && pointer.leftButtonReleased())
            this.shoot(Icicle)

        this.stateMachine.setState(S.Idle)
    }
}