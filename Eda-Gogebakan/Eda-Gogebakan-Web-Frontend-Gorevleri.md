# CodeBlooms - Web Frontend Görevleri (Eda Göğebakan)

**Web Frontend Adresi:** https://code-blooms.vercel.app
**Test Kanıt Videosu (YouTube):** [(https://youtu.be/awmS0zkvpRE)]

## Arayüz (UI) ve Kullanıcı Deneyimi (UX) Görevlerim
Bu dokümanda, sorumlu olduğum REST API metotlarının React frontend arayüzüne entegrasyonu ve sayfa tasarımları listelenmektedir:

1. **Ürün Detay Sayfası (FlowerDetailPage):** Çiçeklerin detaylı gösterimi, ürün resimleri ve açıklama kısımlarının dinamik UI tasarımı.
2. **Sepet (Cart) Arayüzü:** Sepete ürün ekleme, sepetten ürün çıkarma ve miktar güncelleme (artırma/azaltma) butonlarının etkileşimli tasarımı.
3. **Sepet Listeleme:** Kullanıcının sepetindeki tüm ürünleri, toplam fiyatı ve adetleri görebileceği sepet özeti ekranının kurgulanması.
4. **Sipariş Oluşturma (Checkout):** Sepetteki ürünlerin satın alınması ve sipariş oluşturma (POST) adımlarının arayüz entegrasyonu.
5. **Sipariş İptal Arayüzü:** Kullanıcının aktif siparişini iptal edebilmesi için gerekli onay modalları (CancelConfirm) ve buton etkileşimlerinin tasarımı.
6. **Hediye Notu Yönetimi:** Sipariş sırasında veya detay sayfasında hediye notu eklenebilmesi, düzenlenebilmesi ve silinebilmesi için metin alanlarının (textarea) tasarlanması.

---

## Genel Web Frontend Prensipleri

* **Responsive Tasarım:** Tailwind CSS kullanılarak Mobile-First yaklaşımı ile geliştirildi. Tüm ekran boyutlarına (Mobile, Tablet, Desktop) tam uyumluluk sağlandı.
* **Tasarım Sistemi:** Uygulama genelinde tutarlı bir renk paleti (Bordo, Krem) ve tipografi (Jost, Playfair Display) kullanıldı. İkonlar için `lucide-react` kütüphanesi entegre edildi.
* **State Management:** Veri akışı `Context API` (CartContext vb.) ve React Hooks kullanılarak yönetildi. Sepet durumu lokal state ile senkronize edildi.
* **Routing:** Sayfalar arası geçişler ve sipariş adımları `React Router DOM` kullanılarak yapılandırıldı.
* **API Entegrasyonu:** Backend iletişimleri `Axios` kullanılarak yapıldı. Sepet ve sipariş işlemleri için anlık veri çekme (fetch) ve hata yönetimi eklendi.

