import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AudioManager from '@/managers/AudioManager';
import HapticManager from '@/managers/HapticManager';
import WordDataGenerator from '@/data/WordDataGenerator';
import Button from '@/components/UI/Button';
import Panel from '@/components/UI/Panel';
import LetterPalette from '@/components/UI/LetterPalette';
import CurrentWordDisplay from '@/components/UI/CurrentWordDisplay';
import CrosswordGrid from '@/components/UI/CrosswordGrid';
import { CrosswordWord } from '@/types/GameTypes';

export default class GameScene extends Phaser.Scene {
    private categoryId!: string;
    private levelNumber: number = 1;

    // New components
    private crosswordGrid!: CrosswordGrid;
    private letterPalette!: LetterPalette;
    private currentWordDisplay!: CurrentWordDisplay;

    // UI
    private scoreText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;

    // Game data
    private targetWords: CrosswordWord[] = [];
    private palette: string[] = [];

    constructor() {
        super(SCENES.GAME);
    }

    init(data: { categoryId: string }) {
        this.categoryId = data.categoryId || 'animals';
        this.levelNumber = GameManager.getCurrentLevel(this.categoryId);
        console.log(`Initializing GameScene with Category: ${this.categoryId}, Level: ${this.levelNumber}`);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;

        // Background
        this.add.rectangle(0, 0, width, height, 0xF7FAFC).setOrigin(0);

        // Load crossword data and build scene
        this.loadCrosswordData();
    }

    private async loadCrosswordData() {
        try {
            // Load category words first
            await WordDataGenerator.loadCategoryWords(this.categoryId);

            // Generate crossword dynamically
            const config = WordDataGenerator.getCrosswordConfiguration(this.categoryId, this.levelNumber);

            this.palette = config.palette;
            this.targetWords = config.words;

            console.log('✅ Generated crossword:', config);

            this.buildScene();
        } catch (error) {
            console.error('Failed to generate crossword:', error);
            this.scene.start(SCENES.CATEGORY_SELECTION);
        }
    }

    private buildScene() {
        // UI Header
        this.createHeader();

        // Crossword Grid (Top)
        this.createCrosswordGrid();

        // Score Display
        this.createScoreDisplay();

        // Current Word Display (Middle)
        this.createWordDisplay();

        // Letter Palette (Bottom)
        this.createLetterPalette();

        // Footer removed - hint in header
    }

    private createHeader() {
        const headerH = 80;
        this.add.rectangle(0, 0, GAME_WIDTH, headerH, 0xFFFFFF).setOrigin(0);

        // Back Button
        new Button({
            scene: this,
            x: 50,
            y: headerH / 2,
            text: '<',
            width: 40,
            height: 40,
            style: 'secondary',
            onClick: () => {
                this.scene.start(SCENES.CATEGORY_SELECTION);
            }
        });

        // Level Title
        this.levelText = this.add.text(GAME_WIDTH / 2, headerH / 2, `SEVİYE ${this.levelNumber}`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '22px',
            color: '#2D3748',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Hint Button (Top Right)
        new Button({
            scene: this,
            x: GAME_WIDTH - 60,
            y: headerH / 2,
            text: '💡',
            style: 'secondary',
            width: 45,
            height: 45,
            fontSize: 24,
            onClick: () => this.useHint()
        });
    }

    private createCrosswordGrid() {
        const y = 200;

        this.crosswordGrid = new CrosswordGrid({
            scene: this,
            x: GAME_WIDTH / 2 - (this.targetWords[0].text.length * 40) / 2,
            y: y,
            words: this.targetWords,
            rows: 3,
            cols: 5
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
        const y = GAME_HEIGHT * 0.55;

        this.currentWordDisplay = new CurrentWordDisplay({
            scene: this,
            x: GAME_WIDTH / 2,
            y: y,
            width: 300
        });
    }

    private createLetterPalette() {
        const y = GAME_HEIGHT - 150;

        this.letterPalette = new LetterPalette({
            scene: this,
            x: GAME_WIDTH / 2,
            y: y,
            letters: this.palette,
            onWordSubmit: (word) => this.onWordSubmit(word)
        });
    }

    private onWordSubmit(word: string) {
        console.log('Word submitted:', word);
        this.currentWordDisplay.setWord(word);

        // Check if word matches any target word
        const matchingWord = this.targetWords.find(
            (w: CrosswordWord) => w.text.toUpperCase() === word.toUpperCase() && !w.isFound
        );

        if (matchingWord) {
            this.onWordFound(matchingWord);
        } else {
            AudioManager.playSfx('wrong');
            this.time.delayedCall(500, () => {
                this.currentWordDisplay.clear();
            });
        }
    }

    private onWordFound(word: CrosswordWord) {
        console.log('✅ Word found:', word.text);

        AudioManager.playSfx('match');
        HapticManager.medium();

        // Fill in crossword
        this.crosswordGrid.fillWord(word);

        // Add stars
        const stars = 1;
        GameManager.addStars(stars);

        // Update score display
        const totalStars = GameManager.getGameState()?.user.totalStars || 0;
        this.scoreText.setText(`${totalStars} ⭐️`);

        // Clear word display
        this.time.delayedCall(1000, () => {
            this.currentWordDisplay.clear();
        });

        // Check completion
        if (this.crosswordGrid.isComplete()) {
            this.time.delayedCall(1500, () => this.onLevelComplete());
        }
    }

    private useHint() {
        const unfoundWord = this.targetWords.find(w => !w.isFound);
        if (unfoundWord) {
            this.currentWordDisplay.setWord(unfoundWord.text.charAt(0) + '...');
            this.time.delayedCall(2000, () => {
                this.currentWordDisplay.clear();
            });
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

        GameManager.completeLevel(this.categoryId, this.levelNumber, stars, 60);
    }
}
