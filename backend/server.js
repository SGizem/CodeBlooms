const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
require('dotenv').config()

// ── Ortam değişkeni doğrulaması ──────────────────────────────────────
if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
  console.error('\x1b[41m\x1b[37m\x1b[1m')
  console.error(' KRİTİK HATA: .env dosyasında MONGO_URI bulunamadı! ')
  console.error(' Lütfen backend/.env dosyasını oluşturun ve MONGO_URI değerini ekleyin. ')
  console.error('\x1b[0m')
  process.exit(1)
}

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json())

// ── MongoDB bağlantısı ───────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('\x1b[32m✓ MongoDB bağlantısı başarılı.\x1b[0m')
  })
  .catch(err => {
    console.error('\x1b[31m✗ MongoDB bağlantı hatası:\x1b[0m', err.message)
    console.error('  → MONGO_URI değerinizi ve ağ bağlantınızı kontrol edin.')
    process.exit(1)
  })

// ── Route'lar ────────────────────────────────────────────────────────
app.use('/api/users',    require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/orders',   require('./routes/orderRoutes'))
app.use('/api/comments', require('./routes/commentRoutes'))

// Yorum route'larını /api/products/:productId/comments prefix'iyle de bağla
app.use('/api', require('./routes/commentRoutes'))

// Eda'nın route'ları buraya eklenecek:
// app.use('/api/cart',   require('./routes/cartRoutes'))
// app.use('/api/orders', require('./routes/orderNoteRoutes'))

// ── Sunucu ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\x1b[36m🚀 Server çalışıyor → http://localhost:${PORT}\x1b[0m`)
})
