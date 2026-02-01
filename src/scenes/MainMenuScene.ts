import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import ThemeManager from '@/managers/ThemeManager';
import gameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AdManager from '@/managers/AdManager';
import AudioManager from '@/managers/AudioManager';
import { fadeIn } from '@/utils/animations';
import Button from '@/components/UI/Button';
import StarDisplay from '@/components/UI/StarDisplay';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super(SCENES.MAIN_MENU);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;
        const colors = ThemeManager.getCurrentColors();

        // 1. Background (Gradient)
        const bg = this.add.graphics();
        bg.fillGradientStyle(colors.background, colors.background, colors.secondary, colors.secondary, 1, 1);
        bg.fillRect(0, 0, width, height);

        // 2. Logo
        const textColor = ThemeManager.getCurrentColors().textPrimary === 0x1A202C ? '#1A202C' : '#F1F5F9';

        const logoText = this.add.text(centerX, 150, 'KELİME\nUSTASI', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '56px',
            color: textColor,
            fontStyle: 'bold',
            align: 'center',
            stroke: colors.primary === 0xFFFFFF ? '#ffffff' : '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#888',
                blur: 0,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setResolution(window.devicePixelRatio);

        // Logo Pulse Animation
        this.add.tween({
            targets: logoText,
            scale: { from: 1, to: 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 3. Star Display
        const starDisplay = new StarDisplay({
            scene: this,
            x: centerX,
            y: 250,
            initialValue: gameManager.getGameState()?.user.totalStars || 0
        });
        starDisplay.setX(centerX + 20);

        // 4. Buttons

        // Play (Success/Big, Center)
        new Button({
            scene: this,
            x: centerX,
            y: 350,
            text: LocalizationManager.t('mainMenu.play', 'OYNA'),
            style: 'success',
            width: 240,
            height: 70,
            fontSize: 28,
            onClick: () => {
                AudioManager.playSfx('click');
                this.scene.start(SCENES.LEVEL_SELECTION);
            }
        });

        // Store (Primary, Middle)
        new Button({
            scene: this,
            x: centerX,
            y: 440,
            text: LocalizationManager.t('mainMenu.store', 'MAĞAZA'),
            style: 'primary',
            onClick: () => {
                this.scene.start(SCENES.THEME_STORE);
            }
        });

        // Achievements (Secondary)
        new Button({
            scene: this,
            x: centerX,
            y: 520,
            text: LocalizationManager.t('mainMenu.achievements', 'BAŞARILAR'),
            style: 'secondary',
            onClick: () => {
                this.scene.start(SCENES.ACHIEVEMENT);
            }
        });

        // Settings (Secondary, Bottom)
        new Button({
            scene: this,
            x: centerX,
            y: 600,
            text: LocalizationManager.t('mainMenu.settings', 'AYARLAR'),
            style: 'secondary',
            onClick: () => {
                this.scene.start(SCENES.SETTINGS);
            }
        });

        // 5. Banner Ad
        AdManager.showBanner();

        // ✅ Google Play Policy: Add "Reklam" label above banner
        // This clearly differentiates ads from app content
        this.add.text(
            width / 2,
            height - 60, // 60px above bottom (banner is at bottom)
            'Reklam / Advertisement',
            {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: '#999999',
                backgroundColor: '#00000022',
                padding: { x: 8, y: 3 }
            }
        )
            .setOrigin(0.5, 0.5)
            .setDepth(9999) // High z-index above other elements
            .setScrollFactor(0); // Fixed position

        // 6. Fade In
        fadeIn(this, logoText, 800);
    }
}
