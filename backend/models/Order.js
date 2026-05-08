const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String,  required: true },
    price:    { type: Number,  required: true, min: 0 },
    imageUrl: { type: String,  default: '' },
    quantity: { type: Number,  required: true, min: 1 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    items:     { type: [orderItemSchema], default: [] },
    total:     { type: Number, required: true, min: 0 },
    address:   { type: String, required: true },
    recipient: { type: String, required: true },
    giftNote:  { type: String, default: '' },  // checkout'taki tek notlu hediye mesajı (string)
    // notes: GiftNote koleksiyonuna ObjectId referansları
    notes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'GiftNote' }],
    status: {
      type: String,
      enum: ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'],
      default: 'preparing',
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual: frontend'in beklediği 'giftNotes' alanı
// .populate('notes') sonrası notes dizisi dolu GiftNote objeleri içerir.
// Bu virtual onları { _id, note, text } formatına normalize eder.
orderSchema.virtual('giftNotes').get(function () {
  if (!this.notes || this.notes.length === 0) return []
  return this.notes.map((n) => {
    // populate yapılmışsa n bir GiftNote objesidir; yapılmamışsa ObjectId
    if (typeof n === 'object' && n !== null && !(n instanceof mongoose.Types.ObjectId)) {
      return {
        _id:       n._id,
        note:      n.note || n.message || '',
        text:      n.note || n.message || '',
        createdAt: n.createdAt || n.addedAt,
      }
    }
    // populate yapılmamış — sadece _id döner
    return { _id: n }
  })
})

module.exports = mongoose.model('Order', orderSchema)
