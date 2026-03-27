import { useContext, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Star, Trash2, ShoppingCart } from 'lucide-react'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

const FALLBACK = 'https://images.unsplash.com/photo-1487530811015-780780b58c25?w=600&q=80'
const CURRENT_USER = 'mock-user-123'

const INITIAL_COMMENTS = [
  {
    id: 1, userId: 'other-1', userName: 'Elif T.', rating: 5,
    text: 'Harika bir buket, çok taze geldi ve kokusu muhteşemdi!', date: '20 Mart 2026'
  },
  {
    id: 2, userId: CURRENT_USER, userName: 'Sen', rating: 4,
    text: 'Çok beğendim, ambalajı da çok şıktı.', date: '18 Mart 2026'
  },
  {
    id: 3, userId: 'other-2', userName: 'Mehmet K.', rating: 5,
    text: 'Annem çok sevdi, kesinlikle tavsiye ederim.', date: '15 Mart 2026'
  },
]

function StarRow({ count, interactive = false, hovered = 0, onHover, onLeave, onClick }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || count) >= star
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && onHover?.(star)}
            onMouseLeave={() => interactive && onLeave?.()}
            onClick={() => interactive && onClick?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            aria-label={`${star} yıldız`}
          >
            <Star
              size={interactive ? 26 : 16}
              fill={filled ? '#F59E0B' : 'none'}
              className={filled ? 'text-amber-400' : 'text-gray-300'}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
    </div>
  )
}

function CommentsBlock({ productId }) {
  const [comments, setComments] = useState(() =>
    INITIAL_COMMENTS.map(c => ({ ...c, productId }))
  )
  const [hoverRating, setHoverRating] = useState(0)
  const [newRating, setNewRating] = useState(0)
  const [newText, setNewText] = useState('')
  const [formError, setFormError] = useState('')

  const avgRating = comments.length
    ? Math.round(comments.reduce((s, c) => s + c.rating, 0) / comments.length)
    : 0

  function handleAdd() {
    if (!newRating) { setFormError('Lütfen bir puan seçin.'); return }
    if (!newText.trim()) { setFormError('Lütfen yorum yazın.'); return }
    setFormError('')
    setComments(prev => [{
      id: Date.now(), userId: CURRENT_USER, userName: 'Sen',
      rating: newRating, text: newText.trim(),
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      productId,
    }, ...prev])
    setNewRating(0)
    setNewText('')
  }

  function handleDelete(id) {
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl font-bold text-[#7B1C3E]">
          Değerlendirmeler ({comments.length})
        </h2>
        {avgRating > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-display text-4xl font-bold text-[#7B1C3E]">{avgRating}</span>
            <StarRow count={avgRating} />
          </div>
        )}
      </div>

      {/* Add comment form */}
      <div className="bg-[#F5F0E8] rounded-2xl p-6 mb-8">
        <h3 className="font-display text-xl font-semibold text-[#1A1A1A] mb-4">Değerlendirmenizi Paylaşın</h3>
        <div className="mb-4">
          <StarRow
            count={newRating}
            interactive
            hovered={hoverRating}
            onHover={setHoverRating}
            onLeave={() => setHoverRating(0)}
            onClick={setNewRating}
          />
        </div>
        <textarea
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Deneyiminizi paylaşın..."
          rows={4}
          className="w-full rounded-xl border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm text-[#1A1A1A] outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20 resize-none"
        />
        {formError && (
          <p className="mt-2 text-sm text-red-600 font-jost">{formError}</p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newRating || !newText.trim()}
          className="mt-4 px-6 py-3 rounded-full bg-[#7B1C3E] text-white font-jost text-sm tracking-wider hover:bg-[#5a1530] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Yorumu Gönder
        </button>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-10 text-[#1A1A1A]/50 font-jost">
          Henüz yorum yok. İlk yorumu sen yazabilirsin.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-jost font-semibold text-[#1A1A1A]">{c.userName}</span>
                    <span className="text-gray-400 text-xs font-jost">{c.date}</span>
                  </div>
                  <StarRow count={c.rating} />
                </div>
                {c.userId === CURRENT_USER && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    aria-label="Yorumu sil"
                    className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="mt-3 font-jost text-sm text-[#1A1A1A]/80 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function FlowerDetailPage() {
  const { id } = useParams()
  const cart = useContext(CartContext)
  const { productById } = useProducts()
  const flowerId = String(id)
  const flower = useMemo(() => {
    return productById.get(flowerId) ?? null
  }, [flowerId, productById])

  const hasDiscount = !!flower?.originalPrice && flower.originalPrice > flower.price
  const [qty, setQty] = useState(1)

  const isInCart = !!(cart?.items?.[flower?.id])

  if (!flower) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-[#7B1C3E]">Ürün bulunamadı</h1>
        <Link
          to="/flowers"
          className="mt-6 inline-flex rounded-full bg-[#7B1C3E] px-5 py-2 font-jost text-sm font-semibold text-white"
        >
          Çiçeklere Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="font-jost text-sm text-[#1A1A1A] mb-8">
          <Link to="/" className="text-[#7B1C3E] hover:underline">Anasayfa</Link>
          {' '}<span aria-hidden="true">&gt;</span>{' '}
          <Link to="/flowers" className="text-[#7B1C3E] hover:underline">Çiçekler</Link>
          {' '}<span aria-hidden="true">&gt;</span>{' '}
          <span className="text-[#1A1A1A]/60">{flower.name}</span>
        </nav>

        {/* ÜSTTE: Ürün resmi + bilgiler */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
          {/* Sol: resim */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <img
              src={flower.image}
              alt={flower.name}
              className="w-full aspect-square object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK }}
            />
          </div>

          {/* Sağ: bilgiler */}
          <div>
            <h1 className="font-display text-4xl font-bold text-[#7B1C3E] leading-tight">
              {flower.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-4">
              <span className="font-display text-3xl font-bold text-[#7B1C3E]">{flower.price}₺</span>
              {hasDiscount && (
                <span className="font-jost text-sm text-[#1A1A1A]/50 line-through">{flower.originalPrice}₺</span>
              )}
            </div>

            {flower.description && (
              <p className="mt-5 font-jost text-sm leading-relaxed text-[#1A1A1A]/75">
                {flower.description}
              </p>
            )}

            {/* Adet Seçici */}
            <div className="flex items-center gap-4 my-6">
              <button
                type="button"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border border-[#7B1C3E] text-[#7B1C3E] text-xl flex items-center justify-center hover:bg-[#7B1C3E] hover:text-white transition-all"
              >
                −
              </button>
              <span className="font-jost text-xl font-semibold w-8 text-center">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 rounded-full border border-[#7B1C3E] text-[#7B1C3E] text-xl flex items-center justify-center hover:bg-[#7B1C3E] hover:text-white transition-all"
              >
                +
              </button>
            </div>

            {/* DUAL BUTTONS: Sepete Ekle + Sepetten Çıkar */}
            <div className="flex flex-col gap-3 mt-2">
              {/* Her zaman görünür */}
              <button
                type="button"
                onClick={() => cart.addToCart(flower.id, qty)}
                className="w-full py-4 rounded-full bg-[#7B1C3E] text-white font-jost tracking-wider hover:bg-[#5a1530] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Sepete Ekle
              </button>

              {/* Sepette varsa görünür */}
              {isInCart && (
                <button
                  type="button"
                  onClick={() => cart.removeFromCart(flower.id)}
                  className="w-full py-4 rounded-full border-2 border-red-400 text-red-500 font-jost tracking-wider hover:bg-red-50 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Sepetten Çıkar
                </button>
              )}
            </div>

            {/* Özellikler Grid */}
            <div className="grid grid-cols-2 gap-3 mt-5 p-4 bg-[#F5F0E8] rounded-xl text-sm font-jost">
              <div className="flex items-center gap-2 text-[#1A1A1A]/70"><span>🌿</span><span>Taze Garanti</span></div>
              <div className="flex items-center gap-2 text-[#1A1A1A]/70"><span>📦</span><span>Özel Ambalaj</span></div>
              <div className="flex items-center gap-2 text-[#1A1A1A]/70"><span>🚚</span><span>Aynı Gün Teslimat</span></div>
              <div className="flex items-center gap-2 text-[#1A1A1A]/70"><span>💌</span><span>Hediye Notu</span></div>
            </div>
          </div>
        </div>

        {/* ALTTA: Yorumlar */}
        <CommentsBlock productId={flower.id} />
      </div>
    </div>
  )
}
