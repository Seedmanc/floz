import S from '~/const/StateKeys';
import game from '~/main';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class IdleState implements Omit<IState, 'name'> {
    static onUpdate(this: Player) {
        if (this._inputs.activePointer.getDuration() > 250 && this._inputs.activePointer.isDown)
            this.stateMachine.setState(S.Charging)
    }
    static onEnter(this: Player) {
        this._keyE.on('up', this.tryPump, this)
        this._inputs.on('pointerup', (pointer) => {
        if (pointer.leftButtonReleased()) {
            this.shoot()
        } else if (game.config.physics.arcade?.debug && pointer.rightButtonReleased())
            this.shootIce()
        });
    }
    static onExit(this: Player) {
        this._inputs.off('pointerup')
        this._keyE.off('up', this.tryPump, this)
    }
}