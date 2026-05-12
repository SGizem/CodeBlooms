# Eda Gögebakan'ın Mobil Backend (REST API) Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek]

## 1. Authentication (Kimlik Doğrulama) Servisi
**API Endpoint:** `POST /api/auth/login` & `POST /api/auth/register`
**Görev:** Mobil uygulamanın JWT tabanlı kimlik doğrulama sisteminin entegrasyonu.
* **İşlevler:**
  * Kullanıcı giriş bilgilerinin (credentials) API'ye güvenli aktarımı
  * Dönen Access Token ve Refresh Token'ın cihazın güvenli hafızasında (Secure Storage) saklanması
  * Hata durumlarının yakalanması (401 Unauthorized, 400 Bad Request)
* **Teknik Detaylar:**
  * Auth Context/Provider oluşturularak kullanıcı oturum durumunun tüm uygulamada dinlenmesi
  * Axios Request Interceptor ile her isteğe otomatik Bearer Token eklenmesi

## 2. Profil Güncelleme ve Fetch Servisi
**API Endpoint:** `GET /api/users/profile` & `PUT /api/users/profile`
**Görev:** Profil ekranındaki bilgilerin API'den çekilmesi ve düzenlemelerin sunucuya iletilmesi.
* **İşlevler:**
  * JWT Token ile yetkilendirilmiş GET isteği atarak kullanıcı datasını çekme
  * Güncellenen ad, soyad ve iletişim bilgilerini JSON formatında PUT etme
* **Teknik Detaylar:**
  * 403 Forbidden hatalarında kullanıcıyı Login ekranına yönlendiren Response Interceptor mantığı
  * Başarılı güncelleme sonrası uygulamanın Global State'inin (kullanıcı adının) güncellenmesi

## 3. Siparişleri Getirme Servisi
**API Endpoint:** `GET /api/orders/myorders`
**Görev:** Sadece sisteme giriş yapmış kullanıcının siparişlerini çeken servis entegrasyonu.
* **İşlevler:**
  * Kullanıcıya ait siparişlerin API'den array olarak alınıp UI listelerine dönüştürülmesi
* **Teknik Detaylar:**
  * Request timeout durumlarında "Bağlantı koptu, tekrar deneyin" retry mekanizmasının kurulması