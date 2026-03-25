import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../context/OrdersContext'
import { X } from 'lucide-react'

function statusBadge(status) {
  const s = String(status).toLowerCase()
  if (s.includes('hazırlanıyor') || s.includes('oluşturuldu'))
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  if (s.includes('yolda') || s.includes('kargoda'))
    return 'bg-blue-100 text-blue-700 border border-blue-200'
  if (s.includes('teslim'))
    return 'bg-green-100 text-green-700 border border-green-200'
  if (s.includes('iptal'))
    return 'bg-red-100 text-red-700 border border-red-200'
  return 'bg-[#7B1C3E]/10 text-[#7B1C3E] border border-[#7B1C3E]/20'
}

function isActive(status) {
  const s = String(status).toLowerCase()
  return !s.includes('teslim') && !s.includes('iptal')
}

function EditModal({ order, onSave, onClose }) {
  const [address, setAddress] = useState(order.buyer?.address ?? '')
  const [recipient, setRecipient] = useState(order.buyer?.fullName ?? '')
  const [giftNote, setGiftNote] = useState(order.giftNote ?? '')

  function handleSave() {
    onSave(order.id, {
      buyer: { address, fullName: recipient },
      giftNote: giftNote.trim() || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[#7B1C3E]">Siparişi Düzenle</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1A1A1A]/50 transition-colors hover:bg-[#F5F0E8] hover:text-[#1A1A1A]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block font-body text-sm font-semibold text-[#1A1A1A]">Alıcı Adı</label>
            <input
              className="mt-2 w-full rounded-lg border border-[#EDE8DE] bg-white p-3 font-body text-sm text-[#1A1A1A] outline-none transition-all duration-200 focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-[#1A1A1A]">Teslimat Adresi</label>
            <textarea
              className="mt-2 w-full resize-none rounded-lg border border-[#EDE8DE] bg-white p-3 font-body text-sm text-[#1A1A1A] outline-none transition-all duration-200 focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-[#1A1A1A]">Hediye Notu</label>
            <textarea
              className="mt-2 w-full resize-none rounded-lg border border-[#EDE8DE] bg-white p-3 font-body text-sm text-[#1A1A1A] outline-none transition-all duration-200 focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
              rows={2}
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              placeholder="İsteğe bağlı..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-[#7B1C3E] py-3 font-body text-sm font-semibold text-white transition-all duration-200 hover:bg-[#5a1530] active:scale-95"
          >
            Kaydet
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#EDE8DE] bg-white py-3 font-body text-sm font-semibold text-[#1A1A1A] transition-all duration-200 hover:bg-[#F5F0E8] active:scale-95"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onEdit }) {
  const active = isActive(order.status)

  return (
    <article className="rounded-xl border border-[#EDE8DE] bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="font-body text-sm font-semibold text-[#1A1A1A]">
            Sipariş No: <span className="text-[#7B1C3E]">{order.id}</span>
          </div>
          <div className="font-body text-xs text-[#1A1A1A]/50">Tarih: {order.date}</div>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 font-body text-xs font-semibold ${statusBadge(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="mt-4 font-body text-sm text-[#1A1A1A]">
        <span className="font-semibold">Ürünler:</span>
        <ul className="mt-2 space-y-1">
          {order.items.map((item, idx) => (
            <li key={`${order.id}-${idx}`} className="flex items-center gap-2 text-[#1A1A1A]/70">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7B1C3E]/40" />
              {item.name}
              <span className="text-[#1A1A1A]/40">×{item.qty}</span>
              <span className="ml-auto font-semibold text-[#7B1C3E]">{item.price * item.qty}₺</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between border-t border-[#EDE8DE] pt-4">
        <span className="font-body text-sm text-[#1A1A1A]/60">Toplam</span>
        <span className="font-display text-2xl font-bold text-[#7B1C3E]">{order.total}₺</span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex rounded-lg border border-[#7B1C3E] bg-white px-4 py-2 font-body text-sm font-semibold text-[#7B1C3E] transition-all duration-200 hover:bg-[#7B1C3E] hover:text-white active:scale-95"
        >
          Detay
        </Link>
        {active && (
          <button
            type="button"
            onClick={() => onEdit(order)}
            className="inline-flex rounded-lg bg-[#F5F0E8] px-4 py-2 font-body text-sm font-semibold text-[#7B1C3E] transition-all duration-200 hover:bg-[#7B1C3E] hover:text-white active:scale-95"
          >
            Düzenle
          </button>
        )}
      </div>
    </article>
  )
}

export default function OrdersPage() {
  const { orders, updateOrder } = useOrders()
  const [tab, setTab] = useState('active')
  const [editingOrder, setEditingOrder] = useState(null)

  const activeOrders = useMemo(() => orders.filter((o) => isActive(o.status)), [orders])
  const pastOrders = useMemo(() => orders.filter((o) => !isActive(o.status)), [orders])

  const displayOrders = tab === 'active' ? activeOrders : pastOrders

  function handleSave(orderId, updates) {
    updateOrder(orderId, updates)
  }

  if (orders.length === 0) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="font-display text-4xl font-bold text-bordo">Siparişlerim</h1>
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-xl bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-3xl" aria-hidden="true">💐</div>
            <div className="font-body text-sm font-semibold text-[#1A1A1A] sm:text-base">
              Henüz siparişiniz bulunmuyor
            </div>
            <Link
              to="/flowers"
              className="rounded-lg bg-bordo px-6 py-2 font-body text-sm font-semibold text-white transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-bordo">Siparişlerim</h1>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-xl bg-[#F5F0E8] p-1">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`flex-1 rounded-lg py-2.5 font-body text-sm font-semibold transition-all duration-200 ${
              tab === 'active'
                ? 'bg-white text-[#7B1C3E] shadow-sm'
                : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            Aktif Siparişlerim ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={`flex-1 rounded-lg py-2.5 font-body text-sm font-semibold transition-all duration-200 ${
              tab === 'past'
                ? 'bg-white text-[#7B1C3E] shadow-sm'
                : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            Geçmiş Siparişlerim ({pastOrders.length})
          </button>
        </div>

        {/* Order list */}
        <div className="mt-6 space-y-5">
          {displayOrders.length === 0 ? (
            <div className="rounded-xl border border-[#EDE8DE] bg-white p-8 text-center">
              <p className="font-body text-sm text-[#1A1A1A]/50">
                {tab === 'active' ? 'Aktif siparişiniz yok.' : 'Geçmiş siparişiniz yok.'}
              </p>
            </div>
          ) : (
            displayOrders.map((order) => (
              <OrderCard key={order.id} order={order} onEdit={setEditingOrder} />
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingOrder && (
        <EditModal
          order={editingOrder}
          onSave={handleSave}
          onClose={() => setEditingOrder(null)}
        />
      )}
    </div>
  )
}
