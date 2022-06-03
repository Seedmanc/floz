import S from '~/const/StateKeys';
import Player from '~/models/Player';
import {IState} from '~/statemachine/StateMachine';

export default abstract class PumpState implements Omit<IState, 'name'> {
    private static timer;
    private static presses;
    private static readonly maxPresses = 10;
    static isCooldown: boolean;

    static onEnter(this: Player) {
        PumpState.presses = PumpState.maxPresses;
        PumpState.checkTime(this)

        this.progress.setVisible(true)
        this.pumpText.text = ' e '

        this._keyE.on('down',  () => {
            PumpState.checkTime(this)
            PumpState.pump(this)
        });

        this.pumpText.on('pointerdown', () => {
            PumpState.checkTime(this)
            PumpState.pump(this)
        })
    }

    private static checkTime(player: Player) {
        if (PumpState.timer)
            PumpState.timer.remove();

        PumpState.timer = player.scene.time.addEvent({
            delay: 333,                // ms
            callback: () => player.stateMachine.setState(S.Idle),
            callbackScope: this,
            loop: false
        });
    }

    private static pump(player: Player) {
        PumpState.presses -= (player.scene.MAX_HEALTH - 1)/(player.scene.MAX_HEALTH - player.scene.player.health);
        player.progress.value = 0.95 - PumpState.presses/PumpState.maxPresses

        if (player.isHurt && PumpState.presses < 0 || PumpState.presses == PumpState.maxPresses/2) {
            player.heal();
        }
        if (!player.isHurt) {
            player.stateMachine.setState(S.Idle)
        }
    }

    static onExit(this: Player) {
        this._keyE.off('down')
        PumpState.isCooldown = true;

        let textVisible = this.pumpText.visible
        this.pumpText.setVisible(false)
        let penaltyTime = (PumpState.maxPresses - PumpState.presses) * 10
        this.progress.setAlpha(0.75)

        this.scene.tweens.addCounter({
            from: penaltyTime,
            to: 0,
            duration: penaltyTime * 50,
            onUpdate: tween => {
                this.progress.value = tween.getValue()/PumpState.maxPresses/10
            },
            onComplete: () => {
                PumpState.isCooldown = false;
                this.progress.setVisible(false);
                this.pumpText.setVisible(textVisible);
                this.progress.setAlpha(1)
            }
        })

        this.pumpText.text = '(e)'
        this.pumpText.off('pointerdown')
    }
}