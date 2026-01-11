import CircularProgress from "phaser3-rex-plugins/plugins/gameobjects/shape/circularprogress/CircularProgress";

export default abstract class Shake {
    static add(object: CircularProgress, done: ()=>{}) {
        return object.scene.tweens.add({
            targets: { progress: 0 },  // Clean dummy object
            progress: 1,
            duration: 250,
            paused: true,
            yoyo: true,
            onUpdate: function(tweenObj) {
                const t = tweenObj.progress;
                object.x += Math.cos(t*Math.PI*2)/2
            },
            onComplete: done
        });
    }
}