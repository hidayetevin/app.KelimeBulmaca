import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import GameManager from '@/managers/GameManager';
import Button from '@/components/UI/Button';

export default class LevelSelectionScene extends Phaser.Scene {
    private levelButtons: Phaser.GameObjects.Container[] = [];
    private scrollContainer!: Phaser.GameObjects.Container;
    private scrollY: number = 0;

    constructor() {
        super(SCENES.LEVEL_SELECTION);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;

        // Background
        this.add.rectangle(0, 0, width, height, 0xF7FAFC).setOrigin(0);

        this.createHeader();
        this.createLevelGrid();
        this.setupScrolling();
    }

    private createHeader() {
        const headerHeight = 80;
        this.add.rectangle(0, 0, GAME_WIDTH, headerHeight, 0xFFFFFF).setOrigin(0);

        // Back button
        new Button({
            scene: this,
            x: 50,
            y: headerHeight / 2,
            text: '<',
            width: 40,
            height: 40,
            style: 'secondary',
            onClick: () => {
                this.scene.start(SCENES.MAIN_MENU);
            }
        });

        // Title
        this.add.text(GAME_WIDTH / 2, headerHeight / 2, 'SEVİYELER', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '28px',
            color: '#2D3748',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    private createLevelGrid() {
        const startY = 100;
        const cols = 5;
        const totalLevels = 100;
        const buttonSize = 60;
        const spacing = 15;
        const gridWidth = cols * (buttonSize + spacing) - spacing;
        const startX = (GAME_WIDTH - gridWidth) / 2;

        this.scrollContainer = this.add.container(0, 0);

        const currentLevel = GameManager.getCurrentLevel();

        for (let i = 1; i <= totalLevels; i++) {
            const col = (i - 1) % cols;
            const row = Math.floor((i - 1) / cols);

            const x = startX + col * (buttonSize + spacing);
            const y = startY + row * (buttonSize + spacing);

            const levelData = GameManager.getLevelData(i);
            const isUnlocked = i === 1 || (levelData?.isUnlocked ?? false);
            const isCompleted = levelData?.isCompleted ?? false;
            const stars = levelData?.stars ?? 0;

            const button = this.createLevelButton(i, x, y, buttonSize, isUnlocked, isCompleted, stars, i === currentLevel);
            this.scrollContainer.add(button);
            this.levelButtons.push(button);
        }

        this.add.existing(this.scrollContainer);
    }

    private createLevelButton(
        level: number,
        x: number,
        y: number,
        size: number,
        isUnlocked: boolean,
        isCompleted: boolean,
        stars: number,
        isCurrent: boolean
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Background
        const bg = this.add.graphics();
        let bgColor = 0xE5E7EB; // Locked (gray)

        if (isCompleted) {
            bgColor = 0x10B981; // Completed (green)
        } else if (isCurrent || isUnlocked) {
            bgColor = 0x3B82F6; // Current/Unlocked (blue)
        }

        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
        container.add(bg);

        // Level number or lock icon
        if (isUnlocked) {
            const levelText = this.add.text(0, isCompleted ? -8 : 0, level.toString(), {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '24px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(levelText);

            // Stars for completed levels
            if (isCompleted && stars > 0) {
                const starText = this.add.text(0, 12, '⭐'.repeat(stars), {
                    fontSize: '12px'
                }).setOrigin(0.5);
                container.add(starText);
            }

            // Make interactive
            container.setSize(size, size);
            container.setInteractive();

            container.on('pointerdown', () => {
                this.startLevel(level);
            });

            container.on('pointerover', () => {
                bg.clear();
                bg.fillStyle(bgColor, 0.8);
                bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
            });

            container.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(bgColor, 1);
                bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
            });
        } else {
            // Lock icon
            const lockText = this.add.text(0, 0, '🔒', {
                fontSize: '28px'
            }).setOrigin(0.5);
            container.add(lockText);
        }

        return container;
    }

    private setupScrolling() {
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            this.scrollY -= deltaY * 0.5;

            // Clamp scroll
            const maxScroll = Math.max(0, Math.ceil(100 / 5) * 75 - GAME_HEIGHT + 200);
            this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);

            this.scrollContainer.y = this.scrollY;
        });

        // Touch scroll
        let startY = 0;
        let isDragging = false;

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            startY = pointer.y;
            isDragging = true;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (isDragging) {
                const deltaY = pointer.y - startY;
                this.scrollY += deltaY;
                startY = pointer.y;

                const maxScroll = Math.max(0, Math.ceil(100 / 5) * 75 - GAME_HEIGHT + 200);
                this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);

                this.scrollContainer.y = this.scrollY;
            }
        });

        this.input.on('pointerup', () => {
            isDragging = false;
        });
    }

    private startLevel(level: number) {
        console.log(`Starting level ${level}`);
        this.scene.start(SCENES.GAME, { level });
    }
}
