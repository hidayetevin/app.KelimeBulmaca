import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';

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
        this.letterText = this.scene.add.text(0, 0, this.letter, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: `${this.radius}px`,
            color: '#1F2937',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.letterText);

        // Now update circle (which modifies letterText color)
        this.updateCircle();
    }

    private updateCircle() {
        this.circle.clear();

        if (this.isUsed) {
            // Used state: Gray
            this.circle.fillStyle(0xD1D5DB, 1);
            this.circle.fillCircle(0, 0, this.radius);
            this.letterText.setColor('#9CA3AF');
        } else if (this.isSelected) {
            // Selected state: Blue
            this.circle.fillStyle(0x3B82F6, 1);
            this.circle.fillCircle(0, 0, this.radius);
            this.circle.lineStyle(3, 0x1E40AF);
            this.circle.strokeCircle(0, 0, this.radius);
            this.letterText.setColor('#FFFFFF');
        } else {
            // Normal state: White
            this.circle.fillStyle(0xFFFFFF, 1);
            this.circle.fillCircle(0, 0, this.radius);
            this.circle.lineStyle(2, 0xE5E7EB);
            this.circle.strokeCircle(0, 0, this.radius);
            this.letterText.setColor('#1F2937');
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
