/**
 * Oyunun ana state yapısını tanımlar.
 * Tüm oyun verileri bu interface üzerinde tutulur.
 */
export interface GameState {
    version: string;                    // "1.0.0" formatında versiyon
    user: UserData;                     // Kullanıcı istatistikleri
    categories: Category[];         // Kategori ve seviye ilerlemeleri
    achievements: Achievement[];        // Başarı rozetleri durumu
    settings: GameSettings;             // Oyun ayarları
    dailyReward: DailyRewardData;       // Günlük ödül durumu
}

// ==================== WORD CONNECT / CROSSWORD TYPES ====================

export interface CrosswordLevelConfig {
    levelNumber: number;
    palette: string[];              // Available letters (e.g., ["U", "Z", "A", "K", "L", "I"])
    words: CrosswordWord[];         // Target words to find
    gridSize: GridSize;
    layout: CrosswordLayout;        // Grid structure
}

export interface CrosswordWord {
    id: number;
    text: string;
    startRow: number;
    startCol: number;
    direction: 'horizontal' | 'vertical';
    clue?: string;
    isFound: boolean;
}

export interface CrosswordLayout {
    cells: CrosswordCellData[][];
}

export interface CrosswordCellData {
    isActive: boolean;              // false for black/inactive cells
    letter?: string;                // filled letter (when word is found)
    wordIds: number[];              // which word(s) use this cell
    row: number;
    col: number;
}

/**
 * Kullanıcının genel oyun istatistikleri
 */
export interface UserData {
    userId: string;                     // UUID
    totalStars: number;                 // Toplam kazanılan yıldız
    totalWordsFound: number;            // Toplam bulunan kelime
    gamesPlayed: number;                // Oynanan toplam oyun sayısı
    lastPlayedDate: string;             // ISO 8601 tarih formatı
    streakDays: number;                 // Aralıksız oynama serisi
    totalPlayTime: number;              // Toplam oyun süresi (saniye)
    wrongAttempts: number;              // Toplam yanlış deneme sayısı
    hintsUsed: number;                  // Toplam kullanılan ipucu sayısı
    adsWatched: number;                 // İzlenen toplam reklam sayısı
}

/**
 * Oyun ayarları
 */
export interface GameSettings {
    language: 'tr' | 'en';              // Dil seçimi
    darkMode: boolean;                  // Karanlık mod aktif mi
    soundEnabled: boolean;              // Ses efektleri açık mı
    soundVolume: number;                // Ses seviyesi (0.0 - 1.0)
    vibrationEnabled: boolean;          // Titreşim açık mı
    showHints: boolean;                 // Öğretici ipuçları gösterilsin mi
}

/**
 * Günlük ödül verileri
 */
export interface DailyRewardData {
    lastClaimedDate: string | null;     // Son ödül alınan tarih (ISO 8601)
    currentStreak: number;              // Mevcut seri (1-7 gün)
    totalClaimed: number;               // Toplam alınan ödül sayısı
}

/**
 * Çoklu dil metin yapısı
 */
export interface LocalizedString {
    tr: string;
    en: string;
}
