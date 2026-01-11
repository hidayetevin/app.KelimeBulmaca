import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AdManager from '@/managers/AdManager';
import AudioManager from '@/managers/AudioManager';
import HapticManager from '@/managers/HapticManager';
import Panel from '@/components/UI/Panel';
import Toggle from '@/components/UI/Toggle';
import Slider from '@/components/UI/Slider';
import Button from '@/components/UI/Button';

export default class SettingsScene extends Phaser.Scene {
    private panel!: Panel;

    constructor() {
        super(SCENES.SETTINGS);
    }

    create() {
        // Transparent background block
        // Actually Panel handles backdrop when opened, but SettingsScene is a full scene?
        // Usually scenes stack. If we launch SettingsScene as 'start' (replace), we lose MainMenu.
        // Doc says "Navigasyon -> Ayarlar".
        // If we want it as a popup OVER MainMenu, we should launch parallel.
        // "this.scene.launch(SCENES.SETTINGS)" and SettingsScene background is transparent.
        // Assuming standard scene flow for now.
        // But let's make it look like a modal.

        // If it's a full scene transition:
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background (if full scene)
        this.add.rectangle(0, 0, width, height, 0xF7FAFC).setOrigin(0);

        // Panel
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

        // Add settings content
        this.createSettingsContent();

        // Open panel
        this.panel.open();

        // Handle Escape key
        this.input.keyboard?.on('keydown-ESC', () => {
            this.panel.close().then(() => this.goBack());
        });
    }

    private goBack() {
        // Return to Main Menu
        this.scene.start(SCENES.MAIN_MENU);
    }

    private createSettingsContent() {
        const startY = -120;
        const gap = 60;
        let yPos = startY;

        const gameState = GameManager.getGameState();
        const settings = gameState?.settings || { sound: true, vibration: true, theme: 'light', language: 'tr' };

        // 1. Language Row
        this.createLabel(-140, yPos, LocalizationManager.t('settings.language', 'Dil'));
        // Simple toggle button for EN/TR or Text Button
        // Let's use a Button for now toggling between TR <-> EN
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
                await LocalizationManager.setLanguage(newLang);

                // Refresh Scene to apply language
                this.scene.restart();
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
            value: settings.sound,
            onToggle: (val) => {
                const newSettings = { ...GameManager.getGameState().settings, sound: val };
                GameManager.updateSettings(newSettings);
                if (val) AudioManager.enableSound(); else AudioManager.disableSound();
            }
        });
        this.panel.add(soundToggle);

        yPos += gap;

        // 3. Volume Slider
        this.createLabel(-140, yPos, LocalizationManager.t('settings.volume', 'Ses Seviyesi'));
        const volumeSlider = new Slider({
            scene: this,
            x: 0, // Centered below label? Or right side?
            // Layout is tricky. Let's put slider below the label line or offset right logic.
            // Let's put it on next line centered
            y: yPos + 35,
            width: 250,
            value: AudioManager.getVolume(), // Current volume
            onValueChange: (val) => {
                AudioManager.setVolume(val);
            }
        });
        // We need to re-adjust layout.
        // Label left, but slider is wide.
        // Let's shift label to center top
        // No, Keep consistent.
        // Shift slider to x=60 (center-ish)
        volumeSlider.setX(50);
        this.panel.add(volumeSlider);

        yPos += gap + 20;

        // 4. Haptic Toggle
        this.createLabel(-140, yPos, LocalizationManager.t('settings.haptic', 'Titreşim'));
        const hapticToggle = new Toggle({
            scene: this,
            x: 100,
            y: yPos,
            value: settings.vibration,
            onToggle: (val) => {
                const newSettings = { ...GameManager.getGameState().settings, vibration: val };
                GameManager.updateSettings(newSettings);
                if (val) HapticManager.light();
            }
        });
        this.panel.add(hapticToggle);

        yPos += gap + 20;

        // 5. Reset Progress Button (Danger)
        const resetBtn = new Button({
            scene: this,
            x: 0,
            y: yPos + 40,
            text: LocalizationManager.t('settings.reset', 'İlerlemeyi Sıfırla'),
            style: 'danger',
            width: 260,
            onClick: () => {
                // Confirmation?
                // For now direct reset or simple confirm via browser alert (meh)
                // Let's make it direct but maybe hold duration? 
                // Just direct for prototype step.
                // Or better: show another small overlay?
                if (confirm('Tüm ilerleme silinecek. Emin misiniz?')) {
                    GameManager.resetGameState();
                    HapticManager.heavy();
                    this.scene.start(SCENES.PRELOADER); // Restart game
                }
            }
        });
        this.panel.add(resetBtn);
    }

    private createLabel(x: number, y: number, text: string) {
        const label = this.add.text(x, y, text, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: LIGHT_COLORS.TEXT_DARK,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.panel.add(label);
    }
}
