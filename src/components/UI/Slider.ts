import Phaser from 'phaser';
import { LIGHT_COLORS } from '@/utils/colors';

interface SliderConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width?: number;
    value: number; // 0 to 1
    onValueChange: (value: number) => void;
}

export default class Slider extends Phaser.GameObjects.Container {
    private track!: Phaser.GameObjects.Graphics;
    private thumb!: Phaser.GameObjects.Graphics;
    private value: number;
    private config: SliderConfig;
    private colors = LIGHT_COLORS;
    private trackWidth: number;
    private isDragging = false;

    constructor(config: SliderConfig) {
        super(config.scene, config.x, config.y);
        this.config = config;
        this.value = Phaser.Math.Clamp(config.value, 0, 1);
        this.trackWidth = config.width || 200;

        this.scene.add.existing(this);
        this.createContent();
    }

    private createContent() {
        // Track
        this.track = this.scene.add.graphics();
        this.add(this.track);
        this.drawTrack();

        // Thumb
        this.thumb = this.scene.add.graphics();
        this.thumb.fillStyle(0xFFFFFF, 1);
        this.thumb.fillCircle(0, 0, 12);
        // Thumb border
        this.thumb.lineStyle(2, this.colors.PRIMARY, 1);
        this.thumb.strokeCircle(0, 0, 12);
        this.add(this.thumb);

        // Update Thumb Position
        this.updateThumbPosition();

        // Interaction
        this.thumb.setInteractive(new Phaser.Geom.Circle(0, 0, 20), Phaser.Geom.Circle.Contains);
        this.scene.input.setDraggable(this.thumb);

        // Track click
        const trackHitArea = this.scene.add.rectangle(0, 0, this.trackWidth + 20, 40, 0x000000, 0);
        trackHitArea.setInteractive({ useHandCursor: true });
        this.add(trackHitArea);
        this.sendToBack(trackHitArea); // Ensure track visual is top, but hitbuffer is bottom if needed? No, hit area is invisible.
        // Actually, sendToBack(trackHitArea) puts it behind everything in container.

        trackHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.isDragging) {
                this.calculateValueFromX(pointer.worldX);
            }
        });

        // Drag Events
        this.thumb.on('dragstart', () => {
            this.isDragging = true;
            this.scene.tweens.add({ targets: this.thumb, scale: 1.2, duration: 100 });
        });

        this.thumb.on('drag', (pointer: Phaser.Input.Pointer) => {
            // DragX is local? No, it's relative to container if container used? 
            // Phaser container drag is tricky. Better to use pointer worldX.
            this.calculateValueFromX(pointer.worldX);
        });

        this.thumb.on('dragend', () => {
            this.isDragging = false;
            this.scene.tweens.add({ targets: this.thumb, scale: 1, duration: 100 });
        });
    }

    private drawTrack() {
        this.track.clear();

        // Background track (Gray)
        const left = -this.trackWidth / 2;
        this.track.fillStyle(this.colors.SECONDARY, 1);
        this.track.fillRoundedRect(left, -4, this.trackWidth, 8, 4);

        // Fill track (Primary color)
        const fillWidth = this.trackWidth * this.value;
        if (fillWidth > 0) {
            this.track.fillStyle(this.colors.PRIMARY, 1);
            this.track.fillRoundedRect(left, -4, fillWidth, 8, 4);
        }
    }

    private updateThumbPosition() {
        const left = -this.trackWidth / 2;
        this.thumb.x = left + (this.trackWidth * this.value);
    }

    private calculateValueFromX(worldX: number) {
        // Container world position
        // Assuming no nested containers scale/rotation for now for simplicity.
        // Container x is center of slider.
        // Left bound = this.x - width/2

        // NOTE: this.x is container pos.
        // worldX is pointer pos.
        // The track starts at this.x - width/2

        // Need to account for camera scroll if strictly needed, but internal container logic is relative.
        // Let's transform world point to local point.
        // This is complex if nested.

        // Simple approach: 
        // localX = worldX - this.x (if parent is scene root and no cam scroll)
        // More robust:

        // Since getLocalPoint is not easily available on Container in straightforward way without transform matrix,
        // let's assume root placement.

        let localX = worldX - this.x;

        const halfWidth = this.trackWidth / 2;
        localX = Phaser.Math.Clamp(localX, -halfWidth, halfWidth);

        // Map -halfWidth..halfWidth to 0..1
        const pct = (localX + halfWidth) / this.trackWidth;

        this.setValue(pct);
    }

    public setValue(newValue: number) {
        const clamped = Phaser.Math.Clamp(newValue, 0, 1);
        if (this.value !== clamped) {
            this.value = clamped;
            this.updateThumbPosition();
            this.drawTrack();
            if (this.config.onValueChange) {
                this.config.onValueChange(this.value);
            }
        }
    }
}
