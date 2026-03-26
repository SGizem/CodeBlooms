import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useOrders } from '../context/OrdersContext'

const FALLBACK = 'https://images.unsplash.com/photo-1487530811015-780780b58c25?w=200&q=80'

function StatusBadge({ status, statusLabel }) {
  const s = String(status).toLowerCase()
  const sl = String(statusLabel || status).toLowerCase()

  if (sl.includes('hazırlanıyor') || sl.includes('oluşturuldu') || s.includes('oluşturuldu')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-jost font-semibold">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        {statusLabel || 'Hazırlanıyor'}
      </span>
    )
  }
  if (sl.includes('yolda') || sl.includes('kargoda')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-jost font-semibold">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        {statusLabel || 'Yolda'} 🚚
      </span>
    )
  }
  if (sl.includes('teslim')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-jost font-semibold">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        Teslim Edildi ✓
      </span>
    )
  }
  if (sl.includes('iptal')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-jost font-semibold">
        <span className="w-2 h-2 bg-gray-400 rounded-full" />
        İptal Edildi
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7B1C3E]/10 text-[#7B1C3E] rounded-full text-xs font-jost font-semibold">
      <span className="w-2 h-2 bg-[#7B1C3E] rounded-full" />
      {statusLabel || status}
    </span>
  )
}

function isActive(status) {
  const s = String(status).toLowerCase()
  return !s.includes('teslim') && !s.includes('iptal')
}

function EditModal({ order, onSave, onClose }) {
  const [address, setAddress] = useState(order.buyer?.address ?? order.address ?? '')
  const [recipient, setRecipient] = useState(order.buyer?.fullName ?? order.recipient ?? '')
  const [giftNote, setGiftNote] = useState(order.giftNote ?? '')

  function handleSave() {
    onSave(order.id, {
      buyer: { ...order.buyer, address, fullName: recipient },
      giftNote: giftNote.trim() || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-[#7B1C3E]">Siparişi Güncelle</h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1A1A1A]/50 hover:bg-[#F5F0E8] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Alıcı Adı</label>
            <input
              className="w-full rounded-lg border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
              value={recipient} onChange={e => setRecipient(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Teslimat Adresi</label>
            <textarea
              className="w-full resize-none rounded-lg border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
              rows={3} value={address} onChange={e => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Hediye Notu</label>
            <textarea
              className="w-full resize-none rounded-lg border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
              rows={2} value={giftNote} onChange={e => setGiftNote(e.target.value)}
              placeholder="İsteğe bağlı..."
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={handleSave}
            className="flex-1 rounded-full bg-[#7B1C3E] py-3 font-jost text-sm font-semibold text-white hover:bg-[#5a1530] active:scale-95 transition-all">
            Kaydet
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 rounded-full border border-[#EDE8DE] bg-white py-3 font-jost text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F0E8] active:scale-95 transition-all">
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}

function CancelConfirm({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-xl font-bold text-[#7B1C3E] mb-3">Siparişi İptal Et</h2>
        <p className="font-jost text-sm text-[#1A1A1A]/70 mb-6">
          Siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onConfirm}
            className="flex-1 rounded-full bg-red-600 py-3 font-jost text-sm font-semibold text-white hover:bg-red-700 active:scale-95 transition-all">
            Evet, İptal Et
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 rounded-full border border-[#EDE8DE] py-3 font-jost text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F0E8] transition-all">
            Hayır
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onEdit, onCancel, onDeleteGiftNote }) {
  const active = isActive(order.status)
  const [noteVisible, setNoteVisible] = useState(true)
  const statusLabel = order.statusLabel || order.status

  const handleNoteDelete = () => {
    setNoteVisible(false)
    setTimeout(() => onDeleteGiftNote(order.id), 300)
  }

  const firstItem = order.items?.[0]
  const buyerName = order.buyer?.fullName || order.recipient || ''
  const buyerAddress = order.buyer?.address || order.address || ''

  return (
    <article className="rounded-2xl border border-[#EDE8DE] bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      {/* Product image + order info side by side */}
      <div className="flex gap-4 items-start">
        {/* Product image */}
        <img
          src={firstItem?.image || FALLBACK}
          alt={firstItem?.name ?? 'Ürün'}
          className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK }}
        />

        <div className="flex-1 min-w-0">
          {/* Status badge + date */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <StatusBadge status={order.status} statusLabel={statusLabel} />
            <span className="font-jost text-xs text-[#1A1A1A]/50 ml-auto">{order.date}</span>
          </div>

          {/* Order ID */}
          <p className="font-jost text-sm font-semibold text-[#7B1C3E]">#{order.id}</p>

          {/* Items list */}
          {order.items?.map((item, i) => (
            <p key={i} className="font-jost text-sm text-[#1A1A1A]/80 mt-1">
              {item.name} × {item.qty} — {item.price}₺
            </p>
          ))}

          {/* Total */}
          <p className="font-jost font-semibold text-[#1A1A1A] mt-2">Toplam: {order.total}₺</p>
        </div>
      </div>

      {/* Address + Recipient */}
      {(buyerAddress || buyerName) && (
        <div className="mt-4 text-xs font-jost text-[#1A1A1A]/60 space-y-0.5 border-t border-[#EDE8DE] pt-4">
          {buyerName && <div>Alıcı: <span className="font-semibold text-[#1A1A1A]/80">{buyerName}</span></div>}
          {buyerAddress && <div>Adres: {buyerAddress}</div>}
        </div>
      )}

      {/* Gift note */}
      {order.giftNote && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl bg-[#F5F0E8] px-4 py-3 transition-opacity duration-300 ${noteVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className="text-sm">💌</span>
          <span className="flex-1 font-jost text-xs text-[#1A1A1A]/70">{order.giftNote}</span>
          <button
            type="button"
            onClick={handleNoteDelete}
            className="text-[#1A1A1A]/40 hover:text-red-500 transition-colors"
            aria-label="Hediye notunu sil"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex rounded-full border border-[#7B1C3E] bg-white px-4 py-2 font-jost text-sm font-semibold text-[#7B1C3E] transition-all hover:bg-[#7B1C3E] hover:text-white active:scale-95"
        >
          Detay
        </Link>
        {active && (
          <>
            <button
              type="button"
              onClick={() => onEdit(order)}
              className="inline-flex rounded-full bg-[#F5F0E8] px-4 py-2 font-jost text-sm font-semibold text-[#7B1C3E] transition-all hover:bg-[#7B1C3E] hover:text-white active:scale-95"
            >
              Düzenle
            </button>
            <button
              type="button"
              onClick={() => onCancel(order.id)}
              className="inline-flex rounded-full border border-red-200 bg-white px-4 py-2 font-jost text-sm font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white active:scale-95"
            >
              İptal Et
            </button>
          </>
        )}
      </div>
    </article>
  )
}

export default function OrdersPage() {
  const { orders, updateOrder, cancelOrder } = useOrders()
  const [tab, setTab] = useState('active')
  const [editingOrder, setEditingOrder] = useState(null)
  const [cancelId, setCancelId] = useState(null)

  const activeOrders = useMemo(() => orders.filter(o => isActive(o.status)), [orders])
  const pastOrders = useMemo(() => orders.filter(o => !isActive(o.status)), [orders])
  const displayOrders = tab === 'active' ? activeOrders : pastOrders

  function handleSave(orderId, updates) {
    updateOrder(orderId, updates)
  }

  function handleConfirmCancel() {
    if (cancelId) {
      cancelOrder(cancelId)
      setCancelId(null)
    }
  }

  function handleDeleteGiftNote(orderId) {
    updateOrder(orderId, { giftNote: null })
  }

  if (orders.length === 0) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="font-display text-4xl font-bold text-[#7B1C3E]">Siparişlerim</h1>
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-3xl" aria-hidden="true">💐</div>
            <div className="font-jost text-sm font-semibold text-[#1A1A1A] sm:text-base">
              Henüz siparişiniz bulunmuyor
            </div>
            <Link to="/flowers"
              className="rounded-full bg-[#7B1C3E] px-6 py-2 font-jost text-sm font-semibold text-white transition-all hover:shadow-md active:scale-95">
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
        <h1 className="font-display text-4xl font-bold text-[#7B1C3E]">Siparişlerim</h1>

        {/* Tabs */}
        <div className="mt-8 flex border-b border-[#EDE8DE]">
          <button type="button" onClick={() => setTab('active')}
            className={`px-6 py-3 font-jost text-sm font-semibold transition-all ${
              tab === 'active'
                ? 'border-b-2 border-[#7B1C3E] text-[#7B1C3E]'
                : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}>
            Aktif Siparişlerim ({activeOrders.length})
          </button>
          <button type="button" onClick={() => setTab('past')}
            className={`px-6 py-3 font-jost text-sm font-semibold transition-all ${
              tab === 'past'
                ? 'border-b-2 border-[#7B1C3E] text-[#7B1C3E]'
                : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}>
            Geçmiş Siparişlerim ({pastOrders.length})
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {displayOrders.length === 0 ? (
            <div className="rounded-2xl border border-[#EDE8DE] bg-white p-8 text-center">
              <p className="font-jost text-sm text-[#1A1A1A]/50">
                {tab === 'active' ? 'Aktif siparişiniz yok.' : 'Geçmiş siparişiniz yok.'}
              </p>
            </div>
          ) : (
            displayOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onEdit={setEditingOrder}
                onCancel={setCancelId}
                onDeleteGiftNote={handleDeleteGiftNote}
              />
            ))
          )}
        </div>
      </div>

      {editingOrder && (
        <EditModal order={editingOrder} onSave={handleSave} onClose={() => setEditingOrder(null)} />
      )}

      {cancelId && (
        <CancelConfirm onConfirm={handleConfirmCancel} onClose={() => setCancelId(null)} />
      )}
    </div>
  )
}
