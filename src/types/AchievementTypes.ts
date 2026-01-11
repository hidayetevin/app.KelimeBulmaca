import { LocalizedString } from './GameTypes';

/**
 * Başarı rozeti kategorileri
 */
export enum AchievementCategory {
    BEGINNER = 'beginner',              // Başlangıç seviyesi başarılar
    STARS = 'stars',                    // Yıldız toplama başarıları
    SPEED = 'speed',                    // Hız odaklı başarılar
    COMPLETION = 'completion',          // Tamamlama odaklı başarılar
    STREAK = 'streak'                   // Süreklilik başarıları
}

/**
 * Başarı rozeti tanımı
 */
export interface Achievement {
    id: string;                         // Unique ID (örn: "first_win")
    name: LocalizedString;              // Başarı adı
    description: LocalizedString;       // Açıklama
    icon: string;                       // İkon (Emoji veya path)
    isUnlocked: boolean;                // Kilit açık mı
    unlockedDate: string | null;        // Açıldığı tarih (ISO 8601)
    progress: number;                   // Mevcut ilerleme değeri
    target: number;                     // Hedef değer
    category: AchievementCategory;      // Başarı kategorisi
    reward?: number;                    // Varsa ödül (yıldız miktarı)
}
