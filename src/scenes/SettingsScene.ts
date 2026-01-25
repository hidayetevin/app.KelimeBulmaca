import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AudioManager from '@/managers/AudioManager';
import HapticManager from '@/managers/HapticManager';
import Panel from '@/components/UI/Panel';
import Toggle from '@/components/UI/Toggle';
import Button from '@/components/UI/Button';
import { GameSettings } from '@/types/GameTypes';
import SoundGenerator from '@/utils/soundGenerator';

export default class SettingsScene extends Phaser.Scene {
    private panel!: Panel;

    constructor() {
        super(SCENES.SETTINGS);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;
        const centerY = height / 2;

        this.add.rectangle(0, 0, width, height, 0xF7FAFC).setOrigin(0);

        this.panel = new Panel({
            scene: this,
            x: centerX,
            y: centerY,
            width: width - 60,
            height: height - 150,
            title: LocalizationManager.t('settings.title', 'AYARLAR'),
            showCloseButton: true,
            onClose: () => {
                this.goBack();
            }
        });

        this.createSettingsContent();
        this.panel.open();

        this.input.keyboard?.on('keydown-ESC', () => {
            this.panel.close().then(() => this.goBack());
        });
    }

    private goBack() {
        this.scene.start(SCENES.MAIN_MENU);
    }

    private createSettingsContent() {
        const startY = -120;
        const gap = 80; // Increased gap for better look
        let yPos = startY;

        const gameState = GameManager.getGameState();
        const defaultSettings: GameSettings = {
            language: 'tr',
            darkMode: false,
            soundEnabled: true,
            soundVolume: 1.0,
            vibrationEnabled: true,
            showHints: true
        };
        const settings = gameState?.settings || defaultSettings;

        // 1. Language Row
        this.createLabel(-140, yPos, LocalizationManager.t('settings.language', 'Dil'));

        const currentLang = LocalizationManager.getCurrentLanguage().toUpperCase();
        const langBtn = new Button({
            scene: this,
            x: 100,
            y: yPos,
            text: currentLang,
            width: 80,
            height: 40,
            fontSize: 18,
            style: 'secondary',
            onClick: async () => {
                const newLang = currentLang === 'TR' ? 'en' : 'tr';
                localStorage.setItem('language', newLang);
                window.location.reload();
            }
        });
        this.panel.add(langBtn);

        yPos += gap;

        // 2. Sound Toggle
        this.createLabel(-140, yPos, LocalizationManager.t('settings.sound', 'Ses Efektleri'));
        const soundToggle = new Toggle({
            scene: this,
            x: 100,
            y: yPos,
            value: settings.soundEnabled,
            onToggle: (val) => {
                const current = GameManager.getSettings();
                const newSettings = { ...current, soundEnabled: val };
                GameManager.updateSettings(newSettings);

                // Hem AudioManager hem de SoundGenerator'ı kontrol et
                if (val) {
                    AudioManager.enableSound();
                    SoundGenerator.enable();
                } else {
                    AudioManager.disableSound();
                    SoundGenerator.disable();
                }
            }
        });
        this.panel.add(soundToggle);

        yPos += gap;

        // 3. Haptic Toggle
        this.createLabel(-140, yPos, LocalizationManager.t('settings.haptic', 'Titreşim'));
        const hapticToggle = new Toggle({
            scene: this,
            x: 100,
            y: yPos,
            value: settings.vibrationEnabled,
            onToggle: (val) => {
                const current = GameManager.getSettings();
                const newSettings = { ...current, vibrationEnabled: val };
                GameManager.updateSettings(newSettings);

                // HapticManager'ı kontrol et
                if (val) {
                    HapticManager.enable();
                    HapticManager.light(); // Test titreşimi
                } else {
                    HapticManager.disable();
                }
            }
        });
        this.panel.add(hapticToggle);

        yPos += gap + 20;

        // 4. Reset Progress Button
        const resetBtn = new Button({
            scene: this,
            x: 0,
            y: yPos + 40,
            text: LocalizationManager.t('settings.reset', 'İlerlemeyi Sıfırla'),
            style: 'danger',
            width: 260,
            onClick: () => {
                if (confirm('Tüm ilerleme silinecek. Emin misiniz?')) {
                    GameManager.resetGame();
                    HapticManager.heavy();
                    this.scene.start(SCENES.PRELOADER);
                }
            }
        });
        this.panel.add(resetBtn);
    }

    private createLabel(x: number, y: number, text: string) {
        const colorStr = '#' + LIGHT_COLORS.TEXT_DARK.toString(16).padStart(6, '0');
        const label = this.add.text(x, y, text, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: colorStr,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.panel.add(label);
    }

    destroy() {
        this.input.keyboard?.off('keydown-ESC');
        console.log('🧹 SettingsScene cleaned up');
    }
}
