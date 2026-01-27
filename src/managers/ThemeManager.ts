import { Theme, ThemeColors } from '@/types/ThemeTypes';
import { THEMES, getThemeById } from '@/data/themes';
import { LIGHT_COLORS, DARK_COLORS } from '@/utils/colors';
import GameManager from './GameManager';

class ThemeManager {
    private static instance: ThemeManager;

    private constructor() { }

    public static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }

    /**
     * Aktif temayı döndürür.
     */
    public getCurrentTheme(): Theme {
        const settings = GameManager.getSettings();
        const activeId = settings.activeThemeId || 'default';
        const theme = getThemeById(activeId);

        return theme || THEMES[0];
    }

    /**
     * Aktif temaya göre renk paletini döndürür.
     */
    public getCurrentColors(): ThemeColors {
        const theme = this.getCurrentTheme();

        // Eğer 'default' tema seçiliyse, darkMode ayarlarına göre renkleri döndür
        if (theme.id === 'default') {
            const isDark = GameManager.getSettings().darkMode;
            const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

            return {
                background: palette.BACKGROUND,
                primary: palette.PRIMARY,
                secondary: palette.SECONDARY,
                accent: palette.ACCENT,
                accentLight: palette.ACCENT_LIGHT,
                accentDark: palette.ACCENT_DARK,
                textPrimary: palette.TEXT_PRIMARY,
                textSecondary: palette.TEXT_SECONDARY,
                gridCellBg: palette.GRID_CELL_BG,
                gridCellBorder: palette.GRID_CELL_BORDER,
                letterCircleBg: palette.LETTER_CIRCLE_BG,
                letterCircleBorder: palette.LETTER_CIRCLE_BORDER,
                letterSelected: palette.LETTER_SELECTED,
                wordFound: palette.WORD_FOUND,
                wordHint: palette.WORD_HINT,
                buttonPrimary: palette.BUTTON_PRIMARY,
                buttonSecondary: palette.BUTTON_SECONDARY,
                panelBg: palette.PANEL_BG
            };
        }

        return theme.colors;
    }

    /**
     * Tema satın alınmış mı kontrol eder.
     */
    public isThemeUnlocked(id: string): boolean {
        if (id === 'default') return true;
        const state = GameManager.getGameState();
        return state?.unlockedThemeIds?.includes(id) || false;
    }

    /**
     * Tema satın alır.
     */
    public purchaseTheme(id: string): boolean {
        const theme = getThemeById(id);
        if (!theme) return false;

        const success = GameManager.spendStars(theme.cost);
        if (success) {
            const state = GameManager.getGameState();
            if (state) {
                if (!state.unlockedThemeIds) state.unlockedThemeIds = [];
                state.unlockedThemeIds.push(id);
                GameManager.saveGame();
            }
            return true;
        }

        return false;
    }

    /**
     * Temayı aktif eder.
     */
    public selectTheme(id: string): void {
        const settings = GameManager.getSettings();
        settings.activeThemeId = id;
        GameManager.updateSettings(settings);
    }
}

export default ThemeManager.getInstance();
