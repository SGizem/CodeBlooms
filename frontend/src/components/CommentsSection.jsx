import { useMemo, useState } from 'react'
import { useComments } from '../context/CommentsContext'

function StarRating({ rating, onRate, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1" aria-label={`Puan: ${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-xl leading-none transition-transform duration-100 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
          aria-label={`${star} yıldız`}
        >
          {star <= (hovered || rating) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function CommentsSection({ productId }) {
  const { commentsByProductId, addComment, deleteComment } = useComments()
  const pid = Number(productId)
  const comments = commentsByProductId.get(pid) ?? []

  const [form, setForm] = useState({ authorName: '', text: '', rating: 0 })
  const [error, setError] = useState('')
  const [lastAddedKey, setLastAddedKey] = useState(0)

  const countLabel = useMemo(() => {
    const c = comments.length
    if (c === 1) return '1 yorum'
    return `${c} yorum`
  }, [comments.length])

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.rating === 0) {
      setError('Lütfen bir puan seçin.')
      return
    }
    const res = addComment(pid, form)
    if (!res.ok) {
      setError(res.error || 'Yorum eklenemedi.')
      return
    }
    setForm({ authorName: '', text: '', rating: 0 })
    setLastAddedKey((k) => k + 1)
  }

  return (
    <section className="mt-10 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-bordo">Yorumlar</h2>
          <div className="mt-1 font-body text-sm text-[#1A1A1A]/70">{countLabel}</div>
        </div>
      </div>

      <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-5">
        {comments.length === 0 ? (
          <div className="py-6 text-center font-body text-sm text-[#1A1A1A]/70">
            Henüz yorum yok. İlk yorumu sen yazabilirsin.
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <article
                key={c.id}
                className="rounded-md border border-[#1A1A1A]/10 bg-krem p-4 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-body text-sm font-semibold text-[#1A1A1A]">{c.authorName}</div>
                    {c.rating > 0 && (
                      <div className="mt-0.5">
                        <StarRating rating={c.rating} readonly />
                      </div>
                    )}
                    <div className="mt-1 font-body text-xs text-[#1A1A1A]/60">{c.createdAt}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteComment(pid, c.id)}
                    className="rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-1 font-body text-xs font-semibold text-bordo transition hover:bg-bordo hover:text-white"
                    aria-label="Yorumu sil"
                  >
                    Sil
                  </button>
                </div>
                <p className="mt-3 font-body text-sm text-[#1A1A1A]">{c.text}</p>
              </article>
            ))}
          </div>
        )}

        <form
          key={lastAddedKey}
          className="mt-6 space-y-4 rounded-md border border-[#1A1A1A]/10 bg-white p-4"
          onSubmit={onSubmit}
        >
          <div>
            <label className="font-body text-sm font-semibold text-[#1A1A1A]">Puanınız</label>
            <div className="mt-2">
              <StarRating
                rating={form.rating}
                onRate={(r) => setForm((p) => ({ ...p, rating: r }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="font-body text-sm font-semibold text-[#1A1A1A]">Ad Soyad</label>
              <input
                className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                value={form.authorName}
                onChange={(e) => setForm((p) => ({ ...p, authorName: e.target.value }))}
                type="text"
                autoComplete="name"
                required
              />
            </div>
            <div className="sm:pt-7">
              <button
                type="submit"
                className="w-full rounded-md bg-bordo px-4 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Yorum Gönder
              </button>
            </div>
          </div>

          <div>
            <label className="font-body text-sm font-semibold text-[#1A1A1A]">Yorum</label>
            <textarea
              className="mt-2 min-h-[110px] w-full resize-none rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
              value={form.text}
              onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
              required
              maxLength={400}
            />
            <div className="mt-2 flex items-center justify-between font-body text-xs text-[#1A1A1A]/60">
              <span>En fazla 400 karakter</span>
              <span>{form.text.length}/400</span>
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 font-body text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  )
}
