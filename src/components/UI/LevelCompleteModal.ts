import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import Button from './Button';

export default class LevelCompleteModal extends Phaser.GameObjects.Container {
    private sceneRef: Phaser.Scene;
    private background: Phaser.GameObjects.Rectangle;
    private contentContainer: Phaser.GameObjects.Container;
    private continueButton!: Button;
    private doubleRewardButton!: Button;

    private onContinue: () => void;
    private onDoubleReward: () => void;

    constructor(data: {
        scene: Phaser.Scene,
        stars: number,
        time?: number,
        hintsUsed?: number,
        onContinue: () => void,
        onDoubleReward: () => void
    }) {
        super(data.scene, 0, 0);
        this.sceneRef = data.scene;
        this.onContinue = data.onContinue;
        this.onDoubleReward = data.onDoubleReward;

        this.setDepth(1000); // Ensure it's on top of everything
        this.sceneRef.add.existing(this);

        this.background = this.sceneRef.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
            .setOrigin(0)
            .setInteractive(); // Block input behind

        this.contentContainer = this.sceneRef.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

        this.add(this.background);
        this.add(this.contentContainer);

        this.createContent(data.stars, data.time, data.hintsUsed);
        this.startAnimations();
    }

    private createContent(stars: number, time?: number, hintsUsed?: number) {
        // Modal Background
        const modalWidth = GAME_WIDTH * 0.85;
        const modalHeight = GAME_HEIGHT * 0.6;

        const modalGraphics = this.sceneRef.add.graphics();
        modalGraphics.fillStyle(0xFFFFFF, 1);
        modalGraphics.lineStyle(4, 0x3182CE, 1);
        modalGraphics.fillRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, 20);
        modalGraphics.strokeRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, 20);

        this.contentContainer.add(modalGraphics);

        // Title
        const titleText = this.sceneRef.add.text(0, -modalHeight / 2 + 50, 'TEBRİKLER!', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '32px',
            color: '#2D3748',
            fontStyle: 'bold'
        }).setOrigin(0.5).setResolution(window.devicePixelRatio);
        this.contentContainer.add(titleText);

        // Stars
        const starText = this.sceneRef.add.text(0, -modalHeight * 0.15, '⭐'.repeat(stars), {
            fontSize: '48px',
            padding: { top: 10, bottom: 10 }
        }).setOrigin(0.5).setResolution(window.devicePixelRatio);
        this.contentContainer.add(starText);

        const scoreLabel = this.sceneRef.add.text(0, -modalHeight * 0.15 + 60, `${stars} Yıldız Kazandın`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: '#718096'
        }).setOrigin(0.5).setResolution(window.devicePixelRatio);
        this.contentContainer.add(scoreLabel);

        // Performance info
        let yOffset = -modalHeight * 0.15 + 90;

        if (time !== undefined) {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            const timeText = this.sceneRef.add.text(0, yOffset, `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '16px',
                color: '#4A5568'
            }).setOrigin(0.5).setResolution(window.devicePixelRatio);
            this.contentContainer.add(timeText);
            yOffset += 25;
        }

        if (hintsUsed !== undefined) {
            const hintsText = this.sceneRef.add.text(0, yOffset, `💡 İpucu: ${hintsUsed}`, {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '16px',
                color: '#4A5568'
            }).setOrigin(0.5).setResolution(window.devicePixelRatio);
            this.contentContainer.add(hintsText);
            yOffset += 25;
        }

        // Performance message
        const performanceMsg = stars === 3 ? 'Mükemmel!' : stars === 2 ? 'İyi iş!' : 'Tamamlandı!';
        const performanceText = this.sceneRef.add.text(0, yOffset, performanceMsg, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '18px',
            color: stars === 3 ? '#48BB78' : stars === 2 ? '#F6AD55' : '#718096',
            fontStyle: 'bold',
            padding: { bottom: 5 }
        }).setOrigin(0.5).setResolution(window.devicePixelRatio);
        this.contentContainer.add(performanceText);

        // Buttons
        const buttonYUserInfo = modalHeight / 2 - 120;

        // x2 Button (Full Width inside modal padding)
        this.doubleRewardButton = new Button({
            scene: this.sceneRef,
            x: 0,
            y: buttonYUserInfo,
            text: '📺 2x KAZAN',
            width: modalWidth - 60,
            height: 60,
            style: 'primary', // Maybe a special style for ads?
            onClick: () => {
                this.onDoubleReward();
            }
        });
        // Add icon to button if possible, doing text for now
        this.contentContainer.add(this.doubleRewardButton);

        // Continue Button (Initially Hidden)
        this.continueButton = new Button({
            scene: this.sceneRef,
            x: 0,
            y: buttonYUserInfo + 75,
            text: 'Devam Et',
            width: modalWidth - 60,
            height: 60,
            style: 'secondary',
            onClick: () => {
                this.onContinue();
            }
        });
        this.continueButton.setVisible(false);
        this.contentContainer.add(this.continueButton);
    }

    private startAnimations() {
        // Pop in animation
        this.contentContainer.setScale(0);
        this.sceneRef.tweens.add({
            targets: this.contentContainer,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });

        // Show Continue button after 4 seconds
        this.sceneRef.time.delayedCall(4000, () => {
            this.continueButton.setVisible(true);
            this.continueButton.setAlpha(0);

            this.sceneRef.tweens.add({
                targets: this.continueButton,
                alpha: 1,
                y: this.doubleRewardButton.y + 75, // Ensure strictly positioned
                duration: 500
            });
        });
    }

}
