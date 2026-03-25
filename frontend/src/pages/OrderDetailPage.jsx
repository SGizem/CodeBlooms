import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { mockOrders } from '../data/mockOrders'

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
  const order = useMemo(() => {
    return mockOrders.find((o) => o.id === id) ?? null
  }, [id])

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

        <div className="mt-6 rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
          <div className="font-body text-sm font-semibold text-[#1A1A1A]">
            Ürünler
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 font-body text-sm text-[#1A1A1A]">
            {order.items.map((item, idx) => (
              <li key={`${order.id}-${idx}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

