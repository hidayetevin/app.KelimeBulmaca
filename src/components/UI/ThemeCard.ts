import { Theme } from '@/types/ThemeTypes';
import ThemeManager from '@/managers/ThemeManager';
import LocalizationManager from '@/managers/LocalizationManager';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';

export default class ThemeCard extends Phaser.GameObjects.Container {
    private isUnlocked: boolean;
    private isActive: boolean;
    private theme: Theme;
    private onSelect: (id: string) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, theme: Theme, onSelect: (id: string) => void) {
        super(scene, x, y);

        this.theme = theme;
        this.onSelect = onSelect;
        this.isUnlocked = ThemeManager.isThemeUnlocked(theme.id);
        const currentTheme = ThemeManager.getCurrentTheme();
        this.isActive = currentTheme.id === theme.id;

        this.createCard();
        scene.add.existing(this);
    }

    private createCard() {
        const width = 320;
        const height = 100;
        const radius = 15;

        // Background colors for the current UI theme
        const uiColors = ThemeManager.getCurrentColors();

        // Card Border/Outer Shadow
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(0x000000, 0.2);
        shadow.fillRoundedRect(4, 4, width, height, radius);
        this.add(shadow);

        // Main Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(uiColors.primary);
        bg.lineStyle(2, this.isActive ? uiColors.accent : uiColors.secondary);
        bg.fillRoundedRect(0, 0, width, height, radius);
        bg.strokeRoundedRect(0, 0, width, height, radius);
        this.add(bg);

        // Preview Circles
        const colors = [
            this.theme.colors.background,
            this.theme.colors.accent,
            this.theme.colors.primary,
            this.theme.colors.textPrimary
        ];

        colors.forEach((color, index) => {
            const circle = this.scene.add.graphics();
            circle.fillStyle(color);
            circle.fillCircle(40 + (index * 25), height / 2, 10);
            circle.lineStyle(1, 0x000000, 0.2);
            circle.strokeCircle(40 + (index * 25), height / 2, 10);
            this.add(circle);
        });

        // Theme Name
        const name = this.scene.add.text(150, 30, LocalizationManager.t(`themes.${this.theme.id}.name`, this.theme.name.tr), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '18px',
            color: ThemeManager.getCurrentColors().textPrimary === 0x1A202C ? '#1A202C' : '#F1F5F9',
            fontStyle: 'bold'
        });
        this.add(name);

        // Price or Status
        let statusText = '';
        let statusColor = '#666666';

        if (this.isActive) {
            statusText = LocalizationManager.t('common.active', 'Aktif');
            statusColor = '#48BB78'; // Green
        } else if (this.isUnlocked) {
            statusText = LocalizationManager.t('common.use', 'Kullan');
            statusColor = '#4299E1'; // Blue
        } else {
            statusText = `⭐ ${this.theme.cost}`;
            statusColor = '#F6AD55'; // Orange
        }

        const statusLabel = this.scene.add.text(width - 20, height / 2, statusText, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '16px',
            color: statusColor,
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        this.add(statusLabel);

        // Interaction
        bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        bg.on('pointerdown', () => {
            if (this.onSelect) this.onSelect(this.theme.id);
        });

        // Hover effect
        bg.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(uiColors.secondary, 0.5);
            bg.lineStyle(3, uiColors.accent);
            bg.fillRoundedRect(0, 0, width, height, radius);
            bg.strokeRoundedRect(0, 0, width, height, radius);
            this.setScale(1.02);
        });

        bg.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(uiColors.primary);
            bg.lineStyle(2, this.isActive ? uiColors.accent : uiColors.secondary);
            bg.fillRoundedRect(0, 0, width, height, radius);
            bg.strokeRoundedRect(0, 0, width, height, radius);
            this.setScale(1);
        });
    }
}
