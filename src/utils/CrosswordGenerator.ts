import { CrosswordWord } from '@/types/GameTypes';
import { GridSize } from '@/types/CategoryTypes';

export interface CrosswordGeneratorResult {
    words: CrosswordWord[];
    gridSize: GridSize;
    palette: string[];
}

export class CrosswordGenerator {
    /**
     * Generate crossword layout from word list
     */
    public static generate(wordList: string[], targetWordCount: number): CrosswordGeneratorResult {
        // Select random words
        const selectedWords = this.selectRandomWords(wordList, targetWordCount);

        // Place words on grid
        const placedWords = this.placeWords(selectedWords);

        // Calculate grid size
        const gridSize = this.calculateGridSize(placedWords);

        // Extract unique letters for palette
        const palette = this.extractPalette(selectedWords);

        return {
            words: placedWords,
            gridSize,
            palette
        };
    }

    private static selectRandomWords(wordList: string[], count: number): string[] {
        // Filter words between 3-8 characters
        const validWords = wordList.filter(w => w.length >= 3 && w.length <= 8);

        // Shuffle and take first 'count' words
        const shuffled = [...validWords].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    private static placeWords(words: string[]): CrosswordWord[] {
        const placed: CrosswordWord[] = [];

        if (words.length === 0) return placed;

        // Place first word horizontally at (0, 0)
        placed.push({
            id: 0,
            text: words[0],
            startRow: 0,
            startCol: 0,
            direction: 'horizontal',
            isFound: false
        });

        // Try to place remaining words by finding intersections
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const placement = this.findBestPlacement(word, placed);

            if (placement) {
                placed.push({
                    id: i,
                    text: word,
                    startRow: placement.row,
                    startCol: placement.col,
                    direction: placement.direction,
                    isFound: false
                });
            } else {
                // Fallback: place below grid
                const maxRow = Math.max(...placed.map(w =>
                    w.direction === 'vertical' ? w.startRow + w.text.length : w.startRow
                ));
                placed.push({
                    id: i,
                    text: word,
                    startRow: maxRow + 2,
                    startCol: 0,
                    direction: 'horizontal',
                    isFound: false
                });
            }
        }

        return placed;
    }

    private static findBestPlacement(
        word: string,
        existingWords: CrosswordWord[]
    ): { row: number; col: number; direction: 'horizontal' | 'vertical' } | null {
        // Try to find intersection with existing words
        for (const existing of existingWords) {
            for (let i = 0; i < word.length; i++) {
                for (let j = 0; j < existing.text.length; j++) {
                    if (word[i] === existing.text[j]) {
                        // Found matching letter - try placement
                        const newDirection = existing.direction === 'horizontal' ? 'vertical' : 'horizontal';

                        let newRow: number, newCol: number;

                        if (newDirection === 'vertical') {
                            // Place vertically
                            newRow = existing.startRow - i;
                            newCol = existing.startCol + j;
                        } else {
                            // Place horizontally
                            newRow = existing.startRow + j;
                            newCol = existing.startCol - i;
                        }

                        // Check if placement is valid (no negative coords)
                        if (newRow >= 0 && newCol >= 0) {
                            // TODO: Add collision detection with other words
                            return { row: newRow, col: newCol, direction: newDirection };
                        }
                    }
                }
            }
        }

        return null;
    }

    private static calculateGridSize(words: CrosswordWord[]): GridSize {
        let maxRow = 0;
        let maxCol = 0;

        words.forEach(w => {
            if (w.direction === 'horizontal') {
                maxRow = Math.max(maxRow, w.startRow + 1);
                maxCol = Math.max(maxCol, w.startCol + w.text.length);
            } else {
                maxRow = Math.max(maxRow, w.startRow + w.text.length);
                maxCol = Math.max(maxCol, w.startCol + 1);
            }
        });

        return { rows: maxRow, cols: maxCol };
    }

    private static extractPalette(words: string[]): string[] {
        const letters = new Set<string>();
        words.forEach(word => {
            word.split('').forEach(letter => letters.add(letter));
        });
        return Array.from(letters);
    }
}
