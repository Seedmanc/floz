import Phaser from 'phaser';
import S from '~/const/StateKeys';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class HurtState implements Omit<IState, 'name'> {
    static onEnter(this: Player) {
        this.scene.tweens.addCounter({
             from: 100,
             to: 0,
             duration: 150,
             repeat: 2,
             yoyo: true,
             ease: Phaser.Math.Easing.Linear,
             onUpdate: tween => {
                const value = tween.getValue()
                this.setAlpha(value/100)
             },
             onComplete: () => {
                this.stateMachine.setState(S.Idle)
                this.pumpText.setVisible(true);
             }
        })
    }
}