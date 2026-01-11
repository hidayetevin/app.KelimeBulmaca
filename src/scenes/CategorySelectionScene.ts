import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import Button from '@/components/UI/Button';
import StarDisplay from '@/components/UI/StarDisplay';
import CategoryCard from '@/components/UI/CategoryCard';

export default class CategorySelectionScene extends Phaser.Scene {
    private scrollContainer!: Phaser.GameObjects.Container;
    private isDragging = false;
    private lastY = 0;
    private startDragY = 0;
    private minY = 0; // Top bound
    private maxY = 0; // Bottom bound (negative)

    constructor() {
        super(SCENES.CATEGORY_SELECTION);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;

        // 1. Background
        this.add.rectangle(0, 0, width, height, 0xF7FAFC).setOrigin(0);

        // 2. Header
        this.createHeader(centerX);

        // 3. Category List
        this.createCategoryList();

        // 4. Back Key
        this.input.keyboard?.on('keydown-ESC', () => {
            this.goBack();
        });
    }

    private goBack() {
        this.scene.start(SCENES.MAIN_MENU);
    }

    private createHeader(centerX: number) {
        // Top Bar Background
        const headerH = 80;
        const headerBg = this.add.rectangle(0, 0, GAME_WIDTH, headerH, 0xFFFFFF).setOrigin(0);
        // Shadow line
        this.add.rectangle(0, headerH, GAME_WIDTH, 2, 0xE2E8F0).setOrigin(0);

        // Back Button (Simple Text or Icon)
        const backBtn = new Button({
            scene: this,
            x: 50,
            y: headerH / 2,
            text: '<', // Or use icon
            width: 50,
            height: 50,
            style: 'secondary',
            onClick: () => this.goBack()
        });

        // Title
        this.add.text(centerX, headerH / 2, LocalizationManager.t('category.title', 'KATEGORİLER'), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '24px',
            color: '#' + LIGHT_COLORS.TEXT_DARK.toString(16).padStart(6, '0'),
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Star Display (Top Right)
        const starDisplay = new StarDisplay({
            scene: this,
            x: GAME_WIDTH - 60,
            y: headerH / 2,
            initialValue: GameManager.getGameState()?.user.totalStars || 0,
            showLabel: false
        });
        // StarDisplay default puts text at 0, icon at -40.
        // We want generic positioning.
        // This should suffice.
    }

    private createCategoryList() {
        const headerH = 82;
        const listH = GAME_HEIGHT - headerH;
        const centerX = GAME_WIDTH / 2;
        const cardW = GAME_WIDTH - 40;
        const cardH = 100;
        const gap = 20;

        // Mask
        const maskShape = this.make.graphics({});
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(0, headerH, GAME_WIDTH, listH);
        const mask = maskShape.createGeometryMask();

        // Container
        this.scrollContainer = this.add.container(0, headerH + gap + cardH / 2);
        this.scrollContainer.setMask(mask);

        // Add Cards
        const categories = GameManager.getGameState()?.categories || [];

        let currentY = 0;
        categories.forEach(cat => {
            const card = new CategoryCard({
                scene: this,
                x: centerX, // relative to container
                y: currentY,
                width: cardW,
                height: cardH,
                category: cat,
                onPress: () => this.onCategoryPress(cat.id)
            });
            this.scrollContainer.add(card);
            currentY += cardH + gap;
        });

        // Scroll Bounds
        const contentHeight = currentY;
        this.minY = headerH + gap + cardH / 2; // Start pos
        this.maxY = this.minY - (contentHeight - listH + 100);
        // Logic: if content > listH, we can scroll up (y decreases).
        if (contentHeight < listH) {
            this.maxY = this.minY; // No scroll needed
        }

        // Interaction
        const hitZone = this.add.rectangle(centerX, headerH + listH / 2, GAME_WIDTH, listH, 0x000000, 0);
        hitZone.setInteractive();

        hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = true;
            this.lastY = pointer.y;
            this.startDragY = pointer.y;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const dy = pointer.y - this.lastY;
                this.lastY = pointer.y;
                this.scrollContainer.y += dy;

                // Elastic bounds or clamp?
                // Simple clamp for prototype
                // if (this.scrollContainer.y > this.minY) this.scrollContainer.y = this.minY; // Drag down limit
                // if (this.scrollContainer.y < this.maxY) this.scrollContainer.y = this.maxY; // Drag up limit
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                this.isDragging = false;
                // Snap bounds
                if (this.scrollContainer.y > this.minY) {
                    this.tweens.add({ targets: this.scrollContainer, y: this.minY, duration: 300, ease: 'Back.out' });
                } else if (this.scrollContainer.y < this.maxY) {
                    this.tweens.add({ targets: this.scrollContainer, y: this.maxY, duration: 300, ease: 'Back.out' });
                }

                // Detect Click vs Drag
                const dist = Math.abs(pointer.y - this.startDragY);
                // Click logic handled by Card itself, but card also receives pointerup.
                // If we dragged, maybe cancel card click? 
                // Card uses pointerdown/up on itself. That usually works independently.
                // But scrolling triggers card click if not careful.
                // Card should check drag state?
                // Or we rely on small movement.
                // The Card's onPress is triggered on pointerup.
                // If major drag happened, we shouldn't trigger card. 
                // Currently not handled, but acceptable for now.
            }
        });
    }

    private onCategoryPress(categoryId: string) {
        if (Math.abs(this.input.y - this.startDragY) > 10) return; // Ignore if scrolled

        const game = GameManager;
        if (game.canUnlockCategory(categoryId)) {
            // Ask to unlock
            if (confirm(`Bu kategoriyi açmak için yıldız harcansın mı?`)) {
                if (game.unlockCategory(categoryId)) {
                    // Success unlock
                    this.scene.restart(); // Refresh list locked states
                }
            }
        } else {
            // If unlocked, play. If locked and not enough stars, show info?
            const cat = game.getGameState()?.categories.find(c => c.id === categoryId);
            if (cat && !cat.isLocked) {
                // Start Game (Step 23/24)
                // this.scene.start(SCENES.GAME, { categoryId });
                console.log(`Starting Category: ${categoryId}`);
                // Placeholder for Game Scene
                // this.scene.start('GameScene', ...);
            } else {
                alert('Yeterli yıldız yok veya kilitli.');
            }
        }
    }
}
