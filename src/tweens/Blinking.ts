import GameObject = Phaser.GameObjects.GameObject;

export default abstract class Blinking {
    static add(object: GameObject, loop = -1, onComplete = null) {
        object.scene.tweens.add({
            targets: object,
            alpha: { value: 0, duration: 250 },
            yoyo: true,
            loop,
            onComplete
        })
    }
}