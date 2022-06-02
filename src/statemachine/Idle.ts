import S from '~/const/StateKeys';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class IdleState implements Omit<IState, 'name'> {
    static onUpdate(this: Player) {
        if (this._inputs.activePointer.getDuration() > 250 && this._inputs.activePointer.isDown)
            this.stateMachine.setState(S.Charging)
    }
    static onEnter(this: Player) {
        this._reticicle.setVisible(false)
        this._keyE.on('up', this.tryPump, this)
        this._inputs.on('pointerup', (pointer) => {
            if (pointer.leftButtonReleased()) {
                this.shoot()
            } else if (this.scene.physics.world.drawDebug && pointer.rightButtonReleased())
                this.shoot(true)
            }
        );
    }
    static onExit(this: Player) {
        this._inputs.off('pointerup')
        this._keyE.off('up', this.tryPump, this)
    }
}