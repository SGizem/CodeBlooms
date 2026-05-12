# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

**REST API Adresi:** `http://localhost:5000/api` *(Canlı ortamda CodeBlooms sunucu URL'si kullanılacaktır)*

Bu dokümanda, CodeBlooms mobil uygulamasının REST API ile iletişimini sağlayan backend entegrasyon görevleri listelenmektedir. Her grup üyesi, kendisine atanan API endpoint'lerinin mobil uygulamadan çağrılması ve yönetilmesinden sorumludur.

---

## Grup Üyelerinin Mobil Backend Görevleri

1. [Sedef Gizem Orulluoğlu'nun Mobil Backend Görevleri](./Sedef-Gizem-Orulluoglu/Sedef-Gizem-Orulluoglu-Mobil-Backend-Gorevleri.md)
2. [Eda Gögebakan'ın Mobil Backend Görevleri](./Eda-Gogebakan/Eda-Gogebakan-Mobil-Backend-Gorevleri.md)

---

## Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması
* **Base URL:** `/api` (Çevre değişkenleri ile yönetilir, örn: `.env` dosyası).
* **Timeout:** Request timeout 30 saniye, connect timeout 10 saniye.
* **Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer {token}` (Korunan endpoint'lerde Axios Interceptor ile otomatik eklenir).

### 2. Authentication Yönetimi
* JWT token'ları cihazın güvenli hafızasında (Secure Store) saklama.
* Token refresh mekanizması implementasyonu.
* Otomatik token yenileme (401 durumunda).
* Logout durumunda token temizleme ve local state sıfırlama.

### 3. Error Handling
* Network hataları (timeout, connection error) yönetimi.
* HTTP status kodlarına göre uygun mesajlar gösterme (400, 401, 403, 404, 500).
* Retry mekanizması (network hatalarında tekrar deneme).
* Offline durum yönetimi (İnternet bağlantısı koptuğunda kullanıcıya uyarı verme).

### 4. Caching Stratejisi
* GET istekleri için response caching (Özellikle ürün listesi için Redis entegrasyonuna uygun frontend davranışı).
* Cache invalidation (PUT/DELETE/POST sonrası ilgili verilerin güncellenmesi).
* Offline-first yaklaşımı (mümkün olduğunda eski verilerin gösterilmesi).

### 5. Loading States
* Request başlangıcında UI'da loading indicator gösterilmesi.
* Başarılı/başarısız durum bildirimleri.
* Optimistic updates (Özellikle sepete ekleme ve profil güncelleme gibi işlemlerde kullanıcı deneyimini artırmak için API yanıtı beklemeden UI güncellemesi).

### 6. Logging ve Debugging
* API request/response logging (Development modunda React Native Debugger veya Flipper ile ağ takibi).
* Error logging ve crash reporting.
* Network interceptor kullanımı (Axios kullanılarak tüm giden ve gelen isteklerin merkezi kontrolü).