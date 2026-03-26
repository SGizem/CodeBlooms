module.exports = function authMiddleware(req, res, next) {
  try {
    const headerUserId = req.header('x-user-id')
    const authHeader = req.header('authorization') || req.header('Authorization')
    const bearerUserId =
      typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : null

    const userId = headerUserId || bearerUserId

    if (!userId) {
      return res.status(401).json({ message: 'Giriş yapmanız gerekiyor' })
    }

    req.user = { id: userId }
    next()
  } catch (err) {
    return res.status(500).json({ message: 'Yetkilendirme sırasında hata oluştu' })
  }
}
