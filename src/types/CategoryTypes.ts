import { LocalizedString } from './GameTypes';

/**
 * Kategori verisi
 */
export interface CategoryData {
    id: string;                         // Unique ID (örn: "animals", "fruits")
    name: LocalizedString;              // Görünen isim
    icon: string;                       // Emoji veya ikon dosya yolu
    backgroundImage: string;            // Arka plan görseli yolu
    isLocked: boolean;                  // Kategori kilitli mi
    requiredStars: number;              // Kilidi açmak için gereken yıldız
    levels: LevelData[];                // Kategoriye ait seviyeler
    totalStars: number;                 // Kategorideki toplam kazanılabilir yıldız
    earnedStars: number;                // Kazanılmış toplam yıldız
}

/**
 * Seviye ilerleme verisi
 */
export interface LevelData {
    levelNumber: number;                // Seviye numarası (1-5)
    isCompleted: boolean;               // Tamamlandı mı
    foundWords: string[];               // Bulunan kelimeler listesi
    totalWords: number;                 // Toplam bulunması gereken kelime sayısı
    earnedStars: number;                // Bu seviyeden kazanılan yıldız
    maxStars: number;                   // Bu seviyeden kazanılabilecek max yıldız
    bestTime: number | null;            // En iyi bitirme süresi (saniye)
    playCount: number;                  // Oynanma sayısı
    wrongAttempts: number;              // Bu seviyedeki yanlış denemeler
    hintsUsed: number;                  // Bu seviyede kullanılan ipuçları
    firstTryComplete: boolean;          // İlk denemede mi tamamlandı (Achievement için)
}

/**
 * Kelimelerin yerleşim yönleri
 */
export enum Direction {
    HORIZONTAL = 'horizontal',          // Soldan sağa (→)
    VERTICAL = 'vertical',              // Yukarıdan aşağıya (↓)
    DIAGONAL_DOWN = 'diagonal_down',    // Sol üstten sağ alta (↘)
    DIAGONAL_UP = 'diagonal_up'         // Sol alttan sağ üste (↗)
}

/**
 * Grid üzerindeki pozisyon
 */
export interface Position {
    row: number;
    col: number;
}

/**
 * Grid boyutları
 */
export interface GridSize {
    rows: number;
    cols: number;
}

/**
 * Grid hücresi
 */
export interface GridCell {
    letter: string;                     // Hücredeki harf
    row: number;
    col: number;
    isRevealed: boolean;                // Kelime bulundu mu (gösterilsin mi)
    isHinted: boolean;                  // İpucu olarak mı açıldı
    wordIds: string[];                  // Bu hücreden geçen kelimelerin ID'leri (veya metinleri)
}

/**
 * Kelime tanımı
 */
export interface WordDefinition {
    text: string;                       // Kelime metni (Büyük harf)
    direction: Direction;               // Yerleşim yönü
    startPos: Position;                 // Başlangıç hücresi
    endPos: Position;                   // Bitiş hücresi
    isFound: boolean;                   // Oyun sırasında bulunduğu işaretlenir
    hintLettersShown: number;           // Kaç harf ipucu verildi
}

/**
 * Seviye konfigürasyonu (JSON'dan yüklenecek yapı)
 */
export interface LevelConfiguration {
    categoryId: string;                 // Bağlı olduğu kategori ID
    levelNumber: number;                // Seviye no
    gridSize: GridSize;                 // Grid boyutu (örn: 3x3)
    words: WordDefinition[];            // Bulunacak kelimeler
    letters: string[];                  // Alt dairede gösterilecek unique harfler
    difficulty: number;                 // Zorluk seviyesi (1-5)
}
