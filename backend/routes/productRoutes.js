const express = require('express')
const Product = require('../models/Product')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')
const Redis = require('ioredis')

const router = express.Router()
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// GET /api/products
router.get('/', async (req, res) => {
  console.log('📡 [RADAR] GET /api/products isteği backend\'e ulaştı!');
  try {
    const { category, search } = req.query
    const filter = {}

    if (category) {
      filter.category = category
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    const cacheKey = 'products:' + req.originalUrl;
    // Redis'ten kontrol et
    const cachedProducts = await redis.get(cacheKey)
    if (cachedProducts) {
      console.log('🚀 ŞOV: Veri Redis Cache (Önbellek) üzerinden milisaniyeler içinde getirildi!')
      return res.status(200).json(JSON.parse(cachedProducts))
    }

    const products = await Product.find(filter).sort({ createdAt: -1 })
    const responseData = { products, total: products.length }

    console.log('🗄️ Veri MongoDB\'den çekildi ve Redis Cache\'e eklendi.')
    // Redis'e kaydet (3600 saniye)
    await redis.setex(cacheKey, 3600, JSON.stringify(responseData))

    return res.status(200).json(responseData)
  } catch (err) {
    console.error('HATA OLUŞTU:', err.message);
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

// GET /api/products/:productId
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' })
    }
    return res.status(200).json({ product })
  } catch (err) {
    console.error('Ürün detay hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

// POST /api/products — sadece admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, originalPrice, stock, imageUrl, category } = req.body

    if (!name || !description || price == null || !imageUrl || !category) {
      return res.status(400).json({ message: 'Zorunlu alanlar eksik.' })
    }

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice: originalPrice ?? null,
      stock: stock ?? 0,
      imageUrl,
      category,
    })

    // 🧹 Cache Invalidation (Önbellek Temizleme)
    const keys = await redis.keys('products:*')
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log('🧹 Redis Cache Temizlendi: Yeni ürün eklendiği için products:* anahtarları silindi.')
    }

    return res.status(201).json({ product })
  } catch (err) {
    console.error('Ürün ekleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

// DELETE /api/products/:productId — sadece admin
router.delete('/:productId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId)
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' })
    }

    // 🧹 Cache Invalidation (Önbellek Temizleme)
    const keys = await redis.keys('products:*')
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log('🧹 Redis Cache Temizlendi: Ürün silindiği için products:* anahtarları silindi.')
    }

    return res.status(200).json({ message: 'Ürün başarıyla silindi.' })
  } catch (err) {
    console.error('Ürün silme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

module.exports = router