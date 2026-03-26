const express        = require('express')
const Comment        = require('../models/Comment')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// POST /api/products/:productId/comments — yorum ekle
router.post('/products/:productId/comments', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params
    const { text, rating } = req.body

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Yorum metni zorunludur.' })
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Puan 1 ile 5 arasında olmalıdır.' })
    }

    const comment = await Comment.create({
      product:  productId,
      user:     req.user.id,
      userName: req.user.firstName,
      text:     text.trim(),
      rating:   Number(rating),
    })

    return res.status(201).json({ comment })
  } catch (err) {
    console.error('Yorum ekleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

// GET /api/products/:productId/comments — ürüne ait yorumlar
router.get('/products/:productId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ product: req.params.productId })
      .sort({ createdAt: -1 })

    return res.status(200).json({ comments })
  } catch (err) {
    console.error('Yorum listeleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

// DELETE /api/comments/:commentId — sadece yorumu yazan silebilir
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı.' })
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu yorumu silemezsiniz.' })
    }

    await comment.deleteOne()

    return res.status(200).json({ message: 'Yorum silindi.' })
  } catch (err) {
    console.error('Yorum silme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

module.exports = router
