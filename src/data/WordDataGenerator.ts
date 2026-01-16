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
        if (this.wordPools.size > 0) return;

        const categories = ['baslangic', 'orta', 'deneyimli', 'uzman', 'bilgin', 'dahi', 'genel', 'kavramlar'];
        console.log('📚 WordDataGenerator: Loading categories...', categories);

        const loadPromises = categories.map(async (cat) => {
            try {
                const url = `/data/categories/${cat}.json`;
                const response = await fetch(url);

                if (!response.ok) {
                    console.error(`❌ Failed to load category ${cat}: Status ${response.status}`);
                    return;
                }

                const contentType = response.headers.get('Content-Type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.error(`❌ Category ${cat} returned non-JSON content: ${contentType}`);
                    return;
                }

                const words: string[] = await response.json();
                const normalized = words.map(w => w.toLocaleUpperCase('tr-TR'));
                this.wordPools.set(cat, normalized);
                console.log(`✅ Category loaded: ${cat} (${words.length} words)`);
            } catch (err) {
                console.error(`❌ Error fetching category ${cat}:`, err);
            }
        });

        await Promise.all(loadPromises);
        console.log(`📊 WordDataGenerator: Loaded ${this.wordPools.size}/${categories.length} categories`);
    }

    /**
     * Generate crossword configuration for a level
     */
    public getCrosswordConfiguration(levelNumber: number) {
        let categoryId = 'baslangic';
        let wordCount = 3;

        // Tier Logic
        if (levelNumber <= 10) {
            categoryId = 'baslangic';
            wordCount = 3;
        } else if (levelNumber <= 20) {
            categoryId = 'orta';
            wordCount = 3;
        } else if (levelNumber <= 40) {
            categoryId = 'deneyimli';
            wordCount = 4;
        } else if (levelNumber <= 60) {
            categoryId = 'uzman';
            wordCount = 4;
        } else if (levelNumber <= 80) {
            categoryId = 'bilgin';
            wordCount = 5;
        } else {
            categoryId = 'dahi';
            wordCount = 5;
        }

        const pool = this.wordPools.get(categoryId) || [];

        // Jeneratöre daha fazla aday kelime gönderelim ki (örn: 15 tane)
        // içlerinden birbirine en uygun (harf paylaşan) 'wordCount' tanesini seçebilsin.
        const candidatePoolSize = 15;
        const candidates = this.selectWords(pool, candidatePoolSize);

        return CrosswordGenerator.generate(candidates, wordCount);
    }

    private selectWords(pool: string[], count: number): string[] {
        // Yeni bir kopya oluştur ve karıştır
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }
}

export default WordDataGenerator.getInstance();
