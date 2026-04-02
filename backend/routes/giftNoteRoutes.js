const express = require('express')
const mongoose = require('mongoose')

const authMiddleware = require('../middleware/authMiddleware')
const GiftNote = require('../models/GiftNote')
const Order = require('../models/Order')

const router = express.Router()

router.post('/:orderId/notes', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params
    const { note } = req.body || {}

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Geçersiz sipariş kimliği' })
    }

    if (!note || typeof note !== 'string' || !note.trim()) {
      return res.status(400).json({ message: 'Not boş olamaz' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' })
    }

    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' })
    }

    const giftNote = await GiftNote.create({ order: orderId, note: note.trim() })
    await Order.findByIdAndUpdate(orderId, { giftNote: note.trim() })

    return res.status(201).json({ giftNote, message: 'Hediye notu eklendi' })
  } catch (err) {
    return res.status(500).json({ message: 'Hediye notu eklenirken hata oluştu' })
  }
})

router.delete('/:orderId/notes/:noteId', authMiddleware, async (req, res) => {
  try {
    const { orderId, noteId } = req.params

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Geçersiz kimlik bilgisi' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' })
    }

    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' })
    }

    const giftNote = await GiftNote.findById(noteId)
    if (!giftNote) {
      return res.status(404).json({ message: 'Not bulunamadı' })
    }

    if (giftNote.order.toString() !== orderId.toString()) {
      return res.status(400).json({ message: 'Not bu siparişe ait değil' })
    }

    await GiftNote.findByIdAndDelete(noteId)
    await Order.findByIdAndUpdate(orderId, { giftNote: '' })

    return res.status(200).json({ message: 'Hediye notu silindi' })
  } catch (err) {
    return res.status(500).json({ message: 'Hediye notu silinirken hata oluştu' })
  }
})

module.exports = router
