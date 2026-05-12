# CodeBlooms - Web Frontend Görevleri (Sedef Gizem Orulluoğlu)

**Web Frontend Adresi:** https://code-blooms.vercel.app
**Test Kanıt Videosu (YouTube):** [(https://youtu.be/aL6wGfkDJZk)]

## Arayüz (UI) ve Kullanıcı Deneyimi (UX) Görevlerim
Bu dokümanda, sorumlu olduğum REST API metotlarının React frontend arayüzüne entegrasyonu ve sayfa tasarımları listelenmektedir:

1. **Kayıt ve Giriş Ekranları:** Yeni kullanıcı kaydı ve mevcut kullanıcıların token bazlı girişi için yetkilendirme (Auth) formlarının UI tasarımı ve entegrasyonu.
2. **Ana Sayfa ve Ürün Listeleme:** Veritabanındaki ürünlerin (çiçeklerin) ana sayfada listelenmesi, kategorilere ayrılması ve dinamik UI tasarımı.
3. **Ürün Yönetim Arayüzü:** Sisteme yeni ürün eklenmesi ve mevcut ürünlerin silinmesi için gerekli form ve buton etkileşimleri.
4. **Siparişlerim Sayfası:** Kullanıcıya ait geçmiş ve aktif siparişlerin listelendiği genel arayüzün (OrdersPage) oluşturulması.
5. **Sipariş Güncelleme Ekranı:** Sipariş detay sayfasında adres ve teslimat bilgilerinin güncellenebilmesi için gerekli form yapısının kurgulanması.
6. **Yorumlar Arayüzü:** Ürün detay sayfalarında yıldız puanlama sistemi ile dinamik yorum ekleme ve kullanıcının kendi yorumunu silebilmesi için interaktif bileşen tasarımı.

---

## Genel Web Frontend Prensipleri

* **Responsive Tasarım:** Tailwind CSS kullanılarak Mobile-First yaklaşımı ile geliştirildi. Tüm ekran boyutlarına (Mobile, Tablet, Desktop) tam uyumluluk sağlandı.
* **Tasarım Sistemi:** Uygulama genelinde tutarlı bir renk paleti (Bordo, Krem) ve tipografi (Jost, Playfair Display) kullanıldı. İkonlar için `lucide-react` kütüphanesi entegre edildi.
* **State Management:** Veri akışı `Context API` (OrdersContext, ProductsContext vb.) ve React Hooks (useState, useMemo) kullanılarak yönetildi.
* **Routing:** Sayfalar arası geçişler ve yetki gerektiren rotalar `React Router DOM` ile sağlandı.
* **API Entegrasyonu:** Backend iletişimleri `Axios` (api instance) kullanılarak yapıldı. Yetkilendirme gerektiren işlemler için HTTP Header'larına JWT token entegrasyonu sağlandı.
