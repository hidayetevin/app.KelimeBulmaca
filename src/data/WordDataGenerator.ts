import { CrosswordGenerator } from '@/utils/CrosswordGenerator';

/**
 * Kelime verisi ve seviye oluşturucu
 */
export class WordDataGenerator {
    private static instance: WordDataGenerator;
    private wordPools: Map<string, string[]> = new Map();

    private constructor() {
        // Singleton
    }

    public static getInstance(): WordDataGenerator {
        if (!WordDataGenerator.instance) {
            WordDataGenerator.instance = new WordDataGenerator();
        }
        return WordDataGenerator.instance;
    }

    /**
     * Tüm kategorilerin kelimelerini yükler
     */
    public async loadAllWords(): Promise<void> {
        // Zaten yüklendiyse tekrar yükleme
        if (this.wordPools.size > 0) return;

        const categories = ['animals', 'fruits', 'cities']; // Genişletilebilir

        const loadPromises = categories.map(async (cat) => {
            try {
                const response = await fetch(`/data/categories/${cat}.json`);
                if (!response.ok) return;
                const words: string[] = await response.json();
                const normalized = words.map(w => w.toLocaleUpperCase('tr-TR'));
                this.wordPools.set(cat, normalized);
            } catch (err) {
                console.warn(`Failed to load category: ${cat}`, err);
            }
        });

        await Promise.all(loadPromises);
        console.log(`✅ Loaded words from ${this.wordPools.size} categories`);
    }



    /**
     * Generate crossword configuration for a level
     */
    /**
     * Generate crossword configuration for a level with difficulty scaling (every 20 levels)
     */
    public getCrosswordConfiguration(levelNumber: number) {
        // Determine difficulty tier based on level (0 = Easy, 1 = Medium, 2 = Hard)
        const difficulty = this.getDifficultyLevel(levelNumber);
        // Get all words from all categories
        const allWords: string[] = [];
        this.wordPools.forEach(words => {
            allWords.push(...words);
        });
        // Filter words according to difficulty
        const filteredWords = this.filterWordsByDifficulty(allWords, difficulty);
        // Generate crossword using filtered pool and level number
        return CrosswordGenerator.generate(filteredWords, levelNumber);
    }

    /**
     * Compute difficulty tier (0 = Easy, 1 = Medium, 2 = Hard) based on level.
     * Every 20 levels increase difficulty.
     */
    private getDifficultyLevel(level: number): number {
        return Math.floor((level - 1) / 20);
    }

    /**
     * Filter word pool by difficulty tier.
     * Easy: length 3-5, Medium: 5-7, Hard: 7+.
     */
    private filterWordsByDifficulty(pool: string[], difficulty: number): string[] {
        let minLen = 3;
        let maxLen = 10;
        if (difficulty === 0) { // Easy
            minLen = 3;
            maxLen = 5;
        } else if (difficulty === 1) { // Medium
            minLen = 5;
            maxLen = 7;
        } else { // Hard or higher
            minLen = 7;
            maxLen = 12;
        }
        return pool.filter(word => word.length >= minLen && word.length <= maxLen);
    }
}

export default WordDataGenerator.getInstance();
