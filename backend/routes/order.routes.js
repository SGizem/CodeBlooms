const express        = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  createOrder,
  cancelOrder,
  updateOrder,
  getOrders,
  addNote,
  deleteNote,
} = require('../controllers/order.controller')

const router = express.Router()

// POST   /api/orders
router.post('/',                         authMiddleware, createOrder)
// DELETE /api/orders/:orderId/cancel
router.delete('/:orderId/cancel',        authMiddleware, cancelOrder)
// PUT    /api/orders/:orderId
router.put('/:orderId',                  authMiddleware, updateOrder)
// GET    /api/orders/:userId
router.get('/:userId',                   authMiddleware, getOrders)
// POST   /api/orders/:orderId/notes
router.post('/:orderId/notes',           authMiddleware, addNote)
// DELETE /api/orders/:orderId/notes/:noteId
router.delete('/:orderId/notes/:noteId', authMiddleware, deleteNote)

module.exports = router
