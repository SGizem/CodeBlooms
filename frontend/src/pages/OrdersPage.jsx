import { Link } from 'react-router-dom'
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

export default function OrdersPage() {
  const { orders } = useOrders()

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-4xl font-bold text-bordo">
          Siparişlerim
        </h1>

        {orders.length === 0 ? (
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-lg bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-3xl" aria-hidden="true">
              💐
            </div>
            <div className="font-body text-sm font-semibold text-[#1A1A1A] sm:text-base">
              Henüz siparişiniz bulunmuyor
            </div>
            <Link
              to="/flowers"
              className="rounded-md bg-bordo px-6 py-2 font-body text-sm font-semibold text-white transition hover:shadow-md"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-lg border border-[#1A1A1A]/10 bg-white p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="font-body text-sm font-semibold text-[#1A1A1A]">
                      Sipariş No: {order.id}
                    </div>
                    <div className="font-body text-sm text-[#1A1A1A]">
                      Tarih: {order.date}
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center justify-center rounded-md px-3 py-1 font-body text-xs font-semibold ${statusStyles(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-body text-sm text-[#1A1A1A]">
                    <span className="font-semibold">Ürünler:</span>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {order.items.map((item, idx) => (
                        <li key={`${order.id}-${idx}`}>
                          {item.name} x{item.qty}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-right">
                    <div className="font-body text-sm text-[#1A1A1A]">
                      Tutar
                    </div>
                    <div className="font-body text-2xl font-bold text-bordo">
                      {order.total}₺
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex rounded-md border border-bordo bg-white px-4 py-2 font-body text-sm font-semibold text-bordo transition hover:bg-bordo hover:text-white"
                  >
                    Detay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

