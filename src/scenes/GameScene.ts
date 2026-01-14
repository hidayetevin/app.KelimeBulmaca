import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import GameManager from '@/managers/GameManager';
import WordDataGenerator from '@/data/WordDataGenerator';
import Button from '@/components/UI/Button';
import LetterPalette from '@/components/UI/LetterPalette';
import CurrentWordDisplay from '@/components/UI/CurrentWordDisplay';
import CrosswordGrid from '@/components/UI/CrosswordGrid';
import { CrosswordWord } from '@/types/GameTypes';

export default class GameScene extends Phaser.Scene {
    private levelNumber!: number;
    private targetWords: CrosswordWord[] = [];
    private palette: string[] = [];

    // UI Components
    private crosswordGrid!: CrosswordGrid;
    private letterPalette!: LetterPalette;
    private currentWordDisplay!: CurrentWordDisplay;
    private scoreText!: Phaser.GameObjects.Text;
    private score: number = 0;

    constructor() {
        super(SCENES.GAME);
    }

    init(data: { level: number }) {
        console.log(`🎮 Initializing Level ${data.level}`);
        this.levelNumber = data.level || 1;
        this.score = 0;
    }

    async create() {
        // Background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xF7FAFC).setOrigin(0);

        // Load crossword data
        await this.loadCrosswordData();

        // Build UI
        this.createHeader();
        this.createCrosswordGrid();
        this.createScoreDisplay();
        this.createWordDisplay();
        this.createLetterPalette();
    }

    private async loadCrosswordData() {
        try {
            // Load all words
            await WordDataGenerator.loadAllWords();

            // Generate crossword for this level
            const config = WordDataGenerator.getCrosswordConfiguration(this.levelNumber);

            this.targetWords = config.words;
            this.palette = config.palette;

            console.log(`✅ Crossword generated:`, config);
        } catch (error) {
            console.error('❌ Failed to generate crossword:', error);
            // Fallback to level selection
            this.scene.start(SCENES.LEVEL_SELECTION);
        }
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
                this.scene.start(SCENES.LEVEL_SELECTION);
            }
        });

        // Level title
        this.add.text(GAME_WIDTH / 2, headerHeight / 2, `SEVİYE ${this.levelNumber}`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '24px',
            color: '#2D3748',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Hint button (top right)
        new Button({
            scene: this,
            x: GAME_WIDTH - 60,
            y: headerHeight / 2,
            text: '💡',
            style: 'secondary',
            width: 45,
            height: 45,
            fontSize: 24,
            onClick: () => this.useHint()
        });
    }

    private createCrosswordGrid() {
        const y = 120;

        // Calculate grid size from words
        let maxRow = 0;
        let maxCol = 0;
        this.targetWords.forEach(w => {
            const len = Array.from(w.text).length;
            if (w.direction === 'horizontal') {
                maxRow = Math.max(maxRow, w.startRow + 1);
                maxCol = Math.max(maxCol, w.startCol + len);
            } else {
                maxRow = Math.max(maxRow, w.startRow + len);
                maxCol = Math.max(maxCol, w.startCol + 1);
            }
        });

        this.crosswordGrid = new CrosswordGrid({
            scene: this,
            x: GAME_WIDTH / 2 - (maxCol * 40) / 2,
            y: y,
            words: this.targetWords,
            rows: maxRow,
            cols: maxCol
        });
    }

    private createScoreDisplay() {
        const y = GAME_HEIGHT * 0.45;
        this.scoreText = this.add.text(GAME_WIDTH / 2, y, '0 ⭐️', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '22px',
            color: '#F6AD55',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    private createWordDisplay() {
        const y = GAME_HEIGHT * 0.53;

        this.currentWordDisplay = new CurrentWordDisplay({
            scene: this,
            x: GAME_WIDTH / 2,
            y: y,
            width: GAME_WIDTH - 40
        });
    }

    private createLetterPalette() {
        const y = GAME_HEIGHT - 200;

        this.letterPalette = new LetterPalette({
            scene: this,
            x: GAME_WIDTH / 2,
            y: y,
            letters: this.palette,
            onWordSubmit: (word: string) => this.onWordSubmit(word)
        });
    }

    private onWordSubmit(word: string) {
        console.log(`Word submitted: ${word}`);
        this.currentWordDisplay.setWord(word);

        // Check if word is correct
        const foundWord = this.targetWords.find(w =>
            w.text.toLocaleUpperCase('tr-TR') === word.toLocaleUpperCase('tr-TR') && !w.isFound
        );

        if (foundWord) {
            this.onWordFound(foundWord);
            this.letterPalette.clearSelection();
            this.currentWordDisplay.setWord('');
        } else {
            // Wrong word feedback
            console.log('❌ Word not found');
        }
    }

    private onWordFound(word: CrosswordWord) {
        console.log(`✅ Word found: ${word.text}`);

        // Mark as found and fill in grid
        word.isFound = true;
        this.crosswordGrid.fillWord(word);

        // Update score
        this.score += word.text.length;
        this.scoreText.setText(`${this.score} ⭐️`);

        // Check if level complete
        if (this.crosswordGrid.isComplete()) {
            this.time.delayedCall(500, () => {
                this.onLevelComplete();
            });
        }
    }

    private useHint() {
        console.log('💡 Hint requested');

        // Find first unfound word
        const unFoundWord = this.targetWords.find(w => !w.isFound);

        if (unFoundWord) {
            GameManager.useHint();
            unFoundWord.isFound = true;
            this.crosswordGrid.fillWord(unFoundWord);

            // Check completion
            if (this.crosswordGrid.isComplete()) {
                this.time.delayedCall(500, () => {
                    this.onLevelComplete();
                });
            }
        }
    }

    private onLevelComplete() {
        console.log('🎉 Level Complete!');

        // Calculate stars (simplified)
        const stars = 3; // TODO: Calculate based on hints used, time, etc.
        const time = 60; // TODO: Track actual time

        // Save progress
        GameManager.completeLevel(this.levelNumber, stars, time);
        GameManager.addWordsFound(this.targetWords.length);

        // Return to level selection
        this.time.delayedCall(1500, () => {
            this.scene.start(SCENES.LEVEL_SELECTION);
        });
    }
}
