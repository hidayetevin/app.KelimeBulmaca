/**
 * Oyun Sabitleri ve Yapılandırma Değerleri
 */

// ==================== OYUN BOYUTLARI ====================
export const GAME_WIDTH = 375;
export const GAME_HEIGHT = 812;

// ==================== GRID AYARLARI ====================
export const GRID_CELL_SIZE = 60;
export const GRID_CELL_SPACING = 8;
export const GRID_CELL_BORDER_RADIUS = 8;
export const GRID_CELL_BORDER_WIDTH = 2;

// ==================== LETTER CIRCLE AYARLARI ====================
export const LETTER_CIRCLE_SIZE = 50;
export const LETTER_CIRCLE_SPACING = 12;
export const LETTER_CIRCLE_BORDER_WIDTH = 3;
export const LETTER_FONT_SIZE = 28;

// ==================== ANİMASYON SÜRELERİ (ms) ====================
export const ANIM_DURATION_FAST = 150;
export const ANIM_DURATION_NORMAL = 300;
export const ANIM_DURATION_SLOW = 500;
export const ANIM_DURATION_VERY_SLOW = 800;

// Özel animasyon süreleri
export const FADE_IN_DURATION = 300;
export const FADE_OUT_DURATION = 200;
export const SCALE_POPUP_DURATION = 400;
export const BOUNCE_DURATION = 500;
export const SHAKE_DURATION = 300;
export const PULSE_DURATION = 600;
export const SLIDE_DURATION = 350;
export const CONFETTI_DURATION = 2000;
export const STAR_COLLECT_DURATION = 800;
export const UNLOCK_ANIMATION_DURATION = 1000;
export const LETTER_HIGHLIGHT_DURATION = 200;
export const WORD_REVEAL_DURATION = 400;

// ==================== SES DOSYA YOLLARI ====================
export const AUDIO_PATHS = {
    // SFX
    LETTER_SELECT: 'assets/audio/sfx/letter_select.mp3',
    LETTER_DESELECT: 'assets/audio/sfx/letter_deselect.mp3',
    WORD_CORRECT: 'assets/audio/sfx/word_correct.mp3',
    WORD_WRONG: 'assets/audio/sfx/word_wrong.mp3',
    LEVEL_COMPLETE: 'assets/audio/sfx/level_complete.mp3',
    CATEGORY_COMPLETE: 'assets/audio/sfx/category_complete.mp3',
    ACHIEVEMENT_UNLOCK: 'assets/audio/sfx/achievement_unlock.mp3',
    STAR_COLLECT: 'assets/audio/sfx/star_collect.mp3',
    UNLOCK: 'assets/audio/sfx/unlock.mp3',
    BUTTON_CLICK: 'assets/audio/sfx/button_click.mp3',
    HINT_SHOW: 'assets/audio/sfx/hint_show.mp3',
} as const;

// ==================== GÖRSEL DOSYA YOLLARI ====================
export const IMAGE_PATHS = {
    // Backgrounds
    ANIMALS_BG: 'assets/images/backgrounds/animals_bg.webp',
    FRUITS_BG: 'assets/images/backgrounds/fruits_bg.webp',
    CITIES_BG: 'assets/images/backgrounds/cities_bg.webp',

    // UI
    BUTTON_LIGHT: 'assets/images/ui/button_light.png',
    BUTTON_DARK: 'assets/images/ui/button_dark.png',
    PANEL_LIGHT: 'assets/images/ui/panel_light.png',
    PANEL_DARK: 'assets/images/ui/panel_dark.png',
    STAR_FILLED: 'assets/images/ui/star_filled.png',
    STAR_EMPTY: 'assets/images/ui/star_empty.png',
    LOCK_ICON: 'assets/images/ui/lock_icon.png',

    // Icons
    SETTINGS: 'assets/images/icons/settings.png',
    ACHIEVEMENT: 'assets/images/icons/achievement.png',
    HINT: 'assets/images/icons/hint.png',
    CLOSE: 'assets/images/icons/close.png',
} as const;

// ==================== FONT AYARLARI ====================
export const FONT_FAMILY_PRIMARY = 'Poppins, Arial, sans-serif';
export const FONT_FAMILY_SECONDARY = 'Arial, sans-serif';

export const FONT_SIZES = {
    TINY: 12,
    SMALL: 14,
    NORMAL: 16,
    MEDIUM: 18,
    LARGE: 24,
    XL: 32,
    XXL: 48,
    HUGE: 64,
} as const;

// ==================== Z-INDEX DEĞERLERİ ====================
export const Z_INDEX = {
    BACKGROUND: 0,
    GRID: 10,
    LETTERS: 20,
    UI_BACKGROUND: 30,
    UI_ELEMENTS: 40,
    BUTTONS: 50,
    POPUP_OVERLAY: 900,
    POPUP_PANEL: 910,
    POPUP_CONTENT: 920,
    TOOLTIP: 1000,
    DEBUG: 10000,
} as const;

// ==================== OYUN MEKANIĞI SABITLERI ====================
export const MAX_WRONG_ATTEMPTS_FOR_HINT = 3; // 3 yanlış denemeden sonra ipucu sor
export const HINT_COST_STARS = 5; // Game Mechanics
export const HINT_COST = 50;
export const CATEGORY_UNLOCK_REQUIRED_STARS = 20; // 3. kategori için gereken yıldız

export const DAILY_REWARD_AMOUNT = 50;
export const DAILY_REWARD_STREAK_BONUS = 10;

// Günlük ödüller
export const DAILY_REWARDS = [
    { day: 1, stars: 5 },
    { day: 2, stars: 7 },
    { day: 3, stars: 10 },
    { day: 4, stars: 12 },
    { day: 5, stars: 15 },
    { day: 6, stars: 20 },
    { day: 7, stars: 30 }, // Haftalık bonus
] as const;

// ==================== REKLAM AYARLARI ====================
export const AD_COOLDOWN_SECONDS = 120; // Interstitial reklamlar arası minimum süre (2 dk)
export const REWARDED_AD_REWARD_STARS = 5; // Rewarded reklam ödülü

// Test AdMob IDs (Production'da değiştirilecek)
export const AD_IDS = {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
} as const;

// ==================== STORAGE KEYS ====================
export const STORAGE_KEY_GAME_STATE = 'word-master-game-state';
export const STORAGE_KEY_SETTINGS = 'word-master-settings';

// ==================== VERSİYON ====================
export const GAME_VERSION = '1.0.0';

// ==================== DİĞER SABITLER ====================
export const DEFAULT_LANGUAGE = 'tr' as const;
export const SUPPORTED_LANGUAGES = ['tr', 'en'] as const;

export const PARTICLE_COUNT = 30; // Konfeti efekti için
export const SHAKE_INTENSITY = 5; // Sallama efekti yoğunluğu (piksel)

// ==================== TİTREŞİM SÜRELERİ (ms) ====================
export const HAPTIC_DURATION = {
    LIGHT: 10,
    MEDIUM: 20,
    HEAVY: 30,
} as const;

// ==================== SCENE ADLARı ====================
export const SCENES = {
    BOOT: 'BootScene',
    PRELOADER: 'PreloaderScene',
    MAIN_MENU: 'MainMenuScene',
    LEVEL_SELECTION: 'LevelSelectionScene',
    GAME: 'GameScene',
    LEVEL_COMPLETE: 'LevelCompleteScene',
    CATEGORY_COMPLETE: 'CategoryCompleteScene',
    ACHIEVEMENT: 'AchievementScene',
    SETTINGS: 'SettingsScene',
    DAILY_REWARD: 'DailyRewardScene',
} as const;
