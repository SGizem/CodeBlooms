const mongoose   = require('mongoose')
const Cart       = require('../models/Cart')
const Product    = require('../models/Product')
const Redis      = require('ioredis')

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379')

// ─────────────────────────────────────────────
// POST /api/cart/add
// ─────────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body || {}

    if (!productId) {
      return res.status(400).json({ message: 'Ürün seçilmedi' })
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Geçersiz ürün kimliği' })
    }

    const qty = quantity == null ? 1 : Number(quantity)
    if (Number.isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: 'Adet en az 1 olmalıdır' })
    }

    const product = await Product.findById(productId).select('name price imageUrl')
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' })
    }

    let cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] })
    }

    const existingItem = cart.items.find(
      (i) => i.product && i.product.toString() === productId
    )

    if (existingItem) {
      existingItem.quantity += qty
      existingItem.name     = product.name
      existingItem.price    = product.price
      existingItem.imageUrl = product.imageUrl
    } else {
      cart.items.push({
        product:  product._id,
        name:     product.name,
        price:    product.price,
        imageUrl: product.imageUrl,
        quantity: qty,
      })
    }

    await cart.save()
    await redis.del(`cart:${req.user.id}`)
    return res.status(201).json({ cart })
  } catch (err) {
    return res.status(500).json({ message: 'Sepete ekleme sırasında hata oluştu', error: err.message })
  }
}

// ─────────────────────────────────────────────
// DELETE /api/cart/items/:itemId
// ─────────────────────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ message: 'Sepet bulunamadı' })
    }

    const exists = cart.items.find((i) => i._id.toString() === itemId)
    if (!exists) {
      return res.status(404).json({ message: 'Ürün sepette bulunamadı' })
    }

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId)
    await cart.save()
    await redis.del(`cart:${req.user.id}`)

    return res.status(200).json({ cart, message: 'Ürün sepetten çıkarıldı' })
  } catch (err) {
    return res.status(500).json({ message: 'Ürün silinirken hata oluştu', error: err.message })
  }
}

// ─────────────────────────────────────────────
// PUT /api/cart/items/:itemId
// ─────────────────────────────────────────────
const updateCartItem = async (req, res) => {
  try {
    const { itemId }   = req.params
    const { quantity } = req.body || {}

    const qty = Number(quantity)
    if (Number.isNaN(qty)) {
      return res.status(400).json({ message: 'Geçersiz adet' })
    }
    if (qty < 1) {
      return res.status(400).json({ message: 'Adet en az 1 olmalıdır' })
    }

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ message: 'Sepet bulunamadı' })
    }

    const item = cart.items.id(itemId)
    if (!item) {
      return res.status(404).json({ message: 'Sepet öğesi bulunamadı' })
    }

    item.quantity = qty
    await cart.save()
    await redis.del(`cart:${req.user.id}`)

    return res.status(200).json({ cart })
  } catch (err) {
    return res.status(500).json({ message: 'Sepet güncellenirken hata oluştu', error: err.message })
  }
}

// ─────────────────────────────────────────────
// GET /api/cart
// ─────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    console.log('📡 [RADAR] GET /api/cart isteği ulaştı!');
    const cacheKey = `cart:${req.user.id}`;
    const cachedCart = await redis.get(cacheKey);

    if (cachedCart) {
      console.log('🚀 ŞOV: Sepet verisi Redis Cache üzerinden getirildi!');
      return res.status(200).json(JSON.parse(cachedCart));
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product')

    if (!cart) {
      const emptyCart = { cart: { items: [], total: 0 } };
      await redis.setex(cacheKey, 3600, JSON.stringify(emptyCart));
      return res.status(200).json(emptyCart)
    }

    const total = (cart.items || []).reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    )

    const cartData = { cart: { items: cart.items, total } };
    await redis.setex(cacheKey, 3600, JSON.stringify(cartData));

    return res.status(200).json(cartData)
  } catch (err) {
    return res.status(500).json({ message: 'Sepet alınırken hata oluştu', error: err.message })
  }
}

module.exports = { addToCart, removeFromCart, updateCartItem, getCart }
