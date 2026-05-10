const mongoose = require('mongoose')
const Order    = require('../models/Order')
const Cart     = require('../models/Cart')
const Product  = require('../models/Product')
const GiftNote = require('../models/GiftNote')
const amqp     = require('amqplib')

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcı: siparişi items.product + notes (GiftNote) populate ederek getirir
// ─────────────────────────────────────────────────────────────────────────────
const populatedOrder = (query) =>
  query
    .populate('items.product')
    .populate('notes')          // notes → GiftNote belgeleri (note, addedAt, order)

// ─────────────────────────────────────────────
// POST /api/orders
// Body: { address, recipient, items?, giftNote? }
// ─────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    console.log('📡 [RADAR] POST /api/orders isteği ulaştı!');
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

    // 1) Siparişi oluştur
    const order = await Order.create({
      user:     req.user.id,
      items:    orderItems,
      total,
      address,
      recipient,
      giftNote: giftNote || '',
      status:   'preparing',
    })

    // 2) Checkout'tan hediye notu geldiyse → GiftNote koleksiyonuna kaydet
    //    ve siparişin notes dizisine referans olarak ekle
    if (giftNote && giftNote.trim()) {
      const newNote = new GiftNote({
        order: order._id,
        note:  giftNote.trim(),
      })
      await newNote.save()
      order.notes.push(newNote._id)
      await order.save()
    }

    // 3) Sepeti temizle
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] })

    // 4) Populate ederek dön (frontend tam veriyi bekliyor)
    const populated = await populatedOrder(Order.findById(order._id))

    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672');
      const channel = await connection.createChannel();
      const queue = 'order_processing';
      await channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(populated)));
      console.log('🐰 ŞOV: Sipariş alındı! Fatura işlemi için order_processing kuyruğuna eklendi.');
      setTimeout(() => connection.close(), 500);
    } catch (mqErr) {
      console.error('RabbitMQ Error:', mqErr);
    }

    return res.status(201).json({ order: populated, message: 'Siparişiniz oluşturuldu.' })
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
    if (status    !== undefined) {
      const allowedStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled']
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Geçersiz sipariş durumu.' })
      }
      order.status = status
    }

    // ── HEDİYE NOTU GÜNCELLEMESİ (Tüm Koleksiyonlarla Senkronize) ──
    if (giftNote !== undefined) {
      order.giftNote = giftNote.trim() // Eski string alanı güncelle
      
      if (giftNote.trim()) {
        // Not doluysa: Varsa güncelle, yoksa yeni oluştur
        const existingNote = await GiftNote.findOne({ order: orderId })
        if (existingNote) {
          existingNote.note = giftNote.trim()
          await existingNote.save()
        } else {
          const newNote = new GiftNote({ order: orderId, note: giftNote.trim() })
          await newNote.save()
          if (!order.notes.includes(newNote._id)) {
            order.notes.push(newNote._id)
          }
        }
      } else {
        // Not boşsa: Bu siparişe ait tüm GiftNote belgelerini sil ve diziyi temizle
        await GiftNote.deleteMany({ order: orderId })
        order.notes = []
      }
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

    // .populate('notes') → GiftNote belgelerini tam olarak getirir
    // .populate('items.product') → ürün detaylarını getirir
    // NOT: .lean() KULLANILMAZ — virtual 'giftNotes' alanının çalışması için
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .populate('notes')
      .sort({ createdAt: -1 })

    return res.status(200).json({ orders })
  } catch (err) {
    console.error('Sipariş listeleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.', error: err.message })
  }
}

// ─────────────────────────────────────────────
// POST /api/orders/:orderId/notes
// Body: { note } veya { message }
//
// İki tabloya aynı anda yazar:
//   1) GiftNote koleksiyonuna yeni belge oluşturur
//   2) Order.notes dizisine GiftNote._id referansını ekler
// ─────────────────────────────────────────────
const addNote = async (req, res) => {
  try {
    const { orderId } = req.params
    // Frontend 'note' key'i, internal endpoint 'message' key'i gönderebilir
    const { note, message } = req.body || {}
    const noteText = (note || message || '').trim()

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Geçersiz sipariş kimliği.' })
    }

    if (!noteText) {
      return res.status(400).json({ message: 'Not mesajı boş olamaz.' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı.' })
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' })
    }

    // 1) Upsert Mantığı (Varsa güncelle, yoksa oluştur)
    const existingNote = await GiftNote.findOne({ order: orderId })
    
    let savedNote
    if (existingNote) {
      existingNote.note = noteText
      savedNote = await existingNote.save()
    } else {
      savedNote = new GiftNote({ order: orderId, note: noteText })
      await savedNote.save()
      
      // Siparişin notes dizisine referans ekle
      order.notes.push(savedNote._id)
      await order.save()
    }

    return res.status(201).json({
      message: 'Not güncellendi/eklendi.',
      note: savedNote,
      order,
    })
  } catch (err) {
    console.error('Not ekleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.', error: err.message })
  }
}

// ─────────────────────────────────────────────
// DELETE /api/orders/:orderId/notes/:noteId
//
// İki tablodan aynı anda siler:
//   1) GiftNote koleksiyonundan belgeyi kalıcı olarak siler
//   2) Order.notes dizisinden noteId referansını çıkarır
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

    // Notun bu siparişe ait olduğunu doğrula
    const noteExistsInOrder = order.notes.some((n) => n.toString() === noteId)
    if (!noteExistsInOrder) {
      // GiftNote'ta var ama sipariş referansı yoksa yine de sil (tutarsızlık onarımı)
      await GiftNote.findByIdAndDelete(noteId)
      return res.status(404).json({ message: 'Not bu siparişte bulunamadı.' })
    }

    // 1) GiftNote koleksiyonundan kalıcı olarak sil
    await GiftNote.findByIdAndDelete(noteId)

    // 2) Order.notes dizisinden referansı çıkar
    order.notes = order.notes.filter((n) => n.toString() !== noteId)
    await order.save()

    return res.status(200).json({ message: 'Not silindi.', order })
  } catch (err) {
    console.error('Not silme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.', error: err.message })
  }
}

module.exports = { createOrder, cancelOrder, updateOrder, getOrders, addNote, deleteNote }
