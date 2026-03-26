const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    description:   { type: String, required: true },
    price:         { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    stock:         { type: Number, required: true, default: 0 },
    imageUrl:      { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Güller', 'Orkideler', 'Papatyalar', 'Lilyumlar', 'Çikolatalar'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)
