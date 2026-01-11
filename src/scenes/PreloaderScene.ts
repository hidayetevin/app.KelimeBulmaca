import Phaser from 'phaser';
import { SCENES, IMAGE_PATHS, AUDIO_PATHS, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY, DEFAULT_LANGUAGE } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AudioManager from '@/managers/AudioManager';
import AdManager from '@/managers/AdManager';

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
        // Backgrounds
        this.load.image('animals_bg', IMAGE_PATHS.ANIMALS_BG);
        this.load.image('fruits_bg', IMAGE_PATHS.FRUITS_BG);
        this.load.image('cities_bg', IMAGE_PATHS.CITIES_BG);

        // UI
        this.load.image('button_light', IMAGE_PATHS.BUTTON_LIGHT);
        this.load.image('button_dark', IMAGE_PATHS.BUTTON_DARK);
        this.load.image('panel_light', IMAGE_PATHS.PANEL_LIGHT);
        this.load.image('panel_dark', IMAGE_PATHS.PANEL_DARK);
        this.load.image('star_filled', IMAGE_PATHS.STAR_FILLED);
        this.load.image('star_empty', IMAGE_PATHS.STAR_EMPTY);
        this.load.image('lock_icon', IMAGE_PATHS.LOCK_ICON);

        // Icons
        this.load.image('settings_icon', IMAGE_PATHS.SETTINGS);
        this.load.image('achievement_icon', IMAGE_PATHS.ACHIEVEMENT);
        this.load.image('hint_icon', IMAGE_PATHS.HINT);
        this.load.image('close_icon', IMAGE_PATHS.CLOSE);

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
        // Kategori JSON'larını WordDataGenerator zaten fetch ile çekiyor, 
        // burada preload etmeye gerek yok ama cache'e almak istersen:
        this.load.json('animals_data', '/data/categories/animals.json');
        this.load.json('fruits_data', '/data/categories/fruits.json');
        this.load.json('cities_data', '/data/categories/cities.json');

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
            GameManager.init(); // State load & streak check

            // Audio (Scene context gerekli olabilir)
            AudioManager.init(this); // Scene play için referans veriyoruz (opsiyonel)

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
            color: '#FFFFFF',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Progress Box
        const progressBoxWidth = 280;
        const progressBoxHeight = 20;

        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x000000, 0.2);
        progressBox.fillRoundedRect(centerX - progressBoxWidth / 2, centerY + 50, progressBoxWidth, progressBoxHeight, 10);

        // Progress Bar (Dolum)
        const progressBar = this.add.graphics();

        // Yükleniyor Yazısı
        const loadingText = this.add.text(centerX, centerY + 100, 'Yükleniyor...', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '16px',
            color: '#666666'
        }).setOrigin(0.5);

        // Percent Text
        const percentText = this.add.text(centerX, centerY + 50 + 10 + 25, '0%', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '14px',
            color: '#888888',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Events
        this.load.on('progress', (value: number) => {
            percentText.setText(Math.floor(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xFF9F1C, 1); // Turuncu (Primary Color)

            // Rounded rect progress
            const w = (progressBoxWidth - 4) * value;
            if (w > 0) {
                progressBar.fillRoundedRect(centerX - progressBoxWidth / 2 + 2, centerY + 50 + 2, w, progressBoxHeight - 4, 8);
            }
        });

        this.load.on('complete', () => {
            loadingText.setText('Hazır!');
            // destroy işlemleri create içinde otomatik temizlenecek scene değişince
        });
    }
}
