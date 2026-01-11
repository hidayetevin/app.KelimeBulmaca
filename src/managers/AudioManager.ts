import Phaser from 'phaser';
import { AUDIO_PATHS } from '@/utils/constants';

/**
 * Audio Manager - Singleton
 * Ses efektlerini yönetir (Phaser Sound Manager wrapper)
 */
class AudioManager {
    private static instance: AudioManager;
    private scene?: Phaser.Scene;
    private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
    private soundEnabled: boolean = true;
    private volume: number = 0.7;

    private constructor() {
        // Singleton pattern
    }

    /**
     * Singleton instance döndürür
     */
    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * Audio Manager'ı başlatır
     * @param scene - Mevcut Phaser scene
     */
    public init(scene: Phaser.Scene): void {
        this.scene = scene;
        console.log('✅ AudioManager initialized');
    }

    /**
     * Ses efekti çalar
     * @param key - Ses anahtarı (AUDIO_PATHS'ten)
     * @param config - Phaser sound config (opsiyonel)
     */
    public playSfx(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
        if (!this.soundEnabled || !this.scene) {
            return;
        }

        try {
            // Ses zaten yüklü mü kontrol et
            if (!this.scene.cache.audio.exists(key)) {
                console.warn(`⚠️ Sound not loaded: ${key}`);
                return;
            }

            // Varsayılan config
            const defaultConfig: Phaser.Types.Sound.SoundConfig = {
                volume: this.volume,
                ...config,
            };

            // Sesi çal
            const sound = this.scene.sound.add(key, defaultConfig);
            sound.play();

            // Tamamlandığında temizle
            sound.once('complete', () => {
                sound.destroy();
            });

        } catch (error) {
            console.error(`❌ Error playing sound ${key}:`, error);
        }
    }

    /**
     * Tüm sesleri durdurur
     */
    public stopAllSfx(): void {
        if (this.scene) {
            this.scene.sound.stopAll();
        }
    }

    /**
     * Belirli bir sesi durdurur
     * @param key - Durdurulacak ses anahtarı
     */
    public stopSfx(key: string): void {
        if (this.scene) {
            this.scene.sound.stopByKey(key);
        }
    }

    /**
     * Ses seviyesini ayarlar
     * @param volume - Ses seviyesi (0.0 - 1.0)
     */
    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume)); // Clamp 0-1

        if (this.scene) {
            this.scene.sound.volume = this.volume;
        }

        console.log(`🔊 Volume set to: ${this.volume}`);
    }

    /**
     * Ses açık mı kontrol eder
     * @returns Ses durumu
     */
    public isSoundEnabled(): boolean {
        return this.soundEnabled;
    }

    /**
     * Sesi aç/kapat
     */
    public toggleSound(): void {
        this.soundEnabled = !this.soundEnabled;

        if (this.scene) {
            if (this.soundEnabled) {
                this.scene.sound.resumeAll();
            } else {
                this.scene.sound.pauseAll();
            }
        }

        console.log(`🔊 Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Sesi programatik olarak aç
     */
    public enableSound(): void {
        if (!this.soundEnabled) {
            this.toggleSound();
        }
    }

    /**
     * Sesi programatik olarak kapat
     */
    public disableSound(): void {
        if (this.soundEnabled) {
            this.toggleSound();
        }
    }

    /**
     * Mevcut ses seviyesini döndürür
     * @returns Ses seviyesi (0.0 - 1.0)
     */
    public getVolume(): number {
        return this.volume;
    }

    /**
     * Ses efekti için kolaylık metodları
     */

    public playLetterSelect(): void {
        this.playSfx('letter_select', { volume: this.volume * 0.8 });
    }

    public playLetterDeselect(): void {
        this.playSfx('letter_deselect', { volume: this.volume * 0.6 });
    }

    public playWordCorrect(): void {
        this.playSfx('word_correct', { volume: this.volume });
    }

    public playWordWrong(): void {
        this.playSfx('word_wrong', { volume: this.volume });
    }

    public playLevelComplete(): void {
        this.playSfx('level_complete', { volume: this.volume });
    }

    public playCategoryComplete(): void {
        this.playSfx('category_complete', { volume: this.volume });
    }

    public playAchievementUnlock(): void {
        this.playSfx('achievement_unlock', { volume: this.volume });
    }

    public playStarCollect(): void {
        this.playSfx('star_collect', { volume: this.volume * 0.9 });
    }

    public playUnlock(): void {
        this.playSfx('unlock', { volume: this.volume });
    }

    public playButtonClick(): void {
        this.playSfx('button_click', { volume: this.volume * 0.7 });
    }

    public playHintShow(): void {
        this.playSfx('hint_show', { volume: this.volume * 0.8 });
    }

    /**
     * Tüm ses dosyalarının yüklenip yüklenmediğini kontrol eder
     * @returns Yüklenme durumu
     */
    public areSoundsLoaded(): boolean {
        if (!this.scene) {
            return false;
        }

        const soundKeys = Object.keys(AUDIO_PATHS);
        return soundKeys.every(key => this.scene!.cache.audio.exists(key));
    }
}

// Export singleton instance
export default AudioManager.getInstance();
