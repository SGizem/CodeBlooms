# Sedef Gizem Orulluoğlu'nun Mobil Backend (REST API) Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek]

## 1. Ürünleri Listeleme ve Arama Servisi
**API Endpoint:** `GET /api/products`
**Görev:** Mobil uygulamanın anasayfasındaki ürün akışını, filtreleri ve arama sonuçlarını sağlayan entegrasyon.
* **İşlevler:**
  * Query parametrelerini (`?category=gul&search=kirmizi`) API'ye iletme
  * Redis Cache mekanizması üzerinden gelen milisaniyelik veriyi parse edip UI'da gösterme
  * Pagination (sayfalama) desteği ile veri setlerini parça parça çekme
* **Teknik Detaylar:**
  * HTTP Client (Axios) interceptor konfigürasyonu
  * Response caching stratejisi
  * Error handling (500 Internal Server Error, 404 Not Found)

## 2. Ürün Detay Servisi
**API Endpoint:** `GET /api/products/{id}`
**Görev:** Spesifik bir ürünün detaylarını (stok, resim dizisi, fiyat) API'den çekme.
* **İşlevler:**
  * Parametre olarak gönderilen Product ID'nin doğrulanması
  * Gelen JSON verisinin Product modeline çevrilmesi
* **Teknik Detaylar:**
  * Offline durum yönetimi (Ağa bağlanılamadığında cache'den son görüntülenen detayı gösterme)
  * Request timeout mekanizması

## 3. Sipariş Oluşturma (Checkout) Servisi
**API Endpoint:** `POST /api/orders`
**Görev:** Sepetteki ürünlerin siparişe dönüştürülmesi ve veritabanına yazılması.
* **İşlevler:**
  * Sepet verilerinin (ürün ID'leri, adetler, toplam tutar) JSON body olarak hazırlanması
  * JWT Bearer token ile kullanıcının yetkilendirilmesi
  * Sipariş başarılıysa dönen sipariş numarasının (Order ID) UI'a aktarılması
* **Teknik Detaylar:**
  * Token refresh mekanizması entegrasyonu (Yetki düşerse otomatik yenileme)
  * Optimistic updates ve rollback senaryolarının yönetimi