

## 🛍️ Sepet İşlemleri

### 1. Sepete Ürün Ekleme
* **API Metodu:** `POST /cart/add`
* **Açıklama:** Kullanıcının seçtiği ürünü sepetine eklemesini sağlar. Bu işlemde ürünün ID'si ve miktarı gönderilerek sepet güncellenir.

### 2. Sepetten Ürün Silme
* **API Metodu:** `DELETE /cart/items/{itemId}`
* **Açıklama:** Kullanıcı bir ürünü almaktan vazgeçtiğinde, o ürünü sepet listesinden tamamen çıkarmak için kullanılır.

### 3. Sepet Güncelleme
* **API Metodu:** `PUT /cart/items/{itemId}`
* **Açıklama:** Sepetteki mevcut ürünün adetini değiştirmek (örneğin; ürün sayısını 1'den 5'e çıkarmak) için kullanılır.

### 4. Sepet Listeleme
* **API Metodu:** `GET /cart`
* **Açıklama:** Kullanıcının sepetindeki tüm ürünleri, güncel fiyatları ve toplam sepet tutarını görüntülemesini sağlar.

---

## 📦 Sipariş Yönetimi

### 5. Sipariş Oluşturma
* **API Metodu:** `POST /orders`
* **Açıklama:** Sepetteki ürünlerin satın alma sürecini başlatır. Adres ve ödeme bilgileri onaylandıktan sonra sipariş sisteme kaydedilir.

### 6. Sipariş İptali
* **API Metodu:** `POST /orders/{orderId}/cancel`
* **Açıklama:** Henüz kargoya verilmemiş olan siparişlerin kullanıcı tarafından iptal edilmesini sağlar.

---

## 💌 Hediye Notu İşlemleri

### 7. Hediye Notu Ekleme
* **API Metodu:** `POST /orders/{orderId}/notes`
* **Açıklama:** Sipariş bir hediye ise, sevgilinize veya sevdiklerinize özel mesajlar eklemenizi sağlar. 
    * *Örnek:* "İyi ki doğdun sevgilim, nice mutlu yaşlarımıza!" veya "Yeni işin hayırlı olsun!" gibi doğum günü ve özel gün notları bu kısımdan eklenir.

### 8. Hediye Notu Silme
* **API Metodu:** `DELETE /orders/{orderId}/notes/{noteId}`
* **Açıklama:** Eklenen notta bir hata yapıldığında veya not gönderilmek istenmediğinde mesajı sistemden kaldırmak için kullanılır.
