import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useOrders } from '../context/OrdersContext'

export default function OrderCancelPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // orderById YERİNE orders ALINDI
  const { orders, cancelOrder } = useOrders()

  // get(id) YERİNE find KULLANILDI
  const order = useMemo(() => {
    return orders?.find(o => String(o.id) === String(id) || String(o._id) === String(id)) ?? null
  }, [id, orders])
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

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

  const isAlreadyCanceled = String(order.status).toLowerCase().includes('iptal')

  function onCancel() {
    setError('')
    if (isAlreadyCanceled) {
      navigate(`/orders/${order.id}`)
      return
    }
    if (confirmText.trim().toLowerCase() !== 'iptal') {
      setError('İptal etmek için “iptal” yazmalısınız.')
      return
    }
    cancelOrder(order.id)
    navigate(`/orders/${order.id}`)
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-bordo">Siparişi İptal Et</h1>
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

            <div className="mt-5 space-y-4">
              <div>
                <div className="font-body text-sm font-semibold text-[#1A1A1A]">
                  Onay: İptal etmek için `iptal` yazın
                </div>
                <input
                  className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  type="text"
                  placeholder="iptal"
                  disabled={isAlreadyCanceled}
                />
              </div>

              {error ? (
                <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 font-body text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-2 font-body text-sm font-semibold text-bordo transition hover:bg-bordo hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isAlreadyCanceled}
                  className="rounded-md bg-red-600 px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  İptal Onayı
                </button>
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-[#1A1A1A]/10 bg-white p-5">
            <div className="font-display text-xl font-bold text-bordo">Sipariş Özeti</div>
            <div className="mt-4 space-y-2 font-body text-sm text-[#1A1A1A]/70">
              <div>
                Toplam: <span className="font-semibold text-bordo">{order.total}₺</span>
              </div>
              <div>
                Ürün: <span className="font-semibold text-[#1A1A1A]">{order?.items?.length || 0}</span>
              </div>
              <div>
                Tarih: <span className="font-semibold text-[#1A1A1A]">{order.date}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

