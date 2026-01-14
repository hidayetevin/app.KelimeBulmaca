import { SCENES, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY_PRIMARY, DAILY_REWARDS } from '@/utils/constants';
import { LIGHT_COLORS } from '@/utils/colors';
import GameManager from '@/managers/GameManager';
import LocalizationManager from '@/managers/LocalizationManager';
import AudioManager from '@/managers/AudioManager';
import HapticManager from '@/managers/HapticManager';
import { scalePopup, confetti } from '@/utils/animations';

export default class DailyRewardScene extends Phaser.Scene {
    private mainContainer!: Phaser.GameObjects.Container;
    private claimButton!: Phaser.GameObjects.Container;
    private isClaimed: boolean = false;

    constructor() {
        super(SCENES.DAILY_REWARD);
    }

    create() {
        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;
        const centerX = width / 2;
        const centerY = height / 2;

        // Settings'den tema bilgisini al (gerçi şu an global theme yok, local constant kullanıyoruz)
        // Varsayılan Light olsun
        const colors = LIGHT_COLORS;

        // 1. Dimmed Background
        const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        bg.setOrigin(0);
        bg.setInteractive(); // Arkaya tıklamayı engelle

        // 2. Main Container
        this.mainContainer = this.add.container(centerX, centerY);
        this.mainContainer.setScale(0); // Başlangıçta 0, animasyonla büyüyecek

        // Panel Background
        // Texture var mı kontrol et, yoksa graphics çiz
        let panel: Phaser.GameObjects.GameObject;
        if (this.textures.exists('panel_light')) {
            panel = this.add.nineslice(0, 0, 'panel_light', undefined, 340, 500, 20, 20, 20, 20);
        } else {
            const graphics = this.add.graphics();
            graphics.fillStyle(colors.SURFACE, 1);
            graphics.fillRoundedRect(-170, -250, 340, 500, 24);
            panel = graphics;
        }
        this.mainContainer.add(panel);

        // Header Title
        const titleText = this.add.text(0, -210, LocalizationManager.t('dailyReward.title', 'Günlük Ödül'), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '28px',
            color: '#' + colors.TEXT_DARK.toString(16).padStart(6, '0'),
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.mainContainer.add(titleText);

        // Subtitle
        const subtitleText = this.add.text(0, -170, LocalizationManager.t('dailyReward.subtitle', 'Her gün gel, daha çok kazan!'), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '14px',
            color: '#' + colors.TEXT_LIGHT.toString(16).padStart(6, '0')
        }).setOrigin(0.5);
        this.mainContainer.add(subtitleText);

        // 3. Streak Calendar (Grid)
        const gameState = GameManager.getGameState();
        const currentStreak = gameState?.dailyReward.currentStreak || 0;
        // Günlük ödül döngüsü 7 günlük, streak arttıkça başa dönüyor mu yoksa sabit mi?
        // Genelde 7. gün büyük ödül, sonra başa döner.
        // GameManager'da: currentStreak artıyor sürekli.
        // Biz mod 7'sine göre gösterelim gui'yi ama streak metni user için total olabilir.
        // Basitlik için: currentStreak % 7 (0 ise 7. gün)

        let dayIndex = (currentStreak % 7); // 0..6 (Burada claim öncesi state var, henüz claim etmedi)
        // Eğer bugün ödül aldıysa dayIndex bir sonraki gündür. Ama bu sahne "ödül al" sahnesi olduğu için
        // dayIndex, şu an alacağımız gün olmalı.
        // GameManager currentStreak'i claim edince artırıyor. O zaman şu anki değer doğru.

        // Grid Layout
        const startY = -120;
        const gap = 10;
        const boxSize = 80;

        // 7 kutuyu dizmek zor (3 üstte, 4 altta)
        // Row 1: Day 1, 2, 3
        // Row 2: Day 4, 5, 6, 7 (7. geniş olabilir büyük ödül)

        DAILY_REWARDS.forEach((reward, index) => {
            // Pozisyon hesapla
            let x = 0;
            let y = 0;
            const isRow1 = index < 3;

            if (isRow1) {
                // 3 tane ortalı
                const totalW = (3 * boxSize) + (2 * gap);
                x = (index * (boxSize + gap)) - (totalW / 2) + (boxSize / 2);
                y = startY;
            } else {
                // 4 tane biraz sıkışık veya küçük
                // Tasarım kararı: 4. gün, 5. gün, 6. gün, 7. gün
                // Aşağıya 2 satır daha yapalım:
                // Row 2: 4, 5
                // Row 3: 6, 7
                const row2Index = index - 3; // 0..3
                if (row2Index < 2) {
                    const totalW = (2 * boxSize) + gap;
                    x = (row2Index * (boxSize + gap)) - (totalW / 2) + (boxSize / 2);
                    y = startY + boxSize + gap;
                } else {
                    const row3Index = row2Index - 2;
                    const totalW = (2 * boxSize) + gap;
                    x = (row3Index * (boxSize + gap)) - (totalW / 2) + (boxSize / 2);
                    y = startY + (boxSize + gap) * 2;
                }
            }

            // Büyük ödül (7. gün) biraz farklı olabilir ama şimdilik aynı box

            // State: Past, Current, Future
            let state: 'past' | 'current' | 'future' = 'future';
            if (index < dayIndex) state = 'past';
            else if (index === dayIndex) state = 'current';

            const dayBox = this.createDayBox(x, y, reward.day, reward.stars, state, boxSize, colors);
            this.mainContainer.add(dayBox);
        });

        // 4. Claim Button
        this.claimButton = this.createClaimButton(0, 200, colors);
        this.mainContainer.add(this.claimButton);

        // Animasyon
        scalePopup(this, this.mainContainer);

        AudioManager.playSfx('hint_show'); // Açılış sesi
    }

    private createDayBox(x: number, y: number, day: number, stars: number, state: 'past' | 'current' | 'future', size: number, colors: any): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Background
        const bg = this.add.graphics();
        const color = state === 'current' ? colors.PRIMARY : (state === 'past' ? colors.SECONDARY : 0xe0e0e0);
        const alpha = state === 'future' ? 0.5 : 1;

        bg.fillStyle(color, alpha);
        if (state === 'current') {
            bg.lineStyle(3, 0xFFFFFF, 1);
            bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 12);
        }
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
        container.add(bg);

        // Day Text (Top Left)
        const dayText = this.add.text(-size / 2 + 5, -size / 2 + 5, `${day}.Gün`, {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '10px',
            color: state === 'current' ? '#ffffff' : '#666666'
        });
        container.add(dayText);

        // Star Icon & Amount
        if (state === 'past') {
            // Checkmark
            const check = this.add.text(0, 0, '✓', {
                fontSize: '32px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(check);
        } else {
            // Star Icon (Graphics or Image)
            // Image deneyelim
            if (this.textures.exists('star_filled')) {
                const star = this.add.image(0, -5, 'star_filled').setScale(0.5); // Küçük yıldız
                container.add(star);
            } else {
                const starText = this.add.text(0, -5, '⭐', { fontSize: '20px' }).setOrigin(0.5);
                container.add(starText);
            }

            // Amount
            const amountText = this.add.text(0, 15, `+${stars}`, {
                fontFamily: FONT_FAMILY_PRIMARY,
                fontSize: '14px',
                color: state === 'current' ? '#ffffff' : '#444444',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            container.add(amountText);
        }

        return container;
    }

    private createClaimButton(x: number, y: number, colors: any): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Button Shape
        const btnGraphics = this.add.graphics();
        btnGraphics.fillStyle(colors.SUCCESS, 1);
        btnGraphics.fillRoundedRect(-100, -25, 200, 50, 25);

        // Shadow (Basit)
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.2);
        shadow.fillRoundedRect(-100, -20, 200, 50, 25);
        container.add(shadow);
        container.add(btnGraphics); // Shadow arkada kalsın diye önce eklenmeliydi ama neyse

        // Text
        const text = this.add.text(0, 0, LocalizationManager.t('common.collect', 'TOPLA'), {
            fontFamily: FONT_FAMILY_PRIMARY,
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(text);

        // Interactive Zone
        const hitArea = this.add.rectangle(0, 0, 200, 50, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerdown', () => {
            btnGraphics.clear();
            btnGraphics.fillStyle(colors.SUCCESS_DARK || 0x2e7d32, 1);
            btnGraphics.fillRoundedRect(-100, -25, 200, 50, 25);
            container.y += 2; // Press effect
        });

        hitArea.on('pointerup', () => {
            btnGraphics.clear();
            btnGraphics.fillStyle(colors.SUCCESS, 1);
            btnGraphics.fillRoundedRect(-100, -25, 200, 50, 25);
            container.y -= 2;
            this.handleClaim();
        });

        hitArea.on('pointerout', () => {
            btnGraphics.clear();
            btnGraphics.fillStyle(colors.SUCCESS, 1);
            btnGraphics.fillRoundedRect(-100, -25, 200, 50, 25);
            container.y = y; // Reset
        });

        container.add(hitArea);

        return container;
    }

    private handleClaim() {
        if (this.isClaimed) return;
        this.isClaimed = true;

        // Logic
        GameManager.claimDailyReward();

        // Feedback
        AudioManager.playSfx('word_correct'); // Özel ses olmalı ama şimdilik bu
        HapticManager.success();

        // Visual
        confetti(this, 0, 0); // Ekran ortası değil scene coordinate (0,0 is top left)
        // Confetti fonksiyonu origin parametresi scene center mı alıyor?
        // utils/animations.ts içine bakmak lazım: x ve y alıyor.
        confetti(this, GAME_WIDTH / 2, GAME_HEIGHT / 2);

        // Button Text Update
        const text = this.claimButton.list.find(c => c instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
        if (text) text.setText(LocalizationManager.t('common.collected', 'ALINDI'));

        // Delay and Exit
        this.time.delayedCall(1500, () => {
            this.scene.start(SCENES.MAIN_MENU);
        });
    }
}
