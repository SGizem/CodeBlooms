import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = 'http://192.168.1.118:5000'

// Token'lı istek için axios instance
const authAxios = async () => {
  const token = await AsyncStorage.getItem('token')
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
}

// Token'sız istek için
const publicAxios = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// ── SEDEFİN GEREKSİNİMLERİ ──

// GEREKSİNİM 1: Kullanıcı Kaydı
export const registerUser = async (firstName, lastName, email, password) => {
  const res = await publicAxios.post('/api/users/register', {
    firstName, lastName, email, password
  })
  await AsyncStorage.setItem('token', res.data.token)
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user))
  return res.data
}

// GEREKSİNİM 2: Kullanıcı Girişi
export const loginUser = async (email, password) => {
  const res = await publicAxios.post('/api/users/login', { email, password })
  await AsyncStorage.setItem('token', res.data.token)
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user))
  return res.data
}

// GEREKSİNİM 3-5: Ürün İşlemleri
export const getProducts = async (category = '', search = '') => {
  const params = {}
  if (category && category !== 'Tümü') params.category = category
  if (search) params.search = search
  const res = await publicAxios.get('/api/products', { params })
  return res.data.products
}

export const addProduct = async (productData) => {
  const api = await authAxios()
  const res = await api.post('/api/products', productData)
  return res.data.product
}

export const deleteProduct = async (productId) => {
  const api = await authAxios()
  const res = await api.delete(`/api/products/${productId}`)
  return res.data
}

// GEREKSİNİM 6: Sipariş Listeleme
export const getOrders = async (userId) => {
  const api = await authAxios()
  const res = await api.get(`/api/orders/${userId}`)
  return res.data.orders
}

// GEREKSİNİM 7: Sipariş Güncelleme
export const updateOrder = async (orderId, address, recipient, giftNote) => {
  const api = await authAxios()
  const res = await api.put(`/api/orders/${orderId}`, {
    address, recipient, giftNote
  })
  return res.data.order
}

// GEREKSİNİM 8: Yorum Ekleme
export const addComment = async (productId, text, rating) => {
  const api = await authAxios()
  const res = await api.post(
    `/api/comments/products/${productId}/comments`,
    { text, rating }
  )
  return res.data.comment
}

// GEREKSİNİM 9: Yorum Silme
export const deleteComment = async (commentId) => {
  const api = await authAxios()
  const res = await api.delete(`/api/comments/${commentId}`)
  return res.data
}

// ── EDA'NIN GEREKSİNİMLERİ ──

// EDA 1: Sepete Ürün Ekleme
export const addToCart = async (productId, quantity = 1) => {
  const api = await authAxios()
  const res = await api.post('/api/cart/add', {
    productId: String(productId),
    quantity: Number(quantity)
  })
  return res.data.cart
}

// EDA 2: Sepetten Ürün Silme
export const removeFromCart = async (itemId) => {
  const api = await authAxios()
  const res = await api.delete(`/api/cart/items/${itemId}`)
  return res.data.cart
}

// EDA 3: Sepet Güncelleme
export const updateCartItem = async (itemId, quantity) => {
  const api = await authAxios()
  const res = await api.put(`/api/cart/items/${itemId}`, {
    quantity: Number(quantity)
  })
  return res.data.cart
}

// EDA 4: Sepet Listeleme
export const getCart = async () => {
  const api = await authAxios()
  const res = await api.get('/api/cart')
  return res.data.cart
}

// EDA 5: Sipariş Oluşturma
export const createOrder = async (address, recipient, items, giftNote = '') => {
  const api = await authAxios()
  const res = await api.post('/api/orders', {
    address, recipient, items, giftNote
  })
  return res.data.order
}

// EDA 6: Sipariş İptali
export const cancelOrder = async (orderId) => {
  const api = await authAxios()
  const res = await api.delete(`/api/orders/${orderId}/cancel`)
  return res.data
}

// EDA 7: Hediye Notu Ekleme
export const addGiftNote = async (orderId, note) => {
  const api = await authAxios()
  const res = await api.post(`/api/orders/${orderId}/notes`, { note })
  return res.data.giftNote
}

// EDA 8: Hediye Notu Silme
export const deleteGiftNote = async (orderId, noteId) => {
  const api = await authAxios()
  const res = await api.delete(`/api/orders/${orderId}/notes/${noteId}`)
  return res.data
}
