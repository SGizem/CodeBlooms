require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(cors())
app.use(express.json())

const mongoUri = process.env.MONGO_URI
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      // bağlantı başarılı
    })
    .catch(() => {
      // bağlantı hatası: uygulama yine de ayağa kalksın
    })
}

// Bu satırları Sedef'in route'larının altına ekle:
app.use('/api/cart', require('./routes/cartRoutes'))
app.use('/api/orders', require('./routes/orderManageRoutes'))
app.use('/api/orders', require('./routes/giftNoteRoutes'))

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server çalışıyor: ${PORT}`)
})

