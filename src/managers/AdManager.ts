import { REWARDED_AD_REWARD_STARS, AD_COOLDOWN_SECONDS } from '@/utils/constants';
import GameManager from './GameManager';
import LocalizationManager from './LocalizationManager';

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
    private lastInterstitialTime: number = 0;

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
            const adId = TEST_ADS.ANDROID.BANNER; // TODO: Detect Platform
            const options = {
                adId: adId,
                adSize: this.BannerAdSize.BANNER,
                position: this.BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: this.isTestMode
            };

            await this.AdMob.showBanner(options);
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
                const adId = TEST_ADS.ANDROID.INTERSTITIAL;

                // Add Listeners
                // @ts-ignore
                const dismissHandler = this.AdMob.addListener('onInterstitialAdDismissed', () => {
                    dismissHandler.remove();
                    resolve(true);
                });

                // @ts-ignore
                const failHandler = this.AdMob.addListener('onInterstitialAdFailedToLoad', (err) => {
                    failHandler.remove();
                    console.error('Interstitial failed to load', err);
                    resolve(false);
                });

                // Prepare and Show
                await this.AdMob.prepareInterstitial({ adId, isTesting: this.isTestMode });
                await this.AdMob.showInterstitial();

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
                const adId = TEST_ADS.ANDROID.REWARDED;

                // @ts-ignore
                const rewardHandler = this.AdMob.addListener('onRewardVideoReward', (reward) => {
                    console.log('🎁 Reward earned:', reward);
                    earnedReward = true;
                });

                // @ts-ignore
                const dismissHandler = this.AdMob.addListener('onRewardVideoAdDismissed', () => {
                    rewardHandler.remove();
                    dismissHandler.remove();
                    resolve(earnedReward);
                });

                await this.AdMob.prepareRewardVideoAd({ adId, isTesting: this.isTestMode });
                await this.AdMob.showRewardVideoAd();

            } catch (error) {
                console.error('❌ Failed to show rewarded video:', error);
                resolve(false);
            }
        });
    }
}

export default AdManager.getInstance();
