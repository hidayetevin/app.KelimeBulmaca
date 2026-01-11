import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';

export interface CurrentWordDisplayConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width?: number;
}

export default class CurrentWordDisplay extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private wordText: Phaser.GameObjects.Text;
    private width: number;

    constructor(config: CurrentWordDisplayConfig) {
        super(config.scene, config.x, config.y);

        this.width = config.width || 300;

        this.createVisuals();
        this.scene.add.existing(this);
    }

    private createVisuals() {
        // Yellow background
        this.background = this.scene.add.graphics();
        this.updateBackground();
        this.add(this.background);

        // Word text
        this.wordText = this.scene.add.text(0, 0, '', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '32px',
            color: '#1F2937',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.wordText);
    }

    private updateBackground() {
        this.background.clear();
        this.background.fillStyle(0xFDE047, 1); // Yellow
        this.background.fillRoundedRect(-this.width / 2, -25, this.width, 50, 10);
        this.background.lineStyle(2, 0xFACC15);
        this.background.strokeRoundedRect(-this.width / 2, -25, this.width, 50, 10);
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
}
