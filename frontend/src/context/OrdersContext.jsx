/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockOrders } from '../data/mockOrders'

export const OrdersContext = createContext(null)

function normalizeOrder(raw) {
  if (!raw) return null
  const id = String(raw.id ?? '').trim()
  const date = String(raw.date ?? '').trim()
  const status = String(raw.status ?? '').trim()
  const total = Number(raw.total)
  const giftNote = raw.giftNote == null ? null : String(raw.giftNote)
  const buyer = raw.buyer ?? null
  const items = Array.isArray(raw.items) ? raw.items : []
  if (!id) return null

  return {
    id,
    date: date || new Date().toISOString().slice(0, 10),
    status: status || 'Oluşturuldu',
    total: Number.isFinite(total) ? total : 0,
    items,
    giftNote,
    buyer,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
  }
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const raw = localStorage.getItem('cb_orders')
      if (!raw) return mockOrders.map(normalizeOrder).filter(Boolean)
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map(normalizeOrder).filter(Boolean)
        if (normalized.length > 0) return normalized
      }
    } catch {
      // ignore
    }
    return mockOrders.map(normalizeOrder).filter(Boolean)
  })

  useEffect(() => {
    try {
      localStorage.setItem('cb_orders', JSON.stringify(orders))
    } catch {
      // ignore
    }
  }, [orders])

  const orderById = useMemo(() => {
    const map = new Map()
    for (const o of orders) map.set(o.id, o)
    return map
  }, [orders])

  function createOrder({ cartItems, productsById, buyer, giftNote }) {
    if (!buyer) return { ok: false, error: 'Adres bilgileri eksik.' }

    const entries = Object.entries(cartItems ?? {}).filter(([, qty]) => Number(qty) > 0)
    if (entries.length === 0) return { ok: false, error: 'Sepetiniz boş.' }

    const items = entries.map(([productIdRaw, qtyRaw]) => {
      const productId = Number(productIdRaw)
      const product = productsById?.get?.(productId) ?? null
      if (!product) return null
      const qty = Number(qtyRaw)
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        qty,
        image: product.image,
      }
    })

    const filtered = items.filter(Boolean)
    if (filtered.length === 0) return { ok: false, error: 'Sepette ürün bulunamadı.' }

    const total = filtered.reduce((sum, it) => sum + it.price * it.qty, 0)
    const createdAt = new Date().toISOString().slice(0, 10)
    const id = `SP${String(Date.now()).slice(-8)}`

    const order = {
      id,
      date: createdAt,
      status: 'Oluşturuldu',
      total,
      items: filtered,
      giftNote: giftNote ? String(giftNote).trim() : null,
      buyer: {
        fullName: buyer.fullName ?? '',
        email: buyer.email ?? '',
        phone: buyer.phone ?? '',
        address: buyer.address ?? '',
      },
      createdAt,
      updatedAt: createdAt,
    }

    setOrders((prev) => [order, ...prev])
    return { ok: true, order }
  }

  function updateOrder(orderId, updates) {
    const id = String(orderId)
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const next = { ...o }
        if (updates?.buyer) {
          next.buyer = { ...next.buyer, ...updates.buyer }
        }
        if ('giftNote' in updates) next.giftNote = updates.giftNote
        if (updates?.status) next.status = updates.status
        next.updatedAt = new Date().toISOString()
        return next
      })
    )
  }

  function cancelOrder(orderId) {
    const id = String(orderId)
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        if (String(o.status).toLowerCase().includes('iptal')) return o
        return { ...o, status: 'İptal Edildi', updatedAt: new Date().toISOString() }
      })
    )
  }

  const value = { orders, orderById, createOrder, updateOrder, cancelOrder }

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider')
  return ctx
}

