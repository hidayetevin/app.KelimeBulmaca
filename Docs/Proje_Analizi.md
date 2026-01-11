# Kelime Bulmaca Oyunu - Detaylı Proje Dokümanı

## 📋 İçindekiler
1. [Proje Özeti](#proje-özeti)
2. [Oyun Adı Önerileri](#oyun-adı-önerileri)
3. [Teknik Stack](#teknik-stack)
4. [Oyun Mekaniği](#oyun-mekaniği)
5. [Mimari Yapı](#mimari-yapı)
6. [Veri Yapıları](#veri-yapıları)
7. [Ekranlar ve Akış](#ekranlar-ve-akış)
8. [Özellik Detayları](#özellik-detayları)
9. [UI/UX Tasarım Sistemi](#uiux-tasarım-sistemi)
10. [Reklam Stratejisi](#reklam-stratejisi)
11. [Optimizasyon](#optimizasyon)
12. [Geliştirme Planı](#geliştirme-planı)

---

## 1. Proje Özeti

### 🎯 Proje Amacı
Play Store'da yayınlanacak, reklam geliri odaklı, mobil kelime bulmaca oyunu geliştirmek.

### 🎮 Oyun Türü
Kelime bulmaca (Word Connect / Word Search tarzı)

### 📱 Platform
- **Ana Platform:** Android (Google Play Store)
- **Gelecek:** iOS (opsiyonel)

### 💰 Monetizasyon
AdMob reklamları (Banner + Interstitial + Rewarded)

### 🌍 Dil Desteği
- **İlk Sürüm:** Türkçe
- **Gelecek:** İngilizce ve diğer diller (altyapı hazır olacak)

### 📊 İlk Sürüm Kapsamı
- 3 kategori
- Her kategoride 5 seviye
- Toplam 15 seviye
- ~90 kelime içeriği

---

## 2. Oyun Adı Önerileri

### Türkçe İsim Önerileri
1. **Kelime Ustası** ⭐ (Önerilen)
   - Basit, akılda kalıcı
   - SEO dostu
   - Türk kullanıcılar için net

2. **Harf Avcısı**
   - Dinamik
   - Oyun mekaniğini anlatıyor

3. **Kelime Bağla**
   - Oyunun temel mekaniğini vurguluyor

4. **Kelime Macerası**
   - Daha geniş kitle

5. **Kelime Yıldızı**
   - Yıldız sistemi ile bağlantılı

### İngilizce İsim Önerileri
1. **Word Master** ⭐ (Önerilen)
   - Evrensel
   - Kolay telaffuz

2. **Letter Hunter**
3. **Word Connect Pro**
4. **Word Quest**
5. **Word Star**

### Paket Adı Önerisi
```
com.wordmaster.puzzle
```

### App Store Kimliği
```
Bundle ID (iOS): com.wordmaster.puzzle
Package Name (Android): com.wordmaster.puzzle
```

---

## 3. Teknik Stack

### 3.1 Ana Teknolojiler

#### Frontend Framework
```
Phaser.js v3.80+
- Canvas-based rendering
- Built-in tween system
- Scene management
- Asset loader
- Input handling
- Audio management
```

#### Programlama Dili
```
TypeScript 5.0+
- Strict mode enabled
- Strong typing
- Interface/Type definitions
- ES2022+ features
- Path aliases (@/)
```

#### Build Tool
```
Vite 5.0+
- Lightning fast HMR
- Optimized production builds
- Code splitting
- Asset optimization
- Development server
```

#### Mobile Framework
```
Capacitor 5.0+
- Native Android bridge
- Plugin system
- Native API access
- WebView wrapper
```

#### Kod Kalitesi
```
ESLint + Prettier
- TypeScript linting
- Code formatting
- Import sorting
- Complexity checks
```

### 3.2 Bağımlılıklar

```json
{
  "dependencies": {
    "phaser": "^3.80.1",
    "typescript": "^5.3.3",
    "@capacitor/core": "^5.5.0",
    "@capacitor/android": "^5.5.0",
    "@capacitor/haptics": "^5.0.0",
    "@capacitor/preferences": "^5.0.0",
    "admob-plus-cordova": "^1.30.0"
  },
  "devDependencies": {
    "vite": "^5.0.8",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "vitest": "^1.1.0"
  }
}
```

### 3.3 Sistem Gereksinimleri

#### Geliştirme Ortamı
- Node.js 18+
- npm 9+ veya yarn 1.22+
- Android Studio (Android SDK)
- Java JDK 17+

#### Hedef Cihazlar
- Android 7.0+ (API 24+)
- Minimum RAM: 2GB
- Screen size: 4.5" - 6.7"
- Orientasyon: Portrait (dikey)

---

## 4. Oyun Mekaniği

### 4.1 Temel Oynanış

#### Kelime Oluşturma
```
1. Kullanıcı alt taraftaki harf dairelerine dokunur
2. Parmağını kaldırmadan diğer harflere sürükler
3. Harfler seçildikçe görsel feedback verilir
4. Parmak kaldırıldığında kelime kontrol edilir
5. Doğruysa bulmacada işaretlenir, yanlışsa seçim temizlenir
```

#### Seviye Tamamlama
```
- Bulmacadaki TÜM kelimeler bulunmalı
- Her doğru kelime = 1 yıldız
- Seviye bitince otomatik ilerleme
- Seviye 5 bitince kategori tamamlanır
```

#### Kategori Sistemi
```
İlk Durum:
- Kategori 1: AÇIK
- Kategori 2: AÇIK  
- Kategori 3: KİTLİ (20 yıldız gerekli)

Kilit Açma:
- Kategori 1 veya 2'den toplam 20 yıldız topla
- Kategori 3 otomatik açılır
```

### 4.2 Seviye Yapısı

| Seviye | Kelime Sayısı | Harf Sayısı | Grid Boyutu | Maksimum Yıldız |
|--------|---------------|-------------|-------------|-----------------|
| 1      | 4             | 4           | 3x3         | 4               |
| 2      | 5             | 5           | 3x4         | 5               |
| 3      | 6             | 6           | 4x4         | 6               |
| 4      | 7             | 7           | 4x5         | 7               |
| 5      | 8             | 8           | 5x5         | 8               |

**Toplam yıldız/kategori:** 30 yıldız

### 4.3 Kelime Yerleştirme Kuralları

```typescript
// Kelimeler bulmacada bu şekillerde yerleştirilebilir:
enum Direction {
  HORIZONTAL = 'horizontal',        // →
  VERTICAL = 'vertical',            // ↓
  DIAGONAL_DOWN = 'diagonal_down',  // ↘
  DIAGONAL_UP = 'diagonal_up'       // ↗
}

// Kurallar:
// 1. Kelimeler çakışabilir (ortak harfler)
// 2. Kelimeler grid sınırlarını geçemez
// 3. Her harf sadece bir kez kullanılabilir (aynı kelimede)
// 4. Alt taraftaki harf listesi benzersiz olmalı
```

### 4.4 İpucu Sistemi

#### İpucu Tetikleyici
```
3 yanlış kelime denemesinden sonra kullanıcıya sor:
"İpucu almak ister misiniz?"
- 5 yıldız harca
- Reklam izle (ücretsiz)
```

#### İpucu Türleri
```
1. İlk İpucu: İlk harfi göster
   Örnek: "K___" (KEDI için)

2. İkinci İpucu: İkinci harfi de göster
   Örnek: "KE__" (KEDI için)

3. Üçüncü İpucu: Üçüncü harfi de göster
   Örnek: "KED_" (KEDI için)

Her ipucu için yeniden seçim yapılır:
- 5 yıldız harca
- Reklam izle
```

#### İpucu Görsel Feedback
```
- İpucu alınan harf bulmacada parlak sarı renkte gösterilir
- Alt taraftaki harf dairesi de vurgulanır
- Hafif titreşim feedback
```

### 4.5 Günlük Ödül Sistemi

```typescript
const dailyRewards = [
  { day: 1, stars: 5 },
  { day: 2, stars: 7 },
  { day: 3, stars: 10 },
  { day: 4, stars: 12 },
  { day: 5, stars: 15 },
  { day: 6, stars: 20 },
  { day: 7, stars: 30 }  // Haftalık bonus
];

// Kurallar:
// - Her gün ilk girişte popup gösterilir
// - Streak koptu mu? 1. günden başla
// - Yıldızlar otomatik hesaba eklenir
```

### 4.6 Başarı Rozetleri Sistemi

```typescript
const achievements = [
  // BEGINNER (Başlangıç)
  {
    id: 'first_step',
    name: { tr: 'İlk Adım', en: 'First Step' },
    description: { tr: 'İlk seviyeyi tamamla', en: 'Complete first level' },
    icon: '🏆',
    category: 'BEGINNER',
    target: 1,
    reward: 5  // bonus stars
  },
  {
    id: 'word_finder',
    name: { tr: 'Kelime Avcısı', en: 'Word Hunter' },
    description: { tr: '10 kelime bul', en: 'Find 10 words' },
    icon: '🔍',
    category: 'BEGINNER',
    target: 10
  },
  
  // STARS (Yıldız Toplama)
  {
    id: 'star_collector_50',
    name: { tr: 'Yıldız Toplayıcı', en: 'Star Collector' },
    description: { tr: '50 yıldız topla', en: 'Collect 50 stars' },
    icon: '💫',
    category: 'STARS',
    target: 50,
    reward: 10
  },
  {
    id: 'star_collector_100',
    name: { tr: 'Yıldız Dehası', en: 'Star Genius' },
    description: { tr: '100 yıldız topla', en: 'Collect 100 stars' },
    icon: '🌟',
    category: 'STARS',
    target: 100,
    reward: 20
  },
  
  // COMPLETION (Tamamlama)
  {
    id: 'perfect_memory',
    name: { tr: 'Mükemmel Hafıza', en: 'Perfect Memory' },
    description: { tr: 'Bir seviyeyi ilk denemede tamamla', en: 'Complete level first try' },
    icon: '⭐',
    category: 'COMPLETION',
    target: 1
  },
  {
    id: 'category_master',
    name: { tr: 'Kategori Ustası', en: 'Category Master' },
    description: { tr: 'Bir kategorinin tüm seviyelerini tamamla', en: 'Complete all category levels' },
    icon: '🎯',
    category: 'COMPLETION',
    target: 1,
    reward: 15
  },
  {
    id: 'all_categories',
    name: { tr: 'Efsane Oyuncu', en: 'Legend' },
    description: { tr: 'Tüm kategorileri tamamla', en: 'Complete all categories' },
    icon: '👑',
    category: 'COMPLETION',
    target: 3,
    reward: 50
  },
  
  // SPEED (Hız)
  {
    id: 'speed_demon',
    name: { tr: 'Hızlı Eller', en: 'Speed Demon' },
    description: { tr: 'Bir kelimeyi 5 saniyede bul', en: 'Find word in 5 seconds' },
    icon: '⚡',
    category: 'SPEED',
    target: 1
  },
  
  // STREAK (Süreklilik)
  {
    id: 'three_day_streak',
    name: { tr: 'Sadık Oyuncu', en: 'Loyal Player' },
    description: { tr: '3 gün üst üste oyna', en: 'Play 3 days in row' },
    icon: '🔥',
    category: 'STREAK',
    target: 3,
    reward: 10
  },
  {
    id: 'week_streak',
    name: { tr: 'Haftalık Şampiyon', en: 'Weekly Champion' },
    description: { tr: '7 gün üst üste oyna', en: 'Play 7 days in row' },
    icon: '🏅',
    category: 'STREAK',
    target: 7,
    reward: 25
  }
];
```

---

## 5. Mimari Yapı

### 5.1 Proje Klasör Yapısı

```
word-master/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── backgrounds/
│   │   │   │   ├── animals_bg.webp
│   │   │   │   ├── fruits_bg.webp
│   │   │   │   └── cities_bg.webp
│   │   │   ├── ui/
│   │   │   │   ├── button_light.png
│   │   │   │   ├── button_dark.png
│   │   │   │   ├── panel_light.png
│   │   │   │   ├── panel_dark.png
│   │   │   │   ├── star_filled.png
│   │   │   │   ├── star_empty.png
│   │   │   │   └── lock_icon.png
│   │   │   └── icons/
│   │   │       ├── settings.png
│   │   │       ├── achievement.png
│   │   │       ├── hint.png
│   │   │       └── close.png
│   │   ├── audio/
│   │   │   └── sfx/
│   │   │       ├── letter_select.mp3
│   │   │       ├── letter_deselect.mp3
│   │   │       ├── word_correct.mp3
│   │   │       ├── word_wrong.mp3
│   │   │       ├── level_complete.mp3
│   │   │       ├── category_complete.mp3
│   │   │       ├── achievement_unlock.mp3
│   │   │       ├── star_collect.mp3
│   │   │       ├── unlock.mp3
│   │   │       ├── button_click.mp3
│   │   │       └── hint_show.mp3
│   │   └── fonts/
│   │       └── Poppins-Regular.woff2
│   └── locales/
│       ├── tr.json
│       └── en.json
├── src/
│   ├── main.ts
│   ├── config.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── GameTypes.ts
│   │   ├── CategoryTypes.ts
│   │   └── AchievementTypes.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloaderScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── CategorySelectionScene.ts
│   │   ├── GameScene.ts
│   │   ├── LevelCompleteScene.ts
│   │   ├── CategoryCompleteScene.ts
│   │   ├── AchievementScene.ts
│   │   ├── SettingsScene.ts
│   │   └── DailyRewardScene.ts
│   ├── components/
│   │   ├── Grid/
│   │   │   ├── GridManager.ts
│   │   │   ├── GridCell.ts
│   │   │   └── WordPlacer.ts
│   │   ├── Letters/
│   │   │   ├── LetterCircle.ts
│   │   │   └── LetterContainer.ts
│   │   ├── Input/
│   │   │   ├── SwipeGestureDetector.ts
│   │   │   └── TouchVisualizer.ts
│   │   ├── UI/
│   │   │   ├── Button.ts
│   │   │   ├── Panel.ts
│   │   │   ├── ProgressBar.ts
│   │   │   ├── StarDisplay.ts
│   │   │   ├── CategoryCard.ts
│   │   │   ├── AchievementCard.ts
│   │   │   ├── HintButton.ts
│   │   │   └── DailyRewardCard.ts
│   │   └── Effects/
│   │       ├── ParticleEffect.ts
│   │       ├── ConfettiEffect.ts
│   │       ├── UnlockAnimation.ts
│   │       └── StarAnimation.ts
│   ├── managers/
│   │   ├── GameStateManager.ts
│   │   ├── StorageManager.ts
│   │   ├── AdManager.ts
│   │   ├── AudioManager.ts
│   │   ├── HapticManager.ts
│   │   ├── LocalizationManager.ts
│   │   ├── AchievementManager.ts
│   │   └── AnalyticsManager.ts
│   ├── data/
│   │   ├── categories/
│   │   │   ├── animals.json
│   │   │   ├── fruits.json
│   │   │   └── cities.json
│   │   ├── achievements.json
│   │   ├── dailyRewards.json
│   │   └── wordGenerator.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── colors.ts
│   │   ├── animations.ts
│   │   └── gridAlgorithm.ts
│   └── plugins/
│       └── AdMobPlugin.ts
├── android/
│   └── app/
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml
│               └── res/
├── capacitor.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

### 5.2 Scene Flow (Ekran Akışı)

```
[BootScene]
    ↓ (Asset yükleme)
[PreloaderScene]
    ↓ (İlk girişte günlük ödül kontrolü)
[DailyRewardScene] ← (opsiyonel)
    ↓
[MainMenuScene]
    ├─→ [AchievementScene]
    ├─→ [SettingsScene]
    └─→ [CategorySelectionScene]
            ↓ (Kategori seç)
        [GameScene]
            ↓ (Seviye tamamla)
        [LevelCompleteScene]
            ├─→ [GameScene] (Sonraki seviye)
            └─→ [CategoryCompleteScene] (Seviye 5 bitti)
                    ↓
                [CategorySelectionScene]
```

---

## 6. Veri Yapıları

### 6.1 GameState (Ana Oyun Durumu)

```typescript
interface GameState {
  version: string;                    // "1.0.0"
  user: UserData;
  categories: CategoryData[];
  achievements: Achievement[];
  settings: GameSettings;
  dailyReward: DailyRewardData;
}

interface UserData {
  userId: string;                     // UUID
  totalStars: number;
  totalWordsFound: number;
  gamesPlayed: number;
  lastPlayedDate: string;             // ISO 8601
  streakDays: number;
  totalPlayTime: number;              // seconds
  wrongAttempts: number;              // Toplam yanlış deneme
  hintsUsed: number;                  // Kullanılan ipucu sayısı
  adsWatched: number;                 // İzlenen reklam sayısı
}

interface CategoryData {
  id: string;                         // "animals", "fruits", "cities"
  name: LocalizedString;
  icon: string;                       // Emoji veya icon path
  backgroundImage: string;            // Asset path
  isLocked: boolean;
  requiredStars: number;
  levels: LevelData[];
  totalStars: number;                 // 30 (5 level * 6 avg words)
  earnedStars: number;
}

interface LevelData {
  levelNumber: number;                // 1-5
  isCompleted: boolean;
  foundWords: string[];
  totalWords: number;
  earnedStars: number;
  maxStars: number;
  bestTime: number | null;            // seconds
  playCount: number;
  wrongAttempts: number;              // Bu seviyedeki yanlış denemeler
  hintsUsed: number;                  // Bu seviyede kullanılan ipuçları
  firstTryComplete: boolean;          // Achievement için
}

interface Achievement {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  isUnlocked: boolean;
  unlockedDate: string | null;       // ISO 8601
  progress: number;                   // Mevcut ilerleme
  target: number;                     // Hedef
  category: AchievementCategory;
  reward: number;                     // Bonus yıldız
}

enum AchievementCategory {
  BEGINNER = 'beginner',
  STARS = 'stars',
  SPEED = 'speed',
  COMPLETION = 'completion',
  STREAK = 'streak'
}

interface GameSettings {
  language: 'tr' | 'en';
  darkMode: boolean;
  soundEnabled: boolean;
  soundVolume: number;                // 0.0 - 1.0
  vibrationEnabled: boolean;
  showHints: boolean;                 // Tutorial hints
}

interface DailyRewardData {
  lastClaimedDate: string | null;     // ISO 8601
  currentStreak: number;              // 1-7
  totalClaimed: number;
}

interface LocalizedString {
  tr: string;
  en: string;
}
```

### 6.2 Level Configuration (Seviye Yapılandırması)

```typescript
interface LevelConfiguration {
  categoryId: string;
  levelNumber: number;
  gridSize: GridSize;
  words: WordDefinition[];
  letters: string[];                  // Unique letters for bottom circles
  difficulty: number;                 // 1-5
}

interface GridSize {
  rows: number;
  cols: number;
}

interface WordDefinition {
  text: string;                       // Kelime (uppercase)
  direction: Direction;
  startPos: Position;
  endPos: Position;
  isFound: boolean;
  hintLettersShown: number;           // Kaç harf ipucu verildi
}

enum Direction {
  HORIZONTAL = 'horizontal',          // →
  VERTICAL = 'vertical',              // ↓
  DIAGONAL_DOWN = 'diagonal_down',    // ↘
  DIAGONAL_UP = 'diagonal_up'         // ↗
}

interface Position {
  row: number;
  col: number;
}

interface GridCell {
  letter: string;
  row: number;
  col: number;
  isRevealed: boolean;                // Kelime bulundu mu
  isHinted: boolean;                  // İpucu olarak gösterildi mi
  wordIds: string[];                  // Bu hücreyi kullanan kelimeler
}
```

### 6.3 Kategori Veri Örneği

```json
// data/categories/animals.json
{
  "id": "animals",
  "name": {
    "tr": "Hayvanlar",
    "en": "Animals"
  },
  "icon": "🐾",
  "backgroundImage": "animals_bg.webp",
  "requiredStars": 0,
  "levels": [
    {
      "levelNumber": 1,
      "gridSize": { "rows": 3, "cols": 3 },
      "words": [
        {
          "text": "KEDI",
          "direction": "horizontal",
          "startPos": { "row": 0, "col": 0 },
          "endPos": { "row": 0, "col": 3 }
        },
        {
          "text": "KÖPEK",
          "direction": "vertical",
          "startPos": { "row": 0, "col": 0 },
          "endPos": { "row": 4, "col": 0 }
        },
        {
          "text": "KUŞ",
          "direction": "diagonal_down",
          "startPos": { "row": 0, "col": 0 },
          "endPos": { "row": 2, "col": 2 }
        },
        {
          "text": "BALIK",
          "direction": "horizontal",
          "startPos": { "row": 2, "col": 0 },
          "endPos": { "row": 2, "col": 4 }
        }
      ],
      "letters": ["K", "E", "D", "İ", "Ö", "P", "U", "Ş", "B", "A", "L", "I"]
    }
  ]
}
```

---

## 7. Ekranlar ve Akış

### 7.1 Boot Scene (Başlangıç)
```
Görev: Asset'leri yükle
Görünüm: Splash screen + progress bar
Süre: 2-4 saniye
Sonraki: PreloaderScene
```

### 7.2 Preloader Scene (Ön Yükleme)
```
Görev: 
- Game state'i yükle
- Günlük ödül kontrolü
- Achievement kontrolü

Sonraki:
- DailyRewardScene (günlük ödül varsa)
- MainMenuScene (yoksa)
```

### 7.3 Daily Reward Scene (Günlük Ödül)
```
Görünüm:
┌─────────────────────────┐
│   🎁 Günlük Ödülün!     │
│                         │
│   [Gün 3]               │
│   ⭐ 10 Yıldız          │
│                         │
│   Streak: 🔥🔥🔥       │
│                         │
│   [  Topla  ]          │
└─────────────────────────┘

Animasyon:
- Popup scale efekti
- Yıldız parlama
- Confetti efekti

Sonraki: MainMenuScene
```

### 7.4 Main Menu Scene (Ana Menü)
```
Görünüm:
┌─────────────────────────┐
│                         │
│    KELIME USTASI       │
│        (Logo)          │
│                         │
│   ⭐ 47 Yıldız         │
│                         │
│   [🏆 Başarılar]       │
│                         │
│   [  🎮 OYNA  ]        │
│                         │
│   [⚙️ Ayarlar]         │
│                         │
│   [Banner Ad]          │
└─────────────────────────┘

Butonlar:
- Başarılar → AchievementScene
- Oyna → CategorySelectionScene
- Ayarlar → SettingsScene
```

### 7.5 Category Selection Scene (Kategori Seçimi)
```
Görünüm:
┌─────────────────────────┐
│   ← Kategoriler         │
│                         │
│  ┌─────────────────┐   │
│  │   🐾 Hayvanlar  │   │
│  │   ⭐⭐⭐⭐⭐   │   │
│  │   Seviye 3      │   │
│  └─────────────────┘   │
│                         │
│  ┌─────────────────┐   │
│  │   🍎 Meyveler   │   │
│  │   ⭐⭐⭐