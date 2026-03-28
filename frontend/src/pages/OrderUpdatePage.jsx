import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'

export default function OrderUpdatePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // orderById YERİNE orders ALINDI
  const { orders, updateOrder } = useOrders()

  // get(id) YERİNE find KULLANILDI
  const order = useMemo(() => {
    return orders?.find(o => String(o.id) === String(id) || String(o._id) === String(id)) ?? null
  }, [id, orders])

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  })

  const [includeGiftNote, setIncludeGiftNote] = useState(false)
  const [giftNote, setGiftNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!order) return
    setForm({
      fullName: order.buyer?.fullName ?? '',
      email: order.buyer?.email ?? '',
      phone: order.buyer?.phone ?? '',
      address: order.buyer?.address ?? '',
    })
    setIncludeGiftNote(!!order.giftNote)
    setGiftNote(order.giftNote ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id])

  if (!order) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h1 className="font-display text-4xl font-bold text-bordo">Sipariş bulunamadı</h1>
          <div className="mt-6">
            <Link
              to="/orders"
              className="inline-flex rounded-md bg-bordo px-5 py-2 font-body text-sm font-semibold text-white transition hover:shadow-md"
            >
              Siparişlere Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  function validate() {
    if (!form.fullName.trim()) return 'Ad Soyad zorunludur.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Geçerli bir e-posta girin.'
    if (!form.phone.trim() || form.phone.trim().length < 7) return 'Telefon numarası eksik.'
    if (!form.address.trim() || form.address.trim().length < 8) return 'Adres çok kısa.'
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

    updateOrder(order.id, {
      buyer: form,
      giftNote: includeGiftNote ? (giftNote.trim() ? giftNote.trim() : null) : null,
    })
    navigate(`/orders/${order.id}`)
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-bordo">Siparişi Güncelle</h1>
            <div className="mt-2 font-body text-sm text-[#1A1A1A]/70">
              {order.id} · Durum: <span className="font-semibold">{order.status}</span>
            </div>
          </div>
          <Link
            to={`/orders/${order.id}`}
            className="font-body text-sm font-semibold text-bordo underline"
          >
            Detaya Dön
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6 lg:col-span-2">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <h2 className="font-display text-2xl font-bold text-bordo">Alıcı Bilgileri</h2>
                <div className="mt-1 font-body text-sm text-[#1A1A1A]/70">Sipariş detaylarını güncelle.</div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-body text-sm font-semibold text-[#1A1A1A]">Ad Soyad</label>
                  <input
                    className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-semibold text-[#1A1A1A]">E-posta</label>
                  <input
                    className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-semibold text-[#1A1A1A]">Telefon</label>
                  <input
                    className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    type="tel"
                    autoComplete="tel"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-body text-sm font-semibold text-[#1A1A1A]">Adres</label>
                  <input
                    className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
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
                      Notu ekleyin veya kaldırın.
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
                Kaydet
              </button>
            </form>
          </div>

          <aside className="rounded-lg border border-[#1A1A1A]/10 bg-white p-5">
            <div className="font-display text-xl font-bold text-bordo">Özet</div>
            <div className="mt-4 space-y-2 font-body text-sm text-[#1A1A1A]/70">
              <div>
                Durum: <span className="font-semibold text-[#1A1A1A]">{order.status}</span>
              </div>
              <div>
                Toplam: <span className="font-semibold text-bordo">{order.total}₺</span>
              </div>
              <div>Not: {order.giftNote ? 'Var' : 'Yok'}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

