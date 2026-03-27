/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from 'react'
import api from '../api'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState({})
  const [itemIds, setItemIds] = useState({}) // Backend'deki cartItemId'leri tutmak için
  const [toast, setToast] = useState(null)
  const [lastMutation, setLastMutation] = useState(null)

  // Backend'den gelen karmaşık sepeti, Frontend'in anladığı basit {id: qty} diline çeviren fonksiyon
  const syncCartWithBackend = (backendItems = []) => {
    const newItems = {}
    const newItemIds = {}
    backendItems.forEach(item => {
      const pId = String(item.product?._id || item.product)
      newItems[pId] = item.quantity
      newItemIds[pId] = String(item._id) // Silme/Güncelleme işlemleri için backend'in istediği asıl ID
    })
    setItems(newItems)
    setItemIds(newItemIds)
  }

  // Sayfa yüklendiğinde sepeti MongoDB'den getir
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token')
      if (!token) return // Kullanıcı giriş yapmadıysa sepeti çekme
      try {
        const res = await api.get('/api/cart')
        syncCartWithBackend(res.data.cart?.items || [])
      } catch (err) {
        console.error('Sepet yüklenirken hata:', err)
      }
    }
    fetchCart()
  }, [])

  const cartCount = useMemo(() => {
    return Object.values(items).reduce((sum, qty) => sum + qty, 0)
  }, [items])

  function triggerToast(message) {
    const next = { key: Date.now(), message }
    setToast(next)
    window.setTimeout(() => {
      setToast((t) => (t?.key === next.key ? null : t))
    }, 2200)
  }

  async function addToCart(id, qty = 1) {
    if (!id || qty <= 0) return
    try {
      // MongoDB'ye ekle
      const res = await api.post('/api/cart/add', { productId: id, quantity: qty })
      syncCartWithBackend(res.data.cart?.items || [])

      setLastMutation({ key: Date.now(), type: 'add', id: String(id) })
      triggerToast('Ürün sepete eklendi.')
    } catch (err) {
      triggerToast('Sepete eklenirken hata oluştu.')
    }
  }

  async function removeFromCart(id) {
    if (!id) return
    try {
      const cartItemId = itemIds[id]
      if (cartItemId) {
        // MongoDB'den sil
        const res = await api.delete(`/api/cart/items/${cartItemId}`)
        syncCartWithBackend(res.data.cart?.items || [])
      } else {
        setItems(prev => { const { [id]: _, ...rest } = prev; return rest; })
      }
      setLastMutation({ key: Date.now(), type: 'remove', id: String(id) })
      triggerToast('Ürün sepetten kaldırıldı.')
    } catch (err) {
      triggerToast('Ürün silinirken hata oluştu.')
    }
  }

  async function updateCartQty(id, qty) {
    if (!id) return
    const nextQty = Number(qty)
    if (!Number.isFinite(nextQty)) return
    if (nextQty <= 0) {
      removeFromCart(id)
      return
    }
    try {
      const cartItemId = itemIds[id]
      if (cartItemId) {
        // MongoDB'de adedi güncelle
        const res = await api.put(`/api/cart/items/${cartItemId}`, { quantity: nextQty })
        syncCartWithBackend(res.data.cart?.items || [])
      }
      setLastMutation({ key: Date.now(), type: 'update', id: String(id) })
      triggerToast('Sepet güncellendi.')
    } catch (err) {
      triggerToast('Güncelleme başarısız.')
    }
  }

  function clearCart() {
    setItems({})
    setItemIds({})
  }

  const value = {
    cartCount,
    items,
    toast,
    lastMutation,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}