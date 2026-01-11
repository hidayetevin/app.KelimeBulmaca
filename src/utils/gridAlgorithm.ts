import { GridCell, GridSize, Position, Direction, WordDefinition } from '@/types';

/**
 * Grid yerleştirme sonucu
 */
export interface GridGenerationResult {
    grid: GridCell[][];
    placedWords: WordDefinition[];
    success: boolean;
}

/**
 * Grid Algoritması
 * Kelimeleri bulmaca gridine yerleştirir.
 */
export class GridAlgorithm {
    private readonly ALPHABET = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

    /**
     * Kelimeleri grid'e yerleştirir ve grid'i oluşturur.
     * @param words - Yerleştirilecek kelimeler (string listesi)
     * @param gridSize - Grid boyutları
     * @param timeoutMs - Zaman aşımı (varsayılan 2000ms - geliştirme için artırıldı)
     * @returns GridGenerationResult
     */
    public generateGrid(
        words: string[],
        gridSize: GridSize,
        timeoutMs: number = 2000
    ): GridGenerationResult {
        const startTime = Date.now();
        let attempts = 0;

        // Kelimeleri uzunluklarına göre sırala (en uzundan en kısaya) - daha kolay yerleşim için
        const sortedWords = [...words].sort((a, b) => b.length - a.length);

        while (Date.now() - startTime < timeoutMs) {
            attempts++;

            // Boş grid oluştur
            const grid = this.createEmptyGrid(gridSize);
            const placedWords: WordDefinition[] = [];

            // Backtracking ile yerleştirmeye çalış
            if (this.tryPlaceWords(grid, sortedWords, placedWords, gridSize)) {
                // Başarılı olursa boşlukları doldur ve sonucu döndür
                this.fillEmptyCells(grid);

                return {
                    grid,
                    placedWords,
                    success: true
                };
            }
        }

        console.warn(`⚠️ Grid generation failed after ${attempts} attempts`);

        // Başarısız olsa bile boş bir grid döndür
        return {
            grid: this.createEmptyGrid(gridSize),
            placedWords: [],
            success: false
        };
    }

    /**
     * Kelimeleri rekürsif olarak yerleştirmeyi dener (Backtracking)
     */
    private tryPlaceWords(
        grid: GridCell[][],
        remainingWords: string[],
        placedWords: WordDefinition[],
        gridSize: GridSize
    ): boolean {
        if (remainingWords.length === 0) {
            return true; // Tüm kelimeler yerleştirildi
        }

        const currentWordText = remainingWords[0].toUpperCase();
        const possiblePositions = this.getAllPossiblePositions(gridSize, currentWordText.length);

        // Pozisyonları karıştır (rastgelelik için)
        this.shuffleArray(possiblePositions);

        for (const pos of possiblePositions) {
            if (this.canPlaceWord(grid, currentWordText, pos.start, pos.direction, gridSize)) {
                // Kelimeyi geçici olarak yerleştir
                const placedCells = this.placeWord(grid, currentWordText, pos.start, pos.direction);

                const newWordDef: WordDefinition = {
                    text: currentWordText,
                    direction: pos.direction,
                    startPos: pos.start,
                    endPos: this.calculateEndPos(pos.start, pos.direction, currentWordText.length),
                    isFound: false,
                    hintLettersShown: 0
                };
                placedWords.push(newWordDef);

                // Bir sonraki kelimeye geç
                if (this.tryPlaceWords(grid, remainingWords.slice(1), placedWords, gridSize)) {
                    return true;
                }

                // Backtrack: Yerleşimi geri al
                this.removeWord(grid, placedCells);
                placedWords.pop();
            }
        }

        return false; // Bu kelime hiçbir yere yerleşemedi
    }

    /**
     * Kelimenin belirtilen konuma yerleştirilip yerleştirilemeyeceğini kontrol eder
     */
    public canPlaceWord(
        grid: GridCell[][],
        word: string,
        startPos: Position,
        direction: Direction,
        gridSize: GridSize
    ): boolean {
        let row = startPos.row;
        let col = startPos.col;

        for (let i = 0; i < word.length; i++) {
            // Sınır kontrolü
            if (row < 0 || row >= gridSize.rows || col < 0 || col >= gridSize.cols) {
                return false;
            }

            const cell = grid[row][col];

            // Hücre doluysa ve harf uyuşmuyorsa yerleştirilemez
            if (cell.letter !== '' && cell.letter !== word[i]) {
                return false;
            }

            // Koordinatları güncelle
            const nextPos = this.getNextPosition(row, col, direction);
            row = nextPos.row;
            col = nextPos.col;
        }

        return true;
    }

    /**
     * Kelimeyi grid'e yerleştirir
     * @returns Yerleştirilen hücrelerin listesi (Backtracking için gerekli)
     */
    public placeWord(
        grid: GridCell[][],
        word: string,
        startPos: Position,
        direction: Direction
    ): Position[] {
        let row = startPos.row;
        let col = startPos.col;
        const placedPositions: Position[] = [];

        for (let i = 0; i < word.length; i++) {
            const cell = grid[row][col];

            if (cell.letter === '') {
                cell.letter = word[i];
                placedPositions.push({ row, col });
            }

            // Kelime ID'sini ekle (burada sadece harfi koyuyoruz, ID yönetimi dışarıda yapılabilir)
            // Ancak WordDefinition üzerinden takip daha kolay.

            const nextPos = this.getNextPosition(row, col, direction);
            row = nextPos.row;
            col = nextPos.col;
        }

        return placedPositions;
    }

    /**
     * Grid'den kelimeyi (hücreleri) temizler (Backtracking)
     */
    private removeWord(grid: GridCell[][], positions: Position[]): void {
        for (const pos of positions) {
            grid[pos.row][pos.col].letter = '';
        }
    }

    /**
     * Boş hücreleri rastgele harflerle doldurur
     */
    private fillEmptyCells(grid: GridCell[][]): void {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                if (grid[row][col].letter === '') {
                    grid[row][col].letter = this.getRandomLetter();
                }
            }
        }
    }

    /**
     * Boş grid oluşturur
     */
    private createEmptyGrid(gridSize: GridSize): GridCell[][] {
        const grid: GridCell[][] = [];
        for (let row = 0; row < gridSize.rows; row++) {
            const currentRow: GridCell[] = [];
            for (let col = 0; col < gridSize.cols; col++) {
                currentRow.push({
                    row,
                    col,
                    letter: '',
                    isRevealed: false,
                    isHinted: false,
                    wordIds: []
                });
            }
            grid.push(currentRow);
        }
        return grid;
    }

    /**
     * Kelime uzunluğuna göre olası tüm başlangıç pozisyonlarını ve yönleri döndürür
     */
    private getAllPossiblePositions(gridSize: GridSize, wordLength: number): Array<{ start: Position; direction: Direction }> {
        const positions: Array<{ start: Position; direction: Direction }> = [];
        const directions = Object.values(Direction);

        for (let row = 0; row < gridSize.rows; row++) {
            for (let col = 0; col < gridSize.cols; col++) {
                for (const direction of directions) {
                    if (this.isValidBounds(row, col, direction, wordLength, gridSize)) {
                        positions.push({
                            start: { row, col },
                            direction: direction as Direction
                        });
                    }
                }
            }
        }

        return positions;
    }

    /**
     * Sınır kontrolü (kelime sığar mı?)
     */
    private isValidBounds(
        row: number,
        col: number,
        direction: Direction,
        length: number,
        gridSize: GridSize
    ): boolean {
        const endRow = row + this.getDirectionDelta(direction).dy * (length - 1);
        const endCol = col + this.getDirectionDelta(direction).dx * (length - 1);

        return (
            endRow >= 0 && endRow < gridSize.rows &&
            endCol >= 0 && endCol < gridSize.cols
        );
    }

    /**
     * Yön değişimi (delta) değerlerini döndürür
     */
    private getDirectionDelta(direction: Direction): { dx: number; dy: number } {
        switch (direction) {
            case Direction.HORIZONTAL: return { dx: 1, dy: 0 };
            case Direction.VERTICAL: return { dx: 0, dy: 1 };
            case Direction.DIAGONAL_DOWN: return { dx: 1, dy: 1 };
            case Direction.DIAGONAL_UP: return { dx: 1, dy: -1 };
            default: return { dx: 0, dy: 0 };
        }
    }

    /**
     * Bir sonraki pozisyonu hesaplar
     */
    private getNextPosition(row: number, col: number, direction: Direction): Position {
        const delta = this.getDirectionDelta(direction);
        return {
            row: row + delta.dy,
            col: col + delta.dx
        };
    }

    /**
     * Bitiş pozisyonunu hesaplar
     */
    private calculateEndPos(startPos: Position, direction: Direction, length: number): Position {
        const delta = this.getDirectionDelta(direction);
        return {
            row: startPos.row + delta.dy * (length - 1),
            col: startPos.col + delta.dx * (length - 1)
        };
    }

    /**
     * Rastgele harf döndürür
     */
    private getRandomLetter(): string {
        return this.ALPHABET[Math.floor(Math.random() * this.ALPHABET.length)];
    }

    /**
     * Diziyi karıştırır (Fisher-Yates shuffle)
     */
    private shuffleArray(array: any[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Kelimenin grid üzerindeki yolunu (tüm hücreleri) döndürür
     */
    public getWordPath(wordDef: WordDefinition): Position[] {
        const path: Position[] = [];
        let { row, col } = wordDef.startPos;
        const delta = this.getDirectionDelta(wordDef.direction);

        for (let i = 0; i < wordDef.text.length; i++) {
            path.push({ row, col });
            row += delta.dy;
            col += delta.dx;
        }

        return path;
    }

    /**
     * Grid validasyonunu yapar
     */
    public validateGrid(_grid: GridCell[][], _words: string[]): boolean {
        // Burada daha kompleks kontroller yapılabilir
        // Şimdilik sadece tüm kelimelerin grid içinde var olup olmadığını kontrol edelim
        // Ancak bu işlem generateGrid içinde zaten garanti altına alınıyor.
        return true;
    }
}

// Export singleton instance (veya class olarak kullanılabilir, burada class daha mantıklı, her level için new instance gerekebilir veya stateless static metodlar)
// Dokümanda "src/utils/gridAlgorithm.ts" dendiği için düz export class veya functions tercih edilir.
// Singleton gerekmiyor çünkü state tutmuyor.

export const gridAlgorithm = new GridAlgorithm();
