const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ── 1. ORTAM DEĞİŞKENİ KONTROLÜ (Gizem'in Sıkı Güvenliği) ──
if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
  console.error('\x1b[41m\x1b[37m\x1b[1m');
  console.error(' KRİTİK HATA: .env dosyasında MONGO_URI bulunamadı! ');
  console.error(' Lütfen backend/.env dosyasını oluşturun ve MONGO_URI değerini ekleyin. ');
  console.error('\x1b[0m');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// ── 2. VERİTABANI BAĞLANTISI ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Bağlantısı Başarılı'))
  .catch((err) => console.error('❌ MongoDB Bağlantı Hatası:', err));

// ── 3. EDA'NIN ROTALARI (Madde 3 - Sepet, Sipariş Oluşturma/İptal, Hediye Notu) ──
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderManageRoutes'));
app.use('/api/orders', require('./routes/giftNoteRoutes'));

// ── 4. GİZEM'İN ROTALARI (Madde 3 - Kullanıcı, Ürün, Yorum, Sipariş Listeleme/Güncelleme) ──
// DÜZELTME 1: userRoutes.js yerine klasördeki gerçek isim olan authRoutes.js kullanıldı.
app.use('/api/users', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
// DÜZELTME 2: Gizem'in sipariş işlemleri için orderRoutes.js dosyası eklendi.
app.use('/api/orders', require('./routes/orderRoutes'));

// ── 5. TEST ROTASI ──
app.get('/', (req, res) => {
  res.send('🚀 CodeBlooms API Sunucusu Kusursuz Çalışıyor!');
});

// ── 6. HATA YÖNETİMİ (Bulunamayan Endpointler İçin) ──
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// ── 7. SUNUCU BAŞLATMA ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ***************************************
  🚀 Sunucu ${PORT} Portunda Başarıyla Başlatıldı
  📅 Tarih: ${new Date().toLocaleString('tr-TR')}
  ***************************************
  `);
});