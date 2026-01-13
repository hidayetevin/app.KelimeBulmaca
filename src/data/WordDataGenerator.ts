import { GridSize, Difficulty } from '@/types';
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
     * Kategori kelimelerini yükler (Local fetch)
     */
    public async loadCategoryWords(categoryId: string): Promise<void> {
        if (this.wordPools.has(categoryId)) return;

        try {
            const response = await fetch(`/data/categories/${categoryId}.json`);
            if (!response.ok) throw new Error(`Category not found: ${categoryId}`);
            const words = await response.json();
            this.wordPools.set(categoryId, words);
            console.log(`✅ Loaded ${words.length} words for category: ${categoryId}`);
        } catch (error) {
            console.error(`❌ Failed to load words for category ${categoryId}:`, error);
            // Fallback
            this.wordPools.set(categoryId, ['TEST', 'DATA', 'ERROR']);
        }
    }

    /**
     * Seviye için kelime listesi ve grid boyutu üretir
     * @param categoryId - Kategori ID
     * @param levelNumber - Seviye Numarası (1-5)
     */
    public getLevelConfiguration(categoryId: string, levelNumber: number): { words: string[], gridSize: GridSize } {
        const allWords = this.wordPools.get(categoryId) || [];

        // Seviye konfigürasyonu
        // Level 1: 4 kelime, 3x3 (min kelime boyu 3)
        // Level 2: 5 kelime, 3x4 (min kelime boyu 3-4)
        // Level 3: 6 kelime, 4x4 (min kelime boyu 4-5)
        // Level 4: 7 kelime, 4x5 (min kelime boyu 4-6)
        // Level 5: 8 kelime, 5x5 (min kelime boyu 5-7)

        let wordCount = 4;
        let rows = 3;
        let cols = 3;
        let minLength = 3;
        let maxLength = 10; // Daha esnek

        switch (levelNumber) {
            case 1: wordCount = 4; rows = 6; cols = 6; minLength = 3; maxLength = 6; break;
            case 2: wordCount = 5; rows = 7; cols = 7; minLength = 3; maxLength = 7; break;
            case 3: wordCount = 6; rows = 8; cols = 8; minLength = 4; maxLength = 8; break;
            case 4: wordCount = 7; rows = 9; cols = 9; minLength = 4; maxLength = 9; break;
            case 5: wordCount = 8; rows = 10; cols = 10; minLength = 5; maxLength = 10; break;
            default: wordCount = 8; rows = 10; cols = 10; minLength = 5; maxLength = 10; break; // Level 5+ -> max
        }

        // Grid boyutunu biraz daha büyük verelim ki rahat yerleşsin
        // 3x3 çok dar olabilir, özellikle çapraz kelimeler için.
        // Başlangıç için biraz daha geniş gridler:

        const gridSize: GridSize = { rows, cols };

        // Kelime seçimi
        const selectedWords = this.selectWords(allWords, wordCount, minLength, maxLength);

        return {
            words: selectedWords,
            gridSize
        };
    }

    /**
     * Kelime havuzundan rastgele kelimeler seçer
     */
    private selectWords(pool: string[], count: number, minLen: number, maxLen: number): string[] {
        // Uzunluk filtresi
        const filteredPool = pool.filter(w => w.length >= minLen && w.length <= maxLen);

        // Karıştır
        this.shuffleArray(filteredPool);

        // Seç
        const selected: string[] = [];
        for (const word of filteredPool) {
            if (selected.length >= count) break;
            // Aynı kelimeyi tekrar ekleme (zaten shuffle ettik basic check)
            if (!selected.includes(word)) {
                selected.push(word);
            }
        }

        // Eğer yeterli kelime yoksa havuzdan ne varsa doldur
        if (selected.length < count) {
            const remaining = count - selected.length;
            const extras = pool.filter(w => !selected.includes(w)).slice(0, remaining);
            selected.push(...extras);
        }

        return selected;
    }

    /**
     * Helper: Shuffle array
     */
    private shuffleArray(array: any[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
