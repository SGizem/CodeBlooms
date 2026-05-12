# Sedef Gizem Orulluoğlu'nun Mobil Frontend Görevleri (CodeBlooms)

**Mobile Front-end Demo Videosu:** [Link buraya eklenecek]

## 1. Ürün Listeleme ve Arama Ekranı (Anasayfa)
**API Endpoint:** `GET /api/products`
**Görev:** E-ticaret anasayfasında ürünlerin listelenmesi, kategorize edilmesi ve aranması için UI implementasyonu.
* **UI Bileşenleri:**
  * Üst kısımda dinamik arama çubuğu (Search bar)
  * Kategori filtreleme çipleri (Kırmızı Gül, Orkide, Papatya vb.)
  * Ürün kartları (Görsel, İsim, Fiyat, Sepete Ekle ikonu)
  * Sepet bildirim rozeti (Badge)
* **Kullanıcı Deneyimi (UX):**
  * Ürünler yüklenirken Skeleton Loading animasyonu
  * Sayfa aşağı kaydırıldığında Lazy Loading (Sonsuz kaydırma)
  * Arama sonuçlarında anlık filtreleme (Debounce kullanımı)
  * Ürün bulunamadığında "Sonuç Bulunamadı" empty state ekranı
* **Teknik Detaylar:**
  * Platform: React Native / Expo
  * Gelişmiş state yönetimi (Zustand veya Redux)
  * Resim optimizasyonu için önbellekli image component kullanımı (FastImage vb.)

## 2. Ürün Detay Ekranı
**API Endpoint:** `GET /api/products/{id}`
**Görev:** Seçilen çiçeğin/ürünün tüm detaylarının, görsellerinin ve stok bilgisinin gösterildiği ekran.
* **UI Bileşenleri:**
  * Tam ekran yatay kaydırılabilir görsel galerisi (Carousel)
  * Ürün başlığı, açıklaması ve dinamik fiyat alanı
  * Adet seçici (Stepper: +, - butonları)
  * Sabit (Sticky) "Sepete Ekle" butonu (Ekranın en altında)
* **Kullanıcı Deneyimi (UX):**
  * Sepete ekleme anında haptic feedback (titreşim)
  * Başarılı ekleme sonrası ekranın üstünde Toast/Snackbar bildirimi
  * Stokta olmayan ürünler için butonun gri (disabled) olması
* **Teknik Detaylar:**
  * React Navigation ile parametre (ID) taşıma ve veri çekme
  * Animasyonlu geçişler (Shared Element Transition)

## 3. Sepet ve Ödeme Öncesi Ekranı
**API Endpoint:** `GET /api/cart` & `POST /api/orders`
**Görev:** Kullanıcının sepetindeki ürünleri yönettiği ve sipariş özetini gördüğü ekran.
* **UI Bileşenleri:**
  * Sepetteki ürünlerin listesi (Swipe-to-delete ile silme özelliği)
  * Ürün adet güncelleyici ve anlık ara toplam göstergesi
  * Kargo ücreti ve Genel Toplam (Ödenecek Tutar) kartı
  * "Alışverişi Tamamla" (Checkout) butonu
* **Form Validasyonu:**
  * Minimum sepet tutarı kontrolü
  * Stok adedini aşan miktar girişinin engellenmesi
* **Kullanıcı Deneyimi (UX):**
  * Sepet boş olduğunda özel "Sepetiniz Boş, Çiçekleri Keşfedin" empty state'i
  * Tutar güncellenirken fiyat alanında kısa süreli loading state
* **Teknik Detaylar:**
  * Local state ile anlık fiyat hesaplama optimizasyonu
  * Silme işleminde kullanıcı onayı (Dialog)