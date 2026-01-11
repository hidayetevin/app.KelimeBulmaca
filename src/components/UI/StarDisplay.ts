import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';
import AudioManager from '@/managers/AudioManager';

interface StarDisplayConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    initialValue?: number;
    showLabel?: boolean;
}

export default class StarDisplay extends Phaser.GameObjects.Container {
    private starIcon: Phaser.GameObjects.Text | Phaser.GameObjects.Image;
    private countText: Phaser.GameObjects.Text;
    private displayedValue: number;
    private targetValue: number;
    private config: StarDisplayConfig;

    constructor(config: StarDisplayConfig) {
        super(config.scene, config.x, config.y);
        this.config = config;

        this.displayedValue = config.initialValue || 0;
        this.targetValue = this.displayedValue;

        this.scene.add.existing(this); // Sahneye ekle

        // Star Icon
        if (this.scene.textures.exists('star_filled')) {
            this.starIcon = this.scene.add.image(-40, 0, 'star_filled').setScale(0.8);
        } else {
            this.starIcon = this.scene.add.text(-40, 0, '⭐', { fontSize: '32px' }).setOrigin(0.5);
        }
        this.add(this.starIcon);

        // Count Text
        this.countText = this.scene.add.text(0, 0, this.displayedValue.toString(), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '32px',
            color: '#F6AD55', // Goold
            fontStyle: 'bold'
        }).setOrigin(0, 0.5); // Iconun sağına
        this.add(this.countText);

        // Optional Label
        if (config.showLabel) {
            const label = this.scene.add.text(0, 20, 'YILDIZ', {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '10px',
                color: '#A0AEC0'
            }).setOrigin(0, 0);
            this.add(label);
        }
    }

    public setStars(value: number, animated: boolean = true) {
        this.targetValue = value;

        if (animated) {
            // Tween counter
            this.scene.tweens.addCounter({
                from: this.displayedValue,
                to: this.targetValue,
                duration: 500,
                onUpdate: (tween) => {
                    const current = Math.floor(tween.getValue());
                    this.countText.setText(current.toString());
                },
                onComplete: () => {
                    this.displayedValue = this.targetValue;
                    this.countText.setText(this.displayedValue.toString());
                }
            });

            // Pulse effect
            this.scene.tweens.add({
                targets: this.starIcon,
                scale: 1.2,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    // if image was used, reset to original scale logic needed, 
                    // but assumes 0.8 base scale for image if sprite exists or 1 for text.
                    // Simplified for now.
                }
            });
        } else {
            this.displayedValue = value;
            this.countText.setText(value.toString());
        }
    }

    public async animateEarn(amount: number) {
        // Particles or sequential add
        const startVal = this.displayedValue;
        this.setStars(startVal + amount, true);
        AudioManager.playStarCollect();
    }
}
