import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'

function statusStyles(status) {
  const normalized = String(status).toLowerCase()
  if (normalized.includes('kargoda')) {
    return 'bg-bordo text-white'
  }
  if (normalized.includes('teslim')) {
    return 'bg-green-600 text-white'
  }
  if (normalized.includes('iptal')) {
    return 'bg-red-600 text-white'
  }
  return 'bg-[#1A1A1A] text-white'
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { orderById } = useOrders()
  const order = useMemo(() => {
    return orderById.get(id) ?? null
  }, [id, orderById])

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-bordo">
          Sipariş bulunamadı
        </h1>
        <Link
          to="/orders"
          className="mt-6 inline-flex rounded-md bg-bordo px-5 py-2 font-body text-sm font-semibold text-white"
        >
          Siparişlere Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <nav className="font-body text-sm text-[#1A1A1A]">
          <Link to="/" className="text-bordo">
            Anasayfa
          </Link>{' '}
          <span aria-hidden="true">&gt;</span>{' '}
          <Link to="/orders" className="text-bordo">
            Siparişlerim
          </Link>{' '}
          <span aria-hidden="true">&gt;</span>{' '}
          <span>{order.id}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="font-display text-3xl font-bold text-bordo">
              Sipariş No: {order.id}
            </div>
            <div className="mt-3 font-body text-sm text-[#1A1A1A]">
              Tarih: {order.date}
            </div>
            <div className="mt-4 inline-flex items-center rounded-md px-3 py-1 font-body text-xs font-semibold">
              <span className={statusStyles(order.status)}>{order.status}</span>
            </div>
          </div>

          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="font-body text-sm font-semibold text-[#1A1A1A]">
              Tutar
            </div>
            <div className="mt-2 font-body text-3xl font-bold text-bordo">
              {order.total}₺
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {order.giftNote ? (
            <div className="rounded-lg border border-[#1A1A1A]/10 bg-krem p-6">
              <div className="font-body text-sm font-semibold text-[#1A1A1A]">
                Hediye Notu
              </div>
              <div className="mt-3 font-body text-sm text-[#1A1A1A] whitespace-pre-wrap">
                {order.giftNote}
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="font-body text-sm font-semibold text-[#1A1A1A]">
                Ürünler
              </div>
              <div className="font-body text-xs text-[#1A1A1A]/60">
                {order.items.reduce((sum, it) => sum + it.qty, 0)} adet
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={`${order.id}-${idx}`}
                  className="flex items-start gap-4 rounded-md border border-[#1A1A1A]/10 bg-krem p-4"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-bej">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-body text-sm font-semibold text-[#1A1A1A]">
                      {item.name}
                    </div>
                    <div className="mt-1 font-body text-sm text-[#1A1A1A]/70">
                      {item.qty} adet · {item.price}₺ birim
                    </div>
                  </div>
                  <div className="font-body text-sm font-semibold text-bordo">
                    {item.price * item.qty}₺
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="font-body text-sm font-semibold text-[#1A1A1A]">Alıcı Bilgileri</div>
            <div className="mt-3 space-y-2 font-body text-sm text-[#1A1A1A]/70">
              <div>
                <span className="font-semibold text-[#1A1A1A]">Ad:</span> {order.buyer?.fullName || '—'}
              </div>
              <div>
                <span className="font-semibold text-[#1A1A1A]">E-posta:</span> {order.buyer?.email || '—'}
              </div>
              <div>
                <span className="font-semibold text-[#1A1A1A]">Telefon:</span> {order.buyer?.phone || '—'}
              </div>
              <div>
                <span className="font-semibold text-[#1A1A1A]">Adres:</span>{' '}
                <span className="whitespace-pre-wrap">{order.buyer?.address || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {String(order.status).toLowerCase().includes('iptal') ? (
            <div className="font-body text-sm font-semibold text-red-700">
              Bu sipariş iptal edilmiş durumda.
            </div>
          ) : (
            <>
              <Link
                to={`/orders/${order.id}/update`}
                className="inline-flex rounded-md border border-bordo bg-white px-4 py-2 font-body text-sm font-semibold text-bordo transition hover:bg-bordo hover:text-white"
              >
                Siparişi Güncelle
              </Link>
              <Link
                to={`/orders/${order.id}/cancel`}
                className="inline-flex rounded-md bg-red-600 px-4 py-2 font-body text-sm font-semibold text-white transition hover:opacity-90"
              >
                Siparişi İptal Et
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

