import { CrosswordGenerator } from '@/utils/CrosswordGenerator';
import { GameManager } from '@/managers/GameManager';

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
     * Phaser Cache'den kelimeleri yükler (Daha güvenli ve hızlı)
     */
    public initFromCache(scene: Phaser.Scene): void {
        const categories = ['baslangic', 'orta', 'deneyimli', 'uzman', 'bilgin', 'dahi', 'genel', 'kavramlar'];
        console.log('📦 WordDataGenerator: Initializing from Phaser cache...');

        categories.forEach(cat => {
            try {
                const data = scene.cache.json.get(`${cat}_data`);
                if (data && Array.isArray(data)) {
                    const normalized = data.map(w => w.toLocaleUpperCase('tr-TR'));
                    this.wordPools.set(cat, normalized);
                    console.log(`✅ Category initialized from cache: ${cat}`);
                }
            } catch (err) {
                console.warn(`⚠️ Could not init ${cat} from cache, will fallback to fetch`);
            }
        });
    }

    /**
     * Tüm kategorilerin kelimelerini yükler
     */
    public async loadAllWords(): Promise<void> {
        // Eğer zaten yüklüyse veya cache'den geldiyse bekleme
        const categories = ['baslangic', 'orta', 'deneyimli', 'uzman', 'bilgin', 'dahi', 'genel', 'kavramlar'];
        if (this.wordPools.size >= categories.length) return;

        console.log('📚 WordDataGenerator: Loading missing categories via fetch...', categories.filter(c => !this.wordPools.has(c)));

        const loadPromises = categories.map(async (cat) => {
            if (this.wordPools.has(cat)) return;

            try {
                const url = `data/categories/${cat}.json`;
                const response = await fetch(url);

                if (!response.ok) {
                    const errorMsg = `❌ Failed to load category ${cat}: Status ${response.status}`;
                    console.error(errorMsg);
                    GameManager.showToast(errorMsg, 'error');
                    return;
                }

                const contentType = response.headers.get('Content-Type');
                if (!contentType || !contentType.includes('application/json')) {
                    const errorMsg = `❌ Category ${cat} returned non-JSON content: ${contentType}`;
                    console.error(errorMsg);
                    GameManager.showToast(errorMsg, 'warning');
                    return;
                }

                const words: string[] = await response.json();
                const normalized = words.map(w => w.toLocaleUpperCase('tr-TR'));
                this.wordPools.set(cat, normalized);
                console.log(`✅ Category loaded: ${cat} (${words.length} words)`);
            } catch (err) {
                const errorMsg = `❌ Error fetching category ${cat}: ${err instanceof Error ? err.message : String(err)}`;
                console.error(errorMsg);
                GameManager.showToast(errorMsg, 'error');
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
