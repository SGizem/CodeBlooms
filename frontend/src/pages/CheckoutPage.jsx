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

  const shipping = subtotal > 500 ? 0 : 49
  const total = subtotal + shipping

  // Buyer info
  const [buyer, setBuyer] = useState({
    fullName: '', email: '', phone: '', address: '',
  })

  // Gift note
  const [includeGiftNote, setIncludeGiftNote] = useState(true)
  const [giftNote, setGiftNote] = useState('')

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('Kredi Kartı')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const [error, setError] = useState('')

  if (cartCount === 0) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h1 className="font-display text-4xl font-bold text-[#7B1C3E]">Sipariş Oluştur</h1>
          <div className="mt-4 font-jost text-sm text-[#1A1A1A]/70">
            Sepetiniz boş. Lütfen önce ürün ekleyin.
          </div>
          <div className="mt-8">
            <Link to="/flowers"
              className="inline-flex rounded-full bg-[#7B1C3E] px-6 py-3 font-jost text-sm font-semibold text-white transition hover:shadow-md">
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
    if (paymentMethod !== 'Kapıda Ödeme') {
      if (!cardNumber.trim()) return 'Kart numarası zorunludur.'
      if (!expiry.trim()) return 'Son kullanma tarihi zorunludur.'
      if (!cvv.trim()) return 'CVV zorunludur.'
    }
    if (includeGiftNote && giftNote.trim().length > 200) return 'Hediye notu 200 karakteri geçemez.'
    return ''
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    const msg = validate()
    if (msg) { setError(msg); return }

    const gift = includeGiftNote ? giftNote.trim() : ''
    const res = createOrder({
      cartItems: items,
      productsById: productById,
      buyer,
      giftNote: gift || null,
    })

    if (!res.ok) { setError(res.error || 'Sipariş oluşturulamadı.'); return }

    clearCart()
    navigate(`/orders/${res.order.id}`)
  }

  const PAYMENT_METHODS = ['Kredi Kartı', 'Banka Kartı', 'Kapıda Ödeme']

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-[#7B1C3E]">Sipariş Oluştur</h1>
            <div className="mt-2 font-jost text-sm text-[#1A1A1A]/70">
              Bilgilerinizi girin ve siparişinizi tamamlayın.
            </div>
          </div>
          <Link to="/cart" className="font-jost text-sm font-semibold text-[#7B1C3E] underline">
            Sepete Dön
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          {/* Left: form */}
          <div className="space-y-6 lg:col-span-2">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Alıcı bilgileri */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-[#7B1C3E] mb-1">Alıcı Bilgileri</h2>
                <p className="font-jost text-sm text-[#1A1A1A]/60 mb-5">Siparişiniz doğru adrese iletilsin.</p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Ad Soyad</label>
                    <input
                      className="w-full rounded-xl border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={buyer.fullName}
                      onChange={e => setBuyer(p => ({ ...p, fullName: e.target.value }))}
                      autoComplete="name" required
                    />
                  </div>
                  <div>
                    <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">E-posta</label>
                    <input
                      className="w-full rounded-xl border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={buyer.email}
                      onChange={e => setBuyer(p => ({ ...p, email: e.target.value }))}
                      type="email" autoComplete="email" required
                    />
                  </div>
                  <div>
                    <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Telefon</label>
                    <input
                      className="w-full rounded-xl border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={buyer.phone}
                      onChange={e => setBuyer(p => ({ ...p, phone: e.target.value }))}
                      type="tel" autoComplete="tel" required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Adres</label>
                    <input
                      className="w-full rounded-xl border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={buyer.address}
                      onChange={e => setBuyer(p => ({ ...p, address: e.target.value }))}
                      autoComplete="street-address" required
                    />
                  </div>
                </div>
              </div>

              {/* Hediye notu */}
              <div className="bg-[#F5F0E8] rounded-2xl p-6">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="font-display text-xl font-bold text-[#7B1C3E]">💌 Hediye Notu</div>
                    <div className="mt-1 font-jost text-sm text-[#1A1A1A]/60">Sevdiğinize özel bir mesaj ekleyin.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { if (includeGiftNote) { setIncludeGiftNote(false); setGiftNote('') } else setIncludeGiftNote(true) }}
                    className="rounded-full border border-[#7B1C3E] bg-white px-4 py-2 font-jost text-sm font-semibold text-[#7B1C3E] transition hover:bg-[#7B1C3E] hover:text-white"
                  >
                    {includeGiftNote ? 'Notu Kaldır' : 'Not Ekle'}
                  </button>
                </div>
                {includeGiftNote && (
                  <div>
                    <textarea
                      className="w-full min-h-[100px] resize-none rounded-xl border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={giftNote}
                      onChange={e => setGiftNote(e.target.value)}
                      maxLength={200}
                      placeholder="Sevdiğinize özel bir mesaj yazın..."
                    />
                    <div className="mt-1 flex justify-between font-jost text-xs text-[#1A1A1A]/50">
                      <span>En fazla 200 karakter</span>
                      <span>{giftNote.length}/200</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ödeme bilgileri */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-display text-2xl font-bold text-[#7B1C3E] mb-5">💳 Ödeme Bilgileri</h3>

                {/* Method selector */}
                <div className="flex gap-3 mb-6">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-jost font-medium border transition-all ${
                        paymentMethod === method
                          ? 'bg-[#7B1C3E] text-white border-[#7B1C3E]'
                          : 'border-[#EDE8DE] text-[#1A1A1A]/60 hover:border-[#7B1C3E]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod !== 'Kapıda Ödeme' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-jost text-sm font-semibold text-[#1A1A1A]/70 mb-1">Kart Numarası</label>
                      <input
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={cardNumber}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
                          setCardNumber(v)
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-[#EDE8DE] font-jost text-sm tracking-wider focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-jost text-sm font-semibold text-[#1A1A1A]/70 mb-1">Son Kullanma</label>
                        <input
                          placeholder="AA/YY"
                          maxLength={5}
                          value={expiry}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                            setExpiry(v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v)
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-[#EDE8DE] font-jost text-sm focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-jost text-sm font-semibold text-[#1A1A1A]/70 mb-1">CVV</label>
                        <input
                          placeholder="123"
                          maxLength={3}
                          type="password"
                          value={cvv}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          className="w-full px-4 py-3 rounded-xl border border-[#EDE8DE] font-jost text-sm focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-jost text-sm font-semibold text-[#1A1A1A]/70 mb-1">Kart Üzerindeki İsim</label>
                      <input
                        placeholder="AD SOYAD"
                        value={cardName}
                        onChange={e => setCardName(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 rounded-xl border border-[#EDE8DE] font-jost text-sm tracking-wider focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F5F0E8] rounded-xl p-5 text-center">
                    <p className="font-jost text-sm text-[#1A1A1A]/70">
                      💰 Siparişiniz teslim edildiğinde nakit veya kart ile ödeme yapabilirsiniz.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-jost text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-[#7B1C3E] px-5 py-4 font-jost text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5a1530] hover:shadow-md active:scale-95"
              >
                Siparişi Onayla
              </button>
            </form>
          </div>

          {/* Right: summary */}
          <aside className="rounded-2xl border border-[#EDE8DE] bg-white p-6 lg:sticky lg:top-24">
            <div className="font-display text-xl font-bold text-[#7B1C3E] mb-4">Sipariş Özeti</div>
            <div className="space-y-3 font-jost text-sm text-[#1A1A1A]">
              {cartLines.map(line => (
                <div key={line.product.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{line.product.name}</div>
                    <div className="mt-0.5 text-xs text-[#1A1A1A]/50">{line.qty} adet</div>
                  </div>
                  <div className="font-semibold flex-shrink-0">
                    <Money value={line.product.price * line.qty} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-[#EDE8DE] pt-4 space-y-2 font-jost text-sm text-[#1A1A1A]">
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
              <div className="flex items-center justify-between pt-2 border-t border-[#EDE8DE]">
                <span className="font-semibold">Genel Toplam</span>
                <span className="font-display text-2xl font-bold text-[#7B1C3E]">
                  <Money value={total} />
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
