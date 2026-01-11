import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { CrosswordWord, CrosswordCellData } from '@/types/GameTypes';

export interface CrosswordGridConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    words: CrosswordWord[];
    rows: number;
    cols: number;
}

export default class CrosswordGrid extends Phaser.GameObjects.Container {
    private cells: CrosswordCellData[][] = [];
    private cellGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();
    private cellTexts: Map<string, Phaser.GameObjects.Text> = new Map();
    private cellSize: number = 40;
    private words: CrosswordWord[];

    constructor(config: CrosswordGridConfig) {
        super(config.scene, config.x, config.y);

        this.words = config.words;

        this.initializeCells(config.rows, config.cols);
        this.mapWords();
        this.createVisuals();

        this.scene.add.existing(this);
    }

    private initializeCells(rows: number, cols: number) {
        for (let r = 0; r < rows; r++) {
            this.cells[r] = [];
            for (let c = 0; c < cols; c++) {
                this.cells[r][c] = {
                    isActive: false,
                    letter: undefined,
                    wordIds: [],
                    row: r,
                    col: c
                };
            }
        }
    }

    private mapWords() {
        this.words.forEach(word => {
            const { startRow, startCol, direction, text, id } = word;

            for (let i = 0; i < text.length; i++) {
                const row = direction === 'vertical' ? startRow + i : startRow;
                const col = direction === 'horizontal' ? startCol + i : startCol;

                if (this.cells[row] && this.cells[row][col]) {
                    this.cells[row][col].isActive = true;
                    this.cells[row][col].wordIds.push(id);
                }
            }
        });
    }

    private createVisuals() {
        this.cells.forEach((row, r) => {
            row.forEach((cell, c) => {
                const x = c * this.cellSize;
                const y = r * this.cellSize;
                const key = `${r}-${c}`;

                // Cell background
                const graphics = this.scene.add.graphics();
                this.cellGraphics.set(key, graphics);
                this.add(graphics);

                // Cell text
                const text = this.scene.add.text(
                    x + this.cellSize / 2,
                    y + this.cellSize / 2,
                    '',
                    {
                        fontFamily: FONT_FAMILY_PRIMARY,
                        fontSize: '24px',
                        color: '#1F2937',
                        fontStyle: 'bold'
                    }
                ).setOrigin(0.5);
                this.cellTexts.set(key, text);
                this.add(text);

                this.updateCell(r, c);
            });
        });
    }

    private updateCell(row: number, col: number) {
        const cell = this.cells[row][col];
        const key = `${row}-${col}`;
        const graphics = this.cellGraphics.get(key);
        const text = this.cellTexts.get(key);

        if (!graphics || !text) return;

        const x = col * this.cellSize;
        const y = row * this.cellSize;

        graphics.clear();

        if (!cell.isActive) {
            // Inactive cell - blend with background (invisible)
            graphics.fillStyle(0xF7FAFC, 1); // Same as background
            graphics.fillRect(x, y, this.cellSize, this.cellSize);
            text.setText('');
        } else if (cell.letter) {
            // Filled cell (light blue)
            graphics.fillStyle(0xBFDBFE, 1);
            graphics.fillRect(x, y, this.cellSize, this.cellSize);
            graphics.lineStyle(1, 0x93C5FD);
            graphics.strokeRect(x, y, this.cellSize, this.cellSize);
            text.setText(cell.letter);
        } else {
            // Empty active cell (white)
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillRect(x, y, this.cellSize, this.cellSize);
            graphics.lineStyle(1, 0xE5E7EB);
            graphics.strokeRect(x, y, this.cellSize, this.cellSize);
            text.setText('');
        }
    }

    public fillWord(word: CrosswordWord) {
        const { startRow, startCol, direction, text } = word;

        for (let i = 0; i < text.length; i++) {
            const row = direction === 'vertical' ? startRow + i : startRow;
            const col = direction === 'horizontal' ? startCol + i : startCol;

            if (this.cells[row] && this.cells[row][col]) {
                this.cells[row][col].letter = text[i];
                this.updateCell(row, col);
            }
        }

        word.isFound = true;
    }

    public isComplete(): boolean {
        return this.words.every(w => w.isFound);
    }

    public getWords(): CrosswordWord[] {
        return this.words;
    }
}
