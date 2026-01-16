import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY, DAILY_REWARDS } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AudioManager from '@/managers/AudioManager';
import HapticManager from '@/managers/HapticManager';
import { scalePopup, confetti } from '@/utils/animations';

export default class DailyRewardScene extends Phaser.Scene {
    private mainContainer!: Phaser.GameObjects.Container;
    private claimButton!: Phaser.GameObjects.Container;
    private isClaimed: boolean = false;

    constructor() {
        super(SCENES.DAILY_REWARD);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;
        const centerY = height / 2;
        const colors = LIGHT_COLORS;

        // Dimmed Background
        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        bg.setOrigin(0);
        bg.setInteractive(); // Still blocks, but we want to make sure it's visible or dismissible

        // Main Container
        this.mainContainer = this.add.container(centerX, centerY);
        this.mainContainer.setScale(0);

        // Graphics-based panel
        const graphics = this.add.graphics();
        graphics.fillStyle(colors.SURFACE, 1);
        graphics.fillRoundedRect(-170, -250, 340, 500, 24);
        this.mainContainer.add(graphics);

        // Title
        const titleText = this.add.text(0, -210, LocalizationManager.t('dailyReward.title', 'Günlük Ödül'), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '28px',
            color: '#1A202C',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.mainContainer.add(titleText);

        // Claim Button
        this.claimButton = this.createClaimButton(0, 200, colors);
        this.mainContainer.add(this.claimButton);

        // Animation
        scalePopup(this, this.mainContainer);
    }

    private createClaimButton(x: number, y: number, colors: any): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnGraphics = this.add.graphics();
        btnGraphics.fillStyle(colors.SUCCESS, 1);
        btnGraphics.fillRoundedRect(-100, -25, 200, 50, 25);
        container.add(btnGraphics);

        const text = this.add.text(0, 0, LocalizationManager.t('common.collect', 'TOPLA'), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(text);

        const hitArea = this.add.rectangle(0, 0, 200, 50, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerup', () => this.handleClaim());
        container.add(hitArea);

        return container;
    }

    private handleClaim() {
        if (this.isClaimed) return;
        this.isClaimed = true;
        GameManager.claimDailyReward();
        AudioManager.playSfx('word_correct');
        HapticManager.success();
        confetti(this, GAME_WIDTH / 2, GAME_HEIGHT / 2);

        this.time.delayedCall(1000, () => {
            this.scene.start(SCENES.MAIN_MENU);
        });
    }
}
