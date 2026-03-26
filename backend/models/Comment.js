const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    userName: { type: String, required: true },
    text:     { type: String, required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Comment', commentSchema)
