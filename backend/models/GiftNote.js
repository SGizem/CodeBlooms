const mongoose = require('mongoose')

const giftNoteSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  note: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('GiftNote', giftNoteSchema)
