1. **Kullanıcı Kaydı**
   - **API Metodu:** `POST /api/users/register`
   - **Açıklama:** Yeni müşterilerin alışveriş yapabilmek için sisteme kayıt olmasını sağlar. Ad, soyad, e-posta ve şifre gibi kişisel bilgilerin alınarak veritabanına güvenli bir şekilde kaydedilmesini içerir.

2. **Ürün Ekleme**
   - **API Metodu:** `POST /api/products`
   - **Açıklama:** Sisteme satılmak üzere yeni bir hediye veya çiçek seçeneği eklenmesini sağlar. Ürün adı, açıklaması, fiyatı, stok durumu ve görsel linki gibi verilerin girilmesini kapsar. Yalnızca yetkili kullanıcılar (admin) tarafından yapılabilir.

3. **Ürün Silme**
   - **API Metodu:** `DELETE /api/products/{productId}`
   - **Açıklama:** Sistemde kayıtlı olan ve artık satışı yapılmayacak bir ürünün veritabanından kalıcı olarak kaldırılmasını sağlar. Bu işlem için ürünün benzersiz kimliği (ID) kullanılır.

4. **Ürünleri Listeleme**
   - **API Metodu:** `GET /api/products`
   - **Açıklama:** Sistemdeki tüm ürünlerin veya belirli bir kategorideki hediyelerin müşterinin ekranında listelenmesini sağlar. Ürün kataloğunun görüntülenmesi, filtreleme ve arama işlemleri için kullanılır.

5. **Sipariş Güncelleme**
   - **API Metodu:** `PUT /api/orders/{orderId}`
   - **Açıklama:** Müşterinin aktif bir siparişine ait teslimat adresi, alıcı bilgileri veya hediye notu gibi detayları güncellemesini sağlar. Bu işlem yalnızca sipariş kargoya verilmeden önceki aşamalarda yapılabilir.

6. **Sipariş Listeleme**
   - **API Metodu:** `GET /api/orders/{userId}`
   - **Açıklama:** Müşterinin daha önceden oluşturduğu geçmiş siparişlerinin detaylarını ve aktif siparişlerinin anlık durumunu (hazırlanıyor, yolda vb.) görüntülemesini sağlar.

7. **Ürün Yorum Ekleme**
   - **API Metodu:** `POST /api/products/{productId}/comments`
   - **Açıklama:** Kullanıcının satın alıp teslim aldığı bir ürün için değerlendirme metni yazmasını ve puan vermesini (1-5 yıldız) sağlar. Yorum, doğrudan ilgili ürüne ve kullanıcının profiline bağlanır.

8. **Ürün Yorum Silme**
   - **API Metodu:** `DELETE /api/comments/{commentId}`
   - **Açıklama:** Kullanıcının daha önce bir ürüne yapmış olduğu kendi yorumunu ve değerlendirmesini yayından kaldırmasını sağlar.