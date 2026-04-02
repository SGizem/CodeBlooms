const express = require('express')
const mongoose = require('mongoose')

const authMiddleware = require('../middleware/authMiddleware')
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const Product = require('../models/Product')

const router = express.Router()

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { address, recipient, items: bodyItems, giftNote } = req.body || {}

    if (!address || !recipient) {
      return res.status(400).json({ message: 'Adres ve alıcı bilgileri zorunludur' })
    }

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: 'Sepetiniz boş' })
    }

    const requestedItems = Array.isArray(bodyItems) && bodyItems.length > 0 ? bodyItems : cart.items

    const normalized = requestedItems.map((i) => ({
      productId: i.productId || i.product || i._id,
      quantity: Number(i.quantity || 1),
    }))

    for (const it of normalized) {
      if (!it.productId) {
        return res.status(400).json({ message: 'Ürün bilgisi eksik' })
      }
      if (!mongoose.Types.ObjectId.isValid(it.productId)) {
        return res.status(400).json({ message: 'Geçersiz ürün kimliği' })
      }
      if (Number.isNaN(it.quantity) || it.quantity < 1) {
        return res.status(400).json({ message: 'Adet en az 1 olmalıdır' })
      }
    }

    const orderItems = []
    let total = 0

    for (const it of normalized) {
      const product = await Product.findById(it.productId).select('name price imageUrl stock')
      if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı' })
      }
      if (typeof product.stock === 'number' && product.stock < it.quantity) {
        return res.status(400).json({ message: 'Stok yetersiz' })
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: it.quantity,
      })

      total += (product.price || 0) * it.quantity
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      address,
      recipient,
      giftNote: giftNote || '',
      status: 'preparing',
    })

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] })

    return res.status(201).json({ order, message: 'Siparişiniz oluşturuldu' })
  } catch (err) {
    return res.status(500).json({ message: 'Sipariş oluşturulurken hata oluştu' })
  }
})

router.delete('/:orderId/cancel', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Geçersiz sipariş kimliği' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' })
    }

    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' })
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Kargoya verilen sipariş iptal edilemez' })
    }

    const updated = await Order.findByIdAndUpdate(orderId, { status: 'cancelled' }, { new: true })
    return res.status(200).json({ message: 'Sipariş iptal edildi', order: updated })
  } catch (err) {
    return res.status(500).json({ message: 'Sipariş iptal edilirken hata oluştu' })
  }
})

module.exports = router
