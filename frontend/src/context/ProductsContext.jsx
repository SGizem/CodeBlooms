/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockFlowers } from '../data/mockFlowers'

export const ProductsContext = createContext(null)

function normalizeProduct(raw) {
  if (!raw) return null
  const id = Number(raw.id)
  if (!Number.isFinite(id)) return null
  return {
    id,
    name: String(raw.name ?? '').trim(),
    description: String(raw.description ?? '').trim(),
    price: Number(raw.price),
    originalPrice: raw.originalPrice == null ? null : Number(raw.originalPrice),
    image: String(raw.image ?? '').trim(),
    category: String(raw.category ?? '').trim(),
  }
}

function getSeedProducts() {
  return mockFlowers.map((p) => normalizeProduct(p)).filter(Boolean)
}

// Bump this version whenever the seed data structure changes
const DATA_VERSION = 2

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const ver = localStorage.getItem('cb_products_ver')
      if (ver !== String(DATA_VERSION)) {
        // Data structure changed — clear old cache
        localStorage.removeItem('cb_products')
        localStorage.setItem('cb_products_ver', String(DATA_VERSION))
        return getSeedProducts()
      }
      const raw = localStorage.getItem('cb_products')
      if (!raw) return getSeedProducts()
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map((p) => normalizeProduct(p)).filter(Boolean)
        return normalized.length > 0 ? normalized : getSeedProducts()
      }
    } catch {
      // ignore
    }
    return getSeedProducts()
  })

  useEffect(() => {
    try {
      localStorage.setItem('cb_products', JSON.stringify(products))
      localStorage.setItem('cb_products_ver', String(DATA_VERSION))
    } catch {
      // ignore
    }
  }, [products])

  const productById = useMemo(() => {
    const map = new Map()
    for (const p of products) map.set(p.id, p)
    return map
  }, [products])

  function addProduct(input) {
    const name = String(input?.name ?? '').trim()
    const description = String(input?.description ?? '').trim()
    const image = String(input?.image ?? '').trim()
    const category = String(input?.category ?? '').trim()
    const price = Number(input?.price)
    const originalPriceRaw = input?.originalPrice
    const originalPrice =
      originalPriceRaw == null || originalPriceRaw === '' ? null : Number(originalPriceRaw)

    if (!name || !description || !image || !category) {
      return { ok: false, error: 'Lütfen tüm alanları kontrol edin.' }
    }
    if (!Number.isFinite(price) || price <= 0) return { ok: false, error: 'Fiyat geçersiz.' }
    if (originalPrice != null && (!Number.isFinite(originalPrice) || originalPrice < price)) {
      return { ok: false, error: 'İndirimli fiyat mantıksız.' }
    }

    const nextId =
      products.reduce((max, p) => (Number(p.id) > max ? Number(p.id) : max), 0) + 1

    const product = {
      id: nextId,
      name,
      description,
      price,
      originalPrice,
      image,
      category,
    }

    setProducts((prev) => [product, ...prev])
    return { ok: true, id: nextId }
  }

  function deleteProduct(id) {
    const productId = Number(id)
    if (!Number.isFinite(productId)) return
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const value = { products, productById, addProduct, deleteProduct }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider')
  return ctx
}

