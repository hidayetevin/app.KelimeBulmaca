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
import { WordDefinition, LevelConfiguration, Position } from '@/types/GameTypes';

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

        // Load Level Data
        this.loadLevel();

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
        this.input.on('pointermove', this.onPointerMove, this); // Better to handle move on scene for smoother line
    }

    private loadLevel() {
        // GameManager should have a way to get formatted LevelConfig
        // But currently it only has data. 
        // We need to use WordDataGenerator/GridAlgorithm here or inside GameManager.
        // Let's assume GameManager has a method `startNextLevel(categoryId)` that returns ready-to-use config
        // OR we manually ask GameManager for data and use Utils.

        // Simplified: GameManager prepares the level state.
        // But we need the 'LevelConfiguration' object with 'letters' and 'words'.
        // Assuming GameManager has `getCurrentLevelConfig()` which generates it on fly if needed.
        // For now, let's mock/use what's available or create it.

        // If GameManager doesn't serve config, we generate it. 
        // But GameManager manages state.
        // Let's rely on GameManager to get level data.

        // TODO: Ensure GameManager has getLevelConfig
        // Temporarily, let's assume we fetch it or generate it.
        // We will call `GameManager.generateLevel(categoryId)` which returns LevelConfiguration.
        // If that doesn't exist, we might need to implement it or use what we solved in GridAlgorithm step.
        // GridAlgorithm generates grid from words. WordDataGenerator generates words.

        try {
            this.currentLevelConfig = GameManager.generateLevelConfig(this.categoryId);
        } catch (e) {
            console.error('Level gen error', e);
            // Fallback
            this.scene.start(SCENES.CATEGORY_SELECTION);
            return;
        }

        // Setup tiles array
        this.tiles = [];
        for (let r = 0; r < this.currentLevelConfig.gridSize.rows; r++) {
            this.tiles[r] = [];
        }
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
                // Pause Menu
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
        // Simple star icon and count
        this.scoreText = this.add.text(GAME_WIDTH - 60, headerH / 2, '0 ⭐️', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: '#F6AD55',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    private createGrid() {
        const gridSize = this.currentLevelConfig.gridSize; // { rows: 5, cols: 5 }
        const rows = gridSize.rows;
        const cols = gridSize.cols;

        // Calculate layouts
        const maxW = GAME_WIDTH - 40;
        const maxH = GAME_HEIGHT * 0.5; // Grid takes 50% screen

        // Tile Size
        const tileSize = Math.min(maxW / cols, maxH / rows, 70); // Max 70px
        const gridW = cols * tileSize;
        const gridH = rows * tileSize;

        const startX = -gridW / 2 + tileSize / 2;
        const startY = -gridH / 2 + tileSize / 2;

        this.gridContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);

        // Selection Graphics Line (Behind tiles? Or on top?)
        // On top of BG, behind Text.
        // Actually, usually on top of everything but semi-transparent.
        this.selectionLine = this.add.graphics();
        this.gridContainer.add(this.selectionLine);

        // Create Tiles
        // We need visuals for each cell.
        // LevelConfig has 'letters' array? No, LevelConfig definition has words and letters.
        // But we need the Grid layout (2D array of chars).
        // GridAlgorithm.generateGrid returns { cells: GridCell[][], ... }
        // GameManager.generateLevelConfig needs to return that or we regenerate here.
        // Let's assume GameManager returns the GridCells too or we have to rebuild.
        // Better: GameManager returns the GridCells in config or separate property.

        // Assumption: currentLevelConfig has `grid` property which is GridCell[][]
        // If interface doesn't have it, we might need adjustments.
        // Let's create tiles based on `currentLevelConfig.grid` (we will add this to implementation of GameManager or type cast).
        // If not available, we have to map `words` to grid.
        // Wait, GameManager generateLevel should return the FULL object from GridAlgorithm.

        const gridData = (this.currentLevelConfig as any).grid || []; // Force cast for now

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = gridData[r]?.[c];
                const letter = cell ? cell.letter : ''; // Should be filled

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
                // We use global input for drag, but tile can detect 'over'
                // Note: Phaser Container input is tricky. 
                // We can make tile interactive and use pointerover.
                const validTile = tile; // closure capture
                const hit = this.add.rectangle(0, 0, tileSize, tileSize, 0, 0); // invisible hit
                tile.add(hit);
                hit.setInteractive();

                hit.on('pointerdown', () => this.onTileDown(validTile));
                hit.on('pointerover', () => this.onTileOver(validTile));
            }
        }

        // Bring line to top?
        this.gridContainer.bringToTop(this.selectionLine);
    }

    // Input Logic

    private onTileDown(tile: GridTile) {
        if (tile.isFound) return;

        this.isSelecting = true;
        this.startTile = tile;
        this.addToSelection(tile);
        HapticManager.light();
    }

    private onTileOver(tile: GridTile) {
        if (!this.isSelecting || !this.startTile) return;
        if (tile.isFound) return;

        // Validate adjacency / Linearity
        // Word Search allows Horizontal, Vertical, Diagonal.
        // Check if tile is in line with startTile.

        if (this.isValidSelectionStep(tile)) {
            // If we backtrack?
            const index = this.selectedTiles.indexOf(tile);
            if (index !== -1) {
                // Backtracking: remove after index
                // If allow backtracking logic:
                if (index === this.selectedTiles.length - 2) {
                    const removed = this.selectedTiles.pop();
                    removed?.deselect();
                    this.updateSelectionLine();
                    HapticManager.light();
                    return;
                }
                return; // Ignore if already selected elsewhere
            }

            this.addToSelection(tile);
            HapticManager.light();
        }
    }

    private onPointerUp() {
        if (!this.isSelecting) return;

        this.isSelecting = false;
        this.checkWord();

        // Clear selection
        this.clearSelection();
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        // Redraw line if selecting
        if (this.isSelecting && this.selectedTiles.length > 0) {
            // Maybe draw line to pointer?
            // this.updateSelectionLine(pointer);
        }
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
        this.selectionLine.lineCap = 'round';
        this.selectionLine.lineJoin = 'round';

        this.selectionLine.beginPath();
        const first = this.selectedTiles[0];
        this.selectionLine.moveTo(first.x, first.y);

        for (let i = 1; i < this.selectedTiles.length; i++) {
            this.selectionLine.lineTo(this.selectedTiles[i].x, this.selectedTiles[i].y);
        }

        this.selectionLine.strokePath();
    }

    private isValidSelectionStep(tile: GridTile): boolean {
        // Can only extend selection if aligns with start and current/last tile.
        // Actually, standard word search rule: Line must be straight from Start.
        // So vector (tile - start) must be collinear with vector (second - start).

        const start = this.startTile!;
        const last = this.selectedTiles[this.selectedTiles.length - 1];

        // 1. Must be neighbor of last (including diagonal)
        const dr = tile.row - last.row;
        const dc = tile.col - last.col;

        if (Math.abs(dr) > 1 || Math.abs(dc) > 1) return false; // Not neighbor

        // 2. Must maintain direction from Start
        if (this.selectedTiles.length > 1) {
            const drTotal = tile.row - start.row;
            const dcTotal = tile.col - start.col;

            // Check direction consistency
            // Normalized direction of first step
            const second = this.selectedTiles[1];
            const dirR = second.row - start.row;
            const dirC = second.col - start.col;

            // Normalized expected position
            const len = this.selectedTiles.length;
            const expectedR = start.row + dirR * len;
            const expectedC = start.col + dirC * len;

            if (tile.row !== expectedR || tile.col !== expectedC) return false;
        }

        return true;
    }

    private checkWord() {
        const word = this.selectedTiles.map(t => t.letter).join('');
        // Check local reversed too? Usually Grid has word in specific dir.
        // Assuming we select in correct order 

        const config = this.currentLevelConfig;
        const foundDef = config.words.find(w => w.text === word && !w.isFound);

        if (foundDef) {
            // MATCH!
            this.onWordFound(foundDef);
        } else {
            // Fail
            // Shake effect on tiles?
            AudioManager.playSfx('wrong');
        }
    }

    private onWordFound(wordDef: WordDefinition) {
        wordDef.isFound = true;
        AudioManager.playSfx('match');
        HapticManager.medium();

        // Mark tiles as found persistent
        this.selectedTiles.forEach(t => t.setFound());

        // Update UI list
        this.updateWordList();

        // Check Level Complete
        const allFound = this.currentLevelConfig.words.every(w => w.isFound);
        if (allFound) {
            this.time.delayedCall(1000, () => this.onLevelComplete());
        }
    }

    private createWordListDisplay() {
        const y = GAME_HEIGHT * 0.75;
        this.wordListText = this.add.text(GAME_WIDTH / 2, y, '', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '18px',
            color: '#4A5568',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 40 }
        }).setOrigin(0.5, 0);

        this.updateWordList();
    }

    private updateWordList() {
        const words = this.currentLevelConfig.words;
        const text = words.map(w => w.isFound ? `~~${w.text}~~` : w.text.replace(/./g, '_ ')).join('   ');
        // Or show text but grayed out?
        // Usually Word Search shows list of words to find.
        const displayList = words.map(w => w.isFound ? `✅ ${w.text}` : w.text).join('   ');

        this.wordListText.setText(displayList);
    }

    private createFooter() {
        // Controls: Hint
        const y = GAME_HEIGHT - 60;

        new Button({
            scene: this,
            x: GAME_WIDTH / 2,
            y: y,
            text: '💡 İPUCU',
            style: 'warning',
            width: 140,
            height: 50,
            onClick: () => this.useHint()
        });
    }

    private useHint() {
        // Find first unfound word
        const unfound = this.currentLevelConfig.words.find(w => !w.isFound);
        if (!unfound) return;

        // Reveal first letter or random letter
        // Logic: find tile for startPos
        const tile = this.tiles[unfound.startPos.row][unfound.startPos.col];
        if (tile && !tile.isFound && !tile.isHinted) {
            tile.setHint();
            // Consume hint point
        }
    }

    private onLevelComplete() {
        // Win Popup
        const panel = new Panel({
            scene: this,
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            title: 'TEBRİKLER! 🎉',
            height: 300,
            showCloseButton: false
        });

        // Stars calculation
        const stars = 3; // Mock

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
            text: 'SONRAKİ',
            style: 'success',
            onClick: () => {
                this.scene.restart(); // Or next level logic
                // GameManager.nextLevel();
                // this.scene.start(SCENES.GAME);
                // For now back to categories
                this.scene.start(SCENES.CATEGORY_SELECTION);
            }
        });
        panel.add(nextBtn);

        panel.open();
        AudioManager.playSfx('level_complete');
        HapticManager.success();
    }
}
