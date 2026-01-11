import { GameState, GameSettings, LevelConfiguration, Direction, WordDefinition, LevelData } from '@/types';
import StorageManager from './StorageManager';
import AchievementManager from './AchievementManager';
import WordDataGenerator from '@/data/WordDataGenerator';
import { gridAlgorithm } from '@/utils/gridAlgorithm';
import { DAILY_REWARD_AMOUNT, DAILY_REWARD_STREAK_BONUS } from '@/utils/constants';

/**
 * Game Manager - Singleton
 * Oyunun merkezi mantığını ve state yönetimini sağlar.
 * Diğer manager'ları (Storage, Achievement, WordData) koordine eder.
 */
class GameManager {
    private static instance: GameManager;
    private gameState: GameState | null = null;

    // Daily reward için milisaniye
    private readonly ONE_DAY_MS = 24 * 60 * 60 * 1000;

    private constructor() {
        this.init();
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    /**
     * Oyunu başlatır ve state'i yükler
     */
    public init(): void {
        this.gameState = StorageManager.loadGameState();

        if (!this.gameState) {
            console.log('🆕 First time launch, creating new game state...');
            this.gameState = StorageManager.getDefaultGameState();
            StorageManager.saveGameState(this.gameState);
        } else {
            // Versiyon kontrolü vs. StorageManager içinde yapıldı zaten
            console.log('📂 Game state loaded');
        }

        // Streak kontrolü (günlük giriş)
        this.checkStreak();
    }

    /**
     * Oyunu kaydeder
     */
    public saveGame(): void {
        if (this.gameState) {
            StorageManager.saveGameState(this.gameState);
        }
    }

    /**
     * Oyunu sıfırlar (Reset)
     */
    public resetGame(): void {
        StorageManager.clearGameState();
        this.gameState = StorageManager.getDefaultGameState();
        this.saveGame();
        console.log('🔄 Game reset completed');
    }

    /**
     * Tüm oyun durumunu döndürür
     */
    public getGameState(): GameState | null {
        return this.gameState;
    }

    // --- AYARLAR ---

    public getSettings(): GameSettings {
        if (!this.gameState) return { language: 'tr', darkMode: false, soundEnabled: true, soundVolume: 1, vibrationEnabled: true, showHints: true };
        return this.gameState.settings;
    }

    public updateSettings(settings: GameSettings): void {
        if (!this.gameState) return;
        this.gameState.settings = settings;
        this.saveGame();
    }

    // --- STAR İŞLEMLERİ ---

    /**
     * Yıldız ekler (veya çıkarır)
     */
    public addStars(amount: number): void {
        if (!this.gameState) return;

        this.gameState.user.totalStars += amount;
        if (this.gameState.user.totalStars < 0) this.gameState.user.totalStars = 0;

        this.saveGame();
        this.checkAchievements();
    }

    /**
     * Yeterli yıldız var mı kontrolü (Hint veya Kilit açma için)
     */
    public hasEnoughStars(amount: number): boolean {
        return (this.gameState?.user.totalStars || 0) >= amount;
    }

    /**
     * Kategori kilit açma kontrolü
     */
    public canUnlockCategory(categoryId: string): boolean {
        if (!this.gameState) return false;

        const category = this.gameState.categories.find(c => c.id === categoryId);
        if (!category || !category.isLocked) return false; // Zaten açıksa false

        return this.gameState.user.totalStars >= category.requiredStars;
    }

    /**
     * Kategori kilidini açar
     */
    public unlockCategory(categoryId: string): boolean {
        if (!this.gameState) return false;

        const category = this.gameState.categories.find(c => c.id === categoryId);
        if (!category || !category.isLocked) return false;

        if (this.gameState.user.totalStars >= category.requiredStars) {
            // Yıldız düşmeli mi? Genelde harcanmaz, sadece eşik değerdir.
            // Proje analizine göre 'unlock with stars' genelde harcama gerektirir.
            // Ancak dokümanda net değil. Genelde harcanır.
            this.gameState.user.totalStars -= category.requiredStars;
            category.isLocked = false;
            this.saveGame();
            return true;
        }

        return false;
    }

    // --- LEVEL İŞLEMLERİ ---

    /**
     * Seviyeyi başlatır ve konfigürasyonu döndürür
     */
    public async startLevel(categoryId: string, levelNumber: number): Promise<LevelConfiguration | null> {
        if (!this.gameState) return null;

        // Kelime verisini yükle
        await WordDataGenerator.loadCategoryWords(categoryId);

        // Level konfigürasyonunu oluştur
        const rawConfig = WordDataGenerator.getLevelConfiguration(categoryId, levelNumber);

        // Play count artır
        const category = this.gameState.categories.find(c => c.id === categoryId);
        const level = category?.levels.find((l: LevelData) => l.levelNumber === levelNumber);

        if (level) {
            level.playCount++;
        }

        this.gameState.user.gamesPlayed++;
        this.gameState.user.lastPlayedDate = new Date().toISOString();
        this.saveGame();

        // Grid oluştur
        const result = gridAlgorithm.generateGrid(rawConfig.words, rawConfig.gridSize);

        if (!result.success) {
            console.warn('Grid generation failed, retrying or fallback');
        }

        return {
            words: result.placedWords, // WordDefinition[] with positions
            gridSize: rawConfig.gridSize,
            levelNumber,
            categoryId,
            letters: [], // No letters needed for Word Search
            difficulty: 1, // Default
            grid: result.grid
        };
    }

    /**
     * Seviye tamamlandığında çağrılır
     */
    public completeLevel(
        categoryId: string,
        levelNumber: number,
        earnedStars: number,
        timeSeconds: number
    ): void {
        if (!this.gameState) return;

        const category = this.gameState.categories.find(c => c.id === categoryId);
        if (!category) return;

        const level = category.levels.find(l => l.levelNumber === levelNumber);
        if (!level) return;

        // Level verilerini güncelle
        level.isCompleted = true;

        // Yıldızlar (Daha önce kazanılanlardan fazlaysa güncelle)
        if (earnedStars > level.earnedStars) {
            // Farkı toplam yıldıza ekle
            const diff = earnedStars - level.earnedStars;
            this.gameState.user.totalStars += diff;
            category.earnedStars += diff;
            level.earnedStars = earnedStars;
        }

        // Best time
        if (level.bestTime === null || timeSeconds < level.bestTime) {
            level.bestTime = timeSeconds;
        }

        // İlk deneme mi?
        if (level.wrongAttempts === 0 && level.playCount === 1) { // Bu playCount zaten startLevel'da arttı
            level.firstTryComplete = true;
        }

        // Update play time
        this.gameState.user.totalPlayTime += timeSeconds;

        // Unlock next level (if needed, but assuming sequential unlock by default or static levels)

        this.saveGame();
        this.checkAchievements();
    }

    /**
     * Mevcut aktif olması gereken seviyeyi döndürür (ilk tamamlanmamış)
     */
    public getCurrentLevel(categoryId: string): number {
        if (!this.gameState) return 1;

        const category = this.gameState.categories.find(c => c.id === categoryId);
        if (!category) return 1;

        // Tamamlanmamış ilk level
        const nextLevel = category.levels.find((l: LevelData) => !l.isCompleted);
        return nextLevel ? nextLevel.levelNumber : category.levels.length; // Hepsi bittiyse sonuncusu
    }

    // --- STATS & ACHIEVEMENTS ---

    public incrementWordsFound(): void {
        if (this.gameState) {
            this.gameState.user.totalWordsFound++;
            // Save game hemen yapmaya gerek yok, performans için, level sonunda yapılır.
        }
    }

    public incrementWrongAttempts(categoryId: string, levelNumber: number): void {
        if (!this.gameState) return;

        this.gameState.user.wrongAttempts++;

        const category = this.gameState.categories.find(c => c.id === categoryId);
        const level = category?.levels.find(l => l.levelNumber === levelNumber);
        if (level) {
            level.wrongAttempts++;
        }
    }

    public checkAchievements(): void {
        if (this.gameState) {
            AchievementManager.checkAchievements(this.gameState);
        }
    }

    // --- DAILY REWARD ---

    /**
     * Streak ve günlük ödül kontrolü
     */
    private checkStreak(): void {
        if (!this.gameState) return;

        const lastPlayed = new Date(this.gameState.user.lastPlayedDate);
        const now = new Date();

        // Gün farkı
        const diffTime = Math.abs(now.getTime() - lastPlayed.getTime());
        const diffDays = Math.floor(diffTime / this.ONE_DAY_MS);

        if (diffDays === 1) {
            // Ardışık gün, streak devam ediyor
            // Bu sadece played date update'inde artırılmalı, burası sadece kontrol
        } else if (diffDays > 1) {
            this.gameState.user.streakDays = 0;
            this.gameState.dailyReward.currentStreak = 0;
        }
    }

    /**
     * Günlük ödül alınabilir mi?
     */
    public canClaimDailyReward(): boolean {
        if (!this.gameState) return false;

        const lastClaimDateStr = this.gameState.dailyReward.lastClaimedDate;
        if (!lastClaimDateStr) return true; // Hiç alınmamışsa alınabilir

        const lastClaim = new Date(lastClaimDateStr);
        const now = new Date();

        // Basit gün kontrolü: Tarihler farklı günse true
        return lastClaim.getDate() !== now.getDate() ||
            lastClaim.getMonth() !== now.getMonth() ||
            lastClaim.getFullYear() !== now.getFullYear();
    }

    /**
     * Günlük ödülü alır
     */
    public claimDailyReward(): boolean {
        if (!this.canClaimDailyReward() || !this.gameState) return false;

        // Ödül ver
        const streak = this.gameState.dailyReward.currentStreak;
        let reward = DAILY_REWARD_AMOUNT;

        // Streak bonus (her 7 günde büyük ödül mantığı veya artan)
        // Burada basit: streak * 10 max 50 gibi
        // Veya sabit + streak * 5
        reward += Math.min(streak * DAILY_REWARD_STREAK_BONUS, 100);

        this.addStars(reward);

        // State güncelle
        this.gameState.dailyReward.lastClaimedDate = new Date().toISOString();
        this.gameState.dailyReward.currentStreak++;
        this.gameState.user.streakDays++; // User streak ile daily streak senkronize olmalı

        this.saveGame();
        return true;
    }
}

export default GameManager.getInstance(); // Export as singleton instance explicitly
