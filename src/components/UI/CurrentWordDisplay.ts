import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';
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

    constructor(config: CurrentWordDisplayConfig) {
        super(config.scene, config.x, config.y);

        this.bgWidth = config.width || 300;

        this.createVisuals();
        this.scene.add.existing(this);
    }

    private createVisuals() {
        // Dynamic background
        this.background = this.scene.add.graphics();
        this.updateBackground();
        this.add(this.background);

        // Word text
        this.wordText = this.scene.add.text(0, 0, '', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setResolution(window.devicePixelRatio);
        this.add(this.wordText);
    }

    private updateBackground() {
        this.background.clear();
        this.background.fillStyle(this.colors.accent, 0.9);
        this.background.fillRoundedRect(-this.bgWidth / 2, -25, this.bgWidth, 50, 10);
        this.background.lineStyle(2, 0xFFFFFF, 0.5);
        this.background.strokeRoundedRect(-this.bgWidth / 2, -25, this.bgWidth, 50, 10);
    }

    public setWord(word: string) {
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
    }

    public showError() {
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
                this.scene.time.delayedCall(1000, () => {
                    this.updateBackground();
                    this.wordText.setText('');
                });
            }
        });
    }
}
