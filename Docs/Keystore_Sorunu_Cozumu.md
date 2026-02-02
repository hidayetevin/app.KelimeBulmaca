# Keystore Uyumsuzluğu Sorunu - Çözüm Rehberi

## 🚨 Sorun

**Play Console Hatası:**
```
Android App Bundle yanlış anahtarla imzalanmış.

Beklenen SHA1: 44:49:E5:32:A1:2F:B1:F7:6C:81:01:97:0F:8F:72:D0:66:73:23:99
Kullanılan SHA1: 23:79:BF:8C:04:23:5B:53:71:7D:80:48:6B:70:CC:8C:54:19:D6:79
```

**Anlam:** İlk sürümü başka bir keystore ile yayınladınız. Şimdi farklı bir keystore kullanıyorsunuz.

---

## 🔍 Durum Analizi

**Mevcut Keystore:**
- Dosya: `android/app/upload-keystore.jks`
- Oluşturulma: 29.01.2026
- SHA1: `23:79:BF:8C:...` (YENİ)

**Orijinal Keystore:**
- SHA1: `44:49:E5:32:...` (ESKİ - Play Console'da kayıtlı)
- Dosya: **KAYIP veya BAŞKA BİR YER**

---

## ✅ ÇÖZÜM YOLLARI

### **YÖNTEM 1: Eski Keystore'u Bul** ⭐ (EN İYİSİ)

Eski keystore'u bulup onu kullanmalısınız.

#### **Adım 1: Eski Keystore'u Ara**

**Olası Yerler:**

1. **Önceki Proje Klasörü:**
   ```
   D:\PROJECTS\kelime-ustasi\android\app\
   D:\PROJECTS\app.KelimeBulmaca.old\android\app\
   C:\Users\[kullanıcı]\Documents\Android\
   ```

2. **Android Studio Default Yeri:**
   ```
   C:\Users\[kullanıcı]\.android\
   ```

3. **Yedek Klasörleri:**
   ```
   OneDrive, Dropbox, Google Drive
   Masaüstü, İndirilenler
   ```

4. **Arama Komutu (PowerShell):**
   ```powershell
   Get-ChildItem -Path C:\ -Recurse -Include *.jks,*.keystore -ErrorAction SilentlyContinue | Where-Object {$_.Name -like "*kelime*" -or $_.Name -like "*upload*"}
   ```

#### **Adım 2: Keystore'un SHA1'ini Kontrol Et**

Bulduğunuz her keystore için:

```powershell
# Java/JDK yüklüyse
keytool -list -v -keystore "KEYSTORE_PATH.jks" -storepass ŞIFRE

# Android Studio ile
# 1. Android Studio → Build → Generate Signed Bundle
# 2. Keystore seç → "Show fingerprints"
```

**DOĞRU KEYSTORE:**
```
SHA1: 44:49:E5:32:A1:2F:B1:F7:6C:81:01:97:0F:8F:72:D0:66:73:23:99
```

#### **Adım 3: Doğru Keystore ile Build**

Bulduğunuzda:

1. `android/app/build.gradle` güncelleyin:
   ```gradle
   signingConfigs {
       release {
           storeFile file("../../../ESKİ_KEYSTORE.jks")  // Yolu güncelleyin
           storePassword "ESKİ_ŞİFRE"
           keyAlias "ESKİ_ALIAS"
           keyPassword "ESKİ_ŞİFRE"
       }
   }
   ```

2. Yeniden build edin:
   ```powershell
   cd android
   ./gradlew clean
   ./gradlew bundleRelease
   ```

---

### **YÖNTEM 2: Play Console'da Keystore Güncelle** ⚠️ (RISKLI)

**DİKKAT:** Bu genellikle MÜMKÜN DEĞİL! Play Console normalde keystore değişimine izin vermez.

**Tek İstisna:**
- Eğer uygulamanız **Internal Test** veya **Closed Beta** aşamasındaysa
- Ve henüz **Production** yayınlamadıysanız

#### **Kontrol:**

Play Console'da:
```
Setup → App signing
→ "App signing key certificate" bölümüne bakın
→ SHA1 burada görünecek
```

**Eğer "Upload key certificate" bölümü varsa:**
- Yeni keystore'un parmak izini ekleyebilirsiniz
- Ama bu nadiren çalışır

---

### **YÖNTEM 3: Yeni Uygulama Olarak Yayınla** 💀 (SON ÇARE)

**UYARI:** Tüm kullanıcıları, yorumları, puanları kaybedersiniz!

Sadece şu durumlarda düşünün:
- ✅ Eski keystore kesinlikle bulunamıyor
- ✅ Uygulama henüz çok az kullanıcıya ulaştı
- ✅ Production'a henüz girmedi

**Adımlar:**
1. Play Console'da YENİ bir uygulama oluşturun
2. Farklı bir paket adı kullanın:
   ```
   Eski: com.kelime.ustasi
   Yeni: com.kelimeustasi.puzzle
   ```
3. `capacitor.config.ts` + `AndroidManifest.xml` güncelleyin
4. Yeni keystore ile build edin

---

## 🔧 ŞİMDİ NE YAPMALI?

### **İLK ADIM: Sistem Çapında Arama**

```powershell
# PowerShell'i YÖNETİCİ olarak açın
Get-ChildItem -Path C:\ -Recurse -Include *.jks,*.keystore -ErrorAction SilentlyContinue | 
    Select-Object FullName, LastWriteTime, Length | 
    Format-Table -AutoSize
```

**Çıkan her dosya için:**
1. Tarihine bakın (uygulamayı ilk yayınladığınız tarihten önce mi?)
2. Boyutuna bakın (2-4 KB arası normal)
3. İsmini kontrol edin (kelime, upload, release, vb.)

---

### **İKİNCİ ADIM: Play Console Geçmişi**

1. Play Console → **Setup** → **App signing**
2. **"App signing key certificate"** altındaki SHA1'i not edin
3. **"Upload key certificate"** varsa, SHA1'leri karşılaştırın

**Olasılıklar:**
- Eğer Play Console'da **2 farklı SHA1** görüyorsanız:
  - Biri App Signing Key (Google'ın kullandığı)
  - Biri Upload Key (sizin gönderdiğiniz)
  - **Upload Key'i güncelleyebilirsiniz!**

---

### **ÜÇÜNCÜ ADIM: Android Studio Geçmişi**

Android Studio'da:

1. **File → Project Structure → Modules → Signing Configs**
2. Geçmiş build'lerde kullanılan keystore'ları görün
3. **Build → Generate Signed Bundle** → **Create new...** yanındaki dropdown
   - Geçmişte kullandığınız keystore'lar listede çıkabilir

---

## 📝 Hangi Keystore'u Kullandığınızı Öğrenme

### **Yöntem 1: APK'dan SHA1 Çıkarma**

Eğer eski bir APK/AAB dosyanız varsa:

```bash
# APK için
unzip -p your-app.apk META-INF/CERT.RSA | keytool -printcert

# AAB için (Android Studio'da)
# 1. Build → Analyze APK
# 2. app-release.aab dosyasını seçin
# 3. Certificate bilgisini görün
```

### **Yöntem 2: Eski Release Notlarınıza Bakın**

- E-postalarınızı arayın: "keystore", "jks", "imza"
- Slack/Discord mesajlarına bakın
- GitHub/GitLab commitlerini inceleyin (keystore commit'lenmemeli ama path commit'lenmiş olabilir)

---

## 🚨 ACİL ÇÖZÜM: Geçici Çözüm Desteği Talebi

Google Play, **nadir durumlarda** keystore değişikliğine izin verebilir.

### **Support Ticket Açın:**

1. Play Console → **Help & Feedback** (? ikonu)
2. **Contact us** → **App signing**
3. Şu mesajı gönderin:

```
Subject: Lost upload keystore for "Kelime Ustası" (com.kelime.ustasi)

Dear Google Play Support,

I am unable to upload an update for my app "Kelime Ustasi" because I have 
lost access to the original upload keystore.

App ID: com.kelime.ustasi
Expected SHA1: 44:49:E5:32:A1:2F:B1:F7:6C:81:01:97:0F:8F:72:D0:66:73:23:99
New KeyStore SHA1: 23:79:BF:8C:04:23:5B:53:71:7D:80:48:6B:70:CC:8C:54:19:D6:79

I request assistance in resetting the upload key certificate or guidance 
on how to proceed.

Thank you.
```

**NOT:** Bu genellikle 1-2 hafta sürer ve onaylanma garanti değildir.

---

## 📊 Karar Ağacı

```
Eski keystore'u bulabildim mi?
│
├─ EVET → KULLAN! (Yöntem 1)
│   └─ Build yap → Yükle → SORUN ÇÖZÜLDÜ ✅
│
└─ HAYIR → Play Console'da App Signing var mı?
    │
    ├─ EVET, Upload Key değiştirilebilir
    │   └─ Yeni keystore ekle → Yükle → SORUN ÇÖZÜLDÜ ✅
    │
    └─ HAYIR, Upload Key sabit
        │
        ├─ Uygulama çok yeni mi? (< 100 kullanıcı)
        │   └─ EVET → Yeni paket adıyla yeniden yayınla (Yöntem 3)
        │
        └─ Uygulama yerleşik mi? (> 100 kullanıcı)
            └─ Google Support'a ticket aç
```

---

## ⚠️ ÖNEMLİ UYARILAR

1. **ASLA keystore'u GitHub'a push etmeyin!**
2. **MUTLAKA yedekleyin:**
   ```
   - Cloud storage (Google Drive, encrypted)
   - USB disk
   - Password manager vault
   ```
3. **Keystore şifresini kaydedin!**

---

## 💡 ÖNERİLER

### **Hemen Yapın:**

1. **Bilgisayarınızı tamamen tarayın** (yukarıdaki PowerShell komutu)
2. **Yedek disklerinizi kontrol edin**
3. **Play Console'daki App Signing bölümüne bakın**

### **Gelecek İçin:**

```bash
# Keystore'u şifreli yedekleyin
# 1. Cloud'a yükleyin (Google Drive, encrypted ZIP)
# 2. USB'ye kopyalayın
# 3. Password manager'a kaydedin (şifreyle birlikte)
```

---

## 📞 Acil Durum İletişim

Eğer:
- ✅ Hiçbir yerde eski keystore yok
- ✅ Play Console'da değişiklik yapamıyorsunuz
- ✅ Uygulama Production'da

**Seçenekler:**
1. Google Support ticket (1-2 hafta)
2. Yeni uygulama olarak yeniden başlat (son çare)

---

**SON NOT:** Şimdi bilgisayarınızı tamamen tarayın. Keystore'lar genellikle beklenmedik yerlerde bulunur!
