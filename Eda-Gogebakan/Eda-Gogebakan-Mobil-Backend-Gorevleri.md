# Eda Gögebakan'ın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek]

## 1. Hediye Notu (GiftNote) Çift-Koleksiyon Senkronizasyonu
**Görev:** Siparişlerdeki hediye notlarının veritabanındaki koleksiyonlarla kusursuz eşleşmesini sağlayan karmaşık backend mantığının çözülmesi.
* **Teknik Detaylar:**
  * Duplicate GiftNote (Çiftlenen Hediye Notu) bug'ının giderilmesi.
  * POST endpoint'lerine `Upsert` (Update/Insert) mantığının entegre edilmesi.
  * Hediye notu string verisinin ana `GiftNote` koleksiyonu ile `%100 Sync` (tam senkronize) hale getirilmesi.

## 2. Sipariş (Order) API Bağlantıları ve Güncellemeleri
**API Endpoint:** `POST /api/orders` & `GET /api/orders`
**Görev:** Sepetteki verilerin siparişe dönüştürülmesi ve mevcut siparişlerin senkronizasyonu.
* **İşlevler:**
  * `updateOrder` servisinin `GiftNote` koleksiyonu ile eşzamanlı çalışacak şekilde onarılması.
  * Mobil arayüzden gelen sipariş oluşturma isteklerinin auth token'ı ile doğrulanıp backend'e yazılması.

## 3. Sepet ve Ürün Detay API Bağlantıları
**API Endpoint:** `GET /api/products/:id` & `POST /api/cart`
**Görev:** Detay sayfası ve sepet dinamiklerinin backend'e bağlanması.
* **İşlevler:**
  * Ürün ID'sine göre spesifik data fetch edilmesi.
  * Sepete eklenen verilerin kullanıcı oturumuyla eşleştirilerek backend sepet modeline POST edilmesi.