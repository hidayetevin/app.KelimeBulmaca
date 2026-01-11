import Phaser from 'phaser';
import { FONT_FAMILY_PRIMARY, GAME_HEIGHT, GAME_WIDTH } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import AudioManager from '@/managers/AudioManager';

interface PanelConfig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    title?: string;
    showCloseButton?: boolean;
    onClose?: () => void;
}

export default class Panel extends Phaser.GameObjects.Container {
    private bg!: Phaser.GameObjects.Graphics;
    private titleText?: Phaser.GameObjects.Text;

    private backdrop?: Phaser.GameObjects.Rectangle;

    private config: PanelConfig;
    private colors: any;

    constructor(config: PanelConfig) {
        super(config.scene, config.x, config.y);
        this.config = config;
        this.colors = LIGHT_COLORS;

        // Sahneye eklemiyoruz, çünkü bazen başka container içine eklenebilir.
        // Ama genellikle root overlay olur. Kullanıcı "add.existing" yapmalı veya scene.add.existing(panel).
        // Kolaylık olsun diye biz ekleyelim ama "visible: false" başlasın ki open() ile açılsın.
        // Ancak container constructor'da scene'e eklemek bazen sorun yaratabilir (constructor bitmeden).
        // En iyisi kullanıcı manuel eklesin veya otomatik ekleyip visible false yapalım.
        this.scene.add.existing(this);
        this.setVisible(false);
        this.setAlpha(0);
        this.setScale(0.8);

        // Backdrop (Opsiyonel, eğer modal ise)
        // Backdrop panelin içinde olmamalı, panelin arkasında olmalı.
        // Ancak Panel bir Container olduğu için backdrop'u "self" içine koyarsak scale ile o da scale olur.
        // Doğrusu: Backdrop ayrı bir obje olmalı veya Panel tüm ekranı kaplayan bir container olup popup onun içinde child olmalı.
        // Dokümanda "Backdrop: Yarı saydam siyah overlay" diyor.
        // Basitlik için: Backdrop'u scene'e ekleyelim (this'in parent'ı değil, sibling'i).
        // Ama Panel destroy olunca o da gitmeli.
        // Çözüm: Panel aslında tüm ekranı kaplayan bir Container olsun (Overlay), içindeki "Window" asıl içerik olsun.
        // Ama x,y parametresi verilmiş. Demek ki Panel sadece pencere.
        // O zaman Backdrop'u createBackdrop ile yönetelim.

        this.createContent();
    }

    private createContent() {
        const w = this.config.width;
        const h = this.config.height;
        const radius = 24;

        // Shadow
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(0x000000, 0.2);
        shadow.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w, h, radius);
        this.add(shadow);

        // Background
        this.bg = this.scene.add.graphics();
        this.bg.fillStyle(this.colors.SURFACE, 1);
        this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
        this.add(this.bg);

        // Title
        if (this.config.title) {
            this.titleText = this.scene.add.text(0, -h / 2 + 40, this.config.title, {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '24px',
                color: '#1A202C',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.add(this.titleText);

            // Divider line?
            // this.bg.lineStyle(2, 0xE2E8F0);
            // this.bg.lineBetween(-w/2 + 20, -h/2 + 80, w/2 - 20, -h/2 + 80);
        }

        // Close Button
        if (this.config.showCloseButton) {
            this.createCloseButton();
        }
    }

    private createCloseButton() {
        const w = this.config.width;
        const h = this.config.height;
        const btnSize = 36;
        const x = w / 2 - 30;
        const y = -h / 2 + 30;

        const btn = this.scene.add.container(x, y);

        const bg = this.scene.add.graphics();
        bg.fillStyle(this.colors.SECONDARY, 1);
        bg.fillCircle(0, 0, btnSize / 2);
        btn.add(bg);

        const icon = this.scene.add.text(0, 0, '✕', {
            fontSize: '18px',
            color: '#1A202C',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        btn.add(icon);

        const hitArea = this.scene.add.circle(0, 0, btnSize / 2);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerdown', () => {
            btn.setScale(0.9);
        });

        hitArea.on('pointerup', () => {
            btn.setScale(1);
            AudioManager.playSfx('button_click');
            this.close();
        });

        btn.add(hitArea);
        this.add(btn);
        // this.closeBtn = btn;
    }

    public addContent(gameObject: Phaser.GameObjects.GameObject) {
        this.add(gameObject);
    }

    public setTitle(title: string) {
        if (this.titleText) {
            this.titleText.setText(title);
        }
    }

    public async open(duration: number = 300): Promise<void> {
        // Backdrop oluştur
        this.backdrop = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0);
        this.backdrop.setOrigin(0.5);
        this.backdrop.setInteractive(); // Arkaya tıklamayı engelle
        this.backdrop.setDepth(this.depth - 1); // Panelin arkasında

        // Eğer panel bir container içindeyse scene koordinatları karışabilir ama
        // şimdilik root'ta varsayıyoruz.

        // Fade in backdrop
        this.scene.tweens.add({
            targets: this.backdrop,
            fillAlpha: 0.6,
            duration: duration
        });

        this.setVisible(true);
        this.setAlpha(0);
        this.setScale(0.8);

        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: this,
                alpha: 1,
                scale: 1,
                ease: 'Back.out',
                duration: duration,
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    public async close(duration: number = 200): Promise<void> {
        // Fade out backdrop
        if (this.backdrop) {
            this.scene.tweens.add({
                targets: this.backdrop,
                fillAlpha: 0,
                duration: duration,
                onComplete: () => {
                    this.backdrop?.destroy();
                    this.backdrop = undefined;
                }
            });
        }

        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                scale: 0.8,
                ease: 'Back.in',
                duration: duration,
                onComplete: () => {
                    this.setVisible(false);
                    if (this.config.onClose) {
                        this.config.onClose();
                    }
                    resolve();
                }
            });
        });
    }
}
