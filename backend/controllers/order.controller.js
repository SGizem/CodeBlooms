const mongoose = require('mongoose')
const Order    = require('../models/Order')
const Cart     = require('../models/Cart')
const Product  = require('../models/Product')

// ─────────────────────────────────────────────
// POST /api/orders
// Body: { address, recipient, items?, giftNote? }
// ─────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { address, recipient, items: bodyItems, giftNote } = req.body || {}

    if (!address || !recipient) {
      return res.status(400).json({ message: 'Adres ve alıcı bilgileri zorunludur.' })
    }

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: 'Sepetiniz boş.' })
    }

    const sourceItems =
      Array.isArray(bodyItems) && bodyItems.length > 0 ? bodyItems : cart.items

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

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] })

    return res.status(201).json({ order, message: 'Siparişiniz oluşturuldu.' })
  } catch (err) {
    console.error('Sipariş oluşturma hatası:', err)
    return res.status(500).json({ message: 'Sipariş oluşturulurken hata oluştu.', error: err.message })
  }
}

// ─────────────────────────────────────────────
// DELETE /api/orders/:orderId/cancel
// ─────────────────────────────────────────────
const cancelOrder = async (req, res) => {
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

    if (['shipped', 'delivered'].includes(order.status)) {
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
    return res.status(500).json({ message: 'Sipariş iptal edilirken hata oluştu.', error: err.message })
  }
}

// ─────────────────────────────────────────────
// PUT /api/orders/:orderId
// Body: { address?, recipient?, giftNote?, status? }
// ─────────────────────────────────────────────
const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const { address, recipient, giftNote, status } = req.body || {}

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

    const lockedStatuses = ['shipped', 'delivered', 'cancelled']
    if (lockedStatuses.includes(order.status)) {
      return res.status(400).json({ message: 'Bu sipariş artık güncellenemez.' })
    }

    if (address   !== undefined) order.address   = address
    if (recipient !== undefined) order.recipient = recipient
    if (giftNote  !== undefined) order.giftNote  = giftNote
    if (status    !== undefined) {
      const allowedStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled']
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Geçersiz sipariş durumu.' })
      }
      order.status = status
    }

    await order.save()

    return res.status(200).json({ message: 'Sipariş güncellendi.', order })
  } catch (err) {
    console.error('Sipariş güncelleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.', error: err.message })
  }
}

// ─────────────────────────────────────────────
// GET /api/orders/:userId
// ─────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const { userId } = req.params

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu siparişlere erişim yetkiniz yok.' })
    }

    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 })

    return res.status(200).json({ orders })
  } catch (err) {
    console.error('Sipariş listeleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.', error: err.message })
  }
}

// ─────────────────────────────────────────────
// POST /api/orders/:orderId/notes
// Body: { message }
// ─────────────────────────────────────────────
const addNote = async (req, res) => {
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

    return res.status(201).json({ message: 'Not eklendi.', note: addedNote, order })
  } catch (err) {
    console.error('Not ekleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.', error: err.message })
  }
}

// ─────────────────────────────────────────────
// DELETE /api/orders/:orderId/notes/:noteId
// ─────────────────────────────────────────────
const deleteNote = async (req, res) => {
  try {
    const { orderId, noteId } = req.params

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(noteId)
    ) {
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
}

module.exports = { createOrder, cancelOrder, updateOrder, getOrders, addNote, deleteNote }
