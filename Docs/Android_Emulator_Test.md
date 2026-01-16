# Android Emülatörde Test Etme Rehberi

Build başarıyla tamamlandı! ✅ Artık Android Studio'da emülatörde çalıştırabilirsiniz.

## Adım Adım Talimatlar

### 1. Android Studio'yu Aç

```bash
npx cap open android
```

> **Not:** Bu komut Android Studio'yu otomatik olarak açar ve projeyi yükler.

---

### 2. Emülatör Seç veya Oluştur

Android Studio açıldıktan sonra:

1. **Üst menüden:** `Tools` → `Device Manager` (veya araç çubuğundaki telefon ikonu)
2. **Eğer emülatör varsa:** Listeden bir emülatör seç
3. **Eğer emülatör yoksa:**
   - `Create Device` butonuna tıkla
   - `Phone` → `Pixel 5` (veya herhangi bir cihaz) seç
   - `Next` → API Level seç (önerilen: `API 33` - Android 13)
   - `Finish`

---

### 3. Emülatörü Başlat

Device Manager'da emülatör isminin yanındaki **▶️ Play** butonuna tıkla.

Emülatör açılana kadar bekle (ilk açılış 2-3 dakika sürebilir).

---

### 4. Uygulamayı Çalıştır

Emülatör açıldıktan sonra:

1. **Android Studio'da:**
   - Üst araç çubuğunda yeşil **▶️ Run** butonuna tıkla
   - Veya `Shift + F10` tuş kombinasyonu

2. **Gradle Build başlayacak:**
   - İlk build 1-2 dakika sürebilir
   - `BUILD SUCCESSFUL` mesajını göreceksiniz

3. **Uygulama emülatörde açılacak!**

---

## Beklenen Sonuç

Uygulama açıldığında:

1. **Yükleme Ekranı:** 
   - Dairesel **ProgressBar** spinner göreceksiniz
   - %0'dan %100'e animasyonlu dolacak
   - Mor renkli "KELİME USTASI" logosu

2. **Ana Menü:**
   - Yıldız sayınız
   - OYNA butonu
   - Ayarlar butonu

3. **Bir Seviye Oyna:**
   - Seviye seçiminden herhangi bir seviye aç
   - Kelimeleri bularak tamamla
   - **Seviye tamamlandığında:**
     - ✨ **Konfeti patlaması** göreceksiniz
     - Renkli parçacıklar ekranda dönecek
     - Level complete modal açılacak

---

## Hızlı Komutlar (Terminal)

Eğer Android Studio zaten açıksa, bu komutu terminalden çalıştırarak uygulamayı güncelleyebilirsiniz:

```bash
# 1. Build ve sync (zaten yaptık)
npm run build
npx cap sync android

# 2. Android Studio'da Run'a bas veya:
cd android
./gradlew installDebug

# 3. Veya doğrudan ADB ile:
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## Sorun Giderme

### Gradle Build Hatası
Eğer Gradle build hatası alırsanız:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Emülatör Yavaş
- Emülatör ayarlarından RAM'i artırın (Settings → RAM: 2048 MB)
- Hardware acceleration aktif olduğundan emin olun

### "Failed to install app" Hatası
```bash
# Eski APK'yı kaldır
adb uninstall com.wordmaster.puzzle

# Yeniden yükle
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎯 Test Checklist

Emülatörde test edecekleriniz:

- [ ] Yükleme ekranı düzgün çalışıyor mu?
- [ ] ProgressBar animasyonu akıcı mı?
- [ ] Ana menü doğru görünüyor mu?
- [ ] Seviye açılıyor mu?
- [ ] Kelime bulma mekanik çalışıyor mu?
- [ ] Seviye tamamlanınca **konfeti** patlıyor mu? ✨
- [ ] Modal animasyonları düzgün mü?
- [ ] Performance problemi var mı?

---

## İpuçları

- **Hot Reload yok:** Her değişiklikte `npm run build` ve `npx cap sync` yapmanız gerekir
- **Logları görmek için:** Android Studio'nun alt kısmındaki `Logcat` sekmesine bakın
- **APK üretmek için:** `cd android && ./gradlew assembleRelease`
