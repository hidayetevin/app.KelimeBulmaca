/**
 * Localization Manager - Singleton
 * Çoklu dil desteği sağlar
 */
class LocalizationManager {
    private static instance: LocalizationManager;
    private currentLanguage: 'tr' | 'en' = 'tr';
    private translations: Record<string, any> = {};

    private constructor() {
        // Singleton pattern
    }

    /**
     * Singleton instance döndürür
     */
    public static getInstance(): LocalizationManager {
        if (!LocalizationManager.instance) {
            LocalizationManager.instance = new LocalizationManager();
        }
        return LocalizationManager.instance;
    }

    /**
     * Belirtilen dil dosyasını yükler
     * @param lang - Yüklenecek dil kodu ('tr' veya 'en')
     */
    public async loadLocale(lang: 'tr' | 'en'): Promise<void> {
        try {
            const response = await fetch(`locales/${lang}.json`);

            if (!response.ok) {
                throw new Error(`Failed to load locale: ${lang}`);
            }

            this.translations = await response.json();
            this.currentLanguage = lang;

            console.log(`✅ Locale loaded: ${lang}`);
        } catch (error) {
            console.error(`❌ Error loading locale ${lang}:`, error);
            // Fallback: Türkçe yüklenemezse İngilizce dene
            if (lang === 'tr') {
                console.log('⚠️ Falling back to English');
                await this.loadLocale('en');
            }
        }
    }

    /**
     * Çeviri anahtarına karşılık gelen metni döndürür
     * Nested key desteği (örn: "game.wordsFound")
     * @param key - Çeviri anahtarı (dot notation destekler)
     * @param fallback - Bulunamazsa döndürülecek değer
     * @returns Çevrilmiş metin
     */
    public t(key: string, fallback?: string): string {
        const keys = key.split('.');
        let value: any = this.translations;

        // Nested key traverse
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`⚠️ Translation key not found: ${key}`);
                return fallback || key;
            }
        }

        return typeof value === 'string' ? value : (fallback || key);
    }

    /**
     * Mevcut dili döndürür
     * @returns Aktif dil kodu
     */
    public getCurrentLanguage(): 'tr' | 'en' {
        return this.currentLanguage;
    }

    /**
     * Dil değiştirir
     * @param lang - Yeni dil kodu
     */
    public async changeLanguage(lang: 'tr' | 'en'): Promise<void> {
        if (lang !== this.currentLanguage) {
            await this.loadLocale(lang);
        }
    }

    /**
     * Çeviri bulunup bulunmadığını kontrol eder
     * @param key - Kontrol edilecek anahtar
     * @returns Çeviri var mı?
     */
    public hasTranslation(key: string): boolean {
        const keys = key.split('.');
        let value: any = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return false;
            }
        }

        return typeof value === 'string';
    }
}

// Export singleton instance
export default LocalizationManager.getInstance();
