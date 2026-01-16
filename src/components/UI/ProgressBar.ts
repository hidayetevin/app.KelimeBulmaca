import Phaser from 'phaser';
import { LIGHT_COLORS } from '@/utils/colors';

export type ProgressBarMode = 'linear' | 'circular';

interface ProgressBarConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    mode?: ProgressBarMode;
    width?: number;
    height?: number;
    radius?: number;
    value?: number; // 0 to 1
    showPercentage?: boolean;
    color?: number;
    backgroundColor?: number;
}

export default class ProgressBar extends Phaser.GameObjects.Container {
    private mode: ProgressBarMode;
    private value: number;
    private config: ProgressBarConfig;
    private colors = LIGHT_COLORS;

    // Linear mode components
    private trackGraphics?: Phaser.GameObjects.Graphics;
    private fillGraphics?: Phaser.GameObjects.Graphics;
    private percentText?: Phaser.GameObjects.Text;

    // Circular mode components
    private circleGraphics?: Phaser.GameObjects.Graphics;

    private barWidth: number;
    private barHeight: number;
    private circleRadius: number;

    constructor(config: ProgressBarConfig) {
        super(config.scene, config.x, config.y);
        this.config = config;
        this.mode = config.mode || 'linear';
        this.value = config.value || 0;
        this.barWidth = config.width || 280;
        this.barHeight = config.height || 20;
        this.circleRadius = config.radius || 40;

        this.scene.add.existing(this);
        this.createProgressBar();
    }

    private createProgressBar() {
        if (this.mode === 'linear') {
            this.createLinearBar();
        } else {
            this.createCircularBar();
        }
    }

    private createLinearBar() {
        // Background track
        this.trackGraphics = this.scene.add.graphics();
        const bgColor = this.config.backgroundColor || this.colors.SECONDARY;
        this.trackGraphics.fillStyle(bgColor, 1);
        this.trackGraphics.fillRoundedRect(
            -this.barWidth / 2,
            -this.barHeight / 2,
            this.barWidth,
            this.barHeight,
            10
        );
        this.add(this.trackGraphics);

        // Fill bar
        this.fillGraphics = this.scene.add.graphics();
        this.add(this.fillGraphics);

        // Percentage text (optional)
        if (this.config.showPercentage) {
            this.percentText = this.scene.add.text(0, 0, '0%', {
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: '#666666',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.add(this.percentText);
        }

        this.updateLinearBar();
    }

    private createCircularBar() {
        this.circleGraphics = this.scene.add.graphics();
        this.add(this.circleGraphics);

        // Percentage text in center
        if (this.config.showPercentage) {
            this.percentText = this.scene.add.text(0, 0, '0%', {
                fontFamily: 'Poppins',
                fontSize: '18px',
                color: '#333333',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.add(this.percentText);
        }

        this.updateCircularBar();
    }

    private updateLinearBar() {
        if (!this.fillGraphics) return;

        this.fillGraphics.clear();
        const fillColor = this.config.color || this.colors.ACCENT;
        const fillWidth = (this.barWidth - 4) * this.value;

        if (fillWidth > 0) {
            this.fillGraphics.fillStyle(fillColor, 1);
            this.fillGraphics.fillRoundedRect(
                -this.barWidth / 2 + 2,
                -this.barHeight / 2 + 2,
                fillWidth,
                this.barHeight - 4,
                8
            );
        }

        if (this.percentText) {
            this.percentText.setText(Math.floor(this.value * 100) + '%');
            this.percentText.y = this.barHeight / 2 + 20;
        }
    }

    private updateCircularBar() {
        if (!this.circleGraphics) return;

        this.circleGraphics.clear();

        // Background circle
        const bgColor = this.config.backgroundColor || this.colors.SECONDARY;
        this.circleGraphics.lineStyle(8, bgColor, 1);
        this.circleGraphics.strokeCircle(0, 0, this.circleRadius);

        // Progress arc
        if (this.value > 0) {
            const fillColor = this.config.color || this.colors.ACCENT;
            this.circleGraphics.lineStyle(8, fillColor, 1);

            // Draw arc from top (-90 degrees) clockwise
            const startAngle = Phaser.Math.DegToRad(-90);
            const endAngle = startAngle + (Phaser.Math.DegToRad(360) * this.value);

            this.circleGraphics.beginPath();
            this.circleGraphics.arc(0, 0, this.circleRadius, startAngle, endAngle, false);
            this.circleGraphics.strokePath();
        }

        if (this.percentText) {
            this.percentText.setText(Math.floor(this.value * 100) + '%');
        }
    }

    /**
     * Set progress value (0-1) with optional animation
     */
    public setValue(newValue: number, animated: boolean = true) {
        const clamped = Phaser.Math.Clamp(newValue, 0, 1);

        if (animated) {
            this.scene.tweens.add({
                targets: this,
                value: clamped,
                duration: 300,
                ease: 'Power2',
                onUpdate: () => {
                    if (this.mode === 'linear') {
                        this.updateLinearBar();
                    } else {
                        this.updateCircularBar();
                    }
                }
            });
        } else {
            this.value = clamped;
            if (this.mode === 'linear') {
                this.updateLinearBar();
            } else {
                this.updateCircularBar();
            }
        }
    }

    /**
     * Get current value
     */
    public getValue(): number {
        return this.value;
    }

    /**
     * Reset to 0
     */
    public reset() {
        this.setValue(0, false);
    }

    /**
     * Set to 100%
     */
    public complete() {
        this.setValue(1, true);
    }
}
