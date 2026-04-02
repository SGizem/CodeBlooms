const Order = require('../models/Order')
const mongoose = require('mongoose')

// POST /api/orders/:orderId/notes — Hediye notu ekle
// Body: { message }
exports.addNote = async (req, res) => {
  try {
    const { orderId } = req.params
    const { message } = req.body

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
  } catch (error) {
    console.error('Not ekleme hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message })
  }
}

// DELETE /api/orders/:orderId/notes/:noteId — Hediye notu sil
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

    const noteExists = order.notes.find((n) => n._id.toString() === noteId)
    if (!noteExists) {
      return res.status(404).json({ message: 'Not bulunamadı.' })
    }

    order.notes = order.notes.filter((n) => n._id.toString() !== noteId)
    await order.save()

    return res.status(200).json({ message: 'Not silindi.', order })
  } catch (error) {
    console.error('Not silme hatası:', error)
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message })
  }
}
