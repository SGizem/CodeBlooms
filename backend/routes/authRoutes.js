const express  = require('express')
const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')
const User      = require('../models/User')
const amqp      = require('amqplib')

const router = express.Router()

// POST /api/users/register
router.post('/register', async (req, res) => {
  console.log('📡 [RADAR] POST /api/users/register isteği backend\'e ulaştı!');
  try {
    const { firstName, lastName, email, password } = req.body

    // Zorunlu alan kontrolü
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur.' })
    }

    // Şifre uzunluğu
    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' })
    }

    // E-posta unique kontrolü
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Bu email zaten kayıtlı.' })
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10)

    // Kullanıcı oluştur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    })

    // RabbitMQ Mesaj Gönderimi
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672')
      const channel = await connection.createChannel()
      await channel.assertQueue('welcome_emails')
      
      channel.sendToQueue('welcome_emails', Buffer.from(JSON.stringify({ email: user.email, message: 'Hoşgeldin' })))
      
      console.log('🐰 ŞOV: Yeni kayıt alındı! Hoşgeldin emaili RabbitMQ kuyruğuna (welcome_emails) başarıyla eklendi.')

      setTimeout(() => {
        channel.close()
        connection.close()
      }, 500)
    } catch (rabbitErr) {
      console.error('RabbitMQ hatası:', rabbitErr)
    }

    // JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, firstName: user.firstName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
      },
    })
  } catch (err) {
    console.error('HATA OLUŞTU:', err.message);
    return res.status(500).json({ message: 'Sunucu hatası. Lütfen tekrar deneyin.' })
  }
})

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre zorunludur.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Email veya şifre hatalı.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Email veya şifre hatalı.' })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, firstName: user.firstName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
      },
    })
  } catch (err) {
    console.error('Login hatası:', err)
    return res.status(500).json({ message: 'Sunucu hatası.' })
  }
})

module.exports = router
