/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react'
import api from '../api'

export const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])

  // Backend'den kullanıcının siparişlerini getir
  const fetchOrders = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    // Token'dan userId'yi çöz (backend JWT içinde id gönderir)
    let userId = null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.id
    } catch {
      return
    }

    if (!userId) return

    try {
      // GET /api/orders/:userId
      const res = await api.get(`/api/orders/${userId}`)
      const raw = res.data.orders || res.data || []

      const fetchedOrders = raw.map(order => ({
        id: String(order._id),
        date: new Date(order.createdAt).toLocaleDateString('tr-TR'),
        status: order.status || 'preparing',
        statusLabel: mapStatusLabel(order.status),
        total: order.total || order.totalPrice || 0,
        items: (order.items || order.orderItems || []).map(item => ({
          name: item.name,
          qty: item.quantity || item.qty || 1,
          price: item.price,
          image: item.imageUrl || item.image || '',
        })),
        giftNote: order.giftNote || '',
        address: order.address || order.shippingAddress?.address || '',
        recipient: order.recipient || order.shippingAddress?.fullName || '',
        buyer: order.shippingAddress || null,
      }))
      setOrders(fetchedOrders)
    } catch (err) {
      console.error('Siparişler çekilirken hata:', err)
    }
  }

  useEffect(() => {
    fetchOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function mapStatusLabel(status) {
    const map = {
      preparing: 'Hazırlanıyor',
      shipped: 'Yolda',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi',
    }
    return map[status] || status || 'Alındı'
  }

  // POST /api/orders — sipariş oluştur (backend: address + recipient + items + giftNote)
  const addOrder = async (orderData) => {
    try {
      const res = await api.post('/api/orders', orderData)
      await fetchOrders()
      return { ok: true, orderId: res.data.order?._id || res.data._id }
    } catch (err) {
      console.error('Sipariş kaydedilemedi:', err)
      return { ok: false, error: err.response?.data?.message || 'Sipariş oluşturulamadı.' }
    }
  }

  // PUT /api/orders/:orderId — sipariş güncelle
  const updateOrder = async (orderId, updates) => {
    try {
      await api.put(`/api/orders/${orderId}`, updates)
      // Optimistic: local state güncelle
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, ...updates } : o
      ))
      return { ok: true }
    } catch (err) {
      console.error('Sipariş güncellenemedi:', err)
      return { ok: false, error: err.response?.data?.message || 'Güncelleme başarısız.' }
    }
  }

  // DELETE /api/orders/:orderId/cancel — sipariş iptal
  const cancelOrder = async (orderId) => {
    try {
      await api.delete(`/api/orders/${orderId}/cancel`)
      // Optimistic: local state güncelle
      setOrders(prev => prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'cancelled', statusLabel: 'İptal Edildi' }
          : o
      ))
      return { ok: true }
    } catch (err) {
      console.error('Sipariş iptal edilemedi:', err)
      return { ok: false, error: err.response?.data?.message || 'İptal başarısız.' }
    }
  }

  const value = {
    orders,
    addOrder,
    fetchOrders,
    updateOrder,
    cancelOrder,
  }

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used within an OrdersProvider')
  return context
}