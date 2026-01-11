import { GameState, GameSettings, LevelConfiguration, Direction } from '@/types';
import StorageManager from './StorageManager';
import AchievementManager from './AchievementManager';
import WordDataGenerator from '@/data/WordDataGenerator';
import { gridAlgorithm } from '@/utils/GridAlgorithm';
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
        const config = WordDataGenerator.getLevelConfiguration(categoryId, levelNumber);

        // Play count artır
        const category = this.gameState.categories.find(c => c.id === categoryId);
        const level = category?.levels.find((l: any) => l.levelNumber === levelNumber);

        if (level) {
            level.playCount++;
        }

        this.gameState.user.gamesPlayed++;
        this.gameState.user.lastPlayedDate = new Date().toISOString();
        this.saveGame();

        // Grid algoritmasını çalıştırarak kelime pozisyonlarını belirle
        // Ancak henüz grid display yok, sadece data dönüyoruz.
        // LevelConfiguration tipi WordDefinition[] istiyor olabilir veya string[]
        // Types'a bakarsak: LevelConfiguration -> words: WordDefinition[]
        // WordDataGenerator -> words: string[]
        // Bu yüzden burada GridAlgorithm kullanarak kelimeleri yerleştirmeli ve WordDefinition üretmeliyiz.

        // Şimdilik basitçe string[] -> WordDefinition[] dönüşümü yapalım (GridAlgorithm 16. adımda entegre edilecek)
        // Veya types'ı güncelleyelim.
        // Type definition'a bakmak lazım, eğer WordDefinition[] ise GridAlgorithm şart.
        // Ancak burada basit mapper yapalım.

        const wordsDef = config.words.map(w => ({
            text: w,
            direction: Direction.HORIZONTAL, // Placeholder: Direction enum import edilmeli
            startPos: { row: 0, col: 0 }, // Placeholder
            endPos: { row: 0, col: 0 },
            isFound: false,
            hintLettersShown: 0
        }));

        return {
            words: wordsDef,
            gridSize: config.gridSize,
            levelNumber,
            categoryId,
            letters: [], // Placeholder for letters array
            difficulty: 1 // Default difficulty (1: Easy)
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

        // Sonraki leveli aç (Eğer dinamik level açma varsa, şu an hepsi açık varsayılıyor defaultState içinde)
        // Ancak createDefaultLevels içinde isCompleted false, sadece levelNumber var, kilit mekanizması level bazlı yok, sequential oynanış var.

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
        const nextLevel = category.levels.find(l => !l.isCompleted);
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
            // Streak bozuldu
            this.gameState.user.streakDays = 0;
            this.gameState.dailyReward.currentStreak = 0;
        }

        // Streak artırma işlemi aslında günlük ödül alındığında veya ilk oyunda yapılmalı.
        // Basitlik için oyun her açıldığında diffDays >= 1 ise daily reward claimable yapılır.
    }

    public canClaimDailyReward(): boolean {
        if (!this.gameState) return false;

        const lastClaimed = this.gameState.dailyReward.lastClaimedDate
            ? new Date(this.gameState.dailyReward.lastClaimedDate)
            : null;

        if (!lastClaimed) return true; // Hiç almadı

        const now = new Date();
        // Aynı gün mü kontrolü
        return now.toDateString() !== lastClaimed.toDateString();
    }

    public claimDailyReward(): number {
        if (!this.gameState || !this.canClaimDailyReward()) return 0;

        // Streak artır
        this.gameState.dailyReward.currentStreak++;
        this.gameState.user.streakDays = this.gameState.dailyReward.currentStreak;

        // Ödül hesapla (Base + Streak Bonus)
        let reward = DAILY_REWARD_AMOUNT;
        if (this.gameState.dailyReward.currentStreak > 1) {
            reward += (this.gameState.dailyReward.currentStreak - 1) * DAILY_REWARD_STREAK_BONUS;
        }

        this.gameState.user.totalStars += reward;
        this.gameState.dailyReward.totalClaimed++;
        this.gameState.dailyReward.lastClaimedDate = new Date().toISOString();

        this.saveGame();
        this.checkAchievements(); // Streak achievement kontrolü

        return reward;
    }

    // --- SETTINGS ---

    public getSettings(): GameSettings {
        return this.gameState?.settings || StorageManager.getDefaultGameState().settings;
    }

    public updateSettings(newSettings: Partial<GameSettings>): void {
        if (!this.gameState) return;

        this.gameState.settings = { ...this.gameState.settings, ...newSettings };
        this.saveGame();
    }
}

export default GameManager.getInstance();
