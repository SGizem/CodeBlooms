const express    = require('express')
const dotenv     = require('dotenv')
const cors       = require('cors')
const morgan     = require('morgan')
const connectDB  = require('./config/db')

dotenv.config()

// ── 1. ORTAM DEĞİŞKENİ KONTROLÜ ──────────────────────────────
if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
  console.error('KRİTİK HATA: .env dosyasında MONGO_URI bulunamadı!')
  console.error('Lütfen backend/.env dosyasını oluşturun ve MONGO_URI değerini ekleyin.')
  process.exit(1)
}

// ── 2. VERİTABANI BAĞLANTISI ─────────────────────────────────
connectDB()

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())

// ── GELİŞMİŞ LOGLAMA (MORGAN) ────────────────────────────────
morgan.token('zaman', () => new Date().toLocaleString('tr-TR'))
// Renkli log formatı: [ZAMAN] -> METHOD /api/rota - IP Adresi: ::1 - Cihaz: (User-Agent)
const logFormat = '\x1b[36m[:zaman]\x1b[0m -> \x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m - IP Adresi: \x1b[35m:remote-addr\x1b[0m - Cihaz: \x1b[37m(:user-agent)\x1b[0m'
app.use(morgan(logFormat))

// ── 3. ROTALAR ───────────────────────────────────────────────
app.use('/api/users',    require('./routes/authRoutes'))       // register, login
app.use('/api/products', require('./routes/productRoutes'))    // CRUD ürünler
app.use('/api/comments', require('./routes/commentRoutes'))    // yorumlar
app.use('/api/cart',     require('./routes/cart.routes'))      // sepet  → cart.routes.js
app.use('/api/orders',   require('./routes/order.routes'))     // sipariş + notes  → order.routes.js

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
app.listen(PORT, '0.0.0.0', () => {
  console.log('Sunucu çalışıyor...')
})
