export default function createDampedOscillation(scene, gameObject, config: any = {}) {
    const {
        duration = 3000,
        amplitude = 50,        // Initial tilt in degrees
        frequency = 3,       // Oscillations per second
        decayRate = 5,       // Decay speed (higher = stops faster)
        onComplete,
        onInterrupt           // New: callback if stopped early
    } = config;

    // Preserve original angle for resetting
    const baseAngle = 0;
    let isComplete = false;

    // Create tween with proper cleanup
    const tween = scene.tweens.add({
        targets: { progress: 0 },  // Clean dummy object
        progress: 1,
        duration: duration,
        ease: 'Expo.easeOut',
        paused: true,
        onUpdate: function(tweenObj) {
            const t = tweenObj.progress;  // 0 to 1 progress
            const decay = Math.exp(-decayRate * t);
            const oscillation = amplitude * decay * Math.sin(2 * Math.PI * frequency * t);
            gameObject.angle = baseAngle + oscillation;
        },
        onComplete: () => {
            finalizeOscillation();
        }
    });

    // Handle early interruptions (pause/stop)
    tween.on('pause', finalizeOscillation);
    tween.on('stop', finalizeOscillation);

    function finalizeOscillation() {
        if (isComplete) return;
        isComplete = true;
        gameObject.angle = baseAngle;  // Snap to rest position

        if (tween.wasStopped) {
            if (onInterrupt) onInterrupt(gameObject);
        } else if (onComplete) {
            onComplete(gameObject);
        }
    }

    return tween;  // Return reference for control
}