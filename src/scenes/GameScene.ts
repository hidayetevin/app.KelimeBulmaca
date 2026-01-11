import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AudioManager from '@/managers/AudioManager';
import HapticManager from '@/managers/HapticManager';
import GridTile from '@/components/UI/GridTile';
import Panel from '@/components/UI/Panel';
import Button from '@/components/UI/Button';
import { WordDefinition, LevelConfiguration } from '@/types/GameTypes';
import { GridCell } from '@/types/GameTypes';

export default class GameScene extends Phaser.Scene {
    private categoryId!: string;
    private currentLevelConfig!: LevelConfiguration;

    // Grid
    private tiles: GridTile[][] = [];
    private gridContainer!: Phaser.GameObjects.Container;
    private selectionLine!: Phaser.GameObjects.Graphics;

    // Selection State
    private isSelecting = false;
    private selectedTiles: GridTile[] = [];
    private startTile: GridTile | null = null;

    // UI
    private wordListText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;

    constructor() {
        super(SCENES.GAME);
    }

    init(data: { categoryId: string }) {
        this.categoryId = data.categoryId || 'animals'; // Default fallback
        console.log(`Initializing GameScene with Category: ${this.categoryId}`);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;

        // Background
        this.add.rectangle(0, 0, width, height, 0xF7FAFC).setOrigin(0);

        // Show Loading
        const loadingText = this.add.text(centerX, GAME_HEIGHT / 2, 'Yükleniyor...', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '24px',
            color: '#2D3748'
        }).setOrigin(0.5);

        // Start Level Async
        this.startLevelSequence(loadingText);
    }

    private async startLevelSequence(loadingText: Phaser.GameObjects.Text) {
        const game = GameManager; // Already an instance
        const levelNum = game.getCurrentLevel(this.categoryId);

        try {
            const config = await game.startLevel(this.categoryId, levelNum);
            if (!config) throw new Error("Config failed");

            this.currentLevelConfig = config;
            loadingText.destroy();

            this.buildScene();
        } catch (e) {
            console.error(e);
            this.scene.start(SCENES.CATEGORY_SELECTION);
        }
    }

    private buildScene() {
        // UI Header
        this.createHeader();

        // Grid Area
        this.createGrid();

        // Word List (Bottom)
        this.createWordListDisplay();

        // Footer Controls
        this.createFooter();

        // Input Handling (Global for drag)
        this.input.on('pointerup', this.onPointerUp, this);
        this.input.on('pointermove', this.onPointerMove, this);
    }

    private createHeader() {
        // Top Bar
        const headerH = 80;
        this.add.rectangle(0, 0, GAME_WIDTH, headerH, 0xFFFFFF).setOrigin(0);

        // Pause Button
        new Button({
            scene: this,
            x: 50,
            y: headerH / 2,
            text: '||',
            width: 40,
            height: 40,
            style: 'secondary',
            onClick: () => {
                alert('Pause');
            }
        });

        // Level Title
        this.levelText = this.add.text(GAME_WIDTH / 2, headerH / 2, `SEVİYE ${this.currentLevelConfig.levelNumber}`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '24px',
            color: '#2D3748',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Score / Stars
        this.scoreText = this.add.text(GAME_WIDTH - 60, headerH / 2, '0 ⭐️', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: '#F6AD55',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    private createGrid() {
        const gridSize = this.currentLevelConfig.gridSize;
        const rows = gridSize.rows;
        const cols = gridSize.cols;

        // Calculate layouts
        const maxW = GAME_WIDTH - 40;
        const maxH = GAME_HEIGHT * 0.5;

        // Tile Size
        const tileSize = Math.min(maxW / cols, maxH / rows, 70);
        const gridW = cols * tileSize;
        const gridH = rows * tileSize;

        const startX = -gridW / 2 + tileSize / 2;
        const startY = -gridH / 2 + tileSize / 2;

        this.gridContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);

        // Selection Graphics Line
        this.selectionLine = this.add.graphics();
        this.gridContainer.add(this.selectionLine);

        const gridData: GridCell[][] = this.currentLevelConfig.grid || [];

        // Init tiles array
        this.tiles = [];
        for (let r = 0; r < rows; r++) {
            this.tiles[r] = [];
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = gridData[r]?.[c];
                const letter = cell ? cell.letter : '';

                const tile = new GridTile({
                    scene: this,
                    x: startX + c * tileSize,
                    y: startY + r * tileSize,
                    size: tileSize - 4, // Gap
                    letter: letter,
                    row: r,
                    col: c
                });

                this.gridContainer.add(tile);
                this.tiles[r][c] = tile;

                // Interaction
                const validTile = tile;
                const hit = this.add.rectangle(0, 0, tileSize, tileSize, 0, 0);
                tile.add(hit);
                hit.setInteractive();

                hit.on('pointerdown', () => this.onTileDown(validTile));
                hit.on('pointerover', () => this.onTileOver(validTile));
            }
        }

        this.gridContainer.bringToTop(this.selectionLine);
    }

    private onTileDown(tile: GridTile) {
        // Removed: if (tile.isFound) return;
        // Allow starting selection from found tiles

        this.isSelecting = true;
        this.startTile = tile;
        this.addToSelection(tile);
        HapticManager.light();
    }

    private onTileOver(tile: GridTile) {
        if (!this.isSelecting || !this.startTile) return;
        // Removed: if (tile.isFound) return;
        // Allow selecting found tiles for words with shared letters

        if (this.isValidSelectionStep(tile)) {
            // Backtracking check
            const index = this.selectedTiles.indexOf(tile);
            if (index !== -1) {
                if (index === this.selectedTiles.length - 2) {
                    const removed = this.selectedTiles.pop();
                    removed?.deselect();
                    this.updateSelectionLine();
                    HapticManager.light();
                    return;
                }
                return;
            }

            this.addToSelection(tile);
            HapticManager.light();
        }
    }

    private onPointerUp() {
        if (!this.isSelecting) return;

        this.isSelecting = false;
        this.checkWord();
        this.clearSelection();
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        // Optional: Draw line to pointer if needed
    }

    private addToSelection(tile: GridTile) {
        this.selectedTiles.push(tile);
        tile.select();
        this.updateSelectionLine();
    }

    private clearSelection() {
        this.selectedTiles.forEach(t => t.deselect());
        this.selectedTiles = [];
        this.startTile = null;
        this.selectionLine.clear();
    }

    private updateSelectionLine() {
        this.selectionLine.clear();
        if (this.selectedTiles.length < 1) return;

        this.selectionLine.lineStyle(10, LIGHT_COLORS.PRIMARY, 0.4);
        // Phaser Graphics lineCap/lineJoin support depends on version/context, defaulting to basic lineStyle

        this.selectionLine.beginPath();
        const first = this.selectedTiles[0];
        this.selectionLine.moveTo(first.x, first.y);

        for (let i = 1; i < this.selectedTiles.length; i++) {
            this.selectionLine.lineTo(this.selectedTiles[i].x, this.selectedTiles[i].y);
        }

        this.selectionLine.strokePath();
    }

    private isValidSelectionStep(tile: GridTile): boolean {
        const start = this.startTile!;
        const last = this.selectedTiles[this.selectedTiles.length - 1];

        const dr = tile.row - last.row;
        const dc = tile.col - last.col;

        if (Math.abs(dr) > 1 || Math.abs(dc) > 1) return false;

        if (this.selectedTiles.length > 1) {
            // Direction check
            const second = this.selectedTiles[1];
            const dirR = second.row - start.row;
            const dirC = second.col - start.col;

            const len = this.selectedTiles.length;
            const expectedR = start.row + dirR * len;
            const expectedC = start.col + dirC * len;

            if (tile.row !== expectedR || tile.col !== expectedC) return false;
        }

        return true;
    }

    private checkWord() {
        const word = this.selectedTiles.map(t => t.letter).join('');
        const config = this.currentLevelConfig;
        const foundDef = config.words.find(w => w.text === word && !w.isFound);

        if (foundDef) {
            this.onWordFound(foundDef);
        } else {
            AudioManager.playSfx('wrong');
        }
    }

    private onWordFound(wordDef: WordDefinition) {
        wordDef.isFound = true;
        AudioManager.playSfx('match');
        HapticManager.medium();

        this.selectedTiles.forEach(t => t.setFound());
        this.updateWordList();

        const allFound = this.currentLevelConfig.words.every(w => w.isFound);
        if (allFound) {
            this.time.delayedCall(1000, () => this.onLevelComplete());
        }
    }

    private createWordListDisplay() {
        const y = GAME_HEIGHT * 0.85; // Lowered
        this.wordListText = this.add.text(GAME_WIDTH / 2, y, '', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: '#4A5568',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 40 }
        }).setOrigin(0.5, 0);

        this.updateWordList();
    }

    private updateWordList() {
        const words = this.currentLevelConfig.words;
        const displayList = words.map(w => w.isFound ? `✅ ${w.text}` : w.text).join('   ');

        this.wordListText.setText(displayList);
    }

    private createFooter() {
        const y = GAME_HEIGHT - 60;

        new Button({
            scene: this,
            x: GAME_WIDTH / 2,
            y: y,
            text: '💡 İPUCU',
            style: 'secondary', // Changed from warning to secondary
            width: 140,
            height: 50,
            onClick: () => this.useHint()
        });
    }

    private useHint() {
        const unfound = this.currentLevelConfig.words.find(w => !w.isFound);
        if (!unfound) return;

        const tile = this.tiles[unfound.startPos.row][unfound.startPos.col];
        if (tile && !tile.isFound && !tile.isHinted) {
            tile.setHint();
        }
    }

    private onLevelComplete() {
        const panel = new Panel({
            scene: this,
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            title: LocalizationManager.t('game.congrats', 'TEBRİKLER! 🎉'),
            width: 300,
            height: 300,
            showCloseButton: false
        });

        const stars = 3;

        const msg = this.add.text(0, -50, `Seviye Tamamlandı!\n+${stars} Yıldız`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '24px',
            color: '#2D3748',
            align: 'center'
        }).setOrigin(0.5);
        panel.add(msg);

        const nextBtn = new Button({
            scene: this,
            x: 0,
            y: 50,
            text: 'DAHA FAZLA',
            style: 'success',
            onClick: () => {
                this.scene.start(SCENES.CATEGORY_SELECTION);
            }
        });
        panel.add(nextBtn);

        panel.open();
        AudioManager.playSfx('level_complete');
        HapticManager.success();

        GameManager.getInstance().completeLevel(this.categoryId, this.currentLevelConfig.levelNumber, stars, 60);
    }
}
