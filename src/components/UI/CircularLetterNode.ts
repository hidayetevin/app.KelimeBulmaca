import Phaser from 'phaser';
import ThemeManager from '@/managers/ThemeManager';
import { FONT_FAMILY_PRIMARY, GAME_RESOLUTION } from '@/utils/constants';
import { numberToHex } from '@/utils/colors';

interface CircularLetterNodeConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    size: number;
    letter: string;
    index: number;
}

export default class CircularLetterNode extends Phaser.GameObjects.Container {
    public letter: string;
    public index: number;
    private size: number;
    private bg!: Phaser.GameObjects.Graphics;
    private text!: Phaser.GameObjects.Text;

    public isSelected = false;
    public isUsed = false;

    private colors = ThemeManager.getCurrentColors();

    constructor(config: CircularLetterNodeConfig) {
        super(config.scene, config.x, config.y);
        this.scene.add.existing(this);

        this.letter = config.letter;
        this.index = config.index;
        this.size = config.size;

        this.createContent();

        // Interactive zone
        this.setSize(this.size, this.size);
        this.setInteractive(new Phaser.Geom.Circle(0, 0, this.size / 2), Phaser.Geom.Circle.Contains);
    }

    private createContent() {
        // Background
        this.bg = this.scene.add.graphics();
        this.add(this.bg);

        // Text
        const textColorHex = numberToHex(this.colors.textSecondary);
        this.text = this.scene.add.text(0, 0, this.letter, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: `${this.size * 0.6}px`,
            color: textColorHex, // Initial color, will be updated by drawBackground
            fontStyle: 'bold'
        }).setOrigin(0.5).setResolution(GAME_RESOLUTION);
        this.add(this.text);

        this.drawBackground();
    }

    private drawBackground() {
        this.bg.clear();
        const radius = this.size / 2;
        const textPrimaryHex = numberToHex(this.colors.textPrimary);
        const textSecondaryHex = numberToHex(this.colors.textSecondary);

        if (this.isUsed) {
            // Used state: Dimmed
            this.bg.fillStyle(this.colors.secondary, 0.5);
            this.bg.fillCircle(0, 0, radius);
            this.text.setColor(textSecondaryHex);
        } else if (this.isSelected) {
            // Selected state: Accent
            this.bg.fillStyle(this.colors.accent, 1);
            this.bg.fillCircle(0, 0, radius);
            this.bg.lineStyle(3, 0xffffff, 0.8);
            this.bg.strokeCircle(0, 0, radius);
            this.text.setColor('#FFFFFF');
        } else {
            // Normal state: Primary
            this.bg.fillStyle(this.colors.letterCircleBg, 1);
            this.bg.fillCircle(0, 0, radius);
            this.bg.lineStyle(2, this.colors.letterCircleBorder, 1);
            this.bg.strokeCircle(0, 0, radius);
            this.text.setColor(textPrimaryHex);
        }
    }

    public select() {
        if (this.isUsed) return;
        this.isSelected = true;
        this.drawBackground();
    }

    public deselect() {
        this.isSelected = false;
        this.drawBackground();
    }

    public setUsed(used: boolean) {
        this.isUsed = used;
        this.drawBackground();
    }

    public reset() {
        this.isSelected = false;
        this.isUsed = false;
        this.drawBackground();
    }
}
