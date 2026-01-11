import { GameState, CategoryData, LevelData, Achievement, AchievementCategory } from '@/types';
import { STORAGE_KEY_GAME_STATE, GAME_VERSION, CATEGORY_UNLOCK_REQUIRED_STARS } from '@/utils/constants';

/**
 * Storage Manager - Singleton
 * Oyun verilerini localStorage'da saklar ve yükler
 */
class StorageManager {
    private static instance: StorageManager;

    private constructor() {
        // Singleton pattern
    }

    /**
     * Singleton instance'ı döndürür
     */
    public static getInstance(): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    /**
     * Oyun durumunu localStorage'a kaydeder
     * @param state - Kaydedilecek oyun durumu
     */
    public saveGameState(state: GameState): void {
        try {
            const serialized = JSON.stringify(state);
            localStorage.setItem(STORAGE_KEY_GAME_STATE, serialized);
            console.log('✅ Game state saved successfully');
        } catch (error) {
            console.error('❌ Error saving game state:', error);
            // Quota exceeded veya diğer hatalar için fallback
            this.handleStorageError(error);
        }
    }

    /**
     * localStorage'dan oyun durumunu yükler
     * @returns Kaydedilmiş oyun durumu veya null
     */
    public loadGameState(): GameState | null {
        try {
            const serialized = localStorage.getItem(STORAGE_KEY_GAME_STATE);

            if (!serialized) {
                console.log('ℹ️ No saved game state found');
                return null;
            }

            const state = JSON.parse(serialized) as GameState;

            // Versiyon kontrolü ve migration
            if (state.version !== GAME_VERSION) {
                console.log(`⚠️ Version mismatch: ${state.version} -> ${GAME_VERSION}`);
                return this.migrateGameState(state);
            }

            console.log('✅ Game state loaded successfully');
            return state;
        } catch (error) {
            console.error('❌ Error loading game state:', error);
            return null;
        }
    }

    /**
     * Oyun durumunu siler (reset için)
     */
    public clearGameState(): void {
        try {
            localStorage.removeItem(STORAGE_KEY_GAME_STATE);
            console.log('✅ Game state cleared');
        } catch (error) {
            console.error('❌ Error clearing game state:', error);
        }
    }

    /**
     * Varsayılan (yeni) oyun durumu oluşturur
     * @returns Yeni oyun durumu
     */
    public getDefaultGameState(): GameState {
        const userId = this.generateUUID();
        const now = new Date().toISOString();

        // Varsayılan kategoriler
        const categories: CategoryData[] = [
            {
                id: 'animals',
                name: { tr: 'Hayvanlar', en: 'Animals' },
                icon: '🐾',
                backgroundImage: 'assets/images/backgrounds/animals_bg.webp',
                isLocked: false,
                requiredStars: 0,
                levels: this.createDefaultLevels(),
                totalStars: 30, // 5 level * 6 ortalama kelime
                earnedStars: 0,
            },
            {
                id: 'fruits',
                name: { tr: 'Meyveler', en: 'Fruits' },
                icon: '🍎',
                backgroundImage: 'assets/images/backgrounds/fruits_bg.webp',
                isLocked: false,
                requiredStars: 0,
                levels: this.createDefaultLevels(),
                totalStars: 30,
                earnedStars: 0,
            },
            {
                id: 'cities',
                name: { tr: 'Şehirler', en: 'Cities' },
                icon: '🏙️',
                backgroundImage: 'assets/images/backgrounds/cities_bg.webp',
                isLocked: true,
                requiredStars: CATEGORY_UNLOCK_REQUIRED_STARS, // 20 yıldız
                levels: this.createDefaultLevels(),
                totalStars: 30,
                earnedStars: 0,
            },
        ];

        // Varsayılan başarılar
        const achievements: Achievement[] = this.createDefaultAchievements();

        const defaultState: GameState = {
            version: GAME_VERSION,
            user: {
                userId,
                totalStars: 0,
                totalWordsFound: 0,
                gamesPlayed: 0,
                lastPlayedDate: now,
                streakDays: 0,
                totalPlayTime: 0,
                wrongAttempts: 0,
                hintsUsed: 0,
                adsWatched: 0,
            },
            categories,
            achievements,
            settings: {
                language: 'tr',
                darkMode: true,
                soundEnabled: true,
                soundVolume: 0.7,
                vibrationEnabled: true,
                showHints: true,
            },
            dailyReward: {
                lastClaimedDate: null,
                currentStreak: 0,
                totalClaimed: 0,
            },
        };

        return defaultState;
    }

    /**
     * 5 boş seviye oluşturur
     */
    private createDefaultLevels(): LevelData[] {
        const levels: LevelData[] = [];

        // Her kategoride 5 seviye
        const levelWordCounts = [4, 5, 6, 7, 8]; // Level 1-5

        for (let i = 0; i < 5; i++) {
            levels.push({
                levelNumber: i + 1,
                isCompleted: false,
                foundWords: [],
                totalWords: levelWordCounts[i],
                earnedStars: 0,
                maxStars: levelWordCounts[i],
                bestTime: null,
                playCount: 0,
                wrongAttempts: 0,
                hintsUsed: 0,
                firstTryComplete: false,
            });
        }

        return levels;
    }

    /**
     * Varsayılan başarıları oluşturur
     */
    private createDefaultAchievements(): Achievement[] {
        return [
            // BEGINNER
            {
                id: 'first_step',
                name: { tr: 'İlk Adım', en: 'First Step' },
                description: { tr: 'İlk seviyeyi tamamla', en: 'Complete first level' },
                icon: '🏆',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 1,
                category: AchievementCategory.BEGINNER,
                reward: 5,
            },
            {
                id: 'word_finder',
                name: { tr: 'Kelime Avcısı', en: 'Word Hunter' },
                description: { tr: '10 kelime bul', en: 'Find 10 words' },
                icon: '🔍',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 10,
                category: AchievementCategory.BEGINNER,
            },

            // STARS
            {
                id: 'star_collector_50',
                name: { tr: 'Yıldız Toplayıcı', en: 'Star Collector' },
                description: { tr: '50 yıldız topla', en: 'Collect 50 stars' },
                icon: '💫',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 50,
                category: AchievementCategory.STARS,
                reward: 10,
            },
            {
                id: 'star_collector_100',
                name: { tr: 'Yıldız Dehası', en: 'Star Genius' },
                description: { tr: '100 yıldız topla', en: 'Collect 100 stars' },
                icon: '🌟',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 100,
                category: AchievementCategory.STARS,
                reward: 20,
            },

            // COMPLETION
            {
                id: 'perfect_memory',
                name: { tr: 'Mükemmel Hafıza', en: 'Perfect Memory' },
                description: { tr: 'Bir seviyeyi ilk denemede tamamla', en: 'Complete level first try' },
                icon: '⭐',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 1,
                category: AchievementCategory.COMPLETION,
            },
            {
                id: 'category_master',
                name: { tr: 'Kategori Ustası', en: 'Category Master' },
                description: { tr: 'Bir kategorinin tüm seviyelerini tamamla', en: 'Complete all category levels' },
                icon: '🎯',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 1,
                category: AchievementCategory.COMPLETION,
                reward: 15,
            },
            {
                id: 'all_categories',
                name: { tr: 'Efsane Oyuncu', en: 'Legend' },
                description: { tr: 'Tüm kategorileri tamamla', en: 'Complete all categories' },
                icon: '👑',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 3,
                category: AchievementCategory.COMPLETION,
                reward: 50,
            },

            // SPEED
            {
                id: 'speed_demon',
                name: { tr: 'Hızlı Eller', en: 'Speed Demon' },
                description: { tr: 'Bir kelimeyi 5 saniyede bul', en: 'Find word in 5 seconds' },
                icon: '⚡',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 1,
                category: AchievementCategory.SPEED,
            },

            // STREAK
            {
                id: 'three_day_streak',
                name: { tr: 'Sadık Oyuncu', en: 'Loyal Player' },
                description: { tr: '3 gün üst üste oyna', en: 'Play 3 days in row' },
                icon: '🔥',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 3,
                category: AchievementCategory.STREAK,
                reward: 10,
            },
            {
                id: 'week_streak',
                name: { tr: 'Haftalık Şampiyon', en: 'Weekly Champion' },
                description: { tr: '7 gün üst üste oyna', en: 'Play 7 days in row' },
                icon: '🏅',
                isUnlocked: false,
                unlockedDate: null,
                progress: 0,
                target: 7,
                category: AchievementCategory.STREAK,
                reward: 25,
            },
        ];
    }

    /**
     * UUID (v4) üretir
     */
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Storage hatalarını yönetir
     */
    private handleStorageError(error: unknown): void {
        if (error instanceof DOMException) {
            if (error.name === 'QuotaExceededError') {
                console.error('💾 Storage quota exceeded. Clearing old data...');
                // Eski verileri temizle (gelecekte implement edilecek)
            }
        }
    }

    /**
     * Eski versiyon verilerini yeni versiyona migrate eder
     * @param oldState - Eski versiyon state
     * @returns Migrate edilmiş state
     */
    private migrateGameState(oldState: GameState): GameState {
        console.log('🔄 Migrating game state...');

        // Şimdilik basit migration: yeni default state döndür ama user verisini koru
        const newState = this.getDefaultGameState();

        // Eski user verilerini koru (eğer varsa)
        if (oldState.user) {
            newState.user = {
                ...newState.user,
                ...oldState.user,
            };
        }

        // Versiyonu güncelle
        newState.version = GAME_VERSION;

        console.log('✅ Migration completed');
        return newState;
    }
}

// Export singleton instance
export default StorageManager.getInstance();
