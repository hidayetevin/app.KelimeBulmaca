import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import GameManager, { GameManager as GameManagerClass } from '@/managers/GameManager';
import WordDataGenerator from '@/data/WordDataGenerator';
import Button from '@/components/UI/Button';
import LetterPalette from '@/components/UI/LetterPalette';
import CurrentWordDisplay from '@/components/UI/CurrentWordDisplay';
import CrosswordGrid from '@/components/UI/CrosswordGrid';
import LevelCompleteModal from '@/components/UI/LevelCompleteModal';
import { CrosswordWord } from '@/types/GameTypes';
import AdManager from '@/managers/AdManager';

export default class GameScene extends Phaser.Scene {
    private levelNumber!: number;
    private targetWords: CrosswordWord[] = [];
    private palette: string[] = [];

    // UI Components
    private crosswordGrid!: CrosswordGrid;
    private letterPalette!: LetterPalette;
    private currentWordDisplay!: CurrentWordDisplay;
    private scoreText!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private score: number = 0;

    // Timer
    private startTime: number = 0;
    private elapsedTime: number = 0;
    private hintsUsedCount: number = 0;

    constructor() {
        super(SCENES.GAME);
    }

    init(data: { level: number }) {
        console.log(`🎮 Initializing Level ${data.level}`);
        this.levelNumber = data.level || 1;
        this.score = 0;
        this.hintsUsedCount = 0;
    }

    create() {
        console.log('🎬 GameScene: Starting create()');
        GameManagerClass.setToastScene(this);

        // Background - SYNC
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xF7FAFC).setOrigin(0);
        console.log('✅ Background created');

        // Load crossword data - ASYNC
        this.loadCrosswordData().then(() => {
            console.log('✅ Data loaded, words count:', this.targetWords ? this.targetWords.length : 0);

            if (!this.targetWords || this.targetWords.length === 0) {
                console.error('❌ No words generated for this level!');
                this.scene.start(SCENES.LEVEL_SELECTION);
                return;
            }

            // Build UI
            console.log('🛠 Building UI components...');

            try {
                this.createHeader();
                console.log('✅ Header created');
            } catch (e) {
                console.error('❌ Error in createHeader:', e);
            }

            try {
                this.createCrosswordGrid();
                console.log('✅ Grid created');
            } catch (e) {
                console.error('❌ Error in createCrosswordGrid:', e);
            }

            try {
                this.createScoreDisplay();
                console.log('✅ Score display created');
            } catch (e) {
                console.error('❌ Error in createScoreDisplay:', e);
            }

            try {
                this.createWordDisplay();
                console.log('✅ Word display created');
            } catch (e) {
                console.error('❌ Error in createWordDisplay:', e);
            }

            try {
                this.createLetterPalette();
                console.log('✅ Letter palette created');
            } catch (e) {
                console.error('❌ Error in createLetterPalette:', e);
            }

            // Start timer
            this.startTime = this.time.now;
            this.elapsedTime = 0;
            console.log('🎮 GameScene: Create sequence finished');
        }).catch(error => {
            console.error('❌ CRITICAL Error in loadCrosswordData:', error);
            this.scene.start(SCENES.LEVEL_SELECTION);
        });
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
            throw error;
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

        // Level title - Stacked Top
        this.add.text(GAME_WIDTH / 2, 28, `SEVİYE ${this.levelNumber}`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '22px',
            color: '#2D3748',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Timer - Stacked Bottom
        this.timerText = this.add.text(GAME_WIDTH / 2, 52, '⏱️ 00:00', {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '16px',
            color: '#4A5568',
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

    update(_time: number, _delta: number) {
        // Update timer
        if (this.startTime > 0) {
            this.elapsedTime = (this.time.now - this.startTime) / 1000;
            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = Math.floor(this.elapsedTime % 60);
            if (this.timerText) {
                this.timerText.setText(`⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }
    }

    private useHint() {
        console.log('💡 Hint requested');

        // Find first unfound word
        const unFoundWord = this.targetWords.find(w => !w.isFound);

        if (unFoundWord) {
            this.hintsUsedCount++;
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

        // Calculate stars based on performance
        const finalTime = Math.floor(this.elapsedTime);
        const stars = GameManager.calculateStars(this.levelNumber, finalTime, this.hintsUsedCount);

        // Save progress
        GameManager.completeLevel(this.levelNumber, stars, finalTime);
        GameManager.addWordsFound(this.targetWords.length);

        // Show Completion Modal
        const showNextLevel = () => {
            const nextLevel = Math.min(this.levelNumber + 1, 100);
            // Navigate
            this.scene.start(SCENES.GAME, { level: nextLevel });
        };

        new LevelCompleteModal({
            scene: this,
            stars: stars,
            time: finalTime,
            hintsUsed: this.hintsUsedCount,
            onDoubleReward: async () => {
                console.log('📺 Watch Ad for x2 Reward clicked');
                const rewarded = await AdManager.showRewarded();
                if (rewarded) {
                    console.log('💰 Double reward earned!');
                    GameManager.addStars(stars);
                    showNextLevel();
                }
            },
            onContinue: async () => {
                console.log('📺 Continue clicked, showing interstitial');
                await AdManager.showInterstitial();
                showNextLevel();
            }
        });
    }

    destroy() {
        if (this.letterPalette) this.letterPalette.destroy();
        if (this.crosswordGrid) this.crosswordGrid.destroy();
        console.log('🧹 GameScene cleaned up');
    }
}
