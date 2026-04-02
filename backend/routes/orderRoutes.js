const express        = require('express')
const mongoose       = require('mongoose')
const authMiddleware = require('../middleware/authMiddleware')
const Cart           = require('../models/Cart')
const Order          = require('../models/Order')
const Product        = require('../models/Product')

const router = express.Router()

// ─────────────────────────────────────────────
// POST /api/orders — Sipariş oluştur
// Body: { address, recipient, items?, giftNote? }
// ─────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { address, recipient, items: bodyItems, giftNote } = req.body || {}

    if (!address || !recipient) {
      return res.status(400).json({ message: 'Adres ve alıcı bilgileri zorunludur.' })
    }

    // Ürün listesini: body'den gelen items YOKSA sepetten al
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: 'Sepetiniz boş.' })
    }

    const sourceItems =
      Array.isArray(bodyItems) && bodyItems.length > 0 ? bodyItems : cart.items

    // Normalize: her item için productId ve quantity çıkar
    const normalized = sourceItems.map((i) => ({
      productId: i.productId || i.product || i._id,
      quantity:  Number(i.quantity || 1),
    }))

    for (const it of normalized) {
      if (!it.productId) {
        return res.status(400).json({ message: 'Ürün bilgisi eksik.' })
      }
      if (!mongoose.Types.ObjectId.isValid(it.productId)) {
        return res.status(400).json({ message: 'Geçersiz ürün kimliği.' })
      }
      if (isNaN(it.quantity) || it.quantity < 1) {
        return res.status(400).json({ message: 'Adet en az 1 olmalıdır.' })
      }
    }

    // Ürünleri veritabanından çek, stok kontrolü yap, order items oluştur
    const orderItems = []
    let total = 0

    for (const it of normalized) {
      const product = await Product.findById(it.productId).select('name price imageUrl stock')
      if (!product) {
        return res.status(404).json({ message: `Ürün bulunamadı: ${it.productId}` })
      }
      if (typeof product.stock === 'number' && product.stock < it.quantity) {
        return res.status(400).json({ message: `"${product.name}" için stok yetersiz.` })
      }
      orderItems.push({
        product:  product._id,
        name:     product.name,
        price:    product.price,
        imageUrl: product.imageUrl,
        quantity: it.quantity,
      })
      total += (product.price || 0) * it.quantity
    }

    const order = await Order.create({
      user:     req.user.id,
      items:    orderItems,
      total,
      address,
      recipient,
      giftNote: giftNote || '',
      status:   'preparing',
    })

    // Sepeti temizle
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] })

    return res.status(201).json({ order, message: 'Siparişiniz oluşturuldu.' })
  } catch (err) {
    console.error('Sipariş oluşturma hatası:', err)
    return res.status(500).json({ message: 'Sipariş oluşturulurken hata oluştu.' })
  }
})

// ─────────────────────────────────────────────
// GET /api/orders/:userId — Kullanıcının siparişleri
// ─────────────────────────────────────────────
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params

    // Sadece kendi siparişlerine erişebilir (admin hariç)
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

// ─────────────────────────────────────────────
// DELETE /api/orders/:orderId/cancel — Sipariş iptal
// ─────────────────────────────────────────────
router.delete('/:orderId/cancel', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Geçersiz sipariş kimliği.' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı.' })
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' })
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Kargoya verilen veya teslim edilen sipariş iptal edilemez.' })
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status: 'cancelled' },
      { new: true }
    )

    return res.status(200).json({ message: 'Sipariş iptal edildi.', order: updated })
  } catch (err) {
    console.error('Sipariş iptal hatası:', err)
    return res.status(500).json({ message: 'Sipariş iptal edilirken hata oluştu.' })
  }
})

// ─────────────────────────────────────────────
// PUT /api/orders/:orderId — Sipariş güncelle
// Body: { address?, recipient?, giftNote? }
// ─────────────────────────────────────────────
router.put('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params
    const { address, recipient, giftNote } = req.body || {}

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Geçersiz sipariş kimliği.' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı.' })
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu siparişi güncelleme yetkiniz yok.' })
    }

    // Kargoya verilmiş veya teslim edilmişse güncellenemez
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

// ─────────────────────────────────────────────
// POST /api/orders/:orderId/notes — Hediye notu ekle
// Body: { message }
// ─────────────────────────────────────────────
router.post('/:orderId/notes', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params
    const { message } = req.body || {}

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Geçersiz sipariş kimliği.' })
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Not mesajı boş olamaz.' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı.' })
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' })
    }

    order.notes.push({ message: message.trim() })
    await order.save()

    const addedNote = order.notes[order.notes.length - 1]

    return res.status(201).json({
      message: 'Not eklendi.',
      note:    addedNote,
      order,
    })
  } catch (err) {
    console.error('Not ekleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.', error: err.message })
  }
})

// ─────────────────────────────────────────────
// DELETE /api/orders/:orderId/notes/:noteId — Hediye notu sil
// ─────────────────────────────────────────────
router.delete('/:orderId/notes/:noteId', authMiddleware, async (req, res) => {
  try {
    const { orderId, noteId } = req.params

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Geçersiz kimlik bilgisi.' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı.' })
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' })
    }

    const noteExists = order.notes.find((n) => n._id.toString() === noteId)
    if (!noteExists) {
      return res.status(404).json({ message: 'Not bulunamadı.' })
    }

    order.notes = order.notes.filter((n) => n._id.toString() !== noteId)
    await order.save()

    return res.status(200).json({ message: 'Not silindi.', order })
  } catch (err) {
    console.error('Not silme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.', error: err.message })
  }
})

module.exports = router
