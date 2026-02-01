import GameManager from '@/managers/GameManager';
import { AD_IDS } from '@/utils/constants';

class AdManager {
    private static instance: AdManager;
    private isAdMobAvailable: boolean = false;
    private isTestMode: boolean = false;

    // Capacitor AdMob References
    private AdMob: any = null;
    private BannerAdSize: any = null;
    private BannerAdPosition: any = null;

    // Ad Status Flags
    private isInterstitialReady: boolean = false;
    private isRewardedReady: boolean = false;

    private constructor() {
        // init called externally
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
                    // testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Removed for production
                    initializeForTesting: false,
                    // ✅ Google Play Families Policy Compliance
                    tagForChildDirectedTreatment: false,    // App is NOT designed for children
                    tagForUnderAgeOfConsent: false,          // Users are NOT under age of consent
                    maxAdContentRating: 'G'                  // Only General Audience ads (Family-safe)
                });

                this.isAdMobAvailable = true;
                console.log('✅ AdMob initialized');

                // Preload ads immediately
                this.registerGlobalListeners();
                this.preloadInterstitial();
                this.preloadRewarded();
            } else {
                console.log('ℹ️ AdMob running in web mode (Mock)');
            }
        } catch (error) {
            console.error('❌ AdMob initialization failed:', error);
            this.isAdMobAvailable = false;
        }
    }

    private registerGlobalListeners() {
        if (!this.AdMob) return;

        // Interstitial Listeners
        this.AdMob.addListener('onInterstitialAdLoaded', () => {
            console.log('📦 Interstitial Ad READY');
            this.isInterstitialReady = true;
        });

        this.AdMob.addListener('onInterstitialAdDismissed', () => {
            console.log('📺 Interstitial Dismissed');
            this.isInterstitialReady = false;
            // Preload next one
            this.preloadInterstitial();
        });

        this.AdMob.addListener('onInterstitialAdFailedToShow', (err: any) => {
            console.error('❌ Interstitial failed to show:', err);
            this.isInterstitialReady = false;
            this.preloadInterstitial();
        });

        // Rewarded Listeners
        this.AdMob.addListener('onRewardedVideoAdLoaded', () => {
            console.log('📦 Rewarded Ad READY');
            this.isRewardedReady = true;
        });

        this.AdMob.addListener('onRewardedVideoAdDismissed', () => {
            console.log('📺 Rewarded Dismissed');
            this.isRewardedReady = false;
            // Preload next one
            this.preloadRewarded();
        });

        this.AdMob.addListener('onRewardedVideoAdFailedToShow', (err: any) => {
            console.error('❌ Rewarded failed to show:', err);
            this.isRewardedReady = false;
            this.preloadRewarded();
        });
    }

    // --- BANNER ---

    public async showBanner(): Promise<void> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Banner Ad (Bottom)');
            return;
        }

        try {
            const adId = AD_IDS.BANNER;

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

    private async preloadInterstitial() {
        if (!this.isAdMobAvailable) return;
        try {
            console.log('↻ Preloading Interstitial...');
            await this.AdMob.prepareInterstitial({
                adId: AD_IDS.INTERSTITIAL,
                isTesting: this.isTestMode
            });
        } catch (e) {
            console.error('Preload Interstitial error:', e);
        }
    }

    public async showInterstitial(): Promise<boolean> {
        if (!this.isAdMobAvailable) {
            console.log('📺 [MOCK] Showing Interstitial Ad');
            return new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (this.isInterstitialReady) {
            console.log('🚀 Showing Preloaded Interstitial');
            await this.AdMob.showInterstitial();
            return true;
        } else {
            console.log('⚠️ Interstitial not ready, trying JIT load...');
            // Fallback: try to load and show
            try {
                await this.preloadInterstitial();
                await this.AdMob.showInterstitial();
                return true;
            } catch (e) {
                console.error('Failed JIT Interstitial:', e);
                return false;
            }
        }
    }

    // --- REWARDED ---

    private async preloadRewarded() {
        if (!this.isAdMobAvailable) return;
        try {
            console.log('↻ Preloading Rewarded...');
            await this.AdMob.prepareRewardVideoAd({
                adId: AD_IDS.REWARDED,
                isTesting: this.isTestMode
            });
        } catch (e) {
            console.error('Preload Rewarded error:', e);
        }
    }

    public async showRewarded(rewardAmount: number = 0): Promise<boolean> {
        if (!this.isAdMobAvailable) {
            return new Promise(resolve => {
                const confirmed = window.confirm("Mock Ad: Watch video to double reward?");
                if (confirmed) {
                    if (rewardAmount > 0) {
                        GameManager.addStars(rewardAmount);
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }

        return new Promise(async (resolve) => {
            // Setup temporary one-time reward listener for this specific show instance
            // Global listener handles loading, but we need to capture reward for this specific call
            let rewardEarned = false;

            const onReward = (item: any) => {
                console.log('🎁 Reward Captured:', item);
                rewardEarned = true;
            };

            // We attach a temporary listener for reward
            const rewardHandler = this.AdMob.addListener('onRewardedVideoAdReward', onReward);

            // We listen for dismiss to resolve the promise
            // Note: The global dismiss listener will ALSO fire and trigger preload.
            const dismissHandler = this.AdMob.addListener('onRewardedVideoAdDismissed', async () => {
                dismissHandler.remove();
                rewardHandler.remove();

                if (rewardEarned) {
                    if (rewardAmount > 0) {
                        GameManager.addStars(rewardAmount);
                        // @ts-ignore
                        import('@capacitor/toast').then(m => m.Toast.show({
                            text: `🌟 +${rewardAmount} Yıldız!`,
                            duration: 'long'
                        }));
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            try {
                if (this.isRewardedReady) {
                    console.log('🚀 Showing Preloaded Rewarded');
                    await this.AdMob.showRewardVideoAd();
                } else {
                    console.log('⚠️ Rewarded not ready, trying JIT load...');
                    await this.preloadRewarded();
                    await this.AdMob.showRewardVideoAd();
                }
            } catch (error) {
                console.error('❌ Failed to show rewarded ad:', error);
                // Clean up listeners if fail
                dismissHandler.remove();
                rewardHandler.remove();
                resolve(false);
            }
        });
    }
}

export default AdManager.getInstance();
