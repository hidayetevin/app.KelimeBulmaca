# Google Play Policy Düzeltmeleri - Yapılacaklar Listesi

## ✅ Kod Tarafında Tamamlananlar (Otomatik)

### 1. AdMob SDK Ayarları (AdManager.ts)
- ✅ `tagForChildDirectedTreatment: false` eklendi
- ✅ `tagForUnderAgeOfConsent: false` eklendi
- ✅ `maxAdContentRating: 'G'` eklendi (Sadece genel izleyici reklamları)

### 2. AndroidManifest.xml
- ✅ `MAX_AD_CONTENT_RATING` meta-data eklendi (`G` seviyesi)

### 3. Version Update
- ✅ Version Code: 2 → **3**
- ✅ Version Name: 1.0.2 → **1.0.3**

### 4. Banner Reklam Etiketi
- ✅ `AdManager.addBannerLabel()` static metod eklendi
- ✅ MainMenuScene'de banner üzerine "Reklam / Advertisement" etiketi eklendi

---

## 📋 SİZİN YAPMANIZ GEREKENLER

### 1️⃣ AdMob Console Ayarları (ÇOK ÖNEMLİ!)

**Adım 1:** [AdMob Console](https://admob.google.com)'a giriş yapın

**Adım 2:** "Kelime Ustası" uygulamanızı seçin

**Adım 3:** "Uygulamalar" → "Uygulama Ayarları" → "Reklam İçerik Filtreleme"

**Adım 4:** Şu kategorileri **ENGELLE** (Checkbox işaretleyin):

```
☑ Yetişkin içerik (Adult Content)
☑ Dating (Flört/Tanışma uygulamaları)
☑ Kumar ve Şans Oyunları (Gambling)
☑ Alkol (Alcohol)
☑ Politik içerik (Politics)
☑ Hassas sosyal konular (Social Issues)
☑ Şiddet içerikli oyunlar (Violent Games)
☑ Tıbbi/Sağlık reklamları (Health - opsiyonel)
```

**Adım 5:** Değişiklikleri **KAYDET**

> **Not:** Bu adım ZORUNLUDUR! Kod değişiklikleri tek başına yeterli değildir.

---

### 2️⃣ Play Console İçerik Derecelendirmesi Kontrolü

**Adım 1:** [Play Console](https://play.google.com/console)'a giriş yapın

**Adım 2:** "Kelime Ustası" uygulamanızı seçin

**Adım 3:** Sol menüden **"İçerik Derecelendirmesi"** (Content Rating) seçin

**Adım 4:** Anketi kontrol edin ve şunları garantileyin:

```
✅ "Uygulamanız reklamlar içeriyor mu?" → EVET
✅ "Reklamlar yaş uygun mu?" → EVET
✅ Hedef kitle: "Herkes" veya "E for Everyone"
❌ "Çocuklara yönelik mi?" → HAYIR (eğer Families programında değilseniz)
```

**Adım 5:** Gerekirse anketi **YENİDEN DOLDURUN** ve kaydedin

---

### 3️⃣ Yeni APK/AAB Oluşturma

**Adım 1:** Terminal/PowerShell'i açın

**Adım 2:** Proje dizinine gidin:
```powershell
cd D:\PROJECTS\app.KelimeBulmaca
```

**Adım 3:** Build komutlarını çalıştırın:
```powershell
# Web build
npm run build

# Capacitor sync
npx cap sync android

# Android Studio'yu açın
npx cap open android
```

**Adım 4:** Android Studio'da:
```
Build → Generate Signed Bundle / APK
→ Android App Bundle (.aab) seçin
→ Release keystore'u seçin (upload-keystore.jks)
→ Password: kelimeustasi123
→ BUILD butonuna tıklayın
```

**Adım 5:** Oluşan .aab dosyası:
```
android/app/release/app-release.aab
```

---

### 4️⃣ Play Console'a Yükleme

**Adım 1:** Play Console → **"Üretim"** (Production)

**Adım 2:** **"Yeni sürüm oluştur"**

**Adım 3:** .aab dosyasını yükleyin

**Adım 4:** Sürüm notları ekleyin:

**Türkçe:**
```
• Google Play politikalarına uyumluluk düzeltmeleri
• Reklam içeriği filtreleme iyileştirmeleri
• Performans optimizasyonları
```

**İngilizce:**
```
• Google Play policy compliance improvements
• Ad content filtering enhancements
• Performance optimizations
```

**Adım 5:** **"İncelemeye gönder"** butonuna tıklayın

---

### 5️⃣ Google'a Yanıt Mesajı (Opsiyonel ama Önerilen)

Play Console'da reddedilen sürümün yanında **"Yanıt ver"** butonu varsa:

**Mesaj şablonu:**
```
Dear Google Play Review Team,

Thank you for your feedback regarding policy violations in Kelime Ustası.

We have implemented the following changes to ensure full compliance:

1. ✅ Ad Content Filtering:
   - Configured AdMob console to block adult, gambling, alcohol, and inappropriate content
   - Set MAX_AD_CONTENT_RATING to "G" (General Audience)
   - Added "Advertisement" labels above all banner ads to clearly differentiate from app content

2. ✅ SDK Configuration:
   - Implemented tagForChildDirectedTreatment = false
   - Implemented tagForUnderAgeOfConsent = false
   - Enforced maxAdContentRating = 'G'

3. ✅ Manifest Updates:
   - Added MAX_AD_CONTENT_RATING meta-data (value: G)

These changes are now live in version 1.0.3 (version code 3).

We kindly request a re-review of our application.

Best regards,
Kelime Ustası Development Team
```

---

## 🧪 Test Etme (Opsiyonel)

Yeni versiyonu yüklemeden önce test etmek isterseniz:

```powershell
# Internal test track'e yükleyin
Play Console → "Test" → "Internal Testing" → "Yeni sürüm oluştur"
```

Test kullanıcılarıyla onayladıktan sonra Production'a promote edin.

---

## ⏱️ Tahmini Süreçler

- **AdMob ayarları:** 5-10 dakika
- **Build oluşturma:** 5 dakika
- **Play Console yükleme:** 5 dakika
- **Google inceleme süresi:** 1-3 gün

---

## 📞 Sorun Yaşarsanız

Eğer herhangi bir adımda takılırsanız:

1. Build hatası alırsanız:
   ```powershell
   npm run build
   ```
   komutunun çıktısını paylaşın

2. AdMob console'da ilgili ayarları bulamazsanız ekran görüntüsü alıp sorun

3. Google'dan yeni red gelirse rejection mesajını paylaşın

---

## ✅ Checklist

Gönderim öncesi kontrol listesi:

- [ ] AdMob Console'da içerik filtreleme ayarlandı
- [ ] Play Console'da content rating kontrol edildi
- [ ] Yeni .aab dosyası oluşturuldu (version code: 3)
- [ ] Sürüm notları hazırlandı
- [ ] Play Console'a yükleme yapıldı
- [ ] "İncelemeye gönder" butonuna tıklandı

---

**SON NOT:** AdMob Console ayarları MUTLAKA yapılmalı. Kod değişiklikleri tek başına yeterli olmaz!
