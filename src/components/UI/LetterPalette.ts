import Phaser from 'phaser';
import CircularLetterNode from './CircularLetterNode';

export interface LetterPaletteConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    letters: string[];
    onWordSubmit: (word: string) => void;
}

export default class LetterPalette extends Phaser.GameObjects.Container {
    private nodes: CircularLetterNode[] = [];
    private selectedNodes: CircularLetterNode[] = [];
    private selectionLine: Phaser.GameObjects.Graphics;
    private isDragging: boolean = false;
    private activePointerId: number | null = null;
    private lastLocalPos: { x: number, y: number } | null = null;
    private onWordSubmitCallback: (word: string) => void;

    constructor(config: LetterPaletteConfig) {
        super(config.scene, config.x, config.y);

        this.onWordSubmitCallback = config.onWordSubmit;

        // Selection line (Create BEFORE nodes to be behind them)
        this.selectionLine = this.scene.add.graphics();
        this.add(this.selectionLine);

        this.createNodes(config.letters);
        this.setupInteraction();

        this.scene.add.existing(this);
    }

    private createNodes(letters: string[]) {
        const radius = 35;
        // const spacing = 90;

        // Arrange in circular pattern
        //const centerX = 0;
        //const centerY = 0;
        const arrangeRadius = 100;

        letters.forEach((letter, index) => {
            const angle = (index / letters.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * arrangeRadius;
            const y = Math.sin(angle) * arrangeRadius;

            const node = new CircularLetterNode({
                scene: this.scene,
                x: x,
                y: y,
                letter: letter,
                size: radius * 2,
                index: index
            });

            this.nodes.push(node);
            this.add(node);
        });
    }

    private setupInteraction() {
        // Use scene-level input
        this.scene.input.on('pointerdown', this.onPointerDown, this);
        this.scene.input.on('pointermove', this.onPointerMove, this);
        this.scene.input.on('pointerup', this.onPointerUp, this);
        this.scene.input.on('pointerupoutside', this.onPointerUp, this);
    }

    private onPointerDown(pointer: Phaser.Input.Pointer) {
        if (this.isDragging) return;

        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const localPoint = this.pointToContainer(worldPoint);

        const node = this.getNodeAtPosition(localPoint.x, localPoint.y);
        if (node && !node.isUsed) {
            this.isDragging = true;
            this.activePointerId = pointer.id;
            this.selectedNodes = [node];
            node.select();
            this.updateSelectionLine();
            this.lastLocalPos = { x: localPoint.x, y: localPoint.y };
        }
    }

    private onPointerMove(pointer: Phaser.Input.Pointer) {
        if (!this.isDragging || pointer.id !== this.activePointerId) return;

        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const localPoint = this.pointToContainer(worldPoint);

        if (this.lastLocalPos) {
            const dist = Phaser.Math.Distance.Between(this.lastLocalPos.x, this.lastLocalPos.y, localPoint.x, localPoint.y);
            const steps = Math.max(1, Math.ceil(dist / 10)); // Stepping to prevent fast-swipe skipping

            let selectionChanged = false;

            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const px = Phaser.Math.Interpolation.Linear([this.lastLocalPos.x, localPoint.x], t);
                const py = Phaser.Math.Interpolation.Linear([this.lastLocalPos.y, localPoint.y], t);

                const node = this.getNodeAtPosition(px, py);

                if (node && !node.isUsed) {
                    const index = this.selectedNodes.indexOf(node);

                    if (index === -1) {
                        this.selectedNodes.push(node);
                        node.select();
                        selectionChanged = true;
                    } else if (index === this.selectedNodes.length - 2) {
                        const removed = this.selectedNodes.pop();
                        removed?.deselect();
                        selectionChanged = true;
                    }
                }
            }

            if (selectionChanged) {
                this.updateSelectionLine();
            }
        }

        this.lastLocalPos = { x: localPoint.x, y: localPoint.y };

        // Follow the finger visually
        this.updateSelectionLine(localPoint);
    }

    private onPointerUp(pointer: Phaser.Input.Pointer) {
        if (!this.isDragging || pointer.id !== this.activePointerId) return;

        this.isDragging = false;
        this.activePointerId = null;
        this.lastLocalPos = null;

        const word = this.selectedNodes.map(n => n.letter).join('');

        if (word.length >= 2) {
            this.onWordSubmitCallback(word);
        }

        this.clearSelection();
    }

    private getNodeAtPosition(x: number, y: number): CircularLetterNode | null {
        for (const node of this.nodes) {
            const distance = Phaser.Math.Distance.Between(x, y, node.x, node.y);
            if (distance < 35) {
                return node;
            }
        }
        return null;
    }

    private updateSelectionLine(currentPointer?: { x: number, y: number }) {
        this.selectionLine.clear();

        if (this.selectedNodes.length === 0) return;
        if (this.selectedNodes.length === 1 && !currentPointer) return;

        this.selectionLine.lineStyle(8, 0x3B82F6, 0.8);
        this.selectionLine.beginPath();

        const first = this.selectedNodes[0];
        this.selectionLine.moveTo(first.x, first.y);

        for (let i = 1; i < this.selectedNodes.length; i++) {
            const node = this.selectedNodes[i];
            this.selectionLine.lineTo(node.x, node.y);
        }

        if (currentPointer) {
            this.selectionLine.lineTo(currentPointer.x, currentPointer.y);
        }

        this.selectionLine.strokePath();
    }

    public clearSelection() {
        this.selectedNodes.forEach(node => node.deselect());
        this.selectedNodes = [];
        this.selectionLine.clear();
    }

    public markLettersAsUsed(word: string) {
        const letters = word.split('');
        letters.forEach(letter => {
            const node = this.nodes.find(n => n.letter === letter && !n.isUsed);
            if (node) {
                node.setUsed(true);
            }
        });
    }

    public resetPalette() {
        this.nodes.forEach(node => node.reset());
        this.clearSelection();
    }

    public destroy() {
        this.scene.input.off('pointerdown', this.onPointerDown, this);
        this.scene.input.off('pointermove', this.onPointerMove, this);
        this.scene.input.off('pointerup', this.onPointerUp, this);
        this.scene.input.off('pointerupoutside', this.onPointerUp, this);
        super.destroy();
    }
}
