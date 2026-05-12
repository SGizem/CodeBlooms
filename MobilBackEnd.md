# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

**REST API Adresi:** Canlı ortamda CodeBlooms sunucu URL'si kullanılacaktır.

Bu dokümanda, mobil uygulamanın veritabanı ve sunucu (backend) ile nasıl haberleştiği ve bu API bağlantılarının nasıl paylaşıldığı anlatılmaktadır.

---

## Grup Üyelerinin Mobil Backend Görevleri

1. [Sedef Gizem Orulluoğlu'nun Mobil Backend Görevleri](./Sedef-Gizem-Orulluoglu/Sedef-Gizem-Orulluoglu-Mobil-Backend-Gorevleri.md) *(Merkezi api.js kurulumu, Giriş/Kayıt işlemleri ve ürünlerin API'den çekilmesi)*
2. [Eda Gögebakan'ın Mobil Backend Görevleri](./Eda-Gogebakan/Eda-Gogebakan-Mobil-Backend-Gorevleri.md) *(Hediye notu hatalarının onarımı, Sipariş oluşturma ve Sepet verilerinin backend'e gönderilmesi)*

---

## Genel Mobil Backend Prensipleri

Mobil uygulamamızın sunucu ile güvenli ve hatasız haberleşmesi için aşağıdaki standartlar belirlenmiştir:

### 1. Merkezi API Yönetimi
* Uygulama içindeki tüm internet istekleri (GET, POST vb.) her sayfada ayrı ayrı yazılmak yerine tek bir merkezden (`api.js`) yönetildi.
* Bu sayede sunucu adresi değiştiğinde veya global bir ayar yapıldığında tek bir dosyadan tüm uygulamayı güncellemek mümkün hale geldi.

### 2. Güvenlik ve Oturum Yönetimi (Auth)
* Kullanıcı giriş yaptığında sunucudan gelen güvenlik anahtarı (Token), telefonun güvenli hafızasına kaydedilir.
* Kullanıcının sepete ürün ekleme veya sipariş verme gibi işlemleri yapabilmesi için, arka planda bu anahtar otomatik olarak sunucuya gönderilir ve kimliği doğrulanır.

### 3. Hata Yakalama (Error Handling)
* İnternet bağlantısının kopması veya sunucudan veri gelmemesi gibi durumlarda uygulamanın çökmesi engellendi.
* Böyle durumlarda arka planda oluşan hata yakalanıp, kullanıcının ekranına "Bağlantı hatası" gibi anlaşılır uyarılar olarak yansıtıldı.

### 4. Veri Senkronizasyonu
* Kullanıcının mobilde yaptığı işlemlerin (örneğin sepete ürün eklemek veya hediye notu yazmak) veritabanına eksiksiz işlenmesi sağlandı.
* Özellikle siparişler ve hediye notları gibi birbiriyle bağlantılı verilerde çakışma olmaması için çift yönlü senkronizasyon (Sync) kontrolleri yapıldı.