import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY, GAME_RESOLUTION } from '@/utils/constants';
import ThemeManager from '@/managers/ThemeManager';

export interface CurrentWordDisplayConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width?: number;
}

export default class CurrentWordDisplay extends Phaser.GameObjects.Container {
    private background!: Phaser.GameObjects.Graphics;
    private wordText!: Phaser.GameObjects.Text;
    private bgWidth: number;
    private colors = ThemeManager.getCurrentColors();

    private resetTimer?: Phaser.Time.TimerEvent;

    constructor(config: CurrentWordDisplayConfig) {
        super(config.scene, config.x, config.y);

        this.bgWidth = config.width || 300;

        this.createVisuals();
        this.scene.add.existing(this);
    }

    private createVisuals() {
        // Dynamic background
        this.background = this.scene.add.graphics();
        this.resetToNormal();
        this.add(this.background);

        // Word text
        this.wordText = this.scene.add.text(0, 0, '', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setResolution(GAME_RESOLUTION);
        this.add(this.wordText);
    }

    private resetToNormal() {
        if (this.resetTimer) {
            this.resetTimer.remove();
            this.resetTimer = undefined;
        }

        this.background.clear();
        this.background.fillStyle(this.colors.accent, 0.9);
        this.background.fillRoundedRect(-this.bgWidth / 2, -25, this.bgWidth, 50, 10);
        this.background.lineStyle(2, 0xFFFFFF, 0.5);
        this.background.strokeRoundedRect(-this.bgWidth / 2, -25, this.bgWidth, 50, 10);

        // Also ensure text is cleared or kept depending on flow, usually cleared
        // But resetToNormal is visual reset. setWord handles text.
        // If called from timer, we want to clear text.
    }

    public setWord(word: string) {
        // Cancel any pending reset
        if (this.resetTimer) {
            this.resetTimer.remove();
            this.resetTimer = undefined;
            this.resetToNormal(); // Ensure visually normal if interrupting an effect
        }

        this.wordText.setText(word);

        // Pulse animation
        if (word.length > 0) {
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeOut'
            });
        }
    }

    public clear() {
        this.wordText.setText('');
        this.resetToNormal();
    }

    public showError() {
        if (this.resetTimer) this.resetTimer.remove();

        // Kırmızı arkaplan göster
        this.background.clear();
        this.background.fillStyle(0xEF4444, 1); // Red
        this.background.fillRoundedRect(-this.bgWidth / 2, -25, this.bgWidth, 50, 10);
        this.background.lineStyle(2, 0xDC2626);
        this.background.strokeRoundedRect(-this.bgWidth / 2, -25, this.bgWidth, 50, 10);

        // Sallama animasyonu (shake)
        this.scene.tweens.add({
            targets: this,
            x: this.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 5,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // 1 saniye sonra normale dön
                this.resetTimer = this.scene.time.delayedCall(1000, () => {
                    this.resetToNormal();
                    this.wordText.setText('');
                });
            }
        });
    }

    public showSuccess() {
        if (this.resetTimer) this.resetTimer.remove();

        // Yeşil arkaplan göster
        this.background.clear();
        this.background.fillStyle(0x10B981, 1); // Green
        this.background.fillRoundedRect(-this.bgWidth / 2, -25, this.bgWidth, 50, 10);
        this.background.lineStyle(2, 0x059669);
        this.background.strokeRoundedRect(-this.bgWidth / 2, -25, this.bgWidth, 50, 10);

        // Büyüme/Pulse animasyonu
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // 1 saniye sonra normale dön
                this.resetTimer = this.scene.time.delayedCall(1000, () => {
                    this.resetToNormal();
                    this.wordText.setText('');
                });
            }
        });
    }
}
