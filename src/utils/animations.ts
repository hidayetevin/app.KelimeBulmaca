import Phaser from 'phaser';

/**
 * Animation Utilities
 * Oyunda kullanılan hazır animasyon fonksiyonları
 * Tüm fonksiyonlar Promise döndürür (zincirleme yapılabilir)
 */

/**
 * Fade In animasyonu
 * @param scene - Phaser scene
 * @param target - Animasyon hedefi
 * @param duration - Süre (ms)
 */
export function fadeIn(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    duration: number = 300
): Promise<void> {
    return new Promise((resolve) => {
        scene.tweens.add({
            targets: target,
            alpha: { from: 0, to: 1 },
            duration,
            ease: 'Linear',
            onComplete: () => resolve(),
        });
    });
}

/**
 * Fade Out animasyonu
 */
export function fadeOut(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    duration: number = 200
): Promise<void> {
    return new Promise((resolve) => {
        scene.tweens.add({
            targets: target,
            alpha: { from: 1, to: 0 },
            duration,
            ease: 'Linear',
            onComplete: () => resolve(),
        });
    });
}

/**
 * Scale Popup animasyonu (panel açılma efekti)
 */
export function scalePopup(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    duration: number = 400
): Promise<void> {
    return new Promise((resolve) => {
        // Başlangıçta küçük ve görünmez
        if ('setScale' in target) {
            (target as any).setScale(0.8);
        }
        if ('setAlpha' in target) {
            (target as any).setAlpha(0);
        }

        scene.tweens.add({
            targets: target,
            scale: { from: 0.8, to: 1 },
            alpha: { from: 0, to: 1 },
            duration,
            ease: 'Back.easeOut',
            onComplete: () => resolve(),
        });
    });
}

/**
 * Scale Down animasyonu (küçülme)
 */
export function scaleDown(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    duration: number = 300
): Promise<void> {
    return new Promise((resolve) => {
        scene.tweens.add({
            targets: target,
            scale: { from: 1, to: 0 },
            alpha: { from: 1, to: 0 },
            duration,
            ease: 'Back.easeIn',
            onComplete: () => resolve(),
        });
    });
}

/**
 * Bounce animasyonu (zıplama)
 */
export function bounce(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    duration: number = 500
): Promise<void> {
    return new Promise((resolve) => {
        scene.tweens.add({
            targets: target,
            scale: { from: 1, to: 1.2 },
            duration: duration / 2,
            ease: 'Bounce.easeOut',
            yoyo: true,
            onComplete: () => resolve(),
        });
    });
}

/**
 * Shake animasyonu (sallama)
 */
export function shake(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    intensity: number = 5,
    duration: number = 300
): Promise<void> {
    return new Promise((resolve) => {
        const startX = (target as any).x;

        scene.tweens.add({
            targets: target,
            x: startX + intensity,
            duration: duration / 6,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                (target as any).x = startX;
                resolve();
            },
        });
    });
}

/**
 * Pulse animasyonu (nabız atma)
 */
export function pulse(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    duration: number = 600
): Promise<void> {
    return new Promise((resolve) => {
        scene.tweens.add({
            targets: target,
            scale: { from: 1, to: 1.1 },
            duration: duration / 2,
            ease: 'Sine.easeInOut',
            yoyo: true,
            onComplete: () => resolve(),
        });
    });
}

/**
 * Slide In animasyonu (kayma girişi)
 */
export function slideIn(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    direction: 'left' | 'right' | 'top' | 'bottom',
    duration: number = 350
): Promise<void> {
    return new Promise((resolve) => {
        const startX = (target as any).x;
        const startY = (target as any).y;
        const offset = 500;

        // Başlangıç pozisyonunu ayarla
        switch (direction) {
            case 'left':
                (target as any).x = startX - offset;
                break;
            case 'right':
                (target as any).x = startX + offset;
                break;
            case 'top':
                (target as any).y = startY - offset;
                break;
            case 'bottom':
                (target as any).y = startY + offset;
                break;
        }

        scene.tweens.add({
            targets: target,
            x: startX,
            y: startY,
            duration,
            ease: 'Cubic.easeOut',
            onComplete: () => resolve(),
        });
    });
}

/**
 * Slide Out animasyonu (kayma çıkışı)
 */
export function slideOut(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    direction: 'left' | 'right' | 'top' | 'bottom',
    duration: number = 350
): Promise<void> {
    return new Promise((resolve) => {
        const startX = (target as any).x;
        const startY = (target as any).y;
        const offset = 500;

        let endX = startX;
        let endY = startY;

        switch (direction) {
            case 'left':
                endX = startX - offset;
                break;
            case 'right':
                endX = startX + offset;
                break;
            case 'top':
                endY = startY - offset;
                break;
            case 'bottom':
                endY = startY + offset;
                break;
        }

        scene.tweens.add({
            targets: target,
            x: endX,
            y: endY,
            duration,
            ease: 'Cubic.easeIn',
            onComplete: () => resolve(),
        });
    });
}

/**
 * Konfeti efekti (particle effect)
 */
export function confetti(
    scene: Phaser.Scene,
    x: number,
    y: number,
    duration: number = 2000
): Promise<void> {
    return new Promise((resolve) => {
        const colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181];
        const particles: Phaser.GameObjects.Graphics[] = [];

        // 30 particle oluştur
        for (let i = 0; i < 30; i++) {
            const particle = scene.add.graphics();
            const color = Phaser.Utils.Array.GetRandom(colors);
            particle.fillStyle(color, 1);
            particle.fillRect(0, 0, 8, 8);
            particle.setPosition(x, y);
            particles.push(particle);

            const angle = (Math.PI * 2 * i) / 30;
            const speed = Phaser.Math.Between(100, 300);
            const endX = x + Math.cos(angle) * speed;
            const endY = y + Math.sin(angle) * speed;

            scene.tweens.add({
                targets: particle,
                x: endX,
                y: endY,
                alpha: 0,
                rotation: Phaser.Math.Between(0, Math.PI * 4),
                duration,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    particle.destroy();
                },
            });
        }

        scene.time.delayedCall(duration, () => resolve());
    });
}

/**
 * Yıldız toplama animasyonu
 */
export function starCollect(
    scene: Phaser.Scene,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    duration: number = 800
): Promise<void> {
    return new Promise((resolve) => {
        // Yıldız simgesi oluştur (emoji veya sprite)
        const star = scene.add.text(fromX, fromY, '⭐', {
            fontSize: '32px',
        });

        scene.tweens.add({
            targets: star,
            x: toX,
            y: toY,
            scale: { from: 1, to: 0.5 },
            duration,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                star.destroy();
                resolve();
            },
        });
    });
}

/**
 * Kilit açılma animasyonu
 */
export function unlockAnimation(
    scene: Phaser.Scene,
    lockObject: Phaser.GameObjects.GameObject,
    duration: number = 1000
): Promise<void> {
    return new Promise((resolve) => {
        // Shake + Scale + FadeOut
        const startX = (lockObject as any).x;

        scene.tweens.add({
            targets: lockObject,
            x: startX + 5,
            duration: 50,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                scene.tweens.add({
                    targets: lockObject,
                    scale: 1.5,
                    alpha: 0,
                    duration: duration / 2,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        (lockObject as any).x = startX;
                        resolve();
                    },
                });
            },
        });
    });
}

/**
 * Harf vurgulama animasyonu
 */
export function letterHighlight(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    duration: number = 200
): Promise<void> {
    return new Promise((resolve) => {
        scene.tweens.add({
            targets: target,
            scale: { from: 1, to: 1.15 },
            duration: duration / 2,
            ease: 'Quad.easeOut',
            yoyo: true,
            onComplete: () => resolve(),
        });
    });
}

/**
 * Kelime açığa çıkma animasyonu
 */
export function wordReveal(
    scene: Phaser.Scene,
    cells: Phaser.GameObjects.GameObject[],
    duration: number = 400
): Promise<void> {
    return new Promise((resolve) => {
        let delay = 0;
        const delayIncrement = duration / cells.length;

        cells.forEach((cell, index) => {
            scene.tweens.add({
                targets: cell,
                scale: { from: 1, to: 1.1 },
                alpha: { from: 0.5, to: 1 },
                duration: delayIncrement,
                delay: delay,
                ease: 'Back.easeOut',
                yoyo: true,
                onComplete: () => {
                    if (index === cells.length - 1) {
                        resolve();
                    }
                },
            });
            delay += delayIncrement;
        });
    });
}

/**
 * Tüm animasyonları iptal et
 */
export function cancelAll(scene: Phaser.Scene): void {
    scene.tweens.killAll();
}
