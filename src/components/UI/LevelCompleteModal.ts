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

        this.createContent(data.stars);
        this.startAnimations();
    }

    private createContent(stars: number) {
        // Modal Background
        const modalWidth = GAME_WIDTH * 0.85;
        const modalHeight = GAME_HEIGHT * 0.5;
        const modalBg = this.sceneRef.add.rectangle(0, 0, modalWidth, modalHeight, 0xFFFFFF)
            .setStrokeStyle(4, 0x3182CE);
        // .setRounded(16) // Phaser rectangle doesn't support rounded corners native easily without graphics, using rect for simplicity or graphics if needed

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
        }).setOrigin(0.5);
        this.contentContainer.add(titleText);

        // Stars
        const starText = this.sceneRef.add.text(0, -50, '⭐'.repeat(stars), {
            fontSize: '48px'
        }).setOrigin(0.5);
        this.contentContainer.add(starText);

        const scoreLabel = this.sceneRef.add.text(0, 10, `${stars} Yıldız Kazandın`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: '#718096'
        }).setOrigin(0.5);
        this.contentContainer.add(scoreLabel);

        // Buttons
        const buttonYUserInfo = 80;

        // x2 Button (Full Width inside modal padding)
        this.doubleRewardButton = new Button({
            scene: this.sceneRef,
            x: 0,
            y: buttonYUserInfo,
            text: '📺 2x KAZAN',
            width: modalWidth - 60,
            height: 60,
            style: 'primary', // Maybe a special style for ads?
            onClick: () => this.onDoubleReward()
        });
        // Add icon to button if possible, doing text for now
        this.contentContainer.add(this.doubleRewardButton);

        // Continue Button (Initially Hidden)
        this.continueButton = new Button({
            scene: this.sceneRef,
            x: 0,
            y: buttonYUserInfo + 80,
            text: 'Devam Et',
            width: modalWidth - 60,
            height: 60,
            style: 'secondary',
            onClick: () => this.onContinue()
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
                y: this.doubleRewardButton.y + 80, // Ensure strictly positioned
                duration: 500
            });
        });
    }
}
