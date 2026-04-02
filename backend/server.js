const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
require('dotenv').config()

// ── 1. ORTAM DEĞİŞKENİ KONTROLÜ ──────────────────────────────
if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
  console.error('KRİTİK HATA: .env dosyasında MONGO_URI bulunamadı!')
  console.error('Lütfen backend/.env dosyasını oluşturun ve MONGO_URI değerini ekleyin.')
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json())

// ── 2. VERİTABANI BAĞLANTISI ─────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Bağlantısı Başarılı'))
  .catch((err) => console.error('❌ MongoDB Bağlantı Hatası:', err))

// ── 3. ROTALAR ───────────────────────────────────────────────
// Her endpoint grubu tek, yetkili route dosyasına bağlı.
// Çakışmaları önlemek için her prefix yalnızca BİR dosyaya mount edildi.
app.use('/api/users',    require('./routes/authRoutes'))       // register, login
app.use('/api/products', require('./routes/productRoutes'))    // CRUD ürünler
app.use('/api/comments', require('./routes/commentRoutes'))    // yorumlar
app.use('/api/cart',     require('./routes/cartRoutes'))       // sepet
app.use('/api/orders',   require('./routes/orderRoutes'))      // sipariş + notes

// ── 4. TEST ROTASI ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🚀 CodeBlooms API Çalışıyor!')
})

// ── 5. 404 YAKALAYICI ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı.' })
})

// ── 6. SUNUCU BAŞLATMA ───────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor — ${new Date().toLocaleString('tr-TR')}`)
})