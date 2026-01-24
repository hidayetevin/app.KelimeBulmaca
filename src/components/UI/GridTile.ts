import Phaser from 'phaser';
import { LIGHT_COLORS } from '@/utils/colors';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';

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

    private colors = LIGHT_COLORS;

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
        this.text = this.scene.add.text(0, 0, this.letter, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: `${s * 0.6}px`,
            color: '#' + this.colors.TEXT_DARK.toString(16).padStart(6, '0'),
            fontStyle: 'bold'
        }).setOrigin(0.5).setResolution(window.devicePixelRatio);
        this.add(this.text);
    }

    private drawBackground() {
        this.bg.clear();

        const s = this.size;
        const r = 8;

        if (this.isFound) {
            this.bg.fillStyle(this.colors.SUCCESS, 1); // Green
            this.bg.lineStyle(2, 0xffffff, 1);
            this.text?.setColor('#FFFFFF');
        } else if (this.isSelected) {
            this.bg.fillStyle(this.colors.PRIMARY, 1); // Orange/Primary
            this.bg.lineStyle(2, 0xffffff, 1);
            this.text?.setColor('#FFFFFF');
        } else if (this.isHinted) {
            this.bg.fillStyle(0xFFEB3B, 1); // Yellowish
            this.bg.lineStyle(1, 0xE2E8F0, 1);
            this.text?.setColor('#' + this.colors.TEXT_DARK.toString(16).padStart(6, '0'));
        } else {
            this.bg.fillStyle(0xFFFFFF, 1); // White
            this.bg.lineStyle(1, 0xE2E8F0, 1); // Border
            this.text?.setColor('#' + this.colors.TEXT_DARK.toString(16).padStart(6, '0'));
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
