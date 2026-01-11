import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY, IMAGE_PATHS } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AdManager from '@/managers/AdManager';
import AudioManager from '@/managers/AudioManager';
import { fadeIn, pulseInternal } from '@/utils/animations';

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

        // Center the container based on width logic (rough approx)
        // Container origin is 0,0 but contents are relative. 
        // Just keeping it centered manually.

        // 4. Buttons
        const btnY = centerY + 50;
        const gap = 120; // Büyük boşluk

        // Play Button (Center, Big)
        this.createButton(centerX, btnY, 'KATEGORİLER', colors.PRIMARY, () => {
            this.scene.start(SCENES.CATEGORY_SELECTION);
        }, true);

        // Play Button Icon (Extra visual)
        // ...

        // Achievements Button (Small, Top or Bottom?) -> Dokümanda liste
        // Dokümanda: [Başarılar] [OYNA] [Ayarlar] alt alta

        // OYNA (Orta)
        // Başarılar (Üstü)
        // Ayarlar (Altı)

        // Refine Layout:
        // Logo (150)
        // Star (250)
        // Achievements (350)
        // PLAY (450) - Ana Buton
        // Settings (550)

        this.createButton(centerX, 350, LocalizationManager.t('mainMenu.achievements', 'BAŞARILAR'), colors.SURFACE, () => {
            // this.scene.start(SCENES.ACHIEVEMENT);
            console.log('Go to Achievements');
        });

        this.createButton(centerX, 450, LocalizationManager.t('mainMenu.play', 'OYNA'), colors.SUCCESS, () => {
            this.scene.start(SCENES.CATEGORY_SELECTION);
        }, true); // Büyük buton

        this.createButton(centerX, 550, LocalizationManager.t('mainMenu.settings', 'AYARLAR'), colors.SURFACE, () => {
            // this.scene.start(SCENES.SETTINGS);
            console.log('Go to Settings');
        });


        // 5. Banner Ad
        AdManager.showBanner('bottom');

        // 6. Fade In
        fadeIn(this, logoText, 800);

        // Music
        // AudioManager.playMusic('bgm_main'); // Müzik henüz yok
    }

    private createButton(x: number, y: number, text: string, color: number, callback: () => void, isLarge: boolean = false) {
        const container = this.add.container(x, y);

        const width = isLarge ? 240 : 200;
        const height = isLarge ? 70 : 60;
        const fontSize = isLarge ? '28px' : '20px';
        const primaryColor = isLarge ? 0xFFFFFF : 0x1A202C; // Yazı rengi
        const bgColor = isLarge ? color : 0xFFFFFF; // Arkaplan
        const strokeColor = isLarge ? 0xFFFFFF : color;

        // Shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.2);
        shadow.fillRoundedRect(-width / 2, -height / 2 + 5, width, height, 16);
        container.add(shadow);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(bgColor, 1);
        if (!isLarge) {
            bg.lineStyle(2, 0xE2E8F0, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);
        }
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
        container.add(bg);

        // Text
        const btnText = this.add.text(0, 0, text, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: fontSize,
            color: isLarge ? '#ffffff' : '#1A202C',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(btnText);

        // Interactive
        const hitArea = this.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerdown', () => {
            container.y += 4;
            shadow.visible = false;
        });

        hitArea.on('pointerup', () => {
            container.y = y;
            shadow.visible = true;
            AudioManager.playButton();
            callback();
        });

        hitArea.on('pointerout', () => {
            container.y = y;
            shadow.visible = true;
        });

        container.add(hitArea);

        // Hover Effect tween
        this.tweens.add({
            targets: container,
            scale: { from: 1, to: 1.05 },
            duration: 100,
            paused: true,
            persist: true
        }); // Henüz hover logic yok, pointerover eklenebilir.

        return container;
    }
}
