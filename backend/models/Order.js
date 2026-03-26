const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    address: { type: String, required: true },
    recipient: { type: String, required: true },
    giftNote: { type: String, default: '' },
    status: {
      type: String,
      enum: ['preparing', 'shipped', 'delivered', 'cancelled'],
      default: 'preparing',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
