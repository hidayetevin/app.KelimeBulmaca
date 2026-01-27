import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import gameManager, { GameManager as GameManagerClass } from '@/managers/GameManager';
import ThemeManager from '@/managers/ThemeManager';
import Button from '@/components/UI/Button';

export default class LevelSelectionScene extends Phaser.Scene {
    private levelButtons: Phaser.GameObjects.Container[] = [];
    private scrollContainer!: Phaser.GameObjects.Container;
    private scrollY: number = 0;
    private colors = ThemeManager.getCurrentColors();

    constructor() {
        super(SCENES.LEVEL_SELECTION);
    }

    create() {
        this.colors = ThemeManager.getCurrentColors();

        // Ensure toast notifications can show in this scene
        GameManagerClass.setToastScene(this);

        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;

        // Background
        this.add.rectangle(0, 0, width, height, this.colors.background).setOrigin(0);

        // Create grid first (so it stays behind header)
        this.createLevelGrid();

        // Create header on top
        this.createHeader();

        this.setupScrolling();
    }

    private createHeader() {
        const headerHeight = 80;

        const headerContainer = this.add.container(0, 0);
        headerContainer.setDepth(100); // Ensure header is always on top

        // Header background
        const bg = this.add.rectangle(0, 0, GAME_WIDTH, headerHeight, this.colors.primary).setOrigin(0);
        bg.setInteractive(); // Block clicks from passing through
        headerContainer.add(bg);

        // Shadow/Line separator
        const line = this.add.rectangle(0, headerHeight, GAME_WIDTH, 2, this.colors.secondary).setOrigin(0);
        headerContainer.add(line);

        // Back button
        const backBtn = new Button({
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
        headerContainer.add(backBtn);

        // Title
        const textColorHex = this.colors.textPrimary === 0x1A202C ? '#1A202C' : '#F1F5F9';
        const title = this.add.text(GAME_WIDTH / 2, headerHeight / 2, 'SEVİYELER', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '28px',
            color: textColorHex,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        headerContainer.add(title);
    }

    private createLevelGrid() {
        const startY = 100; // Start below header
        const cols = 5;
        const totalLevels = 100;
        const buttonSize = 60;
        const spacing = 15;

        // Calculate total grid width
        const gridWidth = cols * buttonSize + (cols - 1) * spacing;

        // Calculate starting X (left margin) to center the grid
        const leftMargin = (GAME_WIDTH - gridWidth) / 2;

        this.scrollContainer = this.add.container(0, 0);

        const currentLevel = gameManager.getCurrentLevel();

        for (let i = 1; i <= totalLevels; i++) {
            const col = (i - 1) % cols;
            const row = Math.floor((i - 1) / cols);

            const x = leftMargin + col * (buttonSize + spacing) + (buttonSize / 2);
            const y = startY + row * (buttonSize + spacing) + (buttonSize / 2);

            const levelData = gameManager.getLevelData(i);
            const isUnlocked = i === 1 || (levelData?.isUnlocked ?? false);
            const isCompleted = levelData?.isCompleted ?? false;
            const stars = levelData?.stars ?? 0;

            const button = this.createLevelButton(i, x, y, buttonSize, isUnlocked, isCompleted, stars, i === currentLevel);
            this.scrollContainer.add(button);
            this.levelButtons.push(button);
        }

        this.add.existing(this.scrollContainer);

        // Auto-scroll to current level
        const currentRow = Math.floor((currentLevel - 1) / cols);
        const targetY = -(currentRow * (buttonSize + spacing));

        // Center it vertically if possible (screen height / 2)
        const centeredY = targetY + (GAME_HEIGHT / 2) - startY;

        // Clamp to bounds
        const maxScroll = Math.max(0, Math.ceil(totalLevels / cols) * (buttonSize + spacing) - GAME_HEIGHT + 200);
        this.scrollY = Phaser.Math.Clamp(centeredY, -maxScroll, 0);
        this.scrollContainer.y = this.scrollY;
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
        let bgColor = this.colors.secondary; // Default locked

        if (isCompleted) {
            bgColor = this.colors.wordFound; // Completed (greenish)
        } else if (isCurrent || isUnlocked) {
            bgColor = this.colors.accent; // Current/Unlocked
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
                container.setScale(1.05);
            });

            container.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(bgColor, 1);
                bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
                container.setScale(1);
            });
        } else {
            // Lock icon
            const lockText = this.add.text(0, 0, '🔒', {
                fontSize: '28px',
                padding: { top: 10, bottom: 10 }
            }).setOrigin(0.5);
            container.add(lockText);
        }

        return container;
    }

    private setupScrolling() {
        this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
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
