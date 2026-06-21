/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react'
import api from '../api'

export const OrdersContext = createContext(null)

// Sipariş durumunu Türkçeye çevirir
function mapStatusLabel(status) {
  const map = {
    preparing: 'Hazırlanıyor',
    pending:   'Hazırlanıyor',
    shipped:   'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
  }
  return map[status] || status || 'Hazırlanıyor'
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])

  // ── GEREKSİNİM 6: Sipariş Listeleme — GET /api/orders/:userId ──
  const fetchOrders = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    // JWT payload'dan userId çöz
    let userId = null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.id
    } catch {
      return
    }
    if (!userId) return

    try {
      const res = await api.get(`/api/orders/${userId}`)
      const raw = res.data.orders || res.data || []

      const fetchedOrders = raw.map(order => ({
        id:          String(order._id),
        _mongoId:    String(order._id),
        date:        new Date(order.createdAt).toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric'
        }),
        status:      order.status || 'preparing',
        statusLabel: mapStatusLabel(order.status),
        total:       order.total || 0,
        items:       (order.items || []).map(item => ({
          name:  item.name,
          qty:   item.quantity || item.qty || 1,
          price: item.price,
          image: item.imageUrl || item.image || '',
        })),
        // giftNote: hem string field hem de notes array'in ilk elemanını destekle
        giftNote:    order.notes?.[0]?.message || order.giftNote || '',
        firstNoteId: order.notes?.[0]?._id ? String(order.notes[0]._id) : null,
        notes:       order.notes || [],
        address:     order.address || '',
        recipient:   order.recipient || '',
        // ÖNEMLİ: buyer objesini düzelt (order model'de shippingAddress yok)
        buyer: {
          fullName: order.recipient || '',
          address:  order.address  || '',
          email:    order.email    || '',
          phone:    order.phone    || '',
        },
      }))

      setOrders(fetchedOrders)
      console.log('✅ GEREKSİNİM 6 — Sipariş Listeleme MongoDB\'den geldi:', fetchedOrders.length, 'sipariş')
    } catch (err) {
      console.error('❌ Siparişler çekilirken hata:', err?.response?.data || err.message)
    }
  }

  useEffect(() => {
    fetchOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── GEREKSİNİM 5: Sipariş Oluşturma — POST /api/orders ──
  const addOrder = async (orderData) => {
    try {
      const res = await api.post('/api/orders', orderData)
      const orderId = res.data.order?._id || res.data._id
      await fetchOrders()
      return { ok: true, orderId }
    } catch (err) {
      console.error('❌ Sipariş kaydedilemedi:', err?.response?.data || err.message)
      return { ok: false, error: err.response?.data?.message || 'Sipariş oluşturulamadı.' }
    }
  }

  // ── GEREKSİNİM 9: Sipariş Güncelleme — PUT /api/orders/:orderId ──
  const updateOrder = async (orderId, updates) => {
    try {
      const res = await api.put(`/api/orders/${orderId}`, updates)
      const updatedOrder = res.data.order
      setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o
        return {
          ...o,
          address:   updatedOrder?.address   ?? updates.address   ?? o.address,
          recipient: updatedOrder?.recipient ?? updates.recipient ?? o.recipient,
          giftNote:  updatedOrder?.giftNote  ?? updates.giftNote  ?? o.giftNote,
          buyer: {
            ...o.buyer,
            fullName: updatedOrder?.recipient ?? updates.recipient ?? o.buyer?.fullName ?? '',
            address:  updatedOrder?.address   ?? updates.address   ?? o.buyer?.address  ?? '',
          },
        }
      }))
      console.log('✅ GEREKSİNİM 9 — Sipariş Güncelleme MongoDB\'ye kaydedildi')
      return { ok: true }
    } catch (err) {
      console.error('❌ Sipariş güncellenemedi:', err?.response?.data || err.message)
      return { ok: false, error: err.response?.data?.message || 'Güncelleme başarısız.' }
    }
  }

  // ── GEREKSİNİM 6: Sipariş İptali — DELETE /api/orders/:orderId/cancel ──
  const cancelOrder = async (orderId) => {
    try {
      await api.delete(`/api/orders/${orderId}/cancel`)
      setOrders(prev => prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'cancelled', statusLabel: 'İptal Edildi' }
          : o
      ))
      console.log('✅ EDA GEREKSİNİM 6 — Sipariş İptali MongoDB\'ye kaydedildi')
      return { ok: true }
    } catch (err) {
      console.error('❌ Sipariş iptal edilemedi:', err?.response?.data || err.message)
      return { ok: false, error: err.response?.data?.message || 'İptal başarısız.' }
    }
  }

  // ── GEREKSİNİM 7: Hediye Notu Ekleme — POST /api/orders/:orderId/notes ──
  const addGiftNote = async (orderId, message) => {
    try {
      const res = await api.post(`/api/orders/${orderId}/notes`, { message })
      const addedNote = res.data.note
      setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o
        return {
          ...o,
          giftNote:    addedNote?.message || message,
          firstNoteId: addedNote?._id ? String(addedNote._id) : o.firstNoteId,
          notes:       [...(o.notes || []), addedNote].filter(Boolean),
        }
      }))
      console.log('✅ EDA GEREKSİNİM 7 — Hediye Notu Ekleme MongoDB\'ye kaydedildi')
      return { ok: true, noteId: addedNote?._id }
    } catch (err) {
      console.error('❌ Hediye notu eklenemedi:', err?.response?.data || err.message)
      return { ok: false, error: err.response?.data?.message || 'Not eklenemedi.' }
    }
  }

  // ── GEREKSİNİM 8: Hediye Notu Silme — DELETE /api/orders/:orderId/notes/:noteId ──
  const deleteGiftNote = async (orderId, noteId) => {
    try {
      if (noteId) {
        // Önce notes array'inden sil (DELETE endpoint)
        await api.delete(`/api/orders/${orderId}/notes/${noteId}`)
        console.log('✅ EDA GEREKSİNİM 8 — Hediye Notu Silme (notes array) MongoDB\'den silindi')
      }
      // Ayrıca giftNote string field'ı da temizle
      await api.put(`/api/orders/${orderId}`, { giftNote: '' })
      setOrders(prev => prev.map(o =>
        o.id === orderId
          ? { ...o, giftNote: '', firstNoteId: null, notes: [] }
          : o
      ))
      return { ok: true }
    } catch (err) {
      console.error('❌ Hediye notu silinemedi:', err?.response?.data || err.message)
      return { ok: false, error: err.response?.data?.message || 'Not silinemedi.' }
    }
  }

  const value = {
    orders,
    addOrder,
    fetchOrders,
    updateOrder,
    cancelOrder,
    addGiftNote,
    deleteGiftNote,
  }

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used within an OrdersProvider')
  return context
}