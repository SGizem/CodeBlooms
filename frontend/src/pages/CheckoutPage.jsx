import { useContext, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { useOrders } from '../context/OrdersContext'

function Money({ value }) {
  const n = Number(value ?? 0)
  return <>{Number.isFinite(n) ? n : 0}₺</>
}

export default function CheckoutPage() {
  const cart = useContext(CartContext)
  const { items, cartCount, clearCart } = cart
  const { productById } = useProducts()
  const { createOrder } = useOrders()
  const navigate = useNavigate()

  const cartLines = useMemo(() => {
    return Object.entries(items ?? {})
      .map(([idRaw, qtyRaw]) => {
        const id = Number(idRaw)
        const product = productById?.get?.(id) ?? null
        const qty = Number(qtyRaw)
        return product ? { product, qty } : null
      })
      .filter(Boolean)
  }, [items, productById])

  const subtotal = useMemo(() => {
    return cartLines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
  }, [cartLines])

  const [buyer, setBuyer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState('')

  const [includeGiftNote, setIncludeGiftNote] = useState(true)
  const [giftNote, setGiftNote] = useState('')

  if (cartCount === 0) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h1 className="font-display text-4xl font-bold text-bordo">Checkout</h1>
          <div className="mt-4 font-body text-sm text-[#1A1A1A]/70">
            Sepetiniz boş. Lütfen önce ürün ekleyin.
          </div>
          <div className="mt-8">
            <Link
              to="/flowers"
              className="inline-flex rounded-md bg-bordo px-6 py-2 font-body text-sm font-semibold text-white transition hover:shadow-md"
            >
              Çiçekleri Keşfet
            </Link>
          </div>
        </div>
      </div>
    )
  }

  function validate() {
    if (!buyer.fullName.trim()) return 'Ad Soyad zorunludur.'
    if (!buyer.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) return 'Geçerli bir e-posta girin.'
    if (!buyer.phone.trim() || buyer.phone.trim().length < 7) return 'Telefon numarası eksik.'
    if (!buyer.address.trim() || buyer.address.trim().length < 8) return 'Adres çok kısa.'
    if (includeGiftNote && giftNote.trim().length > 200) return 'Hediye notu 200 karakteri geçemez.'
    return ''
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    const msg = validate()
    if (msg) {
      setError(msg)
      return
    }

    const gift = includeGiftNote ? giftNote.trim() : ''
    const res = createOrder({
      cartItems: items,
      productsById: productById,
      buyer,
      giftNote: gift ? gift : null,
    })

    if (!res.ok) {
      setError(res.error || 'Sipariş oluşturulamadı.')
      return
    }

    clearCart()
    navigate(`/orders/${res.order.id}`)
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-bordo">Checkout</h1>
            <div className="mt-2 font-body text-sm text-[#1A1A1A]/70">
              Sipariş bilgilerinizi girin, ardından tamamlayın.
            </div>
          </div>
          <Link to="/cart" className="font-body text-sm font-semibold text-bordo underline">
            Sepete Dön
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6 lg:col-span-2">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <h2 className="font-display text-2xl font-bold text-bordo">Alıcı Bilgileri</h2>
                <div className="mt-1 font-body text-sm text-[#1A1A1A]/70">Siparişiniz doğru adrese iletilsin.</div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-body text-sm font-semibold text-[#1A1A1A]">Ad Soyad</label>
                  <input
                    className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                    value={buyer.fullName}
                    onChange={(e) => setBuyer((p) => ({ ...p, fullName: e.target.value }))}
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-semibold text-[#1A1A1A]">E-posta</label>
                  <input
                    className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                    value={buyer.email}
                    onChange={(e) => setBuyer((p) => ({ ...p, email: e.target.value }))}
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-semibold text-[#1A1A1A]">Telefon</label>
                  <input
                    className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                    value={buyer.phone}
                    onChange={(e) => setBuyer((p) => ({ ...p, phone: e.target.value }))}
                    type="tel"
                    autoComplete="tel"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-body text-sm font-semibold text-[#1A1A1A]">Adres</label>
                  <input
                    className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                    value={buyer.address}
                    onChange={(e) => setBuyer((p) => ({ ...p, address: e.target.value }))}
                    autoComplete="street-address"
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#1A1A1A]/10 bg-krem p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-xl font-bold text-bordo">Hediye Notu</div>
                    <div className="mt-1 font-body text-sm text-[#1A1A1A]/70">
                      Sipariş aşamasında not ekleyebilirsiniz.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (includeGiftNote) {
                        setIncludeGiftNote(false)
                        setGiftNote('')
                      } else {
                        setIncludeGiftNote(true)
                      }
                    }}
                    className="rounded-md border border-bordo bg-white px-4 py-2 font-body text-sm font-semibold text-bordo transition hover:bg-bordo hover:text-white"
                  >
                    {includeGiftNote ? 'Notu Sil' : 'Hediye Notu Ekle'}
                  </button>
                </div>

                {includeGiftNote ? (
                  <div className="mt-4">
                    <label className="font-body text-sm font-semibold text-[#1A1A1A]">Not</label>
                    <textarea
                      className="mt-2 min-h-[110px] w-full resize-none rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      maxLength={200}
                      placeholder="Örn: Doğum günün kutlu olsun..."
                    />
                    <div className="mt-2 flex items-center justify-between font-body text-xs text-[#1A1A1A]/60">
                      <span>En fazla 200 karakter</span>
                      <span>{giftNote.length}/200</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 font-body text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-md bg-bordo px-5 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Siparişi Tamamla
              </button>

              <div className="font-body text-xs text-[#1A1A1A]/60">
                Mock checkout akışıdır. Veriler localStorage’ta saklanır.
              </div>
            </form>
          </div>

          <aside className="rounded-lg border border-[#1A1A1A]/10 bg-white p-5">
            <div className="font-display text-xl font-bold text-bordo">Sipariş Özeti</div>
            <div className="mt-4 space-y-3 font-body text-sm text-[#1A1A1A]">
              {cartLines.map((line) => (
                <div key={line.product.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{line.product.name}</div>
                    <div className="mt-1 text-sm text-[#1A1A1A]/70">
                      {line.qty} adet
                    </div>
                  </div>
                  <div className="font-semibold">
                    <Money value={line.product.price * line.qty} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-[#1A1A1A]/10 pt-4 space-y-2 font-body text-sm text-[#1A1A1A]">
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
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold">Genel Toplam</span>
                <span className="font-display text-2xl font-bold text-bordo">
                  <Money value={subtotal} />
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

