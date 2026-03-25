/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from 'react'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  // { [flowerId]: quantity }
  const [items, setItems] = useState({})
  const [toast, setToast] = useState(null)
  const [lastMutation, setLastMutation] = useState(null)

  useEffect(() => {
    // Mock sepet: sayfa yenilenince kalsın.
    try {
      const raw = localStorage.getItem('cb_cart_items')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') setItems(parsed)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('cb_cart_items', JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

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

  function addToCart(id, qty = 1) {
    if (!id || qty <= 0) return
    setItems((prev) => {
      const nextQty = (prev[id] ?? 0) + qty
      return { ...prev, [id]: nextQty }
    })
    setLastMutation({ key: Date.now(), type: 'add', id: Number(id) })
    triggerToast('Ürün sepete eklendi.')
  }

  function removeFromCart(id) {
    if (!id) return
    setItems((prev) => {
      const { [id]: _, ...rest } = prev
      return rest
    })
    setLastMutation({ key: Date.now(), type: 'remove', id: Number(id) })
    triggerToast('Ürün sepetten kaldırıldı.')
  }

  function updateCartQty(id, qty) {
    if (!id) return
    const nextQty = Number(qty)
    if (!Number.isFinite(nextQty)) return
    if (nextQty <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prev) => ({ ...prev, [id]: nextQty }))
    setLastMutation({ key: Date.now(), type: 'update', id: Number(id) })
    triggerToast('Sepet güncellendi.')
  }

  function clearCart() {
    setItems({})
    triggerToast('Sepet temizlendi.')
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

