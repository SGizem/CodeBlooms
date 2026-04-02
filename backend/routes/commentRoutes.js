const express        = require('express')
const Comment        = require('../models/Comment')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// ─────────────────────────────────────────────
// POST /api/comments/products/:productId/comments — Yorum ekle
// Body: { text, rating }
// ─────────────────────────────────────────────
router.post('/products/:productId/comments', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params
    const { text, rating } = req.body

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Yorum metni zorunludur.' })
    }

    const stars = Number(rating)
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Puan 1 ile 5 arasında olmalıdır.' })
    }

    const comment = await Comment.create({
      product:  productId,
      user:     req.user.id,
      userName: req.user.firstName || 'Kullanıcı',
      text:     text.trim(),
      rating:   stars,
    })

    return res.status(201).json({ comment })
  } catch (err) {
    console.error('Yorum ekleme hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

// ─────────────────────────────────────────────
// GET /api/comments/products/:productId/comments — Ürüne ait yorumlar
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// DELETE /api/comments/:commentId — Yorum sil (sadece yazan kullanıcı)
// ─────────────────────────────────────────────
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı.' })
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
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
