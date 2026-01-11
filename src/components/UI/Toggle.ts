import Phaser from 'phaser';
import { LIGHT_COLORS } from '@/utils/colors';
import AudioManager from '@/managers/AudioManager';

interface ToggleConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    value: boolean;
    onToggle: (value: boolean) => void;
    label?: string; // Optional label text beside it
}

export default class Toggle extends Phaser.GameObjects.Container {
    private isOn: boolean;
    private track!: Phaser.GameObjects.Graphics;
    private thumb!: Phaser.GameObjects.Graphics;
    private thumbXOff = 0;
    private thumbXOn = 0;
    private config: ToggleConfig;
    private colors = LIGHT_COLORS;

    constructor(config: ToggleConfig) {
        super(config.scene, config.x, config.y);
        this.config = config;
        this.isOn = config.value;
        this.scene.add.existing(this);

        this.createContent();
    }

    private createContent() {
        const width = 60;
        const height = 30;
        const radius = 15;
        const thumbRadius = 13;

        this.thumbXOff = -width / 2 + radius; // Left
        this.thumbXOn = width / 2 - radius;   // Right

        // Track
        this.track = this.scene.add.graphics();
        this.add(this.track);

        // Thumb
        this.thumb = this.scene.add.graphics();
        this.thumb.fillStyle(0xFFFFFF, 1);
        this.thumb.fillCircle(0, 0, thumbRadius);
        // Shadow for thumb
        // (Simple circle shadow?)
        this.add(this.thumb);

        // Hit Area
        const hitArea = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerup', this.toggle, this);
        this.add(hitArea);

        this.updateVisuals(false); // Initial draw without animation
    }

    public toggle() {
        this.isOn = !this.isOn;
        this.updateVisuals(true);
        AudioManager.playSfx('button_click');
        if (this.config.onToggle) {
            this.config.onToggle(this.isOn);
        }
    }

    public setValue(value: boolean) {
        if (this.isOn !== value) {
            this.isOn = value;
            this.updateVisuals(true);
        }
    }

    private updateVisuals(animated: boolean) {
        const color = this.isOn ? this.colors.SUCCESS : this.colors.SECONDARY;
        const targetX = this.isOn ? this.thumbXOn : this.thumbXOff;

        // Redraw track
        this.track.clear();
        this.track.fillStyle(color, 1);
        this.track.fillRoundedRect(-30, -15, 60, 30, 15);

        if (animated) {
            this.scene.tweens.add({
                targets: this.thumb,
                x: targetX,
                duration: 200,
                ease: 'Power2'
            });
        } else {
            this.thumb.x = targetX;
        }
    }
}
