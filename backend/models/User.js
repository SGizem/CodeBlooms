const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true },
    name: { type: String, trim: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
