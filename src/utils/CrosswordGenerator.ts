import { CrosswordWord } from '@/types/GameTypes';
import { GridSize } from '@/types/CategoryTypes';

export interface CrosswordGeneratorResult {
    words: CrosswordWord[];
    gridSize: GridSize;
    palette: string[];
}

export class CrosswordGenerator {
    /**
     * SMART WORD SELECTION APPROACH:
     * 1. Select words of target length
     * 2. Choose words that share many letters (minimize palette size)
     * 3. Extract palette from selected words
     */
    public static generate(wordList: string[], level: number): CrosswordGeneratorResult {
        const wordCount = level + 3; // Level 1: 4 words
        const wordLength = level + 2; // Level 1: 3 letters
        const maxPaletteSize = level + 3; // Level 1: max 4 letters (but can be more if needed)

        // Step 1: Select words with maximum letter overlap
        const selectedWords = this.selectWordsWithOverlap(wordList, wordCount, wordLength);

        if (selectedWords.length === 0) {
            console.error('No words found!');
            return { words: [], gridSize: { rows: 0, cols: 0 }, palette: [] };
        }

        // Step 2: Extract palette from selected words
        const palette = this.extractMinimalPalette(selectedWords);

        console.log(`✅ Selected ${selectedWords.length} words: [${selectedWords.join(', ')}]`);
        console.log(`✅ Palette (${palette.length} letters): [${palette.join(', ')}]`);

        // Step 3: Place words on grid
        const placedWords = this.placeWords(selectedWords);

        // Step 4: Calculate grid size
        const gridSize = this.calculateGridSize(placedWords);

        return {
            words: placedWords,
            gridSize,
            palette
        };
    }

    /**
     * Select words that share letters to minimize palette size
     */
    private static selectWordsWithOverlap(
        wordList: string[],
        targetCount: number,
        targetLength: number
    ): string[] {
        // Filter by length (exact or ±1)
        const candidates = wordList.filter(w =>
            Math.abs(w.length - targetLength) <= 1
        );

        if (candidates.length === 0) {
            console.warn(`No words of length ~${targetLength} found`);
            return [];
        }

        if (candidates.length <= targetCount) {
            return candidates.slice(0, targetCount);
        }

        // Greedy selection: pick words that share letters with already selected ones
        const selected: string[] = [];
        const availableWords = [...candidates];

        // Pick first word randomly
        const firstIndex = Math.floor(Math.random() * availableWords.length);
        selected.push(availableWords[firstIndex]);
        availableWords.splice(firstIndex, 1);

        // Pick remaining words based on letter overlap
        while (selected.length < targetCount && availableWords.length > 0) {
            let bestWord = '';
            let maxOverlap = -1;
            let bestIndex = -1;

            // Find word with maximum overlap with selected words
            for (let i = 0; i < availableWords.length; i++) {
                const word = availableWords[i];
                const overlap = this.calculateOverlap(word, selected);

                if (overlap > maxOverlap) {
                    maxOverlap = overlap;
                    bestWord = word;
                    bestIndex = i;
                }
            }

            if (bestIndex >= 0) {
                selected.push(bestWord);
                availableWords.splice(bestIndex, 1);
            } else {
                // Fallback: pick random
                const randIndex = Math.floor(Math.random() * availableWords.length);
                selected.push(availableWords[randIndex]);
                availableWords.splice(randIndex, 1);
            }
        }

        return selected;
    }

    /**
     * Calculate how many unique letters a word shares with selected words
     */
    private static calculateOverlap(word: string, selectedWords: string[]): number {
        const wordLetters = new Set(word.toUpperCase().split(''));
        const selectedLetters = new Set<string>();

        selectedWords.forEach(w => {
            w.toUpperCase().split('').forEach(l => selectedLetters.add(l));
        });

        let overlap = 0;
        wordLetters.forEach(letter => {
            if (selectedLetters.has(letter)) overlap++;
        });

        return overlap;
    }

    /**
     * Extract minimal palette from words
     */
    private static extractMinimalPalette(words: string[]): string[] {
        const letters = new Set<string>();

        words.forEach(word => {
            word.toUpperCase().split('').forEach(letter => letters.add(letter));
        });

        return Array.from(letters);
    }

    private static placeWords(words: string[]): CrosswordWord[] {
        const placed: CrosswordWord[] = [];
        if (words.length === 0) return placed;

        // Place first word
        placed.push({
            id: 0,
            text: words[0],
            startRow: 0,
            startCol: 0,
            direction: 'horizontal',
            isFound: false
        });

        // Try to place remaining words
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
                // Fallback: place below
                const maxRow = Math.max(...placed.map(w => {
                    const len = Array.from(w.text).length;
                    return w.direction === 'vertical' ? w.startRow + len : w.startRow;
                }));
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
        const wordChars = Array.from(word);

        for (const existing of existingWords) {
            const existingChars = Array.from(existing.text);

            for (let i = 0; i < wordChars.length; i++) {
                for (let j = 0; j < existingChars.length; j++) {
                    if (wordChars[i].toUpperCase() === existingChars[j].toUpperCase()) {
                        const newDirection = existing.direction === 'horizontal' ? 'vertical' : 'horizontal';
                        let newRow: number, newCol: number;

                        if (newDirection === 'vertical') {
                            newRow = existing.startRow - i;
                            newCol = existing.startCol + j;
                        } else {
                            newRow = existing.startRow + j;
                            newCol = existing.startCol - i;
                        }

                        if (newRow >= 0 && newCol >= 0) {
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
            // Use Array.from to properly count Turkish characters
            const wordLength = Array.from(w.text).length;

            if (w.direction === 'horizontal') {
                maxRow = Math.max(maxRow, w.startRow + 1);
                maxCol = Math.max(maxCol, w.startCol + wordLength);
            } else {
                maxRow = Math.max(maxRow, w.startRow + wordLength);
                maxCol = Math.max(maxCol, w.startCol + 1);
            }
        });

        return { rows: maxRow, cols: maxCol };
    }
}
