# Sedef Gizem Orulluoğlu'nun Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek]

## 1. Merkezi API İstemcisinin Kurulumu (ortak api.js)
**Görev:** Tüm mobil uygulamanın backend ile haberleşmesini sağlayacak merkezi HTTP istemcisinin yapılandırılması.
* **Teknik Detaylar:**
  * `axios` kütüphanesi kullanılarak base URL ve global ayarların tanımlandığı `api.js` dosyasının oluşturulması.
  * Request/Response Interceptor'ların (araya giriciler) yazılarak JWT token yönetiminin ve hata yakalama süreçlerinin merkezi hale getirilmesi.

## 2. Auth (Kimlik Doğrulama) API Bağlantıları
**API Endpoint:** `POST /api/auth/login` & `POST /api/auth/register`
**Görev:** Auth ekranlarından gelen verilerin CodeBlooms backend'ine iletilmesi.
* **İşlevler:**
  * Kullanıcı kimlik doğrulama verilerinin API'ye gönderilmesi.
  * Dönen token'ın Async/Secure Storage'a kaydedilerek uygulamanın Global State'ine (oturum durumuna) aktarılması.

## 3. Ürün (Urun) API Bağlantıları
**API Endpoint:** `GET /api/products`
**Görev:** Veritabanındaki güncel ürün kataloğunun ana sayfaya çekilmesi.
* **İşlevler:**
  * Endpoint üzerinden JSON verisinin çekilip UI listesine bağlanması.
  * Gerekli error handling (Ağ hatası vb.) durumlarının yönetilmesi.