import Phaser from 'phaser';
import { LIGHT_COLORS } from '@/utils/colors';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { Achievement } from '@/types';

interface AchievementCardConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    achievement: Achievement;
}

export default class AchievementCard extends Phaser.GameObjects.Container {
    private achievement: Achievement;
    private config: AchievementCardConfig;
    private colors = LIGHT_COLORS;

    constructor(config: AchievementCardConfig) {
        super(config.scene, config.x, config.y);
        this.config = config;
        this.achievement = config.achievement;

        this.scene.add.existing(this);
        this.createContent();
    }

    private createContent() {
        const w = this.config.width;
        const h = this.config.height;
        const radius = 16;
        const isUnlocked = this.achievement.isUnlocked;

        // Background
        const bg = this.scene.add.graphics();
        if (isUnlocked) {
            bg.fillStyle(this.colors.SURFACE, 1);
            bg.lineStyle(2, this.colors.SUCCESS, 1);
        } else {
            bg.fillStyle(0xE2E8F0, 1); // Gray-ish
            bg.lineStyle(2, 0xCBD5E0, 1);
        }
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
        this.add(bg);

        // Icon (Emoji or Sprite)
        const iconContainer = this.scene.add.container(-w / 2 + 40, 0);

        const iconBg = this.scene.add.graphics();
        iconBg.fillStyle(isUnlocked ? 0xFFF5F0 : 0xEDF2F7, 1); // Unlock: Light orange, Lock: Light gray
        iconBg.fillCircle(0, 0, 24);
        iconContainer.add(iconBg);

        const iconText = this.scene.add.text(0, 0, this.achievement.icon, {
            fontSize: '24px'
        }).setOrigin(0.5);
        if (!isUnlocked) iconText.setAlpha(0.5);
        iconContainer.add(iconText);

        this.add(iconContainer);

        // Text Content
        const textX = -w / 2 + 80;

        // Title
        const title = this.scene.add.text(textX, -20, this.achievement.title, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '18px',
            color: isUnlocked ? this.colors.TEXT_DARK : this.colors.TEXT_LIGHT,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add(title);

        // Description
        const desc = this.scene.add.text(textX, 5, this.achievement.description, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '14px',
            color: this.colors.TEXT_LIGHT,
            wordWrap: { width: w - 100 }
        }).setOrigin(0, 0);
        this.add(desc);

        // Progress Bar (if not unlocked)
        if (!isUnlocked) {
            const barW = w - 100;
            const barH = 6;
            const barY = h / 2 - 20;
            const barX = textX;

            const progress = Phaser.Math.Clamp(this.achievement.progress / this.achievement.targetValue, 0, 1);

            const track = this.scene.add.graphics();
            track.fillStyle(0xCBD5E0, 1);
            track.fillRoundedRect(barX, barY, barW, barH, 3);
            this.add(track);

            if (progress > 0) {
                const fill = this.scene.add.graphics();
                fill.fillStyle(this.colors.PRIMARY, 1);
                fill.fillRoundedRect(barX, barY, barW * progress, barH, 3);
                this.add(fill);
            }

            // Text Progress
            const progText = this.scene.add.text(w / 2 - 20, barY + 3, `${this.achievement.progress}/${this.achievement.targetValue}`, {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '10px',
                color: this.colors.TEXT_LIGHT
            }).setOrigin(1, 0);
            this.add(progText);
        } else {
            // Reward Badge if unlocked
            // or "Completed" text
            const completedText = this.scene.add.text(w / 2 - 20, h / 2 - 20, 'TAMAMLANDI', {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '12px',
                color: this.colors.SUCCESS,
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            this.add(completedText);
        }

        // Reward Value Display
        const rewardText = this.scene.add.text(w / 2 - 20, -h / 2 + 20, `+${this.achievement.reward} ⭐`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '14px',
            color: '#F6AD55', // Gold
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        this.add(rewardText);
    }
}
