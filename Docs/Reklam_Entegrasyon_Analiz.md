Gerçek Reklam Entegrasyonu Analizi (AdMob)
Bu doküman, uygulamaya gerçek reklamların (AdMob) nasıl ekleneceğine dair teknik gereksinimleri ve adımları kapsar.

🛠️ Teknik Gereksinimler
Uygulama Capacitor tabanlı olduğu için en stabil ve güncel çözüm @capacitor-community/admob eklentisini kullanmaktır.

1. Gerekli Eklentiler
npm install @capacitor-community/admob
npx cap sync
2. Hesap Gereksinimleri
AdMob Hesabı: Reklam birimlerini (Unit IDs) oluşturmak için.
Google Play Console / App Store Connect: Uygulamanın yayınlanmış olması (veya taslak aşamasında olması) reklam onayı için gereklidir.
app-ads.txt: Web sitenizde yayınlanması gereken doğrulama dosyası.
📋 Entegrasyon Adımları
Adım 1: Platform Spesifik Yapılandırma
Android (AndroidManifest.xml):

<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="[ADMOB_APP_ID]"/>
iOS (Info.plist):

<key>GADApplicationIdentifier</key>
<string>[ADMOB_APP_ID]</string>
Adım 2: AdService.ts Güncellemesi
AdService.ts
 dosyasında placeholder kodlar gerçek eklenti çağrıları ile değiştirilmelidir:

import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
// Özet Uygulama:
private async initializeAdMob() {
    await AdMob.initialize({
        requestTrackingAuthorization: true, // iOS 14+ için önemli
    });
}
public async showBanner() {
    const options = {
        adId: '[BANNER_UNIT_ID]',
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0
    };
    await AdMob.showBanner(options);
}
⚠️ Kritik Hususlar
1. Kullanıcı Onayı (GDPR/UMP)
Avrupa Birliği ve bazı bölgeler için kullanıcıdan veri işleme onayı alınması zorunludur.

Google'ın User Messaging Platform (UMP) SDK'sı kullanılmalıdır.
Eklenti bunu AdMob.requestConsentInfo() ve AdMob.showConsentForm() ile destekler.
2. Test ID'leri
Geliştirme sırasında asla gerçek reklam ID'leri kullanılmamalıdır. Google'ın sağladığı test ID'leri (örneğin: ca-app-pub-3940256099942544/6300978111) kullanılmalıdır. Gerçek ID kullanımı hesabın banlanmasına yol açabilir.

3. Reklam Türleri Seçimi
Banner: Alt kısımda sabit.
Interstitial: Bölüm geçişlerinde (Kategori seçimi veya oyun bitişi).
Rewarded: Kullanıcıya ekstra "yıldız" veya özel kategori açma şansı vermek için.
🚀 Uygulama Planı (Öneri)
Hazırlık: AdMob panelinden App ID ve Reklam Birim ID'lerini oluşturun.
SDK Kurulumu: Eklentiyi projeye ekleyin ve sync yapın.
Test Implementasyonu: Test ID'leri ile 
AdService
'i güncelleyin.
Onay Formu: GDPR uyumu için UMP formunu ekleyin.
Canlıya Geçiş: Yayınlanmadan hemen önce test ID'lerini gerçek ID'ler ile değiştirin.