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

// Her notun kendi _id'si var (Mongoose default)
const noteSchema = new mongoose.Schema({
  message:   { type: String, required: true },
  createdAt: { type: Date,   default: Date.now },
})

const orderSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:     { type: [orderItemSchema], default: [] },
    total:     { type: Number, required: true, min: 0 },
    address:   { type: String, required: true },
    recipient: { type: String, required: true },
    giftNote:  { type: String, default: '' },
    notes:     { type: [noteSchema], default: [] },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'],
      default: 'preparing',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
