const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name:     String,
        price:    Number,
        quantity: Number,
        imageUrl: String,
      },
    ],
    total:     { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    address:   { type: String, required: true },
    recipient: { type: String, required: true },
    giftNote:  { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
