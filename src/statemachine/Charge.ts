import S from '~/const/StateKeys';
import Icicle from '~/models/Icicle';
import Player from '~/models/Player';
import K from "~/const/ResourceKeys";

export module ChargeState {
    export function onEnter(this: Player) {
        this._inputs.on('pointerup', onPointerUp.bind(this));
        this._inputs.on('pointerupoutside', onPointerUp.bind(this));
        this.scene.sound.play(K.Charge, {pan: this.Xpos, rate: 0.33, detune: 1000})
    }
    export function onExit(this: Player) {
        this._inputs.off('pointerup')
        this._inputs.off('pointerupoutside')
        this._reticicle.setVisible(false)
    }
    export function onUpdate(this: Player) {
        if (this._inputs.activePointer.getDuration() > 1000) {
            if (!this._reticicle.visible && !this.sfx[K.Ice].isPlaying)
                this.sfx[K.Ice].play({pan:this.Xpos})
            this._reticicle.setVisible(true)
        }
    }

    function onPointerUp(this: Player, pointer) {
        pointer.event.stopImmediatePropagation()
        if (pointer.getDuration() > 1000 && pointer.leftButtonReleased())
            this.shoot(Icicle)

        this.stateMachine.setState(S.Idle)
    }
}