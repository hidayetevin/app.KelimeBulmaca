import { Achievement, GameState } from '@/types';
import StorageManager from './StorageManager';
import AudioManager from './AudioManager';
import HapticManager from './HapticManager';
import LocalizationManager from './LocalizationManager';

/**
 * Achievement Manager - Singleton
 * Başarı rozetlerini ve ilerlemeyi yönetir.
 */
class AchievementManager {
    private static instance: AchievementManager;

    private constructor() {
        // Singleton
    }

    public static getInstance(): AchievementManager {
        if (!AchievementManager.instance) {
            AchievementManager.instance = new AchievementManager();
        }
        return AchievementManager.instance;
    }

    /**
     * Oyun durumuna göre başarıları kontrol eder ve günceller
     * @param gameState - Mevcut oyun durumu
     * @returns Yeni açılan başarılar listesi
     */
    public checkAchievements(gameState: GameState): Achievement[] {
        const unlockedNow: Achievement[] = [];
        const achievements = gameState.achievements;

        achievements.forEach(achievement => {
            // Zaten açıksa atla
            if (achievement.isUnlocked) return;

            let isConditionMet = false;
            let currentProgress = 0;

            // Başarı koşullarını kontrol et
            switch (achievement.id) {
                // BEGINNER
                case 'first_step':
                    // İlk seviyeyi tamamla
                    currentProgress = gameState.user.gamesPlayed; // Basitçe oynanan oyun sayısı > 0 ise
                    isConditionMet = gameState.categories.some(c => c.levels.some(l => l.isCompleted));
                    achievement.progress = isConditionMet ? 1 : 0;
                    break;

                case 'word_finder':
                    // 10 kelime bul
                    currentProgress = gameState.user.totalWordsFound;
                    achievement.progress = Math.min(currentProgress, achievement.target);
                    isConditionMet = currentProgress >= achievement.target;
                    break;

                // STARS
                case 'star_collector_50':
                    // 50 yıldız topla
                    currentProgress = gameState.user.totalStars;
                    achievement.progress = Math.min(currentProgress, achievement.target);
                    isConditionMet = currentProgress >= achievement.target;
                    break;

                case 'star_collector_100':
                    // 100 yıldız topla
                    currentProgress = gameState.user.totalStars;
                    achievement.progress = Math.min(currentProgress, achievement.target);
                    isConditionMet = currentProgress >= achievement.target;
                    break;

                // COMPLETION
                case 'perfect_memory':
                    // Bir seviyeyi ilk denemede tamamla
                    // Bu, oyun sırasında tetiklenir, burada sadece state kontrol ediyoruz
                    // İlerlemeyi manuel updateProgress ile yöneteceğiz.
                    isConditionMet = achievement.progress >= achievement.target;
                    break;

                case 'category_master':
                    // Bir kategorinin tüm seviyelerini tamamla
                    const completedCategories = gameState.categories.filter(c =>
                        c.levels.every((l: any) => l.isCompleted)
                    ).length;
                    currentProgress = completedCategories;
                    achievement.progress = Math.min(currentProgress, achievement.target);
                    isConditionMet = currentProgress >= achievement.target;
                    break;

                case 'all_categories':
                    // Tüm kategorileri tamamla
                    const allCompleted = gameState.categories.length > 0 &&
                        gameState.categories.every(c => c.levels.every((l: any) => l.isCompleted));
                    currentProgress = allCompleted ? achievement.target : gameState.categories.filter(c => c.levels.every((l: any) => l.isCompleted)).length;
                    achievement.progress = currentProgress;
                    isConditionMet = allCompleted;
                    break;

                // SPEED (Manuel tetiklenir)
                case 'speed_demon':
                    isConditionMet = achievement.progress >= achievement.target;
                    break;

                // STREAK
                case 'three_day_streak':
                    currentProgress = gameState.user.streakDays;
                    achievement.progress = Math.min(currentProgress, achievement.target);
                    isConditionMet = currentProgress >= achievement.target;
                    break;

                case 'week_streak':
                    currentProgress = gameState.user.streakDays;
                    achievement.progress = Math.min(currentProgress, achievement.target);
                    isConditionMet = currentProgress >= achievement.target;
                    break;
            }

            // Eğer koşul sağlandıysa kilidi aç
            if (isConditionMet) {
                this.unlockAchievement(gameState, achievement);
                unlockedNow.push(achievement);
            }
        });

        // Değişiklik varsa kaydet
        if (unlockedNow.length > 0) {
            StorageManager.saveGameState(gameState);
        }

        return unlockedNow;
    }

    /**
     * Başarıyı açar, ödülü verir ve efektleri çalar
     */
    private unlockAchievement(gameState: GameState, achievement: Achievement): void {
        achievement.isUnlocked = true;
        achievement.unlockedDate = new Date().toISOString();
        achievement.progress = achievement.target;

        // Ödül varsa ver
        if (achievement.reward && achievement.reward > 0) {
            gameState.user.totalStars += achievement.reward;
            console.log(`🏆 Achievement Reward: +${achievement.reward} stars`);
        }

        // Efektler
        AudioManager.playAchievementUnlock();
        HapticManager.onAchievementUnlock();

        console.log(`🔓 Achievement Unlocked: ${LocalizationManager.getCurrentLanguage() === 'tr' ? achievement.name.tr : achievement.name.en}`);
    }

    /**
     * Manuel olarak ilerleme günceller (Speed, Perfect Memory vb. için)
     * @param achievementId - Başarı ID'si
     * @param progress - Eklenecek ilerleme (veya set edilecek değer)
     * @param gameState - Oyun durumu
     */
    public updateProgress(achievementId: string, progress: number, gameState: GameState): boolean {
        const achievement = gameState.achievements.find(a => a.id === achievementId);

        if (!achievement || achievement.isUnlocked) return false;

        // İlerlemeyi güncelle (bazıları birikimli, bazıları tek seferlik)
        if (achievement.target === 1) {
            // Tek seferlik (Bool logic)
            achievement.progress = progress;
        } else {
            // Birikimli değilse direkt set et (genelde manager kullanımına bağlı, burada set ediyoruz)
            achievement.progress = progress;
        }

        // Anında kontrol et
        const unlocked = this.checkAchievements(gameState);
        return unlocked.length > 0;
    }

    /**
     * Açık başarıları döndürür
     */
    public getUnlockedAchievements(gameState: GameState): Achievement[] {
        return gameState.achievements.filter(a => a.isUnlocked);
    }

    /**
     * Kilitli başarıları döndürür
     */
    public getLockedAchievements(gameState: GameState): Achievement[] {
        return gameState.achievements.filter(a => !a.isUnlocked);
    }

    /**
     * Toplanabilir ödül miktarını gösterir (Unlock olmuş ama belki claim edilmemiş gibi bir mantık varsa)
     * Şu an ödüller otomatik veriliyor.
     */
    public getTotalEarnedAchievementRewards(gameState: GameState): number {
        return gameState.achievements
            .filter(a => a.isUnlocked)
            .reduce((sum, a) => sum + (a.reward || 0), 0);
    }
}

export default AchievementManager.getInstance();
