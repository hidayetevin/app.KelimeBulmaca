# Google Play Reklam Kısıtlamaları - Uyumluluk Rehberi

## 📋 Genel Bakış

Bu doküman, Google Play'deki **Families Ad Format** ve **Ad Content Rating** politikalarına uyum için yapılması gereken tüm adımları içerir.

**Kullanım Senaryoları:**
- ✅ Yeni uygulama yayınlarken
- ✅ Policy violation nedeniyle red alındığında
- ✅ Uygulama güncellemelerinde kontrol için
- ✅ AdMob entegrasyonu yaparken

---

## 🎯 Google Play Policy Gereksinimleri

### **1. Families Ad Format Requirements**

**Kural:** Reklamlar, uygulamanın içeriğinden **açıkça ayırt edilebilir** olmalıdır.

**Çözüm:**
- Banner reklamların üzerine/altına **"Reklam"** veya **"Advertisement"** etiketi ekleyin
- Etiket uygulamanın normal UI elementlerinden farklı görünmeli

**Örnek İhlal:**
```
[Banner Ad]     ← Sorun: Bu uygulamanın bir parçası mı, reklam mı belli değil
```

**Doğru Uygulama:**
```
Reklam / Advertisement  ← Etiket
[Banner Ad]
```

---

### **2. Ad Content Rating Compliance**

**Kural:** Gösterilen reklamlar, uygulamanın hedef kitle yaş grubuna uygun olmalıdır.

**Rating Seviyeleri:**
- **G** = General Audiences (Tüm yaşlar) ← Kelime oyunları için önerilen
- **PG** = Parental Guidance (Ebeveyn gözetimi)
- **T** = Teen (13+)
- **MA** = Mature Audiences (Yetişkin 17+)

**Kelime/Puzzle Oyunları için:**
```
Önerilen: G (General Audiences)
Sebep: Ailelere yönelik, eğitici içerik
```

---

## 🛠️ Teknik Uygulama Adımları

### **ADIM 1: AdMob SDK Konfigürasyonu**

**Dosya:** `src/managers/AdManager.ts`

```typescript
await this.AdMob.initialize({
    requestTrackingAuthorization: true,
    initializeForTesting: false,
    
    // ✅ Google Play Families Policy Compliance
    tagForChildDirectedTreatment: false,    // Çocuklara yönelik DEĞİL
    tagForUnderAgeOfConsent: false,          // Reşit olmayanlara yönelik DEĞİL
    maxAdContentRating: 'G'                  // Sadece Genel İzleyici reklamları
});
```

**Parametreler:**

| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| `tagForChildDirectedTreatment` | `false` | Uygulama özellikle çocuklara yönelik DEĞİL |
| `tagForUnderAgeOfConsent` | `false` | GDPR uyumluluğu (Avrupa için) |
| `maxAdContentRating` | `'G'` | En güvenli seviye - Tüm yaşlar |

**Alternatif Değerler:**
```typescript
maxAdContentRating: 'G'   // ✅ En güvenli - Önerilen
maxAdContentRating: 'PG'  // Ebeveyn rehberliği gerekli
maxAdContentRating: 'T'   // Gençler (13+)
maxAdContentRating: 'MA'  // Yetişkin - KULLANMAYIN
```

---

### **ADIM 2: AndroidManifest.xml Ayarları**

**Dosya:** `android/app/src/main/AndroidManifest.xml`

```xml
<application>
    <!-- Mevcut içerik -->
    
    <!-- AdMob App ID -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
    />
    
    <!-- ✅ EKLE: Max Ad Content Rating -->
    <meta-data
        android:name="com.google.android.gms.ads.MAX_AD_CONTENT_RATING"
        android:value="G"
    />
</application>
```

**Önemli:**
- `android:value` SDK'daki `maxAdContentRating` değeriyle AYNI olmalı
- Büyük/küçük harf duyarlı: `"G"` olmalı, `"g"` olmaz

---

### **ADIM 3: Banner Reklam Etiketi Ekleme**

**Her banner reklam gösterilen scene'de:**

**Örnek:** `src/scenes/MainMenuScene.ts`

```typescript
create() {
    // ... diğer UI elementleri
    
    // Banner reklamı göster
    AdManager.showBanner();
    
    // ✅ Reklam etiketi ekle (Google Play Policy)
    this.add.text(
        this.scale.width / 2,
        this.scale.height - 60, // Banner'ın 60px üstünde
        'Reklam / Advertisement',
        {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#999999',
            backgroundColor: '#00000022',
            padding: { x: 8, y: 3 }
        }
    )
    .setOrigin(0.5, 0.5)
    .setDepth(9999)         // En üst katman
    .setScrollFactor(0);     // Sabit pozisyon
}
```

**Stil Önerileri:**
- **Renk:** Gri tonlar (`#999999`), dikkat dağıtmamalı
- **Boyut:** Küçük ama okunabilir (`10-12px`)
- **Pozisyon:** Banner'ın hemen üstünde/altında
- **Arka plan:** Hafif saydam (`#00000022`)

**Diğer Banner Konumları:**
```typescript
// Banner TOP pozisyonundaysa
y: 60  // Ekranın üst kısmında

// Banner BOTTOM pozisyonundaysa
y: this.scale.height - 60  // Ekranın alt kısmında
```

---

## 🔧 AdMob Console Ayarları

### **ADIM 4: İçerik Filtreleme Kategorileri**

**URL:** [admob.google.com](https://admob.google.com)

**Yol:**
```
AdMob Console
→ Uygulamalar (Apps)
→ [Uygulamanızı seçin]
→ Engelleme kontrolleri (Blocking controls)
```

---

#### **4A: Hassas Kategoriler (MUTLAKA ENGELLEYİN)**

**Türkçe AdMob Arayüzü:**
```
☑ Yetişkin içerik
☑ Çıkmalar (Dating)
☑ Kumar ve ilgili içerik
☑ Alkol
```

**İngilizce AdMob Arayüzü:**
```
☑ Adult & Explicit Sexual Content
☑ Dating & Personals
☑ Gambling & Betting
☑ Alcohol
```

---

#### **4B: Genel Kategoriler (ŞİDDETLE ÖNERİLEN)**

**Türkçe:**
```
☑ Siyasi içerik
☑ Tartışmalı hassas sosyal konular
☑ Şaşırtıcı içerik
☑ Trajedi ve çatışma
☑ Şiddet
```

**İngilizce:**
```
☑ Political Content
☑ Debated Sensitive Social Issues
☑ Shocking Content
☑ Tragedy and Conflict
☑ Violence & Gore
```

---

#### **4C: Ekstra Güvenlik (OPSİYONEL)**

```
☑ Tütün (Tobacco)
☑ İlaç ve Takviyeler (Drugs & Supplements)
☑ Silahlar (Weapons)
☑ Hızlı zengin olma şemaları (Get Rich Quick)
☑ Okült ve Paranormal
```

---

### **ADIM 5: Reklam İçerik Derecelendirmesi**

**Yol:**
```
AdMob Console
→ Engelleme kontrolleri
→ Reklam İçeriği Derecelendirmesi
```

**Slider Pozisyonu:**
```
G (Genel Kitleler)   PG   T   MA
[●]──────────────────────────    ← Slider EN SOLDA olmalı
```

**Kaydet** butonuna basmayı unutmayın!

---

## 📱 Play Console Kontrolleri

### **ADIM 6: İçerik Derecelendirmesi Anketi**

**URL:** [play.google.com/console](https://play.google.com/console)

**Yol:**
```
Play Console
→ [Uygulamanızı seçin]
→ Sol menü: İçerik Derecelendirmesi (Content Rating)
```

**Kritik Sorular:**

| Soru | Yanıt | Açıklama |
|------|-------|----------|
| Uygulamanız reklamlar içeriyor mu? | **EVET** | AdMob kullanıyorsunuz |
| Reklamlar yaşa uygun mu? | **EVET** | G rating kullanıyorsunuz |
| Çocuklara yönelik mi? | **HAYIR** | Families program dışındaysanız |
| Hedef kitle | **Herkes** | Kelime oyunları için |

---

## ✅ Kontrol Listesi

Yayınlamadan önce bu listeyi kontrol edin:

### **Kod Tarafı:**
- [ ] `AdManager.ts` → `maxAdContentRating: 'G'` eklendi
- [ ] `AdManager.ts` → `tagForChildDirectedTreatment: false` eklendi
- [ ] `AdManager.ts` → `tagForUnderAgeOfConsent: false` eklendi
- [ ] `AndroidManifest.xml` → `MAX_AD_CONTENT_RATING` meta-data eklendi
- [ ] Banner gösterilen her scene'de **"Reklam"** etiketi var
- [ ] Version code artırıldı (her sürümde)

### **AdMob Console:**
- [ ] Hassas kategoriler engellendi (Adult, Dating, Gambling, Alcohol)
- [ ] Genel kategoriler engellendi (Politics, Violence, Shocking)
- [ ] Reklam içerik derecelendirmesi **G** olarak ayarlandı
- [ ] Değişiklikler **KAYDEDILDI**

### **Play Console:**
- [ ] İçerik derecelendirmesi anketi dolduruldu
- [ ] "Reklamlar yaşa uygun" → EVET işaretlendi
- [ ] Hedef kitle doğru seçildi

---

## 🚨 Hata Senaryoları ve Çözümleri

### **Senaryo 1: "Families Ad Format Requirements" Hatası**

**Hata Mesajı:**
```
Your app is not compliant with Google Play Policies
Issue found: Families Ad Format Requirements
Ads are not clearly differentiated from app content
```

**Çözüm:**
1. ✅ Banner etiketlerini kontrol edin (her scene'de olmalı)
2. ✅ Etiket stilini kontrol edin (net görünmeli)
3. ✅ Etiket pozisyonunu kontrol edin (banner'a çok yakın)

**Kod Düzeltmesi:**
```typescript
// Etiket ekleyin veya daha belirgin yapın
this.add.text(x, y, 'Reklam / Advertisement', {
    fontSize: '12px',        // Biraz büyüt
    color: '#666666',        // Daha koyu
    backgroundColor: '#00000033',  // Daha belirgin arka plan
    padding: { x: 10, y: 5 }  // Daha fazla padding
});
```

---

### **Senaryo 2: "Ad Content Rating" Hatası**

**Hata Mesajı:**
```
Issue found: Ad Content
The ad content in your app is not consistent with the age rating
```

**Çözüm:**
1. ✅ AdMob Console → Hassas kategorileri kontrol edin
2. ✅ `maxAdContentRating` değerini kontrol edin
3. ✅ AndroidManifest meta-data'yı kontrol edin

**AdMob Test:**
```
Uygulamayı telefonunuzda çalıştırın
→ Gösterilen reklamları gözlemleyin
→ Uygunsuz reklam görürseniz → AdMob filtreleri yetersiz
```

---

### **Senaryo 3: "Build başarısız oluyor"**

**Hata:**
```
Execution failed for task ':app:processReleaseManifest'
```

**Çözüm:**
AndroidManifest.xml'de syntax hatası var:

```xml
<!-- YANLIŞ -->
<meta-data android:name="..." android:value="g" />  ❌ Küçük harf

<!-- DOĞRU -->
<meta-data android:name="..." android:value="G" />  ✅ Büyük harf
```

---

## 📊 Test Etme

### **Test 1: Kod Kontrolü**

```bash
# Android Studio'da
./gradlew assembleRelease

# Hata yoksa ✅
# Build successful
```

### **Test 2: Canlı Reklam Testi**

1. Uygulamayı debug modunda çalıştırın
2. Banner reklamı açın
3. Kontrol edin:
   - ✅ "Reklam" etiketi görünüyor mu?
   - ✅ Reklam içeriği uygun mu?
   - ✅ Yetişkin/kumar reklamı yok mu?

### **Test 3: AdMob Ayarları Kontrolü**

```
AdMob Console → Engelleme kontrolleri
→ Tüm kategoriler "Engellendi" durumunda mı?
→ Reklam derecelendirmesi "G" mi?
```

---

## 📝 Yeniden Gönderim Şablonu

Google'a yeniden gönderim yaparken bu mesajı kullanın:

```
Dear Google Play Review Team,

Thank you for your feedback regarding policy violations in [App Name].

We have implemented the following compliance improvements:

1. ✅ Ad Content Filtering:
   - Configured AdMob console to block adult, gambling, alcohol, and 
     inappropriate content
   - Set MAX_AD_CONTENT_RATING to "G" (General Audience) in both SDK 
     and AndroidManifest

2. ✅ Families Ad Format Compliance:
   - Added "Reklam / Advertisement" labels above all banner ads
   - Ads are now clearly differentiated from app content
   - Labels are visible, readable, and positioned appropriately

3. ✅ SDK Configuration:
   - Implemented tagForChildDirectedTreatment = false
   - Implemented tagForUnderAgeOfConsent = false
   - Enforced maxAdContentRating = 'G'

4. ✅ Play Console Settings:
   - Updated Content Rating questionnaire
   - Confirmed age-appropriate ad settings

These changes are live in version X.X.X (version code XXX).

We kindly request a re-review of our application.

Best regards,
[Your Team Name]
```

---

## 🎓 Best Practices

### **1. Proaktif Yaklaşım**

Yeni uygulama yayınlarken bu ayarları önceden yapın:
- ✅ İlk geliştirme aşamasında AdMob konfigürasyonu ekleyin
- ✅ Banner etiketlerini standart component yapın
- ✅ AdMob Console ayarlarını proje başında yapın

### **2. Düzenli Kontrol**

Her sürümde kontrol edin:
- ✅ Yeni eklenen banner'larda etiket var mı?
- ✅ AdMob kategorileri hala aktif mi?
- ✅ Version code artırıldı mı?

### **3. Dokümantasyon**

Projenizde şunu saklayın:
- ✅ AdMob uygulaması ID'leri
- ✅ Keystore bilgileri
- ✅ Son inceleme tarih ve durumları

---

## 🔗 Faydalı Linkler

- **AdMob Console:** https://admob.google.com
- **Play Console:** https://play.google.com/console
- **Google Play Policies:** https://play.google.com/about/developer-content-policy/
- **Families Policy:** https://support.google.com/googleplay/android-developer/answer/9893335
- **AdMob Help:** https://support.google.com/admob

---

## 📞 Sorun Giderme

Takıldığınız yerler:

1. **AdMob kategorileri bulamıyorum**
   → Sol menü: "Engelleme kontrolleri" veya "Blocking controls"

2. **Slider nerede?**
   → Engelleme kontrolleri → Reklam İçeriği Derecelendirmesi

3. **Build hatası alıyorum**
   → `npm run build` çıktısını kontrol edin
   → AndroidManifest.xml syntax hatalarına bakın

4. **Ayarları yaptım ama red aldım**
   → 24-48 saat bekleyin (ayarlar yayılır)
   → AdMob Console → "Hesap durumu" kontrol edin

---

## ✅ Sonuç

Bu rehberi takip ederek:
- ✅ Google Play Families Policy'ye tam uyum
- ✅ Ad Content Rating compliance
- ✅ Gelecekteki incelemeler için hazırlık
- ✅ Kullanıcı güvenliği ve yasal koruma

**Başarılar!** 🎉

---

**Son Güncelleme:** 2026-02-01  
**Geçerli Olduğu Platformlar:** Android (Google Play)  
**AdMob SDK Versiyonu:** @capacitor-community/admob@8.0.0
