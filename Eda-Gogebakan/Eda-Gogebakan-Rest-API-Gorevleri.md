# CodeBlooms - REST API Görevleri (Eda Göğebakan)

**Yayınlanan REST API Domain Adresi:** [Domain Linki Buraya Gelecek]
**Test Kanıt Videosu (YouTube):** [Video Linki Buraya Gelecek]

## Gerçekleştirilen API Metotları ve Yollar

1. **Sepete Ürün Ekleme:** `POST /api/cart/add`
2. **Sepetten Ürün Silme:** `DELETE /api/cart/items/{itemId}`
3. **Sepet Güncelleme:** `PUT /api/cart/items/{itemId}`
4. **Sepet Listeleme:** `GET /api/cart`
5. **Sipariş Oluşturma:** `POST /api/orders`
6. **Sipariş İptali:** `DELETE /api/orders/{orderId}/cancel`
7. **Hediye Notu Ekleme:** `POST /api/orders/{orderId}/notes`
8. **Hediye Notu Silme:** `DELETE /api/orders/{orderId}/notes/{noteId}`