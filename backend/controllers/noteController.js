const Order    = require('../models/Order')
const GiftNote = require('../models/GiftNote')
const mongoose = require('mongoose')

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:orderId/notes — Hediye notu ekle
// Body: { note } veya { message }
//
// İki tabloya aynı anda yazar:
//   1) GiftNote koleksiyonuna yeni belge oluşturur
//   2) Order.notes dizisine GiftNote._id referansını ekler
// ─────────────────────────────────────────────────────────────────────────────
exports.addNote = async (req, res) => {
  try {
    const { orderId } = req.params
    // Frontend 'note' key'i, internal endpoint 'message' key'i gönderebilir
    const { note, message } = req.body
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
  } catch (error) {
    console.error('Not ekleme hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/orders/:orderId/notes/:noteId — Hediye notu sil
//
// İki tablodan aynı anda siler:
//   1) GiftNote koleksiyonundan belgeyi kalıcı olarak siler
//   2) Order.notes dizisinden noteId referansını çıkarır (hayalet referans kalmaz)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteNote = async (req, res) => {
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

    // Notun bu siparişe ait olduğunu doğrula
    const noteExistsInOrder = order.notes.some((n) => n.toString() === noteId)
    if (!noteExistsInOrder) {
      // Tutarsızlık onarımı: sipariş referansı yok ama GiftNote varsa yine de sil
      await GiftNote.findByIdAndDelete(noteId)
      return res.status(404).json({ message: 'Not bu siparişte bulunamadı.' })
    }

    // 1) GiftNote koleksiyonundan kalıcı olarak sil
    await GiftNote.findByIdAndDelete(noteId)

    // 2) Order.notes dizisinden referansı çıkar (hayalet referans önlenir)
    order.notes = order.notes.filter((n) => n.toString() !== noteId)
    await order.save()

    return res.status(200).json({ message: 'Not silindi.', order })
  } catch (error) {
    console.error('Not silme hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message })
  }
}
