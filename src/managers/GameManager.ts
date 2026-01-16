import { GameState } from '@/types';
import StorageManager from './StorageManager';

/**
 * Game Manager - Level-Based System
 */
class GameManager {
    private static instance: GameManager;
    private gameState: GameState | null = null;
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

    public init(): void {
        this.gameState = StorageManager.loadGameState();

        if (!this.gameState) {
            console.log('🆕 First time launch, creating new game state...');
            this.gameState = StorageManager.getDefaultGameState();
            StorageManager.saveGameState(this.gameState);
        } else {
            console.log('📂 Game state loaded');
        }
    }

    public saveGame(): void {
        if (this.gameState) {
            StorageManager.saveGameState(this.gameState);
        }
    }

    public getGameState(): GameState | null {
        return this.gameState;
    }

    // ==================== LEVEL OPERATIONS ====================

    /**
     * Get current playable level (highest unlocked)
     */
    public getCurrentLevel(): number {
        if (!this.gameState || !this.gameState.levels) return 1;

        const levels = this.gameState.levels;
        let current = 1;

        // Find highest unlocked level
        for (let i = 1; i <= 100; i++) {
            if (levels[i]?.isUnlocked && !levels[i]?.isCompleted) {
                return i;
            }
            if (levels[i]?.isUnlocked) {
                current = i;
            }
        }

        // If all unlocked levels are completed, return next level
        return Math.min(current + 1, 100);
    }

    /**
     * Get level data
     */
    public getLevelData(level: number) {
        if (!this.gameState || !this.gameState.levels) return null;
        return this.gameState.levels[level];
    }

    /**
     * Unlock a level
     */
    public unlockLevel(level: number): void {
        if (!this.gameState) return;

        if (!this.gameState.levels[level]) {
            this.gameState.levels[level] = {
                isUnlocked: true,
                isCompleted: false,
                stars: 0,
                bestTime: 0
            };
        } else {
            this.gameState.levels[level].isUnlocked = true;
        }

        this.saveGame();
    }

    /**
     * Calculate stars based on performance
     * @param levelNumber - Level number (1-100)
     * @param completionTime - Time taken in seconds
     * @param hintsUsed - Number of hints used
     * @returns Number of stars (1-3)
     */
    public calculateStars(levelNumber: number, completionTime: number, hintsUsed: number): number {
        // Determine target time based on level
        let targetTime = 60; // Default for levels 1-20

        if (levelNumber > 80) {
            targetTime = 180;
        } else if (levelNumber > 60) {
            targetTime = 150;
        } else if (levelNumber > 40) {
            targetTime = 120;
        } else if (levelNumber > 20) {
            targetTime = 90;
        }

        // 3 Stars: Complete within target time AND no hints used
        if (completionTime <= targetTime && hintsUsed === 0) {
            return 3;
        }

        // 2 Stars: Complete within 150% of target time OR only 1 hint used
        const extendedTime = targetTime * 1.5;
        if (completionTime <= extendedTime || hintsUsed === 1) {
            return 2;
        }

        // 1 Star: Level completed (always get at least 1 star)
        return 1;
    }

    /**
     * Complete a level
     */
    public completeLevel(level: number, stars: number, time: number): void {
        if (!this.gameState) return;

        // Update or create level data
        if (!this.gameState.levels[level]) {
            this.gameState.levels[level] = {
                isUnlocked: true,
                isCompleted: true,
                stars,
                bestTime: time
            };
        } else {
            const existingLevel = this.gameState.levels[level];
            existingLevel.isCompleted = true;
            existingLevel.stars = Math.max(existingLevel.stars, stars);

            if (existingLevel.bestTime === 0 || time < existingLevel.bestTime) {
                existingLevel.bestTime = time;
            }
        }

        // Add stars to total
        this.gameState.user.totalStars += stars;
        this.gameState.user.gamesPlayed++;

        // Unlock next level
        if (level < 100) {
            this.unlockLevel(level + 1);
        }

        this.saveGame();
        console.log(`✅ Level ${level} completed: ${stars} stars, ${time}s`);
    }

    // ==================== USER STATS ====================

    public addWordsFound(count: number): void {
        if (!this.gameState) return;
        this.gameState.user.totalWordsFound += count;
        this.saveGame();
    }

    public addStars(amount: number): void {
        if (!this.gameState) return;
        this.gameState.user.totalStars += amount;
        this.saveGame();
    }

    public useHint(): void {
        if (!this.gameState) return;
        this.gameState.user.hintsUsed++;
        this.saveGame();
    }

    /**
     * Static toast reference for showing notifications
     */
    private static toastScene: Phaser.Scene | null = null;

    public static setToastScene(scene: Phaser.Scene) {
        GameManager.toastScene = scene;
    }

    public static showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
        if (!GameManager.toastScene) {
            console.warn('Toast scene not set');
            return;
        }

        // Dynamic import to avoid circular dependency
        import('@/components/UI/Toast').then(({ default: Toast }) => {
            const toast = Toast.getInstance();
            if (!toast['scene']) {
                toast.init(GameManager.toastScene!);
            }
            toast.show({ message, type });
        });
    }

    public getTotalStars(): number {
        return this.gameState?.user.totalStars || 0;
    }

    // ==================== SETTINGS ====================

    public getSettings() {
        if (!this.gameState) {
            return {
                language: 'tr' as const,
                darkMode: false,
                soundEnabled: true,
                soundVolume: 0.7,
                vibrationEnabled: true,
                showHints: true
            };
        }
        return this.gameState.settings;
    }

    public updateSettings(settings: any): void {
        if (!this.gameState) return;
        this.gameState.settings = settings;
        this.saveGame();
    }

    // ==================== DAILY REWARD ====================

    public canClaimDailyReward(): boolean {
        if (!this.gameState) return false;

        const lastClaimed = this.gameState.dailyReward.lastClaimedDate;
        if (!lastClaimed) return true;

        const now = new Date();
        const lastClaimedDate = new Date(lastClaimed);
        const diffMs = now.getTime() - lastClaimedDate.getTime();

        return diffMs >= this.ONE_DAY_MS;
    }

    public claimDailyReward(): number {
        if (!this.gameState || !this.canClaimDailyReward()) return 0;

        const now = new Date().toISOString();
        this.gameState.dailyReward.lastClaimedDate = now;
        this.gameState.dailyReward.currentStreak++;
        this.gameState.dailyReward.totalClaimed++;

        const baseReward = 10;
        const streakBonus = Math.min(this.gameState.dailyReward.currentStreak * 2, 20);
        const totalReward = baseReward + streakBonus;

        this.addStars(totalReward);
        this.saveGame();

        return totalReward;
    }
    public resetGame(): void {
        console.log('🔄 Resetting game...');
        this.gameState = StorageManager.getDefaultGameState();
        this.saveGame();
    }
}

const gameManager = GameManager.getInstance();
export default gameManager;
