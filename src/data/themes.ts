import { Theme } from '@/types/ThemeTypes';
import { LIGHT_COLORS } from '@/utils/colors';

export const THEMES: Theme[] = [
    {
        id: 'default',
        name: { tr: 'Varsayılan', en: 'Default' },
        description: { tr: 'Sistem temasını takip eder (Açık/Koyu).', en: 'Follows system theme (Light/Dark).' },
        cost: 0,
        colors: {
            background: LIGHT_COLORS.BACKGROUND,
            primary: LIGHT_COLORS.PRIMARY,
            secondary: LIGHT_COLORS.SECONDARY,
            accent: LIGHT_COLORS.ACCENT,
            accentLight: LIGHT_COLORS.ACCENT_LIGHT,
            accentDark: LIGHT_COLORS.ACCENT_DARK,
            textPrimary: LIGHT_COLORS.TEXT_PRIMARY,
            textSecondary: LIGHT_COLORS.TEXT_SECONDARY,
            gridCellBg: LIGHT_COLORS.GRID_CELL_BG,
            gridCellBorder: LIGHT_COLORS.GRID_CELL_BORDER,
            letterCircleBg: LIGHT_COLORS.LETTER_CIRCLE_BG,
            letterCircleBorder: LIGHT_COLORS.LETTER_CIRCLE_BORDER,
            letterSelected: LIGHT_COLORS.LETTER_SELECTED,
            wordFound: LIGHT_COLORS.WORD_FOUND,
            wordHint: LIGHT_COLORS.WORD_HINT,
            buttonPrimary: LIGHT_COLORS.BUTTON_PRIMARY,
            buttonSecondary: LIGHT_COLORS.BUTTON_SECONDARY,
            panelBg: LIGHT_COLORS.PANEL_BG
        }
    },
    {
        id: 'ocean',
        name: { tr: 'Okyanus', en: 'Ocean' },
        description: { tr: 'Derin maviliklerin huzuru.', en: 'Peacer of the deep blue.' },
        cost: 100,
        colors: {
            background: 0xE0F2F1,
            primary: 0xFFFFFF,
            secondary: 0xB2DFDB,
            accent: 0x00796B,
            accentLight: 0x4DB6AC,
            accentDark: 0x004D40,
            textPrimary: 0x004D40,
            textSecondary: 0x00796B,
            gridCellBg: 0xFFFFFF,
            gridCellBorder: 0xB2DFDB,
            letterCircleBg: 0xFFFFFF,
            letterCircleBorder: 0x00796B,
            letterSelected: 0x00796B,
            wordFound: 0x43A047,
            wordHint: 0xFFA000,
            buttonPrimary: 0x00796B,
            buttonSecondary: 0xB2DFDB,
            panelBg: 0xFFFFFF
        }
    },
    {
        id: 'forest',
        name: { tr: 'Orman', en: 'Forest' },
        description: { tr: 'Doğanın yeşil dokunuşu.', en: 'The green touch of nature.' },
        cost: 150,
        colors: {
            background: 0xF1F8E9,
            primary: 0xFFFFFF,
            secondary: 0xDCEDC8,
            accent: 0x388E3C,
            accentLight: 0x81C784,
            accentDark: 0x1B5E20,
            textPrimary: 0x1B5E20,
            textSecondary: 0x388E3C,
            gridCellBg: 0xFFFFFF,
            gridCellBorder: 0xDCEDC8,
            letterCircleBg: 0xFFFFFF,
            letterCircleBorder: 0x388E3C,
            letterSelected: 0x388E3C,
            wordFound: 0x2E7D32,
            wordHint: 0xF9A825,
            buttonPrimary: 0x388E3C,
            buttonSecondary: 0xDCEDC8,
            panelBg: 0xFFFFFF
        }
    },
    {
        id: 'neon',
        name: { tr: 'Neon', en: 'Neon' },
        description: { tr: 'Canlı renkler ve siberpunk hava.', en: 'Vibrant colors and cyberpunk atmosphere.' },
        cost: 200,
        colors: {
            background: 0x0D0221,
            primary: 0x261447,
            secondary: 0x2DE2E6,
            accent: 0xFF3864,
            accentLight: 0xFF6B85,
            accentDark: 0xC72E48,
            textPrimary: 0x00F5FF,
            textSecondary: 0x2DE2E6,
            gridCellBg: 0x1A0B2E,
            gridCellBorder: 0x2DE2E6,
            letterCircleBg: 0x1A0B2E,
            letterCircleBorder: 0xFF3864,
            letterSelected: 0xFF3864,
            wordFound: 0x48BB78,
            wordHint: 0xF6AD55,
            buttonPrimary: 0xFF3864,
            buttonSecondary: 0x2DE2E6,
            panelBg: 0x1A0B2E
        }
    },
    {
        id: 'sunset',
        name: { tr: 'Gün Batımı', en: 'Sunset' },
        description: { tr: 'Sıcak turuncular ve morlar.', en: 'Warm oranges and purples.' },
        cost: 250,
        colors: {
            background: 0xFFF3E0,
            primary: 0xFFFFFF,
            secondary: 0xFFE0B2,
            accent: 0xE64A19,
            accentLight: 0xFF8A65,
            accentDark: 0xBF360C,
            textPrimary: 0x3E2723,
            textSecondary: 0x5D4037,
            gridCellBg: 0xFFFFFF,
            gridCellBorder: 0xFFE0B2,
            letterCircleBg: 0xFFFFFF,
            letterCircleBorder: 0xE64A19,
            letterSelected: 0xE64A19,
            wordFound: 0x48BB78,
            wordHint: 0xF6AD55,
            buttonPrimary: 0xE64A19,
            buttonSecondary: 0xFFE0B2,
            panelBg: 0xFFFFFF
        }
    }
];

export function getThemeById(id: string): Theme | undefined {
    return THEMES.find(t => t.id === id);
}
