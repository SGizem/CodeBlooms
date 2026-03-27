/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react'
import api from '../api'

export const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await api.get('/api/orders')
      const fetchedOrders = res.data.map(order => ({
        id: String(order._id),
        date: new Date(order.createdAt).toLocaleDateString('tr-TR'),
        status: order.status || 'Alındı',
        total: order.totalPrice,
        items: order.orderItems || [],
        note: order.note || ''
      }))
      setOrders(fetchedOrders.reverse())
    } catch (err) {
      console.error('Siparişler çekilirken hata:', err)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const addOrder = async (orderData) => {
    try {
      const res = await api.post('/api/orders', orderData)
      await fetchOrders()
      return { ok: true, orderId: res.data._id }
    } catch (err) {
      console.error('Sipariş kaydedilemedi:', err)
      return { ok: false, error: err.response?.data?.message || 'Sipariş oluşturulamadı.' }
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status: newStatus })
      await fetchOrders()
    } catch (err) {
      console.error('Sipariş güncellenemedi:', err)
    }
  }

  const value = {
    orders,
    addOrder,
    fetchOrders,
    updateOrderStatus
  }

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

// İŞTE BENİM UNUTTUĞUM VE SAYFAYI ÇÖKERTEN O HAYATİ KOD BURASIYDI:
export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used within an OrdersProvider')
  return context
}