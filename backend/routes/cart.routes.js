const express       = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  addToCart,
  removeFromCart,
  updateCartItem,
  getCart,
} = require('../controllers/cart.controller')

const router = express.Router()

// POST   /api/cart/add
router.post('/add',             authMiddleware, addToCart)
// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', authMiddleware, removeFromCart)
// PUT    /api/cart/items/:itemId
router.put('/items/:itemId',    authMiddleware, updateCartItem)
// GET    /api/cart
router.get('/',                 authMiddleware, getCart)

module.exports = router
