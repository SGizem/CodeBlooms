const express        = require('express')
const Product        = require('../models/Product')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = express.Router()

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    const filter = {}

    if (category) {
      filter.category = category
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    const products = await Product.find(filter).sort({ createdAt: -1 })

    return res.status(200).json({ products, total: products.length })
  } catch (err) {
    console.error('Ürün listeleme hatası:', err)
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
      stock:         stock ?? 0,
      imageUrl,
      category,
    })

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
    return res.status(200).json({ message: 'Ürün başarıyla silindi.' })
  } catch (err) {
    console.error('Ürün silme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

module.exports = router
