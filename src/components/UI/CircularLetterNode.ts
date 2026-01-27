import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';
import ThemeManager from '@/managers/ThemeManager';
import { numberToHex } from '@/utils/colors';

export interface CircularLetterNodeConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    letter: string;
    radius?: number;
    onSelect?: () => void;
    onDeselect?: () => void;
}

export default class CircularLetterNode extends Phaser.GameObjects.Container {
    public letter: string;
    public isSelected: boolean = false;
    public isUsed: boolean = false;

    private circle!: Phaser.GameObjects.Graphics;
    private letterText!: Phaser.GameObjects.Text;
    private radius: number;
    private onSelectCallback?: () => void;
    private onDeselectCallback?: () => void;
    private colors = ThemeManager.getCurrentColors();

    constructor(config: CircularLetterNodeConfig) {
        super(config.scene, config.x, config.y);

        this.letter = config.letter;
        this.radius = config.radius || 30;
        this.onSelectCallback = config.onSelect;
        this.onDeselectCallback = config.onDeselect;

        this.createVisuals();
        this.scene.add.existing(this);
    }

    private createVisuals() {
        // Circle background
        this.circle = this.scene.add.graphics();
        this.add(this.circle);

        // Letter text - CREATE FIRST before updateCircle
        const textColorHex = numberToHex(this.colors.textPrimary);
        this.letterText = this.scene.add.text(0, 0, this.letter, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: `${this.radius}px`,
            color: textColorHex,
            fontStyle: 'bold'
        }).setOrigin(0.5).setResolution(window.devicePixelRatio);
        this.add(this.letterText);

        // Now update circle (which modifies letterText color)
        this.updateCircle();
    }

    private updateCircle() {
        this.circle.clear();
        const textPrimaryHex = numberToHex(this.colors.textPrimary);

        if (this.isUsed) {
            // Used state: Dimmed
            this.circle.fillStyle(this.colors.secondary, 0.5);
            this.circle.fillCircle(0, 0, this.radius);
            this.letterText.setColor(numberToHex(this.colors.textSecondary));
        } else if (this.isSelected) {
            // Selected state: Accent
            this.circle.fillStyle(this.colors.accent, 1);
            this.circle.fillCircle(0, 0, this.radius);
            this.circle.lineStyle(3, 0xffffff, 0.8);
            this.circle.strokeCircle(0, 0, this.radius);
            this.letterText.setColor('#FFFFFF');
        } else {
            // Normal state: Primary
            this.circle.fillStyle(this.colors.letterCircleBg, 1);
            this.circle.fillCircle(0, 0, this.radius);
            this.circle.lineStyle(2, this.colors.letterCircleBorder, 1);
            this.circle.strokeCircle(0, 0, this.radius);
            this.letterText.setColor(textPrimaryHex);
        }
    }

    public select() {
        if (this.isUsed) return;
        this.isSelected = true;
        this.updateCircle();
        this.onSelectCallback?.();
    }

    public deselect() {
        this.isSelected = false;
        this.updateCircle();
        this.onDeselectCallback?.();
    }

    public setUsed(used: boolean) {
        this.isUsed = used;
        this.updateCircle();
    }

    public reset() {
        this.isSelected = false;
        this.isUsed = false;
        this.updateCircle();
    }
}
