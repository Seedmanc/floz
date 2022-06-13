import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class DrownState implements Omit<IState, 'name'> {
    static onEnter(this: Player) {
    }
    static onExit(this: Player) {
    }
}