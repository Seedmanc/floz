import S from '~/const/StateKeys';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';
import PumpState from "~/statemachine/Pump";
import Blinking from "~/tweens/Blinking";

export default abstract class HurtState implements Omit<IState, 'name'> {
    static onEnter(this: Player) {
        if (this.body.checkCollision.down)
            this.y = this.scene.waterSurface.getTopCenter().y - this.body.height/2

        Blinking.add(this, 2, () => {
            this.stateMachine.setState(S.Idle)
            this.pumpText.setVisible(!PumpState.isCooldown);
        });
    }
}