const express        = require('express')
const Order          = require('../models/Order')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// GET /api/orders/:userId — kullanıcının kendi siparişleri
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params

    // Sadece kendi siparişlerine erişebilir
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu siparişlere erişim yetkiniz yok.' })
    }

    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 })

    return res.status(200).json({ orders })
  } catch (err) {
    console.error('Sipariş listeleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

// PUT /api/orders/:orderId — sipariş güncelleme
router.put('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params
    const { address, recipient, giftNote } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı.' })
    }

    // Sadece kendi siparişini güncelleyebilir
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu siparişi güncelleme yetkiniz yok.' })
    }

    // Kargo verildiyse güncellenemez
    const lockedStatuses = ['shipped', 'delivered', 'cancelled']
    if (lockedStatuses.includes(order.status)) {
      return res.status(400).json({ message: 'Bu sipariş artık güncellenemez.' })
    }

    if (address   !== undefined) order.address   = address
    if (recipient !== undefined) order.recipient = recipient
    if (giftNote  !== undefined) order.giftNote  = giftNote

    await order.save()

    return res.status(200).json({ order })
  } catch (err) {
    console.error('Sipariş güncelleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

module.exports = router
