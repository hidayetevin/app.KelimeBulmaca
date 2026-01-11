import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AdManager from '@/managers/AdManager';
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
        const centerY = height / 2;
        const colors = LIGHT_COLORS;

        // 1. Background (Gradient)
        const bg = this.add.graphics();
        bg.fillGradientStyle(colors.BACKGROUND, colors.BACKGROUND, colors.SECONDARY, colors.SECONDARY, 1);
        bg.fillRect(0, 0, width, height);

        // 2. Logo
        const logoText = this.add.text(centerX, 150, 'KELİME\nUSTASI', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '56px',
            color: '#1A202C', // colors.TEXT_PRIMARY
            fontStyle: 'bold',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 6,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#888',
                blur: 0,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

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
        const starContainer = this.add.container(centerX, 250);

        let starIcon: Phaser.GameObjects.GameObject;
        if (this.textures.exists('star_filled')) {
            starIcon = this.add.image(-40, 0, 'star_filled').setScale(0.8);
        } else {
            starIcon = this.add.text(-40, 0, '⭐', { fontSize: '32px' }).setOrigin(0.5);
        }

        const totalStars = GameManager.getGameState()?.user.totalStars || 0;
        const starText = this.add.text(0, 0, totalStars.toString(), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '32px',
            color: '#F6AD55', // colors.WARNING (Gold)
            fontStyle: 'bold'
        }).setOrigin(0, 0.5); // Iconun sağına

        starContainer.add([starIcon, starText]);

        // 4. Buttons

        // Achievements (Secondary, Top)
        new Button({
            scene: this,
            x: centerX,
            y: 350,
            text: LocalizationManager.t('mainMenu.achievements', 'BAŞARILAR'),
            style: 'secondary',
            onClick: () => {
                // this.scene.start(SCENES.ACHIEVEMENT);
                console.log('Go to Achievements');
            }
        });

        // Play (Success/Big, Center)
        new Button({
            scene: this,
            x: centerX,
            y: 450,
            text: LocalizationManager.t('mainMenu.play', 'OYNA'),
            style: 'success',
            width: 240,
            height: 70,
            fontSize: 28,
            onClick: () => {
                this.scene.start(SCENES.CATEGORY_SELECTION);
            }
        });

        // Settings (Secondary, Bottom)
        new Button({
            scene: this,
            x: centerX,
            y: 550,
            text: LocalizationManager.t('mainMenu.settings', 'AYARLAR'),
            style: 'secondary',
            onClick: () => {
                // this.scene.start(SCENES.SETTINGS);
                console.log('Go to Settings');
            }
        });

        // 5. Banner Ad
        AdManager.showBanner('bottom');

        // 6. Fade In
        fadeIn(this, logoText, 800);
    }
}
