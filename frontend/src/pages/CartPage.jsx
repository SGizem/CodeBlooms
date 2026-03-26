import { useContext, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

const FALLBACK = 'https://images.unsplash.com/photo-1487530811015-780780b58c25?w=600&q=80'

function Money({ value }) {
  const n = Number(value ?? 0)
  return <>{Number.isFinite(n) ? n : 0}₺</>
}

export default function CartPage() {
  const cart = useContext(CartContext)
  const { productById } = useProducts()
  const navigate = useNavigate()

  const { items, cartCount, updateCartQty, removeFromCart, clearCart, lastMutation } = cart

  const cartLines = useMemo(() => {
    return Object.entries(items ?? {})
      .map(([idRaw, qty]) => {
        const id = Number(idRaw)
        const product = productById?.get?.(id) ?? null
        return product
          ? { product, qty: Number(qty) }
          : { product: null, qty: Number(qty), productId: id }
      })
      .filter((l) => l.qty > 0)
  }, [items, productById])

  const subtotal = useMemo(() => {
    return cartLines.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.qty, 0)
  }, [cartLines])

  const shipping = subtotal > 500 ? 0 : 49
  const total = subtotal + shipping

  const [removingId, setRemovingId] = useState(null)
  const activeAnimId = lastMutation?.id ?? null
  const activeAnimType = lastMutation?.type ?? null
  const canCheckout = cartCount > 0

  function onRemoveAnimated(productId) {
    setRemovingId(productId)
    window.setTimeout(() => {
      removeFromCart(productId)
      setRemovingId(null)
    }, 220)
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-[#7B1C3E]">Sepet</h1>
            <div className="mt-2 font-jost text-sm text-[#1A1A1A]/70">
              {cartCount > 0 ? `${cartCount} ürün` : 'Sepetiniz boş'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cartCount > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-[#1A1A1A]/15 bg-white px-4 py-2 font-jost text-sm font-semibold text-[#7B1C3E] transition hover:bg-[#7B1C3E] hover:text-white"
              >
                Sepeti Temizle
              </button>
            )}
            <Link
              to="/flowers"
              className="rounded-full border border-[#7B1C3E] bg-white px-4 py-2 font-jost text-sm font-semibold text-[#7B1C3E] transition hover:bg-[#7B1C3E] hover:text-white"
            >
              Alışverişe Devam
            </Link>
          </div>
        </div>

        {cartCount === 0 ? (
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-5xl" aria-hidden="true">🛒</div>
            <div className="font-display text-2xl font-bold text-[#7B1C3E]">Sepetiniz boş</div>
            <div className="font-jost text-sm text-[#1A1A1A]/60 max-w-xs">
              Henüz sepete ürün eklemediniz. Harika çiçekler sizi bekliyor!
            </div>
            <Link
              to="/flowers"
              className="rounded-full bg-[#7B1C3E] px-8 py-3 font-jost text-sm font-semibold text-white transition hover:shadow-md active:scale-95"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
            {/* Cart items */}
            <div className="space-y-3 lg:col-span-2">
              {cartLines.map((line) => {
                const product = line.product
                const productId = product?.id ?? line.productId
                const isRemoving = removingId === productId
                const isHighlight = activeAnimId === productId && activeAnimType === 'update'
                const isAdded = activeAnimId === productId && activeAnimType === 'add'

                const rowClass = [
                  'rounded-2xl border border-[#EDE8DE] bg-white p-5 transition-all duration-200',
                  isRemoving ? 'opacity-0 scale-95 overflow-hidden' : '',
                  isAdded ? 'ring-2 ring-[#7B1C3E]/30' : '',
                  isHighlight ? 'bg-[#F5F0E8]' : '',
                ].filter(Boolean).join(' ')

                return (
                  <article key={productId} className={rowClass}>
                    <div className="flex gap-4">
                      {/* Clickable image + name */}
                      <Link
                        to={`/flowers/${productId}`}
                        className="flex items-center gap-4 hover:opacity-80 transition-opacity flex-shrink-0"
                      >
                        <img
                          src={product?.image || FALLBACK}
                          alt={product?.name ?? 'Ürün'}
                          className="w-20 h-20 object-cover rounded-xl"
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK }}
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              to={`/flowers/${productId}`}
                              className="font-jost font-semibold text-[#1A1A1A] hover:text-[#7B1C3E] transition-colors"
                            >
                              {product?.name ?? 'Ürün bulunamadı'}
                            </Link>
                            {product?.category && (
                              <div className="mt-0.5 font-jost text-xs text-[#1A1A1A]/50">{product.category}</div>
                            )}
                            <div className="mt-1 font-jost text-sm text-[#1A1A1A]/60">
                              Birim: <span className="font-semibold text-[#7B1C3E]">{product ? `${product.price}₺` : '—'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveAnimated(productId)}
                            className="rounded-full border border-red-200 bg-white px-3 py-1 font-jost text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white flex-shrink-0"
                          >
                            Sil
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          {/* Qty control */}
                          <div className="inline-flex items-center rounded-full border border-[#EDE8DE] bg-[#F5F0E8]">
                            <button
                              type="button"
                              className="w-9 h-9 flex items-center justify-center text-[#7B1C3E] text-lg font-bold disabled:opacity-40"
                              onClick={() => updateCartQty(productId, line.qty - 1)}
                              disabled={line.qty <= 1}
                              aria-label="Azalt"
                            >
                              −
                            </button>
                            <div className="px-4 font-jost text-sm font-semibold text-[#1A1A1A]">
                              {line.qty}
                            </div>
                            <button
                              type="button"
                              className="w-9 h-9 flex items-center justify-center text-[#7B1C3E] text-lg font-bold"
                              onClick={() => updateCartQty(productId, line.qty + 1)}
                              aria-label="Artır"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-jost text-xs text-[#1A1A1A]/50">Toplam</div>
                            <div className="font-display text-2xl font-bold text-[#7B1C3E]">
                              {product ? `${product.price * line.qty}₺` : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Order summary */}
            <aside className="rounded-2xl border border-[#EDE8DE] bg-white p-6 lg:sticky lg:top-24">
              <div className="font-display text-2xl font-bold text-[#7B1C3E]">Sipariş Özeti</div>
              <div className="mt-5 space-y-3 font-jost text-sm text-[#1A1A1A]">
                <div className="flex items-center justify-between">
                  <span className="text-[#1A1A1A]/60">Ara Toplam</span>
                  <span className="font-semibold"><Money value={subtotal} /></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#1A1A1A]/60">Kargo</span>
                  <span className="font-semibold">
                    {shipping === 0
                      ? <span className="text-green-600">Ücretsiz</span>
                      : `${shipping}₺`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-[#1A1A1A]/50">
                    500₺ üzeri siparişlerde kargo ücretsiz!
                  </p>
                )}
              </div>
              <div className="mt-5 border-t border-[#EDE8DE] pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-jost text-sm font-semibold text-[#1A1A1A]/70">Genel Toplam</span>
                  <span className="font-display text-3xl font-bold text-[#7B1C3E]">
                    <Money value={total} />
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canCheckout}
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full rounded-full bg-[#7B1C3E] px-5 py-4 font-jost text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5a1530] hover:shadow-md active:scale-95 disabled:opacity-50"
              >
                Siparişi Tamamla
              </button>

              <div className="mt-3 font-jost text-xs text-center text-[#1A1A1A]/50">
                Ödeme adımında güvenli ödeme yapabilirsiniz.
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
