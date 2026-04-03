import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'

function statusStyles(status) {
  const normalized = String(status).toLowerCase()
  if (normalized.includes('kargo') || normalized.includes('yolda')) {
    return 'bg-blue-600 text-white'
  }
  if (normalized.includes('teslim')) {
    return 'bg-green-600 text-white'
  }
  if (normalized.includes('iptal')) {
    return 'bg-red-600 text-white'
  }
  return 'bg-amber-500 text-white' // Hazırlanıyor, preparing, oluşturuldu vb. için
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { orders } = useOrders()

  const order = useMemo(() => {
    return orders?.find(o => String(o.id) === String(id) || String(o._id) === String(id)) ?? null
  }, [id, orders])

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

  // 1. GEREKSİNİM: ALICI BİLGİLERİ (Postman'deki farklı API formatlarına karşı tam korumalı yapı)
  // Alıcı bilgileri için Mega-Fallback (Akla gelebilecek tüm ihtimaller)
  const buyerName = order.buyer?.fullName || order.shippingAddress?.fullName || order.recipient || order.user?.name || order.fullName || 'Belirtilmedi'
  const buyerEmail = order.buyer?.email || order.shippingAddress?.email || order.contactEmail || order.email || order.user?.email || 'Belirtilmedi'
  const buyerPhone = order.buyer?.phone || order.shippingAddress?.phone || order.contactPhone || order.phone || order.user?.phone || 'Belirtilmedi'
  const buyerAddress = order.buyer?.address || order.shippingAddress?.address || order.address || order.deliveryAddress || 'Belirtilmedi'

  // 2. GEREKSİNİM: SADECE KARGOYA VERİLMEDEN ÖNCE GÜNCELLENEBİLİR / İPTAL EDİLEBİLİR
  const statusStr = String(order.status).toLowerCase()
  const isCanceled = statusStr.includes('iptal') || statusStr.includes('cancel')
  // Kargoda, yolda veya teslim edildiyse işlem yapılamaz:
  const isShippedOrDelivered = statusStr.includes('kargo') || statusStr.includes('yolda') || statusStr.includes('teslim')

  // Sadece iptal edilmemiş ve henüz yola çıkmamış siparişler düzenlenebilir
  const canEdit = !isCanceled && !isShippedOrDelivered

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
          <span>{order.id || order._id}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="font-display text-3xl font-bold text-bordo">
              Sipariş No: {order.id || order._id}
            </div>
            <div className="mt-3 font-body text-sm text-[#1A1A1A]">
              Tarih: {order.date || order.createdAt?.substring(0, 10)}
            </div>
            <div className="mt-4 inline-flex items-center rounded-md px-3 py-1 font-body text-xs font-semibold">
              <span className={`px-3 py-1 rounded-full ${statusStyles(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="font-body text-sm font-semibold text-[#1A1A1A]">
              Tutar
            </div>
            <div className="mt-2 font-body text-3xl font-bold text-bordo">
              {order.total || order.totalPrice}₺
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
                {order.items?.reduce((sum, it) => sum + (it.qty || it.quantity || 1), 0)} adet
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={`${order.id || order._id}-${idx}`}
                  className="flex items-start gap-4 rounded-md border border-[#1A1A1A]/10 bg-krem p-4"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-bej">
                    {(item.image || item.imageUrl) ? (
                      <img src={item.image || item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-body text-sm font-semibold text-[#1A1A1A]">
                      {item.name}
                    </div>
                    <div className="mt-1 font-body text-sm text-[#1A1A1A]/70">
                      {item.qty || item.quantity || 1} adet · {item.price}₺ birim
                    </div>
                  </div>
                  <div className="font-body text-sm font-semibold text-bordo">
                    {item.price * (item.qty || item.quantity || 1)}₺
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="font-body text-sm font-semibold text-[#1A1A1A]">Alıcı Bilgileri</div>
            <div className="mt-3 space-y-2 font-body text-sm text-[#1A1A1A]/70">
              <div>
                <span className="font-semibold text-[#1A1A1A]">Ad:</span> {buyerName}
              </div>
              <div>
                <span className="font-semibold text-[#1A1A1A]">E-posta:</span> {buyerEmail}
              </div>
              <div>
                <span className="font-semibold text-[#1A1A1A]">Telefon:</span> {buyerPhone}
              </div>
              <div>
                <span className="font-semibold text-[#1A1A1A]">Adres:</span>{' '}
                <span className="whitespace-pre-wrap">{buyerAddress}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {canEdit ? (
            <>
              <Link
                to={`/orders/${order.id || order._id}/update`}
                className="inline-flex rounded-md border border-bordo bg-white px-4 py-2 font-body text-sm font-semibold text-bordo transition hover:bg-bordo hover:text-white"
              >
                Siparişi Güncelle
              </Link>
              <Link
                to={`/orders/${order.id || order._id}/cancel`}
                className="inline-flex rounded-md bg-red-600 px-4 py-2 font-body text-sm font-semibold text-white transition hover:opacity-90"
              >
                Siparişi İptal Et
              </Link>
            </>
          ) : (
            <div className={`font-body text-sm font-semibold ${isCanceled ? 'text-red-600' : 'text-green-600'}`}>
              Bu sipariş {isCanceled ? 'iptal edildiği' : 'kargoya verildiği/teslim edildiği'} için değişiklik yapılamaz.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}