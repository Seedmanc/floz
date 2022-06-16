import S from '~/const/StateKeys';
import Bullet from '~/models/Bullet';
import Icicle from '~/models/Icicle';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class IdleState implements Omit<IState, 'name'> {
    static onUpdate(this: Player) {
        if (this._inputs.activePointer.getDuration() > 250 && this._inputs.activePointer.isDown)
            this.stateMachine.setState(S.Charging)
    }
    static onEnter(this: Player) {
        this._reticicle.setVisible(false)

        this._keyE.on('down', this.tryPump, this)

        this.pumpText.on('pointerdown', this.tryPump, this)

        this._inputs.on('pointerupoutside', IdleState.onPointerUp.bind(this));
        this._inputs.on('pointerup', IdleState.onPointerUp.bind(this));
    }
    static onExit(this: Player) {
        this._inputs.off('pointerup')
        this._inputs.off('pointerupoutside')
        this._keyE.off('down', this.tryPump, this)

        this.pumpText.off('pointerdown', this.tryPump, this)
    }

    private static onPointerUp (this: Player, pointer) {
        pointer.event.stopImmediatePropagation()

        if (pointer.leftButtonReleased())
            this.shoot(Bullet)
        else if (this.scene.physics.world.drawDebug && pointer.rightButtonReleased())
            this.shoot(Icicle)
    }
}