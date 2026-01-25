import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY, DEFAULT_LANGUAGE } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AudioManager from '@/managers/AudioManager';
import AdManager from '@/managers/AdManager';
import ProgressBar from '@/components/UI/ProgressBar';
import WordDataGenerator from '@/data/WordDataGenerator';
import SoundGenerator from '@/utils/soundGenerator';
import HapticManager from '@/managers/HapticManager';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super(SCENES.PRELOADER);
    }

    preload() {
        this.createLoadingBar();

        // Asset Yükleme - Hata alsa bile devam etmesi için listener
        this.load.on('loaderror', (file: any) => {
            console.warn('⚠️ Asset loading failed:', file.src);
        });

        // --- IMAGES ---
        // Backgrounds - Removed as they are missing in the current repo
        /*
        this.load.image('animals_bg', IMAGE_PATHS.ANIMALS_BG);
        this.load.image('fruits_bg', IMAGE_PATHS.FRUITS_BG);
        this.load.image('cities_bg', IMAGE_PATHS.CITIES_BG);
        */

        // UI - Components use Graphics, no need for images unless using textures
        /*
        this.load.image('button_light', IMAGE_PATHS.BUTTON_LIGHT);
        this.load.image('button_dark', IMAGE_PATHS.BUTTON_DARK);
        this.load.image('panel_light', IMAGE_PATHS.PANEL_LIGHT);
        this.load.image('panel_dark', IMAGE_PATHS.PANEL_DARK);
        this.load.image('star_filled', IMAGE_PATHS.STAR_FILLED);
        this.load.image('star_empty', IMAGE_PATHS.STAR_EMPTY);
        this.load.image('lock_icon', IMAGE_PATHS.LOCK_ICON);
        */

        // Icons - Are now mostly handled with emojis or Text icons in components
        /*
        this.load.image('settings_icon', IMAGE_PATHS.SETTINGS);
        this.load.image('achievement_icon', IMAGE_PATHS.ACHIEVEMENT);
        this.load.image('hint_icon', IMAGE_PATHS.HINT);
        this.load.image('close_icon', IMAGE_PATHS.CLOSE);
        */

        // --- AUDIO ---
        // --- AUDIO ---
        // Assets klasörü boş olduğu için geçici olarak devre dışı
        /*
        Object.values(AUDIO_PATHS).forEach(path => {
            const key = path.split('/').pop()?.replace('.mp3', '') || path;
            this.load.audio(key, path);
        });
        */

        // --- DATA ---
        this.load.json('baslangic_data', 'data/categories/baslangic.json');
        this.load.json('orta_data', 'data/categories/orta.json');
        this.load.json('deneyimli_data', 'data/categories/deneyimli.json');
        this.load.json('uzman_data', 'data/categories/uzman.json');
        this.load.json('bilgin_data', 'data/categories/bilgin.json');
        this.load.json('dahi_data', 'data/categories/dahi.json');
        this.load.json('genel_data', 'data/categories/genel.json');
        this.load.json('kavramlar_data', 'data/categories/kavramlar.json');

        // Font (Google Fonts - index.html'de yüklendi ama burada emin olmak için WebFont loader kullanılabilir)
        // Şimdilik index.html yeterli.
    }

    async create() {
        console.log('📥 Assets loaded');

        // Manager Initialization
        try {
            // Localization
            await LocalizationManager.loadLocale(DEFAULT_LANGUAGE);
            console.log('✅ Localization loaded');

            // AdMob
            await AdManager.init();

            // Game Manager
            console.log('⏳ Initializing Game Manager...');
            await GameManager.init(); // State load & streak check
            console.log('✅ Game Manager initialized');

            // Word Data Pool Initialize
            WordDataGenerator.initFromCache(this);
            console.log('✅ WordDataGenerator initialized from cache');

            // Audio (Scene context gerekli olabilir)
            AudioManager.init(this); // Scene play için referans veriyoruz (opsiyonel)

            // Haptic Manager başlat
            await HapticManager.init();
            console.log('✅ HapticManager initialized');

            // Kullanıcı ayarlarına göre ses ve titreşim durumlarını ayarla
            const settings = GameManager.getSettings();
            if (settings) {
                // Ses ayarı
                if (settings.soundEnabled) {
                    AudioManager.enableSound();
                    SoundGenerator.enable();
                } else {
                    AudioManager.disableSound();
                    SoundGenerator.disable();
                }

                // Titreşim ayarı
                if (settings.vibrationEnabled) {
                    HapticManager.enable();
                } else {
                    HapticManager.disable();
                }
            }

            // Bekleme (Estetik)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Yönlendirme
            this.handleNavigation();

        } catch (error) {
            console.error('❌ Critical initialization error:', error);
            // Hata olsa bile menüye gitmeyi dene
            this.scene.start(SCENES.MAIN_MENU);
        }
    }

    private handleNavigation() {
        // Günlük ödül kontrolü
        if (GameManager.canClaimDailyReward()) {
            // Daily Reward sahnesi henüz yoksa, direkt menüye git
            // this.scene.start(SCENES.DAILY_REWARD);
            console.log('🎁 Daily Reward available!');

            // Şimdilik DailyRewardScene olmadığı için MainMenu'ye gidiyoruz.
            // GameManager günlük ödül kontrolünü yaptı, kullanıcıya göstermek için scene lazım.
            // Adım 15: DailyRewardScene yapılınca burayı güncelle.
            this.scene.start(SCENES.MAIN_MENU);
        } else {
            this.scene.start(SCENES.MAIN_MENU);
        }
    }

    private createLoadingBar() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;
        const centerY = height / 2;

        // Arkaplan rengi
        this.cameras.main.setBackgroundColor(LIGHT_COLORS.BACKGROUND);

        // Logo Text (Asset yoksa diye)
        this.add.text(centerX, centerY - 100, 'KELİME\nUSTASI', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '48px',
            color: '#6C63FF',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Use ProgressBar component (circular mode)
        const progressBar = new ProgressBar({
            scene: this,
            x: centerX,
            y: centerY + 50,
            mode: 'circular',
            radius: 50,
            showPercentage: true,
            color: LIGHT_COLORS.ACCENT
        });

        // Yükleniyor Yazısı
        const loadingText = this.add.text(centerX, centerY + 140, 'Yükleniyor...', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '16px',
            color: '#666666'
        }).setOrigin(0.5);

        // Events
        this.load.on('progress', (value: number) => {
            progressBar.setValue(value, false);
        });

        this.load.on('complete', () => {
            loadingText.setText('Hazır!');
            progressBar.complete();
        });
    }
}
