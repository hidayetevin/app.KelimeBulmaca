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
     * 1. Select words of desired count from the provided list
     * 2. Choose words that share many letters (minimize palette size)
     * 3. Extract palette from selected words
     */
    public static generate(wordList: string[], wordCount: number): CrosswordGeneratorResult {
        let bestResult: CrosswordGeneratorResult | null = null;
        const attempts = 50;

        for (let i = 0; i < attempts; i++) {
            const result = this.generateInternal(wordList, wordCount);

            // If we found a fully formed crossword with desired word count
            if (result && result.words.length === wordCount) {
                return result;
            }

            // Keep track of the best partial result just in case (optional, but good for fallback)
            if (result && (!bestResult || result.words.length > bestResult.words.length)) {
                bestResult = result;
            }
        }

        // If we failed to find a perfect one, return best partial or empty
        if (bestResult) {
            console.warn(`Could not generate full crossword. Returning best partial (${bestResult.words.length}/${wordCount})`);
            return bestResult;
        }

        console.error('Failed to generate any valid crossword');
        return { words: [], gridSize: { rows: 0, cols: 0 }, palette: [] };
    }

    private static generateInternal(wordList: string[], wordCount: number): CrosswordGeneratorResult | null {
        // Step 1: Select words with maximum letter overlap
        const selectedWords = this.selectWordsWithOverlap(wordList, wordCount);

        if (selectedWords.length === 0) return null;

        // Step 2: Place words on grid
        const placedWords = this.placeWords(selectedWords);

        // If not all words could be placed connectedly, fail this attempt
        if (placedWords.length !== selectedWords.length) {
            return {
                words: placedWords,
                gridSize: { rows: 0, cols: 0 }, // temp
                palette: []
            };
        }

        // Step 3: Extract palette from PLACED words only
        const palette = this.extractMinimalPalette(placedWords.map(w => w.text));

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
        targetCount: number
    ): string[] {
        // Since we trust the input list is already from a specific Tier (length-filtered),
        // we don't need strict length filtering here.
        const candidates = wordList;

        if (candidates.length === 0) {
            console.warn(`No candidate words provided`);
            return [];
        }

        if (candidates.length <= targetCount) {
            return candidates;
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
     * Extract minimal palette needed to form all words
     * Handles duplicate letters correctly (e.g., ARMA requires 2 A's)
     */
    private static extractMinimalPalette(words: string[]): string[] {
        const globalMaxCounts = new Map<string, number>();

        // Her kelime için harf ihtiyacını hesapla
        words.forEach(word => {
            const wordCounts = new Map<string, number>();
            const letters = Array.from(word.toLocaleUpperCase('tr-TR'));

            letters.forEach(letter => {
                wordCounts.set(letter, (wordCounts.get(letter) || 0) + 1);
            });

            // Global ihtiyacı güncelle: Her harf için max ihtiyacı sakla
            wordCounts.forEach((count, letter) => {
                const currentMax = globalMaxCounts.get(letter) || 0;
                if (count > currentMax) {
                    globalMaxCounts.set(letter, count);
                }
            });
        });

        // Map'ten palette array oluştur
        const palette: string[] = [];
        globalMaxCounts.forEach((count, letter) => {
            for (let i = 0; i < count; i++) {
                palette.push(letter);
            }
        });

        return this.shuffleArray(palette);
    }

    private static shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
            }
            // FALLBACK REMOVED: If placement is null, we simply DO NOT add the word.
            // This ensures we never have disconnected islands.
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
                            // Check if this placement is valid (no illegal touches)
                            // Pass 'existingWords' instead of 'placed'
                            if (this.canPlaceWord(word, newRow, newCol, newDirection, existingWords)) {
                                return { row: newRow, col: newCol, direction: newDirection };
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Checks if a word can be placed at the specified position without violating crossword rules.
     * Rule: A word cannot touch other words except at intersection points.
     */
    private static canPlaceWord(
        word: string,
        startRow: number,
        startCol: number,
        direction: 'horizontal' | 'vertical',
        placedWords: CrosswordWord[]
    ): boolean {
        const wordLen = word.length;

        // 1. Identify which cells this word will occupy
        // and which of those are intersections (already occupied)
        const myCells: { r: number, c: number, char: string }[] = [];
        const intersections: { r: number, c: number }[] = [];

        for (let i = 0; i < wordLen; i++) {
            const r = direction === 'vertical' ? startRow + i : startRow;
            const c = direction === 'horizontal' ? startCol + i : startCol;
            myCells.push({ r, c, char: word[i] });

            if (this.isCellOccupied(r, c, placedWords)) {
                intersections.push({ r, c });
                // Validation 1: Intersection must match char
                const existingChar = this.getCharAt(r, c, placedWords);
                if (existingChar !== word[i]) return false;
            }
        }

        // 2. Check each cell's neighbors
        for (const cell of myCells) {
            // If this cell is an intersection, we've already validated it matches.
            // We don't need to check its neighbors (they are occupied by the crossing word, which is fine).
            const isIntersection = intersections.some(int => int.r === cell.r && int.c === cell.c);

            if (!isIntersection) {
                // This cell is empty. Its neighbors must NOT be occupied, 
                // UNLESS the occupied neighbor is one of our intersection points.
                const neighbors = [
                    { r: cell.r - 1, c: cell.c },
                    { r: cell.r + 1, c: cell.c },
                    { r: cell.r, c: cell.c - 1 },
                    { r: cell.r, c: cell.c + 1 }
                ];

                for (const n of neighbors) {
                    if (this.isCellOccupied(n.r, n.c, placedWords)) {
                        // Neighbor is occupied. Is it a valid intersection point of ours?
                        const isNeighborIntersection = intersections.some(int => int.r === n.r && int.c === n.c);
                        if (!isNeighborIntersection) {
                            // It touches a word cell that we are NOT crossing.
                            // This creates an illegal 2-letter word (connected island).
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    private static isCellOccupied(row: number, col: number, placedWords: CrosswordWord[]): boolean {
        return placedWords.some(w => {
            if (w.direction === 'horizontal') {
                return row === w.startRow && col >= w.startCol && col < w.startCol + w.text.length;
            } else {
                return col === w.startCol && row >= w.startRow && row < w.startRow + w.text.length;
            }
        });
    }

    private static getCharAt(row: number, col: number, placedWords: CrosswordWord[]): string | null {
        for (const w of placedWords) {
            if (w.direction === 'horizontal') {
                if (row === w.startRow && col >= w.startCol && col < w.startCol + w.text.length) {
                    return w.text[col - w.startCol];
                }
            } else {
                if (col === w.startCol && row >= w.startRow && row < w.startRow + w.text.length) {
                    return w.text[row - w.startRow];
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
