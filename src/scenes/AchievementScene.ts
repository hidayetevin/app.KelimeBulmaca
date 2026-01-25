import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import Panel from '@/components/UI/Panel';
import AchievementCard from '@/components/UI/AchievementCard';

export default class AchievementScene extends Phaser.Scene {
    private panel!: Panel;
    private scrollContainer!: Phaser.GameObjects.Container;
    private minScrollY = 0;
    private maxScrollY = 0;
    private isDragging = false;
    private lastY = 0;

    constructor() {
        super(SCENES.ACHIEVEMENT);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;
        const centerY = height / 2;

        this.add.rectangle(0, 0, width, height, 0xF7FAFC).setOrigin(0);

        this.panel = new Panel({
            scene: this,
            x: centerX,
            y: centerY,
            width: width - 40,
            height: height - 100,
            title: LocalizationManager.t('achievements.title', 'BAŞARILAR'),
            showCloseButton: true,
            onClose: () => {
                this.goBack();
            }
        });

        this.createScrollableList();
        this.panel.open();

        this.input.keyboard?.on('keydown-ESC', () => {
            this.panel.close().then(() => this.goBack());
        });
    }

    private goBack() {
        this.scene.start(SCENES.MAIN_MENU);
    }

    private createScrollableList() {
        // List area dimensions - use full panel width minus padding
        const panelWidth = GAME_WIDTH - 40; // Same as panel config
        const listW = panelWidth - 40; // 20px padding on each side
        const cardW = listW - 20; // Card slightly smaller for visual padding
        const cardH = 100;
        const gap = 15;

        const listHeight = GAME_HEIGHT - 200; // Visible area height

        // Stats Header
        const statsY = - (listHeight / 2) - 40;
        this.createStats(statsY);

        // Container setup
        this.scrollContainer = this.add.container(0, 0); // Position relative to mask

        const achievements = GameManager.getGameState()?.achievements || [];

        let currentY = 0;
        achievements.forEach((ach) => {
            const card = new AchievementCard({
                scene: this,
                x: 0,
                y: currentY,
                width: cardW,
                height: cardH,
                achievement: ach
            });
            this.scrollContainer.add(card);
            currentY += cardH + gap;
        });

        const totalContentHeight = currentY;

        // Scroll Logic
        const contentStartY = - (GAME_HEIGHT - 100) / 2 + 80;
        const initialY = contentStartY + cardH / 2;

        this.scrollContainer.y = initialY;

        // Scroll Logic
        // totalContentHeight is the bottom Y of the last card + gap
        // We want to scroll until the bottom of the last card is visible.
        // Add extra padding at the bottom so it clears the panel edge comfortably
        const bottomPadding = 100;
        const scrollableDistance = Math.max(0, totalContentHeight + bottomPadding - listHeight);

        this.maxScrollY = initialY;
        this.minScrollY = initialY - scrollableDistance;

        // Mask
        const maskY = (GAME_HEIGHT - listHeight) / 2 + 20; // Offset for title
        const maskShape = this.make.graphics({});
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect((GAME_WIDTH - listW) / 2, maskY, listW, listHeight);
        const mask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(mask);
        // AchievementCard calls super(x,y) -> Container.
        // Container doesn't have origin. Elements inside are relative to 0,0.
        // In card: Rect drawn at -w/2, -h/2. So 0,0 is center. Perfect.

        this.panel.add(this.scrollContainer);

        // Drag Interaction
        const hitZone = this.add.rectangle(0, 10, listW, listHeight, 0x000000, 0); // Relative to panel center
        hitZone.setInteractive();
        this.panel.add(hitZone);

        hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = true;
            this.lastY = pointer.y;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const dy = pointer.y - this.lastY;
                this.lastY = pointer.y;

                this.scrollContainer.y += dy;

                // Clamp
                if (this.scrollContainer.y > this.maxScrollY) this.scrollContainer.y = this.maxScrollY;
                if (this.scrollContainer.y < this.minScrollY) this.scrollContainer.y = this.minScrollY;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
            this.snapScroll();
        });
    }

    private snapScroll() {
        // Bounds checking logic needs refinement based on exact content height vs visible height
        // For MVP, just ensure we don't scroll too far.
        // TODO: Refine scroll physics.
    }

    private createStats(y: number) {
        const achievements = GameManager.getGameState()?.achievements || [];
        const unlocked = achievements.filter(a => a.isUnlocked).length;
        const total = achievements.length;

        const text = this.add.text(0, y, `Kazanılan: ${unlocked}/${total}`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '16px',
            color: '#' + LIGHT_COLORS.TEXT_LIGHT.toString(16).padStart(6, '0') // Converted
        }).setOrigin(0.5);
        this.panel.add(text);
    }

    /**
     * Cleanup
     */
    destroy() {
        this.input.keyboard?.off('keydown-ESC');
        this.input.off('pointermove');
        this.input.off('pointerup');
        console.log('🧹 AchievementScene cleaned up');
    }
}
