import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import AudioManager from '@/managers/AudioManager';

type ButtonStyle = 'primary' | 'secondary' | 'danger' | 'success';

interface ButtonConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    text: string;
    onClick?: () => void;
    style?: ButtonStyle;
    width?: number;
    height?: number;
    fontSize?: number;
    icon?: string;
}

export default class Button extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Graphics;
    private btnText: Phaser.GameObjects.Text;
    private hitAreaRect: Phaser.GameObjects.Rectangle;
    private shadow: Phaser.GameObjects.Graphics;

    // Config
    private config: ButtonConfig;
    private isEnabled: boolean = true;
    private colors: any; // Theme colors

    constructor(config: ButtonConfig) {
        super(config.scene, config.x, config.y);
        this.config = config;
        this.colors = LIGHT_COLORS; // Default theme for now

        this.scene.add.existing(this);

        // Defaults
        this.config.width = this.config.width || 200;
        this.config.height = this.config.height || 60;
        this.config.style = this.config.style || 'primary';
        this.config.fontSize = this.config.fontSize || 20;

        // Shadow
        this.shadow = this.scene.add.graphics();
        this.add(this.shadow);

        // Background
        this.bg = this.scene.add.graphics();
        this.add(this.bg);

        // Text
        this.btnText = this.scene.add.text(0, 0, this.config.text, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: `${this.config.fontSize}px`,
            color: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.btnText);

        // Hit Area
        this.hitAreaRect = this.scene.add.rectangle(0, 0, this.config.width, this.config.height, 0x000000, 0);
        this.add(this.hitAreaRect);

        // Interactive
        this.hitAreaRect.setInteractive({ useHandCursor: true });

        // Events
        this.hitAreaRect.on('pointerdown', this.onPointerDown, this);
        this.hitAreaRect.on('pointerup', this.onPointerUp, this);
        this.hitAreaRect.on('pointerover', this.onPointerOver, this);
        this.hitAreaRect.on('pointerout', this.onPointerOut, this);

        // Initial Draw
        this.draw();
    }

    private draw() {
        const w = this.config.width!;
        const h = this.config.height!;
        const radius = 16;

        this.bg.clear();
        this.shadow.clear();

        let bgColor: number;
        let textColor: string = '#FFFFFF';

        // Colors based on style
        switch (this.config.style) {
            case 'primary':
                bgColor = this.colors.PRIMARY;
                textColor = '#1A202C'; // Dark text on white
                break;
            case 'secondary':
                bgColor = this.colors.SECONDARY; // Gray
                textColor = '#1A202C';
                break;
            case 'danger':
                bgColor = this.colors.ERROR;
                textColor = '#FFFFFF';
                break;
            case 'success':
                bgColor = this.colors.SUCCESS;
                textColor = '#FFFFFF';
                break;
            default:
                bgColor = this.colors.PRIMARY;
                textColor = '#1A202C';
        }

        // Draw Shadow
        if (this.isEnabled) {
            this.shadow.fillStyle(0x000000, 0.2);
            this.shadow.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, radius);
        }

        // Draw Background
        this.bg.fillStyle(bgColor, this.isEnabled ? 1 : 0.5);

        // Border for primary/secondary
        if (this.config.style === 'primary') {
            // Beyaz buton biraz kontur istiyor grid üstünde değilse
        }

        this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);

        // Text Color
        this.btnText.setColor(textColor);
        this.btnText.setAlpha(this.isEnabled ? 1 : 0.5);
    }

    private onPointerDown() {
        if (!this.isEnabled) return;

        this.y += 4;
        this.shadow.visible = false;

        // Scale down slightly
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100
        });
    }

    private onPointerUp() {
        if (!this.isEnabled) return;

        this.y = this.config.y; // Reset pos
        this.shadow.visible = true;

        // Bounce back
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 100
        });

        AudioManager.playButtonClick();

        if (this.config.onClick) {
            this.config.onClick();
        }
    }

    private onPointerOver() {
        if (!this.isEnabled) return;

        // Scale up slightly
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100
        });
    }

    private onPointerOut() {
        if (!this.isEnabled) return;

        this.y = this.config.y; // Reset pos if dragged out
        this.shadow.visible = true;

        // Reset scale
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 100
        });
    }

    // Public Methods

    public setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        if (!enabled) {
            // Reset states if disabling
            this.setScale(1);
            this.y = this.config.y;
            this.hitAreaRect.disableInteractive();
        } else {
            this.hitAreaRect.setInteractive({ useHandCursor: true });
        }
        this.draw();
    }

    public setText(text: string) {
        this.config.text = text;
        this.btnText.setText(text);
    }

    public setStyle(style: ButtonStyle) {
        this.config.style = style;
        this.draw();
    }
}
