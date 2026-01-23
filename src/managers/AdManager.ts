import GameManager from '@/managers/GameManager';

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
            } else {
                console.log('ℹ️ AdMob running in web mode (Mock)');
            }
        } catch (error) {
            console.error('❌ AdMob initialization failed:', error);
            this.isAdMobAvailable = false;
        }
    }

    // --- BANNER ---

    public async showBanner(): Promise<void> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Banner Ad (Bottom)');
            return;
        }

        try {
            const adId = TEST_ADS.ANDROID.BANNER;

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
                    resolve(true);
                }, 1000);
            });
        }

        return new Promise(async (resolve) => {
            try {
                const adId = TEST_ADS.ANDROID.INTERSTITIAL;

                const cleanup = () => {
                    dismissHandler.remove();
                    failHandler.remove();
                };

                // @ts-ignore
                const dismissHandler = this.AdMob.addListener('onInterstitialAdDismissed', () => {
                    console.log('📺 Interstitial Dismissed');
                    cleanup();
                    resolve(true);
                });

                // @ts-ignore
                const failHandler = this.AdMob.addListener('onInterstitialAdFailedToShow', (err) => {
                    console.error('❌ Interstitial failed:', err);
                    cleanup();
                    resolve(false);
                });

                await this.AdMob.prepareInterstitial({ adId, isTesting: this.isTestMode });
                await this.AdMob.showInterstitial();

            } catch (error) {
                console.error('❌ Failed to show interstitial:', error);
                resolve(false);
            }
        });
    }

    // --- REWARDED ---

    public async showRewarded(rewardAmount: number = 0): Promise<boolean> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Rewarded Ad');
            return new Promise(resolve => {
                const confirmed = window.confirm("Mock Ad: Watch video to double reward?");
                if (confirmed && rewardAmount > 0) {
                    GameManager.addStars(rewardAmount);
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }

        return new Promise(async (resolve) => {
            let adWasShown = false;
            let adFailed = false;

            try {
                const adId = TEST_ADS.ANDROID.REWARDED;

                const timeout = setTimeout(() => {
                    console.warn('🕒 Rewarded ad timeout');
                    cleanup();
                    resolve(false);
                }, 30000);

                const cleanup = () => {
                    clearTimeout(timeout);
                    loadedHandler.remove();
                    showHandler.remove();
                    rewardHandler.remove();
                    dismissHandler.remove();
                    failHandler.remove();
                };

                // Rewarded Video Events
                // @ts-ignore
                const loadedHandler = this.AdMob.addListener('onRewardedVideoAdLoaded', () => {
                    console.log('📥 Rewarded ad loaded');
                });

                // @ts-ignore
                const showHandler = this.AdMob.addListener('onRewardedVideoAdShowed', () => {
                    console.log('📺 Rewarded ad showed');
                    adWasShown = true;
                });

                // @ts-ignore
                const rewardHandler = this.AdMob.addListener('onRewardedVideoAdReward', (reward) => {
                    console.log('🎁 Reward earned!', reward);
                });

                // @ts-ignore
                const dismissHandler = this.AdMob.addListener('onRewardedVideoAdDismissed', () => {
                    console.log('📺 Rewarded ad dismissed');

                    if (adWasShown && !adFailed && rewardAmount > 0) {
                        GameManager.addStars(rewardAmount);
                        // @ts-ignore
                        import('@capacitor/toast').then(m => m.Toast.show({
                            text: `🌟 +${rewardAmount} Yıldız!`,
                            duration: 'long'
                        }));
                        console.log(`✅ Rewarded ${rewardAmount} stars`);
                        resolve(true);
                    } else {
                        console.warn(`No reward: shown=${adWasShown}, failed=${adFailed}`);
                        resolve(false);
                    }
                    cleanup();
                });

                // @ts-ignore
                const failHandler = this.AdMob.addListener('onRewardedVideoAdFailedToShow', (err) => {
                    console.error('❌ Rewarded ad failed:', err);
                    adFailed = true;
                    cleanup();
                    resolve(false);
                });

                // Prepare and show
                await this.AdMob.prepareRewardVideoAd({ adId, isTesting: this.isTestMode });
                await this.AdMob.showRewardVideoAd();

            } catch (error) {
                console.error('❌ Failed to show rewarded ad:', error);
                resolve(false);
            }
        });
    }
}

export default AdManager.getInstance();
