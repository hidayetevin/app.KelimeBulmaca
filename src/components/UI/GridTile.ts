import Phaser from 'phaser';
import ThemeManager from '@/managers/ThemeManager';
import { FONT_FAMILY_PRIMARY, GAME_RESOLUTION } from '@/utils/constants';
import { numberToHex } from '@/utils/colors';

interface GridTileConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    size: number;
    letter: string;
    row: number;
    col: number;
}

export default class GridTile extends Phaser.GameObjects.Container {
    public row: number;
    public col: number;
    public letter: string;
    private size: number;

    // Visuals
    private bg!: Phaser.GameObjects.Graphics;
    private text!: Phaser.GameObjects.Text;

    public isSelected = false;
    public isFound = false;
    public isHinted = false;

    private colors = ThemeManager.getCurrentColors();

    constructor(config: GridTileConfig) {
        super(config.scene, config.x, config.y);
        this.scene.add.existing(this);

        this.row = config.row;
        this.col = config.col;
        this.letter = config.letter;
        this.size = config.size;

        this.createContent();
    }

    private createContent() {
        const s = this.size;

        // Background
        this.bg = this.scene.add.graphics();
        this.drawBackground();
        this.add(this.bg);

        // Text
        const textColorHex = numberToHex(this.colors.textPrimary);
        this.text = this.scene.add.text(0, 0, this.letter, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: `${s * 0.6}px`,
            color: textColorHex,
            fontStyle: 'bold'
        }).setOrigin(0.5).setResolution(GAME_RESOLUTION);
        this.add(this.text);
    }

    private drawBackground() {
        this.bg.clear();

        const s = this.size;
        const r = 8;
        const textColorHex = numberToHex(this.colors.textPrimary);

        if (this.isFound) {
            this.bg.fillStyle(this.colors.wordFound, 1);
            this.bg.lineStyle(2, 0xffffff, 1);
            this.text?.setColor('#FFFFFF');
        } else if (this.isSelected) {
            this.bg.fillStyle(this.colors.accent, 1);
            this.bg.lineStyle(2, 0xffffff, 1);
            this.text?.setColor('#FFFFFF');
        } else if (this.isHinted) {
            this.bg.fillStyle(this.colors.wordHint, 1);
            this.bg.lineStyle(1, this.colors.gridCellBorder, 1);
            this.text?.setColor(textColorHex);
        } else {
            this.bg.fillStyle(this.colors.gridCellBg, 1);
            this.bg.lineStyle(2, this.colors.gridCellBorder, 1);
            this.text?.setColor(textColorHex);
        }

        this.bg.fillRoundedRect(-s / 2, -s / 2, s, s, r);
        this.bg.strokeRoundedRect(-s / 2, -s / 2, s, s, r);
    }

    public select() {
        if (!this.isSelected && !this.isFound) {
            this.isSelected = true;
            this.drawBackground();
            // Scale pop animation
            this.scene.tweens.add({
                targets: this,
                scale: { from: 1, to: 1.1 },
                duration: 100,
                yoyo: true
            });
        }
    }

    public deselect() {
        if (this.isSelected && !this.isFound) {
            this.isSelected = false;
            this.drawBackground();
        }
    }

    public setFound() {
        this.isFound = true;
        this.isSelected = false;
        this.drawBackground();
        // Success animation
        this.scene.tweens.add({
            targets: this,
            scale: { from: 1, to: 1.2 },
            angle: 360,
            duration: 400,
            ease: 'Back.out'
        });
    }

    public setHint() {
        if (!this.isFound) {
            this.isHinted = true;
            this.drawBackground();
        }
    }
}
