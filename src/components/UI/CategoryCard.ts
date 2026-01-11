import Phaser from 'phaser';
import { LIGHT_COLORS } from '@/utils/colors';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { CategoryData } from '@/types/CategoryTypes';
import LocalizationManager from '@/managers/LocalizationManager';

interface CategoryCardConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    category: CategoryData;
    onPress: () => void;
}

export default class CategoryCard extends Phaser.GameObjects.Container {
    private category: CategoryData;
    private config: CategoryCardConfig;
    private colors = LIGHT_COLORS;

    constructor(config: CategoryCardConfig) {
        super(config.scene, config.x, config.y);
        this.config = config;
        this.category = config.category;

        this.scene.add.existing(this);
        this.createContent();
    }

    private createContent() {
        const w = this.config.width;
        const h = this.config.height;
        const radius = 16;
        const isLocked = this.category.isLocked;

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(isLocked ? 0xE2E8F0 : this.colors.SURFACE, 1);
        bg.lineStyle(2, 0xCBD5E0, 1);

        // Shadow (Simple offset rect or texture)
        // this.scene.add.rectangle(4, 4, w, h, 0x000000, 0.1).setOrigin(0.5); // Add if needed outside

        bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
        this.add(bg);

        // Interactive Hit Area
        const hitArea = this.scene.add.rectangle(0, 0, w, h, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => {
            this.setScale(0.98);
        });
        hitArea.on('pointerup', () => {
            this.setScale(1);
            this.config.onPress();
        });
        hitArea.on('pointerout', () => {
            this.setScale(1);
        });
        this.add(hitArea);

        // Content Position
        const contentX = -w / 2 + 20;

        // Icon / Thumbnail placeholder (Circle)
        const iconBg = this.scene.add.graphics();
        iconBg.fillStyle(isLocked ? 0xCBD5E0 : this.colors.PRIMARY, 1);
        iconBg.fillCircle(contentX + 30, 0, 30);
        this.add(iconBg);

        // Icon Text (First letter of name)
        // Use Localization
        const nameKey = `category.${this.category.id}`; // e.g. category.animals
        const defaultName = this.category.id.toUpperCase();
        // Assuming LocalizationManager handles keys well, otherwise fallback
        // Since we don't have keys in tr.json yet for categories, let's use id directly or generic function.
        // But types.CategoryData doesn't have localized name map (yet?). 
        // We will assume ID is readable or check Localization.

        // In types.GameTypes: CategoryData has id.
        // Let's use generic text.
        const name = LocalizationManager.t(nameKey, defaultName);
        const initial = name.charAt(0).toUpperCase();

        const iconText = this.scene.add.text(contentX + 30, 0, isLocked ? '🔒' : initial, {
            fontSize: '28px',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.add(iconText);

        // Title and Info
        const textStart = contentX + 80;

        // Title
        const titleColor = isLocked ? '#' + this.colors.TEXT_LIGHT.toString(16).padStart(6, '0') : '#' + this.colors.TEXT_DARK.toString(16).padStart(6, '0');
        const title = this.scene.add.text(textStart, -15, name, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '22px',
            color: titleColor,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add(title);

        // Subtitle (Levels or Cost)
        if (isLocked) {
            const cost = this.category.requiredStars;
            const costText = this.scene.add.text(textStart, 15, `${cost} ⭐ Gerekli`, {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '16px',
                color: '#F6AD55', // Gold
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            this.add(costText);
        } else {
            // Level progress
            const totalLevels = this.category.levels.length;
            const completedLevels = this.category.levels.filter((l: any) => l.isCompleted).length;

            const progressText = this.scene.add.text(textStart, 15, `${completedLevels}/${totalLevels} Seviye`, {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '16px',
                color: '#' + this.colors.TEXT_LIGHT.toString(16).padStart(6, '0')
            }).setOrigin(0, 0.5);
            this.add(progressText);

            // Completion Badge if done
            if (completedLevels === totalLevels && totalLevels > 0) {
                const badge = this.scene.add.text(w / 2 - 20, 0, '🏆', { fontSize: '24px' }).setOrigin(1, 0.5);
                this.add(badge);
            } else {
                // Play Icon
                const playIcon = this.scene.add.text(w / 2 - 30, 0, '▶', {
                    fontSize: '24px',
                    color: '#' + this.colors.PRIMARY.toString(16).padStart(6, '0')
                }).setOrigin(1, 0.5);
                this.add(playIcon);
            }
        }
    }
}
