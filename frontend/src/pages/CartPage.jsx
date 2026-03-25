import { useContext, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

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
        return product ? { product, qty: Number(qty) } : { product: null, qty: Number(qty), productId: id }
      })
      .filter((l) => l.qty > 0)
  }, [items, productById])

  const subtotal = useMemo(() => {
    return cartLines.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.qty, 0)
  }, [cartLines])

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
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-bordo">Sepet</h1>
            <div className="mt-2 font-body text-sm text-[#1A1A1A]/70">
              {cartCount > 0 ? `${cartCount} ürün` : 'Sepetiniz boş'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cartCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  clearCart()
                }}
                className="rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-2 font-body text-sm font-semibold text-bordo transition hover:bg-bordo hover:text-white"
              >
                Sepeti Temizle
              </button>
            ) : null}
            <Link
              to="/flowers"
              className="rounded-md border border-bordo bg-white px-4 py-2 font-body text-sm font-semibold text-bordo transition hover:bg-bordo hover:text-white"
            >
              Alışverişe Devam
            </Link>
          </div>
        </div>

        {cartCount === 0 ? (
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-lg bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-3xl" aria-hidden="true">
              🛒
            </div>
            <div className="font-body text-sm font-semibold text-[#1A1A1A] sm:text-base">
              Şu an sepetinde ürün yok.
            </div>
            <Link
              to="/flowers"
              className="rounded-md bg-bordo px-6 py-2 font-body text-sm font-semibold text-white transition hover:shadow-md"
            >
              Çiçekleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
            <div className="space-y-3 lg:col-span-2">
              {cartLines.map((line) => {
                const product = line.product
                const productId = product?.id ?? line.productId
                const isRemoving = removingId === productId
                const isHighlight = activeAnimId === productId && activeAnimType === 'update'
                const isAdded = activeAnimId === productId && activeAnimType === 'add'

                const rowClass = [
                  'rounded-lg border border-[#1A1A1A]/10 bg-white p-4 transition-all',
                  'transform',
                  isRemoving ? 'opacity-0 scale-95 h-0 p-0 overflow-hidden' : '',
                  isAdded ? 'ring-2 ring-bordo/30' : '',
                  isHighlight ? 'bg-krem' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <article key={productId} className={rowClass}>
                    <div className="flex gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-md bg-bej">
                        {product?.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-body text-sm font-semibold text-[#1A1A1A]">
                              {product?.name ?? 'Ürün bulunamadı'}
                            </div>
                            <div className="mt-1 font-body text-sm text-[#1A1A1A]/70">
                              Birim: <span className="font-semibold">{product ? <Money value={product.price} /> : '—'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveAnimated(productId)}
                            className="rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-1 font-body text-xs font-semibold text-bordo transition hover:bg-bordo hover:text-white"
                          >
                            Sil
                          </button>
                        </div>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="font-body text-sm font-semibold text-[#1A1A1A]">Adet</div>
                            <div className="inline-flex items-center rounded-md border border-[#1A1A1A]/10 bg-white">
                              <button
                                type="button"
                                className="px-3 py-2 font-body text-xl text-bordo disabled:opacity-40"
                                onClick={() => updateCartQty(productId, line.qty - 1)}
                                disabled={line.qty <= 1}
                                aria-label="Azalt"
                              >
                                -
                              </button>
                              <div className="px-4 py-2 font-body text-sm font-semibold text-[#1A1A1A]">
                                {line.qty}
                              </div>
                              <button
                                type="button"
                                className="px-3 py-2 font-body text-xl text-bordo"
                                onClick={() => updateCartQty(productId, line.qty + 1)}
                                aria-label="Artır"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-body text-sm text-[#1A1A1A]/70">Toplam</div>
                            <div className="font-body text-2xl font-bold text-bordo">
                              {product ? <Money value={product.price * line.qty} /> : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="rounded-lg border border-[#1A1A1A]/10 bg-white p-5 lg:sticky lg:top-24">
              <div className="font-display text-xl font-bold text-bordo">Sipariş Özeti</div>
              <div className="mt-4 space-y-3 font-body text-sm text-[#1A1A1A]">
                <div className="flex items-center justify-between">
                  <span>Ara Toplam</span>
                  <span className="font-semibold">
                    <Money value={subtotal} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kargo</span>
                  <span className="font-semibold">Ücretsiz</span>
                </div>
              </div>
              <div className="mt-5 border-t border-[#1A1A1A]/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm font-semibold text-[#1A1A1A]/70">Genel Toplam</span>
                  <span className="font-display text-3xl font-bold text-bordo">
                    <Money value={subtotal} />
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canCheckout}
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full rounded-md bg-bordo px-5 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
              >
                Checkout
              </button>

              <div className="mt-3 font-body text-xs text-[#1A1A1A]/60">
                Ödeme adımına geçmeden önce siparişinizi doğrulayacağız.
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

