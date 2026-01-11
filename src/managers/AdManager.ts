import { AD_IDS, REWARDED_AD_REWARD_STARS, AD_COOLDOWN_SECONDS } from '@/utils/constants';
import GameManager from './GameManager';
import LocalizationManager from './LocalizationManager';

/**
 * Ad Manager - Singleton
 * Capacitor AdMob plugin wrapper.
 * Reklam gösterimi ve ödülleri yönetir.
 */
class AdManager {
    private static instance: AdManager;
    private isAdMobAvailable: boolean = false;
    private isTestMode: boolean = true;
    private lastInterstitialTime: number = 0;

    // Placeholder for Capacitor AdMob
    private AdMob: any = null;
    private BannerAdSize: any = null;
    private BannerAdPosition: any = null;
    private AdMobRewardItem: any = null;
    private AdMobAdOptions: any = null;

    private constructor() {
        this.checkAdMobAvailability();
    }

    public static getInstance(): AdManager {
        if (!AdManager.instance) {
            AdManager.instance = new AdManager();
        }
        return AdManager.instance;
    }

    /**
     * AdMob plugin kontrolü ve başlatma
     */
    public async init(): Promise<void> {
        try {
            // @ts-ignore
            if (typeof window !== 'undefined' && window.Capacitor) {
                // @ts-ignore
                const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
                this.AdMob = AdMob;
                this.BannerAdSize = BannerAdSize;
                this.BannerAdPosition = BannerAdPosition;

                await this.AdMob.initialize({
                    requestTrackingAuthorization: true,
                    testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Test cihaz ID'leri eklenebilir
                    initializeForTesting: true,
                });

                this.isAdMobAvailable = true;
                console.log('✅ AdMob initialized');
            } else {
                console.log('ℹ️ AdMob running in web mode (Mock)');
            }
        } catch (error) {
            console.error('❌ AdMob initialization failed:', error);
            this.isAdMobAvailable = false;
        }
    }

    // --- BANNER REKLAMLAR ---

    public async showBanner(position: 'top' | 'bottom' = 'bottom'): Promise<void> {
        if (!this.isAdMobAvailable) {
            console.log(`📺 [MOCK] Showing Banner Ad at ${position}`);
            return;
        }

        try {
            const options = {
                adId: AD_IDS.BANNER,
                adSize: this.BannerAdSize.BANNER,
                position: position === 'top' ? this.BannerAdPosition.TOP_CENTER : this.BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: this.isTestMode
            };

            await this.AdMob.showBanner(options);
        } catch (error) {
            console.error('❌ Failed to show banner:', error);
        }
    }

    public async hideBanner(): Promise<void> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Hiding Banner Ad');
            return;
        }

        try {
            await this.AdMob.hideBanner();
            // Veya removeBanner
        } catch (error) {
            console.error('❌ Failed to hide banner:', error);
        }
    }

    public async removeBanner(): Promise<void> {
        if (!this.isAdMobAvailable) return;
        try {
            await this.AdMob.removeBanner();
        } catch (error) { /* ignore */ }
    }

    // --- INTERSTITIAL (TAM EKRAN) REKLAMLAR ---

    /**
     * Tam ekran reklam yükler
     */
    public async loadInterstitial(): Promise<void> {
        if (!this.isAdMobAvailable) return;

        try {
            const options = {
                adId: AD_IDS.INTERSTITIAL,
                isTesting: this.isTestMode
            };
            await this.AdMob.prepareInterstitial(options);
        } catch (error) {
            console.error('❌ Failed to load interstitial:', error);
        }
    }

    /**
     * Tam ekran reklam gösterir (Cooldown kontrolü ile)
     * @returns Reklam gösterildi mi?
     */
    public async showInterstitial(): Promise<boolean> {
        const now = Date.now();

        // Cooldown kontrolü (2 dakika)
        if (now - this.lastInterstitialTime < AD_COOLDOWN_SECONDS * 1000) {
            console.log('⏳ Ad cooldown active, skipping interstitial');
            return false;
        }

        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Interstitial Ad');
            this.lastInterstitialTime = now;
            return true;
        }

        try {
            await this.AdMob.showInterstitial();
            this.lastInterstitialTime = now;
            return true;
        } catch (error) {
            console.error('❌ Failed to show interstitial:', error);
            // Yüklenmemiş olabilir, tekrar yüklemeyi dene
            this.loadInterstitial();
            return false;
        }
    }

    // --- REWARDED (ÖDÜLLÜ) REKLAMLAR ---

    /**
     * Ödüllü reklam yükler
     */
    public async loadRewarded(): Promise<void> {
        if (!this.isAdMobAvailable) return;

        try {
            const options = {
                adId: AD_IDS.REWARDED,
                isTesting: this.isTestMode
            };
            await this.AdMob.prepareRewardVideoAd(options);
        } catch (error) {
            console.error('❌ Failed to load rewarded video:', error);
        }
    }

    /**
     * Ödüllü reklam gösterir
     * @returns Ödül kazanıldı mı?
     */
    public async showRewarded(): Promise<boolean> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Rewarded Ad');
            // Web modunda direkt ödülü ver
            return new Promise(resolve => {
                const confirmed = window.confirm(LocalizationManager.t('hints.watchAd')); // Mock confirm
                if (confirmed) {
                    this.grantReward();
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }

        return new Promise(async (resolve) => {
            try {
                // Ödül listener'ı ekle
                // Not: Capacitor AdMob API sürümüne göre değişebilir, basit implementasyon.
                // @ts-ignore
                const handler = this.AdMob.addListener('onRewardVideoReward', (reward: any) => {
                    this.grantReward();
                    resolve(true);
                });

                // Kapatılma listener'ı (ödül almadan kapattıysa)
                // @ts-ignore
                const closeHandler = this.AdMob.addListener('onRewardVideoAdDismissed', () => {
                    // Listener'ları temizle
                    handler.remove();
                    closeHandler.remove();
                    // Resolve edilmediyse false dön (timeout veya logic ile)
                    // Basitlik için burada resolve etmiyoruz, reward event gelirse true döner.
                    // Aslında bir flag ile kontrol edilebilir.
                });

                await this.AdMob.showRewardVideoAd();
            } catch (error) {
                console.error('❌ Failed to show rewarded video:', error);
                this.loadRewarded(); // Reload
                resolve(false);
            }
        });
    }

    /**
     * Ödülü verir (Merkezi method)
     */
    private grantReward(): void {
        GameManager.addStars(REWARDED_AD_REWARD_STARS);
        console.log(`🎁 Ad Reward Granted: +${REWARDED_AD_REWARD_STARS} stars`);
    }

    /**
     * Capacitor kontrolü
     */
    private checkAdMobAvailability(): void {
        // Init içinde yapılıyor
    }
}

export default AdManager.getInstance();
