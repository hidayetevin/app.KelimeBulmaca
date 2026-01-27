import { LocalizedString } from './GameTypes';

export interface ThemeColors {
    background: number;
    primary: number;
    secondary: number;
    accent: number;
    accentLight: number;
    accentDark: number;
    textPrimary: number;
    textSecondary: number;
    gridCellBg: number;
    gridCellBorder: number;
    letterCircleBg: number;
    letterCircleBorder: number;
    letterSelected: number;
    wordFound: number;
    wordHint: number;
    buttonPrimary: number;
    buttonSecondary: number;
    panelBg: number;
}

export interface Theme {
    id: string;
    name: LocalizedString;
    description: LocalizedString;
    cost: number;
    colors: ThemeColors;
    isPremium?: boolean; // Gelecekte reklamla açılanlar için
}
