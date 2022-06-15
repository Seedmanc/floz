import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class DrownState implements Omit<IState, 'name'> {
    static readonly final = true;

    static onEnter(this: Player) {
        this.body.checkCollision.down = false

        window.setTimeout(() => {
            this.scene?.scene.stop();
            this.scene?.scene.start('gameover', {})
        }, 1500)
    }
    static onExit(this: Player) {
    }
}