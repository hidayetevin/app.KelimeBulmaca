/**
 * Renk Sistemi ve Yardımcı Fonksiyonlar
 * Light ve Dark mode için renk paletleri
 */

/**
 * Light Mode Renk Paleti
 */
export const LIGHT_COLORS = {
    // Arka planlar
    BACKGROUND: 0xF5F7FA,
    PRIMARY: 0xFFFFFF,
    SECONDARY: 0xE2E8F0,
    SURFACE: 0xFFFFFF,
    TEXT_DARK: 0x1A202C,
    TEXT_LIGHT: 0x718096,

    // Accent renkler
    ACCENT: 0x6C63FF,
    ACCENT_LIGHT: 0x9B94FF,
    ACCENT_DARK: 0x4A42D4,

    // Metin renkleri
    TEXT_PRIMARY: 0x1A202C,
    TEXT_SECONDARY: 0x4A5568,
    TEXT_DISABLED: 0xA0AEC0,

    // Durum renkleri
    SUCCESS: 0x48BB78,
    WARNING: 0xF6AD55,
    ERROR: 0xF56565,
    INFO: 0x4299E1,

    // Grid ve oyun elemanları
    GRID_CELL_BG: 0xFFFFFF,
    GRID_CELL_BORDER: 0xE2E8F0,
    LETTER_CIRCLE_BG: 0xFFFFFF,
    LETTER_CIRCLE_BORDER: 0x6C63FF,
    LETTER_SELECTED: 0x6C63FF,
    WORD_FOUND: 0x48BB78,
    WORD_HINT: 0xF6AD55,

    // UI elemanları
    BUTTON_PRIMARY: 0x6C63FF,
    BUTTON_SECONDARY: 0xE2E8F0,
    BUTTON_DANGER: 0xF56565,
    PANEL_BG: 0xFFFFFF,
    PANEL_SHADOW: 0x00000040, // Alpha 0.25
    OVERLAY: 0x00000080, // Alpha 0.5

    // Yıldız ve başarılar
    STAR_FILLED: 0xFBD38D,
    STAR_EMPTY: 0xE2E8F0,
    ACHIEVEMENT_LOCKED: 0xCBD5E0,
    ACHIEVEMENT_UNLOCKED: 0x6C63FF,
} as const;

/**
 * Dark Mode Renk Paleti
 */
export const DARK_COLORS = {
    // Arka planlar
    BACKGROUND: 0x0F172A,
    PRIMARY: 0x1E293B,
    SECONDARY: 0x334155,

    // Accent renkler
    ACCENT: 0xE94560,
    ACCENT_LIGHT: 0xFF6B85,
    ACCENT_DARK: 0xC72E48,

    // Metin renkleri
    TEXT_PRIMARY: 0xF1F5F9,
    TEXT_SECONDARY: 0xCBD5E1,
    TEXT_DISABLED: 0x64748B,

    // Durum renkleri
    SUCCESS: 0x34D399,
    WARNING: 0xFBBF24,
    ERROR: 0xF87171,
    INFO: 0x60A5FA,

    // Grid ve oyun elemanları
    GRID_CELL_BG: 0x1E293B,
    GRID_CELL_BORDER: 0x334155,
    LETTER_CIRCLE_BG: 0x1E293B,
    LETTER_CIRCLE_BORDER: 0xE94560,
    LETTER_SELECTED: 0xE94560,
    WORD_FOUND: 0x34D399,
    WORD_HINT: 0xFBBF24,

    // UI elemanları
    BUTTON_PRIMARY: 0xE94560,
    BUTTON_SECONDARY: 0x334155,
    BUTTON_DANGER: 0xF87171,
    PANEL_BG: 0x1E293B,
    PANEL_SHADOW: 0x00000060, // Alpha 0.375
    OVERLAY: 0x00000099, // Alpha 0.6

    // Yıldız ve başarılar
    STAR_FILLED: 0xFBBF24,
    STAR_EMPTY: 0x334155,
    ACHIEVEMENT_LOCKED: 0x475569,
    ACHIEVEMENT_UNLOCKED: 0xE94560,
} as const;

/**
 * Renk Yardımcı Fonksiyonları
 */

/**
 * HEX string'i Phaser sayı formatına çevirir
 * @param hex - '#FF00FF' veya 'FF00FF' formatında hex renk
 * @returns Phaser color number (0xFFFFFF)
 */
export function hexToNumber(hex: string): number {
    const cleanHex = hex.replace('#', '');
    return parseInt(cleanHex, 16);
}

/**
 * Phaser sayı formatını HEX string'e çevirir
 * @param color - Phaser color number
 * @returns '#FFFFFF' formatında hex string
 */
export function numberToHex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0').toUpperCase();
}

/**
 * RGB değerlerini Phaser sayı formatına çevirir
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Phaser color number
 */
export function rgbToNumber(r: number, g: number, b: number): number {
    return (r << 16) + (g << 8) + b;
}

/**
 * Phaser sayı formatını RGB'ye çevirir
 * @param color - Phaser color number
 * @returns { r, g, b } object
 */
export function numberToRgb(color: number): { r: number; g: number; b: number } {
    return {
        r: (color >> 16) & 0xFF,
        g: (color >> 8) & 0xFF,
        b: color & 0xFF,
    };
}

/**
 * Rengi belirli bir alpha ile döndürür (CSS formatında)
 * @param color - Phaser color number
 * @param alpha - Alpha değeri (0.0 - 1.0)
 * @returns 'rgba(r, g, b, a)' string
 */
export function colorWithAlpha(color: number, alpha: number): string {
    const { r, g, b } = numberToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * İki rengi karıştırır
 * @param color1 - İlk renk
 * @param color2 - İkinci renk
 * @param ratio - Karışım oranı (0.0 = tamamen color1, 1.0 = tamamen color2)
 * @returns Karışık renk
 */
export function blendColors(color1: number, color2: number, ratio: number): number {
    const rgb1 = numberToRgb(color1);
    const rgb2 = numberToRgb(color2);

    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);

    return rgbToNumber(r, g, b);
}

/**
 * Rengi koyulaştırır
 * @param color - Orijinal renk
 * @param amount - Koyulaştırma miktarı (0.0 - 1.0)
 * @returns Koyulaştırılmış renk
 */
export function darkenColor(color: number, amount: number): number {
    return blendColors(color, 0x000000, amount);
}

/**
 * Rengi açar
 * @param color - Orijinal renk
 * @param amount - Açma miktarı (0.0 - 1.0)
 * @returns Açılmış renk
 */
export function lightenColor(color: number, amount: number): number {
    return blendColors(color, 0xFFFFFF, amount);
}
