# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [https://codeblooms.vercel.app](https://codeblooms.vercel.app)

Bu dokümanda, CodeBlooms web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan sayfaların tasarımı, API entegrasyonu ve kullanıcı etkileşimlerinden sorumludur.

## Grup Üyelerinin Web Frontend Görevleri

Aşağıdaki bağlantılara tıklayarak her üyenin detaylı frontend görevlerine ve test videolarına ulaşabilirsiniz:

1. [Sedef Gizem Orulluoğlu'nun Web Frontend Görevleri](./Sedef-Gizem-Orulluoglu/WebFrontEnd.md)
2. [Eda Göğebakan'ın Web Frontend Görevleri](./Eda-Gogebakan/WebFrontEnd.md)

---

## Genel Web Frontend Prensipleri

**1. Responsive Tasarım**
* **Mobile-First Approach:** Tasarımlar Tailwind CSS kullanılarak önce mobil, sonra desktop (md, lg breakpointleri) cihazlara tam uyumlu olacak şekilde geliştirilmiştir.
* **Flexible Layouts:** Sayfa yapılarında modern CSS Grid ve Flexbox mimarisi kullanılmıştır.

**2. Tasarım Sistemi ve Kütüphaneler**
* **CSS Framework:** Hızlı ve tutarlı stil yazımı için `Tailwind CSS` tercih edilmiştir.
* **Renk Paleti & Tipografi:** Marka kimliğine uygun özel bordo ve krem renkleri yapılandırılmış; Google Fonts (Jost ve Playfair Display) kullanılmıştır.
* **Iconography:** Kullanıcı deneyimini artırmak için `lucide-react` ikon kütüphanesi entegre edilmiştir.

**3. State Management (Durum Yönetimi)**
* **Global State:** Uygulama genelindeki sepet (Cart), sipariş (Orders) ve ürün (Products) verileri `React Context API` ile merkezi olarak yönetilmektedir.
* **Local State:** Komponent bazlı anlık durumlar `useState` ve `useMemo` Hook'ları ile kontrol edilmektedir.

**4. Routing ve Navigasyon**
* **Client-Side Routing:** Sayfalar arası hızlı ve yenilemesiz geçişler için `React Router DOM` kullanılmıştır.
* **Dynamic Routing:** Ürün detayları ve sipariş detayları gibi sayfalar URL parametreleri (`/:id`) ile dinamik olarak oluşturulmuştur.

**5. API Entegrasyonu**
* **HTTP Client:** Backend ile iletişim kurmak için `Axios` kütüphanesi yapılandırılmış (`api.js`), gerekli noktalarda yetkilendirme (Bearer Token) istek başlıklarına eklenmiştir.

**6. Build ve Deployment**
* **Build Tool:** Hızlı geliştirme ortamı ve optimize edilmiş canlı sürüm için `Vite` kullanılmıştır.
* **Hosting:** Uygulama, CI/CD süreçleri otomatikleştirilerek doğrudan GitHub üzerinden `Vercel` platformunda canlıya alınmıştır.