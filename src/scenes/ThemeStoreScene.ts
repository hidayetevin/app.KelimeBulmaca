import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import ThemeManager from '@/managers/ThemeManager';
import LocalizationManager from '@/managers/LocalizationManager';
import gameManager, { GameManager } from '@/managers/GameManager';
import { THEMES } from '@/data/themes';
import ThemeCard from '@/components/UI/ThemeCard';
import Button from '@/components/UI/Button';

export default class ThemeStoreScene extends Phaser.Scene {
    private scrollContainer!: Phaser.GameObjects.Container;
    private scrollY: number = 0;
    private maxScroll: number = 0;

    constructor() {
        super(SCENES.THEME_STORE);
    }

    create() {
        const colors = ThemeManager.getCurrentColors();

        // Background
        this.add.graphics()
            .fillGradientStyle(colors.background, colors.background, colors.secondary, colors.secondary, 1, 1)
            .fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Scrollable Content - CREATED FIRST
        this.createScrollableContent();

        // Header - CREATED SECOND with high depth
        this.createHeader(colors);

        // Back Button
        const backBtn = new Button({
            scene: this,
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT - 60,
            text: LocalizationManager.t('common.back', 'Geri'),
            onClick: () => this.scene.start(SCENES.MAIN_MENU),
            style: 'secondary'
        });
        backBtn.setDepth(101);
    }

    private createHeader(colors: any) {
        const headerContainer = this.add.container(0, 0);
        headerContainer.setDepth(100);

        const headerBg = this.add.graphics();
        headerBg.fillStyle(colors.primary);
        headerBg.fillRect(0, 0, GAME_WIDTH, 80);
        headerBg.lineStyle(2, colors.accent);
        headerBg.lineBetween(0, 80, GAME_WIDTH, 80);
        headerContainer.add(headerBg);

        const titleText = this.add.text(GAME_WIDTH / 2, 40, LocalizationManager.t('mainMenu.store', 'Tema Mağazası'), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '24px',
            color: ThemeManager.getCurrentColors().textPrimary === 0x1A202C ? '#1A202C' : '#F1F5F9',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        headerContainer.add(titleText);

        // Star Display in Header
        const stars = gameManager.getTotalStars();
        const starText = this.add.text(GAME_WIDTH - 20, 40, `⭐ ${stars}`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '18px',
            color: '#F6AD55',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        headerContainer.add(starText);
    }

    private createScrollableContent() {
        // Area: starts after header (80) and ends before back button (GAME_HEIGHT - 120)
        const maskX = 0;
        const maskY = 90; // Small margin after header
        const maskWidth = GAME_WIDTH;
        const maskHeight = GAME_HEIGHT - 210; // (GAME_HEIGHT - 120) - 90

        this.scrollContainer = this.add.container(27, maskY);

        // Mask
        const maskShape = this.make.graphics({});
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(maskX, maskY, maskWidth, maskHeight);
        const mask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(mask);

        let currentY = 0;
        THEMES.forEach((theme) => {
            const card = new ThemeCard(this, 0, currentY, theme, (id) => this.handleThemeSelection(id));
            this.scrollContainer.add(card);
            currentY += 120;
        });

        this.maxScroll = Math.max(0, currentY - maskHeight);

        // Input handling for scrolling
        this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
            this.scrollY = Phaser.Math.Clamp(this.scrollY - deltaY, -this.maxScroll, 0);
            this.scrollContainer.y = maskY + this.scrollY;
        });

        // Drag to scroll for mobile
        let startY = 0;
        this.input.on('pointerdown', (pointer: any) => {
            startY = pointer.y;
        });

        this.input.on('pointermove', (pointer: any) => {
            if (pointer.isDown) {
                const diff = pointer.y - startY;
                startY = pointer.y;
                this.scrollY = Phaser.Math.Clamp(this.scrollY + diff, -this.maxScroll, 0);
                this.scrollContainer.y = 90 + this.scrollY;
            }
        });
    }

    private handleThemeSelection(id: string) {
        if (ThemeManager.isThemeUnlocked(id)) {
            ThemeManager.selectTheme(id);
            GameManager.showToast(LocalizationManager.t('themes.equipped', 'Tema kuşandı!'), 'success');
            this.scene.restart(); // Refresh to show active status
        } else {
            const theme = THEMES.find(t => t.id === id);
            if (theme && gameManager.getTotalStars() >= theme.cost) {
                const success = ThemeManager.purchaseTheme(id);
                if (success) {
                    GameManager.showToast(LocalizationManager.t('themes.purchased', 'Tema satın alındı!'), 'success');
                    this.scene.restart();
                }
            } else {
                GameManager.showToast(LocalizationManager.t('errors.not_enough_stars', 'Yetersiz yıldız!'), 'error');
            }
        }
    }
}
