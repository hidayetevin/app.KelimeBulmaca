import Phaser from 'phaser';

interface ConfettiConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    particleCount?: number;
    duration?: number;
    spreadAngle?: number;
}

/**
 * Confetti Particle Effect
 * Creates a celebratory confetti explosion
 */
export default class ConfettiEffect {
    private scene: Phaser.Scene;

    constructor(config: ConfettiConfig) {
        this.scene = config.scene;
        this.createConfetti(config);
    }

    private createConfetti(config: ConfettiConfig) {
        const particleCount = config.particleCount || 50;
        const duration = config.duration || 3000;
        const spreadAngle = config.spreadAngle || 360;

        // Define confetti colors
        const colors = [
            0xFF6B6B, // Red
            0xFFD93D, // Yellow
            0x6BCF7F, // Green
            0x4D96FF, // Blue
            0xFF6BF7, // Pink
            0xFFB347  // Orange
        ];

        // Create multiple particle systems for different colors
        colors.forEach((color, index) => {
            const graphics = this.scene.make.graphics({});
            graphics.setVisible(false);

            // Create different shapes for variety
            const shapeType = index % 3;
            if (shapeType === 0) {
                // Rectangle
                graphics.fillStyle(color, 1);
                graphics.fillRect(0, 0, 8, 8);
            } else if (shapeType === 1) {
                // Circle
                graphics.fillStyle(color, 1);
                graphics.fillCircle(4, 4, 4);
            } else {
                // Triangle
                graphics.fillStyle(color, 1);
                graphics.fillTriangle(4, 0, 0, 8, 8, 8);
            }

            const textureName = `confetti_${color}_${Date.now()}_${index}`;
            graphics.generateTexture(textureName, 8, 8);
            graphics.destroy();

            const particles = this.scene.add.particles(config.x, config.y, textureName, {
                speed: { min: 200, max: 400 },
                angle: { min: -spreadAngle / 2, max: spreadAngle / 2 },
                scale: { start: 1, end: 0 },
                alpha: { start: 1, end: 0 },
                rotate: { start: 0, end: 360 },
                gravityY: 400,
                lifespan: duration,
                quantity: Math.floor(particleCount / colors.length),
                frequency: 50,
                maxParticles: particleCount,
                blendMode: Phaser.BlendModes.NORMAL
            });

            // Auto cleanup after duration
            this.scene.time.delayedCall(duration + 1000, () => {
                particles.destroy();
            });
        });
    }

    /**
     * Static helper to create a quick confetti burst
     */
    public static burst(scene: Phaser.Scene, x: number, y: number) {
        return new ConfettiEffect({ scene, x, y });
    }
}
