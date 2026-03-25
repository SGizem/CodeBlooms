/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState } from 'react'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  // { [flowerId]: quantity }
  const [items, setItems] = useState({})

  const cartCount = useMemo(() => {
    return Object.values(items).reduce((sum, qty) => sum + qty, 0)
  }, [items])

  function addToCart(id, qty = 1) {
    if (!id || qty <= 0) return
    setItems((prev) => {
      const nextQty = (prev[id] ?? 0) + qty
      return { ...prev, [id]: nextQty }
    })
  }

  function removeFromCart(id) {
    if (!id) return
    setItems((prev) => {
      const { [id]: _, ...rest } = prev
      return rest
    })
  }

  function clearCart() {
    setItems({})
  }

  const value = useMemo(
    () => ({ cartCount, items, addToCart, removeFromCart, clearCart }),
    [cartCount, items]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

