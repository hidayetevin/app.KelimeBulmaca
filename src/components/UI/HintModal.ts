import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import Panel from './Panel';
import Button from './Button';

interface HintModalConfig {
    scene: Phaser.Scene;
    currentStars: number;
    hintCost: number;
    onWatchAd: () => void;
    onUseStars: () => void;
    onClose: () => void;
}

export default class HintModal {
    private scene: Phaser.Scene;
    private panel: Panel;
    private config: HintModalConfig;
    private starButton: Button | null = null;

    constructor(config: HintModalConfig) {
        this.scene = config.scene;
        this.config = config;

        this.panel = new Panel({
            scene: this.scene,
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            width: 300,
            height: 350,
            title: 'İPUCU AL',
            showCloseButton: true,
            onClose: () => {
                this.destroy();
                this.config.onClose();
            }
        });

        this.createContent();
    }

    private createContent() {
        // Coin Icon & Count
        // Top section
        const starContainer = this.scene.add.container(0, -90);

        const starText = this.scene.add.text(0, 0, `${this.config.currentStars}`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '32px',
            color: '#F59E0B', // Gold/Star color
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Star Icon (Emoji for now or graphic)
        const starIcon = this.scene.add.text(-40, 0, '⭐', { fontSize: '28px' }).setOrigin(0.5);
        // Adjust text position based on length? centering the whole group
        const totalW = starIcon.width + starText.width + 10;
        starIcon.x = -totalW / 2 + starIcon.width / 2;
        starText.x = starIcon.x + starIcon.width / 2 + 10 + starText.width / 2;

        starContainer.add([starIcon, starText]);
        this.panel.addContent(starContainer);

        // info text
        const infoText = this.scene.add.text(0, -40, 'Bir kelime açmak için:', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '16px',
            color: '#64748B'
        }).setOrigin(0.5);
        this.panel.addContent(infoText);

        // 1. Button: Watch Ad (Primary)
        const adButton = new Button({
            scene: this.scene,
            x: 0,
            y: 20,
            text: '🎬 İzle ve Kazan',
            width: 240,
            height: 50,
            style: 'primary',
            backgroundColor: 0x8B5CF6, // Purple-ish for Ad
            onClick: () => {
                this.config.onWatchAd();
                this.animateClose();
            }
        });
        this.panel.addContent(adButton);

        // 2. Button: Use Stars (Delayed)
        // Initially invisible
        this.scene.time.delayedCall(1500, () => {
            this.createStarButton();
        });
    }

    private createStarButton() {
        // Check if panel is still active/visible before adding
        if (!this.panel || !this.panel.visible) return;

        const canAfford = this.config.currentStars >= this.config.hintCost;

        this.starButton = new Button({
            scene: this.scene,
            x: 0,
            y: 90,
            text: `${this.config.hintCost} ⭐ Harca`,
            width: 240,
            height: 50,
            style: canAfford ? 'secondary' : 'secondary', // Could add 'disabled' style
            backgroundColor: canAfford ? 0xF59E0B : 0xCBD5E1, // Orange vs Grey
            onClick: () => {
                if (canAfford) {
                    this.config.onUseStars();
                    this.animateClose();
                } else {
                    // Shake effect or toast
                    this.scene.tweens.add({
                        targets: this.starButton,
                        x: '+=5',
                        duration: 50,
                        yoyo: true,
                        repeat: 3
                    });
                }
            }
        });

        // Add with fade in
        this.starButton.setAlpha(0);
        this.panel.addContent(this.starButton);

        this.scene.tweens.add({
            targets: this.starButton,
            alpha: 1,
            y: 90,
            duration: 300,
            ease: 'Power2'
        });
    }

    public show() {
        this.panel.open();
    }

    public animateClose() {
        this.panel.close().then(() => {
            this.destroy();
            this.config.onClose();
        });
    }

    public destroy() {
        // Panel cleans itself up mostly
    }
}
