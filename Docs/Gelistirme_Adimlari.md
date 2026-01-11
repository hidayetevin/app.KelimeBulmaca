# Kelime Ustası Oyunu - Adım Adım Geliştirme Promptları

## 📌 Kullanım Talimatları

Her prompt'u AI asistanına sırayla verin. Bir adım tamamlanmadan bir sonrakine geçmeyin. Her prompt, proje_dokumani.md dosyasına referans verir, bu yüzden her prompt ile birlikte dokümanı da context olarak sağlayın.

---

## ADIM 1: Proje Kurulumu ve Temel Yapı

```
Kelime Ustası oyunu için proje kurulumu yapacağız. proje_dokumani.md dosyasına göre:

1. Vite + TypeScript + Phaser.js 3 projesi oluştur
2. Aşağıdaki klasör yapısını oluştur:
   - src/scenes/
   - src/components/
   - src/managers/
   - src/types/
   - src/utils/
   - src/data/
   - public/assets/images/
   - public/assets/audio/
   - public/locales/

3. package.json içinde şu bağımlılıkları ekle:
   - phaser@^3.80.1
   - typescript@^5.3.3
   - vite@^5.0.8

4. tsconfig.json'u strict mode ile yapılandır ve path aliases ekle (@/ için src/)

5. vite.config.ts oluştur ve Phaser için optimize et

6. src/config.ts dosyası oluştur ve oyun yapılandırmasını ekle:
   - Canvas boyutu: 375x812 (iPhone X)
   - Ölçekleme: FIT
   - Arka plan rengi: dokümandaki renk paletinden

7. src/main.ts oluştur ve Phaser Game instance'ı başlat

8. Boş BootScene.ts ve PreloaderScene.ts oluştur

Tüm dosyaları kod bloklarında ver. Her dosya için açıklama ekle.
```

---

## ADIM 2: TypeScript Type Definitions

```
proje_dokumani.md'deki "6. Veri Yapıları" bölümüne göre tüm TypeScript type definition'larını oluştur:

1. src/types/GameTypes.ts
   - GameState interface
   - UserData interface
   - GameSettings interface
   - DailyRewardData interface
   - LocalizedString interface

2. src/types/CategoryTypes.ts
   - CategoryData interface
   - LevelData interface
   - LevelConfiguration interface
   - WordDefinition interface
   - Direction enum
   - Position interface
   - GridSize interface
   - GridCell interface

3. src/types/AchievementTypes.ts
   - Achievement interface
   - AchievementCategory enum

4. src/types/index.ts
   - Tüm type'ları export et

Her interface için JSDoc yorumları ekle. Enum değerlerini açıkla.
```

---

## ADIM 3: Renk Sistemi ve Sabitler

```
proje_dokumani.md'deki "9. UI/UX Tasarım Sistemi" bölümüne göre:

1. src/utils/colors.ts oluştur
   - Light mode renk paleti
   - Dark mode renk paleti
   - Renk yardımcı fonksiyonları (hexToNumber, etc.)

2. src/utils/constants.ts oluştur
   - Oyun sabitleri (GRID_CELL_SIZE, LETTER_CIRCLE_SIZE, etc.)
   - Animasyon süreleri
   - Ses dosyası yolları
   - Z-index değerleri
   - Font isimleri

3. Dokümandaki renk paletini tam olarak uygula:
   - Light mode: Background #F5F7FA, Primary #FFFFFF, Accent #6C63FF
   - Dark mode: Background #0F172A, Primary #1E293B, Accent #E94560

Tüm sabitler SCREAMING_SNAKE_CASE formatında olsun.
```

---

## ADIM 4: Storage Manager (Veri Kaydetme)

```
Oyunun tüm verilerini localStorage'da saklayacak StorageManager oluştur.

src/managers/StorageManager.ts:

1. Singleton pattern kullan
2. Şu metodları implement et:
   - saveGameState(state: GameState): void
   - loadGameState(): GameState | null
   - clearGameState(): void
   - getDefaultGameState(): GameState
   
3. Veri versiyonlama sistemi ekle (migration için)

4. JSON.stringify/parse ile compression uygula

5. Try-catch ile error handling

6. LocalStorage key: 'word-master-game-state'

7. getDefaultGameState() metodunda:
   - 3 kategori oluştur (animals, fruits, cities)
   - İlk 2 kategori açık, 3. kilitli (20 yıldız)
   - Her kategoride 5 boş seviye
   - Tüm achievement'ları locked olarak
   - Default settings (TR dil, dark mode true, ses açık)

Tam kod ver, her metod için açıklama ekle.
```

---

## ADIM 5: Localization Manager (Çoklu Dil)

```
Çoklu dil desteği için LocalizationManager oluştur.

1. src/managers/LocalizationManager.ts:
   - Singleton pattern
   - loadLocale(lang: 'tr' | 'en'): Promise<void>
   - t(key: string): string (translation fonksiyonu)
   - getCurrentLanguage(): string
   - Nested key desteği (örn: "game.wordsFound")

2. public/locales/tr.json:
   - proje_dokumani.md'deki tüm metinleri ekle
   - Yapı:
     ```json
     {
       "common": { "play": "Oyna", "back": "Geri", ... },
       "mainMenu": { "title": "Kelime Ustası", ... },
       "categories": { ... },
       "game": { ... },
       "achievements": { ... },
       "settings": { ... }
     }
     ```

3. public/locales/en.json:
   - Türkçe çevirilerin İngilizce karşılıkları

Tüm dosyaları ver. En az 50 çeviri terimi olsun.
```

---

## ADIM 6: Audio Manager (Ses Yönetimi)

```
Ses efektlerini yönetecek AudioManager oluştur.

src/managers/AudioManager.ts:

1. Singleton pattern kullan

2. Phaser Sound Manager'ı wrap et

3. Metodlar:
   - init(scene: Phaser.Scene): void
   - playSfx(key: string): void
   - stopAllSfx(): void
   - setVolume(volume: number): void
   - isSoundEnabled(): boolean
   - toggleSound(): void

4. SFX key'leri (constants.ts'den):
   - LETTER_SELECT
   - LETTER_DESELECT
   - WORD_CORRECT
   - WORD_WRONG
   - LEVEL_COMPLETE
   - ACHIEVEMENT_UNLOCK
   - BUTTON_CLICK
   - HINT_SHOW
   - STAR_COLLECT
   - UNLOCK

5. Volume kontrolü GameSettings'ten alsın

6. Sound enabled/disabled durumunu kontrol et

Tam implementasyon ver.
```

---

## ADIM 7: Haptic Manager (Titreşim)

```
Mobil cihazlarda titreşim feedback için HapticManager oluştur.

src/managers/HapticManager.ts:

1. Capacitor Haptics plugin'ini kullan

2. Singleton pattern

3. Metodlar:
   - init(): Promise<void>
   - light(): void (hafif titreşim)
   - medium(): void (orta şiddette)
   - heavy(): void (güçlü)
   - success(): void (başarı feedback)
   - warning(): void (uyarı feedback)
   - error(): void (hata feedback)
   - isEnabled(): boolean
   - toggle(): void

4. GameSettings'teki vibrationEnabled kontrolü

5. Web'de fallback (vibrate API veya sessiz kalma)

6. Kullanım örnekleri:
   - Harf seçimi: light()
   - Doğru kelime: success()
   - Yanlış kelime: error()
   - Seviye tamamlama: heavy()

Kod ver ve her feedback tipi için açıklama ekle.
```

---

## ADIM 8: Animation Utilities

```
Oyunda kullanılacak tüm animasyon preset'lerini oluştur.

src/utils/animations.ts:

Şu animasyonları hazır fonksiyon olarak oluştur:

1. fadeIn(scene, target, duration) - Soluklaştırma
2. fadeOut(scene, target, duration) - Koyulaştırma
3. scalePopup(scene, target, duration) - Popup açılma
4. scaleDown(scene, target, duration) - Küçülme
5. bounce(scene, target) - Zıplama
6. shake(scene, target, intensity) - Sallama
7. pulse(scene, target) - Nabız atma
8. slideIn(scene, target, direction) - Kayma girişi
9. slideOut(scene, target, direction) - Kayma çıkışı
10. confetti(scene, x, y) - Konfeti patlama (particle effect)
11. starCollect(scene, fromX, fromY, toX, toY) - Yıldız toplama animasyonu
12. unlockAnimation(scene, lockObject) - Kilit açılma
13. letterHighlight(scene, target) - Harf vurgulama
14. wordReveal(scene, cells) - Kelime açığa çıkma

Her animasyon için:
- Phaser Tween kullan
- Ease fonksiyonları (Back, Bounce, Elastic, etc.)
- Promise döndür (animasyon bitince resolve)
- Zincirleme yapılabilir olsun

Tüm kodları ver.
```

---

## ADIM 9: Grid Algorithm (Kelime Yerleştirme)

```
Bulmacada kelimeleri yerleştirecek algoritmayı oluştur.

src/utils/gridAlgorithm.ts:

1. generateGrid(words: string[], gridSize: GridSize): GridCell[][]
   - Kelimeleri gridi yerleştir
   - Kelimeler çakışabilir (ortak harfler)
   - Tüm yönler desteklensin (horizontal, vertical, diagonal)
   - Boş hücrelere rastgele harf ekle

2. canPlaceWord(grid, word, startPos, direction): boolean
   - Kelimenin yerleştirilebilir olup olmadığını kontrol et

3. placeWord(grid, word, startPos, direction): void
   - Kelimeyi grid'e yerleştir

4. getWordPath(word: WordDefinition): Position[]
   - Kelimenin tüm hücre pozisyonlarını döndür

5. findWordInGrid(grid, word): Position[] | null
   - Grid'de kelimeyi bul

6. validateGrid(grid, words): boolean
   - Grid'in valid olduğunu kontrol et

Algoritma özellikleri:
- Backtracking kullan
- Performanslı olsun (max 100ms)
- Test caseler ekle

Algoritmanın tam implementasyonunu ver.
```

---

## ADIM 10: Word Data Generator

```
Her kategori için kelime verisi oluştur.

src/data/wordGenerator.ts ve JSON dosyaları:

1. Her kategori için kelime havuzu:
   - Hayvanlar: KEDI, KÖPEK, KUŞ, BALIK, AT, KOYUN, İNEK, TAVUK, etc. (min 40 kelime)
   - Meyveler: ELMA, ARMUT, MUZ, ÇİLEK, KAYISI, ŞEFTALİ, etc. (min 40 kelime)
   - Şehirler: ANKARA, İSTANBUL, İZMİR, BURSA, ANTALYA, etc. (min 40 kelime)

2. Seviye generator fonksiyonu:
   - generateLevel(categoryId, levelNumber): LevelConfiguration
   - Level 1: 4 kelime, 3x3 grid
   - Level 2: 5 kelime, 3x4 grid
   - Level 3: 6 kelime, 4x4 grid
   - Level 4: 7 kelime, 4x5 grid
   - Level 5: 8 kelime, 5x5 grid

3. public/data/categories/ altına JSON dosyaları:
   - animals.json
   - fruits.json
   - cities.json

4. Kelime seçimi algoritması:
   - Zorluk seviyesine göre kelime seç
   - Uzunluk çeşitliliği
   - Ortak harfler olsun

Tüm kelimeleri ve generator kodunu ver.
```

---

## ADIM 11: Achievement Manager

```
Başarı rozetleri sistemini yönetecek manager.

src/managers/AchievementManager.ts:

1. Singleton pattern

2. Metodlar:
   - checkAchievements(gameState: GameState): Achievement[]
   - unlockAchievement(id: string): void
   - updateProgress(id: string, progress: number): void
   - getUnlockedAchievements(): Achievement[]
   - getLockedAchievements(): Achievement[]
   - getTotalReward(): number

3. Achievement kontrol mantığı:
   - Her oyun aksiyonundan sonra çalışsın
   - Kelime bulunduğunda
   - Seviye tamamlandığında
   - Yıldız toplandığında
   - Gün geçtiğinde

4. Progress tracking:
   - "50 yıldız topla" → her yıldızda progress++
   - "3 gün oyna" → her gün progress++

5. Unlock animasyonu için event emit et

6. Bonus yıldızları otomatik ekle

proje_dokumani.md'deki 10 achievement için tam implementasyon ver.
```

---

## ADIM 12: Game State Manager

```
Oyunun merkezi state yönetimi.

src/managers/GameStateManager.ts:

1. Singleton pattern

2. Private gameState: GameState

3. Metodlar:
   - init(): void (StorageManager'dan yükle)
   - saveGame(): void
   - resetGame(): void
   
   STAR İŞLEMLERİ:
   - addStars(amount: number): void
   - canUnlockCategory(categoryId: string): boolean
   - unlockCategory(categoryId: string): void
   
   LEVEL İŞLEMLERİ:
   - startLevel(categoryId: string, levelNumber: number): LevelConfiguration
   - completeLevel(categoryId, level, earnedStars, time): void
   - getCurrentLevel(categoryId: string): number
   - markWordAsFound(categoryId, level, wordIndex): void
   
   ACHIEVEMENT İŞLEMLERİ:
   - checkAndUnlockAchievements(): void
   - getAchievementProgress(id: string): number
   
   STATS:
   - incrementWordsFound(): void
   - incrementWrongAttempts(): void
   - updatePlayTime(seconds: number): void
   - updateStreak(): void
   
   DAILY REWARD:
   - canClaimDailyReward(): boolean
   - claimDailyReward(): number
   - getDailyRewardStreak(): number
   
   SETTINGS:
   - updateSettings(settings: Partial<GameSettings>): void
   - getSettings(): GameSettings

4. Her değişiklikte otomatik kaydet

5. Event system ekle (değişiklikleri dinlemek için)

Tam implementasyon ver. Her metod detaylı açıklanmalı.
```

---

## ADIM 13: Ad Manager (Reklam Yönetimi)

```
AdMob reklamlarını yönetecek manager.

src/managers/AdManager.ts:

1. Capacitor AdMob plugin wrapper

2. Singleton pattern

3. Test mode flag (development için)

4. Ad IDs (test IDs kullan):
   ```
   BANNER_ID: 'ca-app-pub-3940256099942544/6300978111'
   INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712'
   REWARDED_ID: 'ca-app-pub-3940256099942544/5224354917'
   ```

5. Metodlar:
   BANNER:
   - showBanner(position: 'top' | 'bottom'): Promise<void>
   - hideBanner(): Promise<void>
   
   INTERSTITIAL (seviye sonu):
   - loadInterstitial(): Promise<void>
   - showInterstitial(): Promise<boolean>
   - canShowInterstitial(): boolean (cooldown kontrolü)
   
   REWARDED (ipucu için):
   - loadRewarded(): Promise<void>
   - showRewarded(): Promise<{ watched: boolean, reward: number }>

6. Cooldown sistemi:
   - Interstitial: 120 saniye (2 dakika)
   - Rewarded: limitsiz

7. Error handling ve fallback

8. Analytics tracking

Web'de mock implementasyon (console.log).
Tam kod ver.
```

---

## ADIM 14: BootScene ve PreloaderScene

```
Oyunun başlangıç sahneleri.

1. src/scenes/BootScene.ts:
   - Sadece preload asset'leri yükle (logo, loading bar)
   - Splash screen göster
   - 1 saniye bekle
   - PreloaderScene'e geç

2. src/scenes/PreloaderScene.ts:
   - Tüm game asset'leri yükle:
     * Görseller (backgrounds, ui, icons)
     * Sesler (sfx)
     * Fontlar
     * Kategori dataları
   
   - Progress bar göster
   
   - Asset yükleme tamamlandıktan sonra:
     * GameStateManager.init()
     * LocalizationManager.loadLocale()
     * AudioManager.init()
     * HapticManager.init()
   
   - Günlük ödül kontrolü:
     * canClaimDailyReward() true ise → DailyRewardScene
     * false ise → MainMenuScene

3. Loading UI:
   - Progress bar (0-100%)
   - "Yükleniyor..." metni
   - Oyun logosu
   - Animasyonlu spinner

Tam implementasyon ver. Asset yolları constants.ts'den.
```

---

## ADIM 15: DailyRewardScene

```
Günlük ödül popup ekranı.

src/scenes/DailyRewardScene.ts:

1. Popup panel:
   - Merkeze scale animasyonlu açılsın
   - Arka plan blur/dim efekti

2. İçerik:
   - "🎁 Günlük Ödülün!" başlık
   - Gün numarası (1-7)
   - Yıldız miktarı (büyük font)
   - Streak göstergesi (🔥 emojileri)
   - "Topla" butonu

3. Streak visualization:
   - 7 günlük takvim
   - Geçmiş günler: yeşil check ✓
   - Bugün: parlayan
   - Gelecek günler: gri kilitli

4. Topla butonu:
   - Tıklandığında:
     * Yıldız toplama animasyonu
     * Konfeti efekti
     * HapticManager.success()
     * AudioManager.play('star_collect')
     * GameStateManager.claimDailyReward()
   - 1.5 saniye sonra MainMenuScene'e geç

5. Dark/Light mode desteği

Tam kod ver. UI elementleri için Phaser.GameObjects kullan.
```

---

## ADIM 16: MainMenuScene

```
Ana menü ekranı.

src/scenes/MainMenuScene.ts:

1. Layout:
   ```
   ┌─────────────────────┐
   │                     │
   │   KELIME USTASI     │ (Logo/Başlık)
   │                     │
   │   ⭐ 47 Yıldız     │ (Star display)
   │                     │
   │   [🏆 Başarılar]   │
   │                     │
   │   [  🎮 OYNA  ]    │ (Ana buton - büyük)
   │                     │
   │   [⚙️ Ayarlar]     │
   │                     │
   │   [Banner Ad]       │
   └─────────────────────┘
   ```

2. Komponenentler:
   - Logo text (gradient + shadow)
   - StarDisplay component (total stars)
   - 3 buton (custom Button component)
   - Banner ad (AdManager.showBanner('bottom'))

3. Buton aksiyonları:
   - Başarılar → AchievementScene
   - Oyna → CategorySelectionScene
   - Ayarlar → SettingsScene

4. Animasyonlar:
   - Scene açılışında fade in
   - Butonlara hover/press efekti
   - Logo pulse animasyonu

5. Arka plan:
   - Gradient (theme'e göre)
   - Hafif pattern

6. Scene create() metodunda:
   - Manager'ları kontrol et
   - Banner reklamı göster
   - Achievement kontrolü

Tam implementasyon ver.
```

---

## ADIM 17: UI Components - Button

```
Yeniden kullanılabilir buton component'i.

src/components/UI/Button.ts:

1. Phaser.GameObjects.Container extend et

2. Constructor parametreleri:
   - scene
   - x, y
   - text: string
   - onClick: () => void
   - style?: 'primary' | 'secondary' | 'danger'
   - width?: number
   - height?: number

3. Elements:
   - Background (roundedRectangle)
   - Text (Phaser.GameObjects.Text)
   - Icon (opsiyonel)

4. States:
   - Normal
   - Hover (scale 1.05, brightness++)
   - Pressed (scale 0.95)
   - Disabled (alpha 0.5, no interaction)

5. Animasyonlar:
   - Hover: scale tween
   - Press: scale + bounce tween
   - Click: bounce + ripple effect

6. Metodlar:
   - setEnabled(enabled: boolean): void
   - setText(text: string): void
   - setStyle(style: string): void

7. Theme support:
   - Dark/Light mode renkleri
   - Colors.ts'den al

8. Touch feedback:
   - AudioManager.playSfx('button_click')
   - HapticManager.light()

Tam implementasyon ver. Modern, şık görünümlü olsun.
```

---

## ADIM 18: UI Components - Panel

```
Popup ve container'lar için Panel component.

src/components/UI/Panel.ts:

1. Phaser.GameObjects.Container extend et

2. Constructor:
   - scene
   - x, y
   - width, height
   - title?: string
   - showCloseButton?: boolean

3. Elements:
   - Background (rounded rectangle + shadow)
   - Title bar (gradient)
   - Content area
   - Close button (üst sağ köşe)

4. Metodlar:
   - open(duration?: number): Promise<void>
     * Scale popup animation
     * Fade in
   
   - close(duration?: number): Promise<void>
     * Scale down animation
     * Fade out
   
   - addContent(gameObject): void
   - setTitle(title: string): void

5. Backdrop:
   - Yarı saydam siyah overlay
   - Tıklanınca panel kapansın

6. Theme support

7. Open animasyonu:
   - Scale: 0.8 → 1.0
   - Alpha: 0 → 1
   - Ease: Back.easeOut

Tam kod ver.
```

---

## ADIM 19: UI Components - StarDisplay

```
Yıldız göstergesi component.

src/components/UI/StarDisplay.ts:

1. Phaser.GameObjects.Container extend et

2. Constructor:
   - scene
   - x, y
   - starCount: number
   - showLabel?: boolean

3. Elements:
   - Star icon (⭐ veya sprite)
   - Count text (büyük, bold)
   - Label text (opsiyonel: "Yıldız")

4. Metodlar:
   - setStarCount(count: number, animated?: boolean): void
     * Animated ise: sayı artışı animasyonu
     * Yeni yıldız eklenince parlama efekti
   
   - increment(amount: number): Promise<void>
     * Smooth counter animation
     * Her +1 için ufak scale bounce

5. Animasyonlar:
   - Yıldız ekleme: scale pulse
   - Sayı değişimi: counter tween
   - Glow effect (periodic)

6. Theme support

Tam implementasyon ver.
```

---

## ADIM 20: SettingsScene

```
Ayarlar ekranı.

src/scenes/SettingsScene.ts:

1. Panel component kullan (başlık: "Ayarlar")

2. Ayar öğeleri:
   ```
   Dil: [Türkçe ▼]
   
   Karanlık Mod: [Toggle] ●——○
   
   Ses Efektleri: [Toggle] ●——○
   Ses Seviyesi: [Slider] ———●——
   
   Titreşim: [Toggle] ●——○
   
   [İlerlemeyi Sıfırla]
   ```

3. Toggle component:
   - Custom toggle switch
   - Animasyonlu geçiş
   - Anında uygulansın

4. Slider component:
   - 0-100 arası
   - Thumb draggable
   - Anında ses ayarı

5. Language dropdown:
   - TR, EN seçenekleri
   - Seçim yapınca tüm UI güncellensin

6. İlerlemeyi Sıfırla:
   - Onay dialogu:
     "Tüm ilerleme silinecek. Emin misiniz?"
     [İptal] [Sıfırla]
   - Sıfırlama: GameStateManager.resetGame()

7. Geri butonu:
   - Sol üst köşe
   - MainMenuScene'e dön

8. Değişiklikler:
   - Anında GameStateManager.updateSettings()
   - Anında uygulansın (theme değişimi, ses, etc.)

Tam implementasyon ver. Modern UI, smooth animasyonlar.
```

---

## ADIM 21: AchievementScene

```
Başarı rozetleri ekranı.

src/scenes/AchievementScene.ts:

1. Panel kullan (başlık: "Başarı Rozetleri")

2. Scrollable liste:
   - Phaser ScrollablePanel veya custom scroll
   - AchievementCard componentleri

3. Achievement Card:
   ```
   ┌─────────────────────────┐
   │ 🏆  İlk Adım           │
   │  İlk seviyeyi tamamla  │
   │  ●●●○○ 3/5            │
   │  +5 ⭐ (ödül)          │
   └─────────────────────────┘
   ```

4. Kilitsiz achievement:
   - Renkli (accent color)
   - Parlama efekti
   - Unlock tarihi göster

5. Kilitli achievement:
   - Gri tonlar
   - Kilit ikonu
   - Progress bar
   - "Henüz kazanılmadı"

6. Filtreleme (opsiyonel):
   - Hepsi
   - Kilitsiz
   - Kilitli

7. İstatistikler (üst kısım):
   - Toplam achievement: X/10
   - Kazanılan bonus: Y yıldız

8. Animasyonlar:
   - Liste açılış: cascade fade in
   - Progress bar: animated fill

Tam implementasyon ver.
```

---

## ADIM 22: UI Components - AchievementCard

```
Tek bir achievement için card component.

src/components/UI/AchievementCard.ts:

1. Phaser.GameObjects.Container extend et

2. Constructor:
   - scene
   - x, y
   - achievement: Achievement
   - width: number

3. Layout:
   ```
   [Icon] Title
          Description
          ProgressBar (current/target)
          +X ⭐ (if reward)
   ```

4. Locked state:
   - Grayscale
   - 🔒 icon overlay
   - "Henüz kazanılmadı"

5. Unlocked state:
   - Colorful
   - ✓ checkmark
   - Unlock date
   - Glow effect

6. Progress bar:
   - Fill animation
   - Color: gradient (incomplete), gold (complete)

7. Metodlar:
   - updateProgress(progress: number): void
   - unlock(): void (animation)

8. Unlock animasyonu:
   - Flash effect
   - Scale pulse
   - Confetti
   - Sound effect

Tam implementasyon ver.
```

---

## ADIM 23: CategorySelectionScene

```
Kategori seçim ekranı.

src/scenes/CategorySelectionScene.ts:

1. Header:
   - "← Kategoriler" (geri butonu ile)
   - Toplam yıldız göstergesi

2. Scrollable grid:
   - CategoryCard componentleri
   - 1 sütun (mobil için)
   - Padding ve spacing

3. CategoryCard için detaylar sonraki adımda

4. Kategori tıklama:
   - Kilit