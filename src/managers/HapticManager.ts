/**
 * Haptic Manager - Singleton
 * Mobil cihazlarda titreşim feedback yönetimi
 * Web'de Vibration API, Capacitor'da Haptics plugin kullanır
 */
class HapticManager {
    private static instance: HapticManager;
    private isEnabled: boolean = true;
    private isCapacitorAvailable: boolean = false;

    private constructor() {
        // Singleton pattern
        this.checkCapacitorAvailability();
    }

    /**
     * Singleton instance döndürür
     */
    public static getInstance(): HapticManager {
        if (!HapticManager.instance) {
            HapticManager.instance = new HapticManager();
        }
        return HapticManager.instance;
    }

    /**
     * Capacitor mevcut mu kontrol eder
     */
    private checkCapacitorAvailability(): void {
        // @ts-ignore - Capacitor global object
        this.isCapacitorAvailable = typeof window !== 'undefined' && typeof window.Capacitor !== 'undefined';

        if (this.isCapacitorAvailable) {
            console.log('✅ Capacitor Haptics available');
        } else {
            console.log('ℹ️ Using Web Vibration API fallback');
        }
    }

    /**
     * HapticManager'ı başlatır
     */
    public async init(): Promise<void> {
        try {
            if (this.isCapacitorAvailable) {
                // Capacitor Haptics varsa import et
                // @ts-ignore
                const { Haptics } = await import('@capacitor/haptics');
                // @ts-ignore
                this.haptics = Haptics;
                console.log('✅ HapticManager initialized with Capacitor');
            } else {
                console.log('✅ HapticManager initialized with Web API');
            }
        } catch (error) {
            console.warn('⚠️ Haptics not available:', error);
        }
    }

    /**
     * Hafif titreşim
     */
    public light(): void {
        if (!this.isEnabled) return;

        if (this.isCapacitorAvailable) {
            this.capacitorHaptic('light');
        } else {
            this.webVibrate(10);
        }
    }

    /**
     * Orta şiddette titreşim
     */
    public medium(): void {
        if (!this.isEnabled) return;

        if (this.isCapacitorAvailable) {
            this.capacitorHaptic('medium');
        } else {
            this.webVibrate(20);
        }
    }

    /**
     * Güçlü titreşim
     */
    public heavy(): void {
        if (!this.isEnabled) return;

        if (this.isCapacitorAvailable) {
            this.capacitorHaptic('heavy');
        } else {
            this.webVibrate(30);
        }
    }

    /**
     * Başarı feedback (pozitif)
     */
    public success(): void {
        if (!this.isEnabled) return;

        if (this.isCapacitorAvailable) {
            this.capacitorNotification('success');
        } else {
            // Çift kısa titreşim
            this.webVibrate([15, 50, 15]);
        }
    }

    /**
     * Uyarı feedback
     */
    public warning(): void {
        if (!this.isEnabled) return;

        if (this.isCapacitorAvailable) {
            this.capacitorNotification('warning');
        } else {
            // Uzun tek titreşim
            this.webVibrate(25);
        }
    }

    /**
     * Hata feedback (negatif)
     */
    public error(): void {
        if (!this.isEnabled) return;

        if (this.isCapacitorAvailable) {
            this.capacitorNotification('error');
        } else {
            // Üç kısa titreşim
            this.webVibrate([10, 40, 10, 40, 10]);
        }
    }

    /**
     * Titreşim aktif mi?
     */
    public isHapticEnabled(): boolean {
        return this.isEnabled;
    }

    /**
     * Titreşimi aç/kapat
     */
    public toggle(): void {
        this.isEnabled = !this.isEnabled;
        console.log(`📳 Haptics ${this.isEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Titreşimi programatik olarak aç
     */
    public enable(): void {
        this.isEnabled = true;
    }

    /**
     * Titreşimi programatik olarak kapat
     */
    public disable(): void {
        this.isEnabled = false;
    }

    /**
     * Capacitor Haptics impact
     */
    private async capacitorHaptic(style: 'light' | 'medium' | 'heavy'): Promise<void> {
        try {
            // @ts-ignore
            if (this.haptics && this.haptics.impact) {
                // @ts-ignore
                await this.haptics.impact({ style });
            }
        } catch (error) {
            console.warn('⚠️ Haptic impact failed:', error);
        }
    }

    /**
     * Capacitor Haptics notification
     */
    private async capacitorNotification(type: 'success' | 'warning' | 'error'): Promise<void> {
        try {
            // @ts-ignore
            if (this.haptics && this.haptics.notification) {
                // @ts-ignore
                await this.haptics.notification({ type });
            }
        } catch (error) {
            console.warn('⚠️ Haptic notification failed:', error);
        }
    }

    /**
     * Web Vibration API
     */
    private webVibrate(pattern: number | number[]): void {
        try {
            if ('vibrate' in navigator) {
                navigator.vibrate(pattern);
            }
        } catch (error) {
            // Sessizce başarısız ol (vibration desteklenmiyor)
        }
    }

    /**
     * Oyun aksiyonları için kolaylık metodları
     */

    /**
     * Harf seçimi feedback
     */
    public onLetterSelect(): void {
        this.light();
    }

    /**
     * Doğru kelime feedback
     */
    public onWordCorrect(): void {
        this.success();
    }

    /**
     * Yanlış kelime feedback
     */
    public onWordWrong(): void {
        this.error();
    }

    /**
     * Seviye tamamlama feedback
     */
    public onLevelComplete(): void {
        this.heavy();
    }

    /**
     * Buton tıklama feedback
     */
    public onButtonClick(): void {
        this.light();
    }

    /**
     * İpucu gösterme feedback
     */
    public onHintShow(): void {
        this.medium();
    }

    /**
     * Kilit açma feedback
     */
    public onUnlock(): void {
        this.success();
    }

    /**
     * Başarı rozeti feedback
     */
    public onAchievementUnlock(): void {
        this.heavy();
    }
}

// Export singleton instance
export default HapticManager.getInstance();
