


// Google AdMob Test IDs
const TEST_ADS = {
    ANDROID: {
        BANNER: 'ca-app-pub-3940256099942544/6300978111',
        INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
        REWARDED: 'ca-app-pub-3940256099942544/5224354917'
    },
    IOS: {
        BANNER: 'ca-app-pub-3940256099942544/2934735716',
        INTERSTITIAL: 'ca-app-pub-3940256099942544/4411468910',
        REWARDED: 'ca-app-pub-3940256099942544/1712485313'
    }
};

class AdManager {
    private static instance: AdManager;
    private isAdMobAvailable: boolean = false;
    private isTestMode: boolean = true;

    // Capacitor AdMob References
    private AdMob: any = null;
    private BannerAdSize: any = null;
    private BannerAdPosition: any = null;

    private constructor() {
        this.init();
    }

    public static getInstance(): AdManager {
        if (!AdManager.instance) {
            AdManager.instance = new AdManager();
        }
        return AdManager.instance;
    }

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
                    testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
                    initializeForTesting: true,
                });

                this.isAdMobAvailable = true;
                console.log('✅ AdMob initialized');

                // Preload ads immediately after init
                this.preloadAds();
            } else {
                console.log('ℹ️ AdMob running in web mode (Mock)');
            }
        } catch (error) {
            console.error('❌ AdMob initialization failed:', error);
            this.isAdMobAvailable = false;
        }
    }

    public async preloadAds(): Promise<void> {
        if (!this.isAdMobAvailable) return;

        try {
            console.log('⏳ Preloading Interstitial and Rewarded ads...');
            await this.AdMob.prepareInterstitial({ adId: TEST_ADS.ANDROID.INTERSTITIAL, isTesting: this.isTestMode });
            await this.AdMob.prepareRewardVideoAd({ adId: TEST_ADS.ANDROID.REWARDED, isTesting: this.isTestMode });
            console.log('✅ Ads preloaded and ready');
        } catch (error) {
            console.warn('⚠️ Ad preloading failed:', error);
        }
    }

    // --- BANNER ---

    public async showBanner(): Promise<void> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Banner Ad (Bottom)');
            return;
        }

        try {
            const adId = TEST_ADS.ANDROID.BANNER; // TODO: Implement Platform Detection

            await this.AdMob.showBanner({
                adId: adId,
                adSize: this.BannerAdSize.ADAPTIVE_BANNER,
                position: this.BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: this.isTestMode
            });
            console.log('✅ Banner Ad displayed at BOTTOM_CENTER');
        } catch (error) {
            console.error('❌ Failed to show banner:', error);
        }
    }

    public async hideBanner(): Promise<void> {
        if (!this.isAdMobAvailable) return;
        try {
            await this.AdMob.hideBanner();
        } catch (error) { /* ignore */ }
    }

    // --- INTERSTITIAL ---

    public async showInterstitial(): Promise<boolean> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Interstitial Ad');
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log('📺 [MOCK] Interstitial Closed');
                    resolve(true); // Closed
                }, 1000);
            });
        }

        return new Promise(async (resolve) => {
            try {
                // @ts-ignore
                const { Toast } = await import('@capacitor/toast');

                const cleanup = () => {
                    dismissHandler.remove();
                    failHandler.remove();
                    showHandler.remove();
                };

                // v8 Standard: interstitialAdDismissed
                // @ts-ignore
                const dismissHandler = this.AdMob.addListener('interstitialAdDismissed', () => {
                    console.log('📺 Interstitial Dismissed');
                    cleanup();
                    resolve(true);
                });

                // @ts-ignore
                const showHandler = this.AdMob.addListener('interstitialAdShowed', () => {
                    console.log('📺 Interstitial Showed');
                    Toast.show({ text: 'Reklam Gösteriliyor...', duration: 'short' });
                });

                // @ts-ignore
                const failHandler = this.AdMob.addListener('interstitialAdFailedToShow', async (err) => {
                    console.error('❌ Interstitial failed to show', err);
                    cleanup();
                    resolve(false);
                });

                // Show immediately (already prepared by preload)
                await this.AdMob.showInterstitial();

                // Immediately prepare the NEXT one for later
                this.preloadAds();

            } catch (error) {
                console.error('❌ Failed to show interstitial:', error);
                resolve(false);
            }
        });
    }

    // --- REWARDED ---

    public async showRewarded(): Promise<boolean> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Rewarded Ad');
            return new Promise(resolve => {
                const confirmed = window.confirm("Mock Ad: Watch video to double reward?");
                if (confirmed) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }

        return new Promise(async (resolve) => {
            let earnedReward = false;
            try {
                // @ts-ignore
                const { Toast } = await import('@capacitor/toast');

                const timeout = setTimeout(() => {
                    console.warn('🕒 Rewarded ad safety timeout');
                    cleanup();
                    resolve(false);
                }, 20000); // 20 seconds for testing

                const cleanup = () => {
                    clearTimeout(timeout);
                    rewardHandler.remove();
                    dismissHandler.remove();
                    failHandler.remove();
                    if (rewardHandlerLegacy) rewardHandlerLegacy.remove();
                    if (dismissHandlerLegacy) dismissHandlerLegacy.remove();
                };

                // v8 Events (Standard)
                // @ts-ignore
                const rewardHandler = this.AdMob.addListener('rewardAdReward', (reward) => {
                    console.log('🎁 Reward earned (Standard):', reward);
                    earnedReward = true;
                    Toast.show({ text: 'Ödül Kazanıldı! ⭐', duration: 'short' });
                });
                // @ts-ignore
                const dismissHandler = this.AdMob.addListener('rewardAdDismissed', () => {
                    console.log('📺 Ad Dismissed (Standard)');
                    cleanup();
                    resolve(earnedReward);
                });
                // @ts-ignore
                const failHandler = this.AdMob.addListener('rewardAdFailedToShow', (err) => {
                    console.error('❌ Failed to show:', err);
                    cleanup();
                    resolve(false);
                });

                // Legacy/Video variations just in case
                // @ts-ignore
                const rewardHandlerLegacy = this.AdMob.addListener('rewardVideoAdReward', () => { earnedReward = true; });
                // @ts-ignore
                const dismissHandlerLegacy = this.AdMob.addListener('rewardVideoAdDismissed', () => { cleanup(); resolve(earnedReward); });

                // Show immediately (already prepared by preload)
                await this.AdMob.showRewardVideoAd();

                // Immediately prepare the NEXT one
                this.preloadAds();

            } catch (error) {
                console.error('❌ Failed to show rewarded video:', error);
                resolve(false);
            }
        });
    }
}

export default AdManager.getInstance();
