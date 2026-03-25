import { useContext, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import CommentsSection from '../components/CommentsSection'

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-[#1A1A1A]/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-body text-sm font-semibold text-[#1A1A1A]"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-bordo">{open ? '—' : '+'}</span>
      </button>
      {open ? <div className="px-5 pb-5 text-sm font-body text-[#1A1A1A]">{children}</div> : null}
    </div>
  )
}

export default function FlowerDetailPage() {
  const { id } = useParams()
  const cart = useContext(CartContext)
  const { productById } = useProducts()
  const flowerId = Number(id)

  const flower = useMemo(() => {
    return productById.get(flowerId) ?? null
  }, [flowerId, productById])

  const hasDiscount = !!flower?.originalPrice && flower.originalPrice > flower.price
  const [qty, setQty] = useState(1)

  if (!flower) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-bordo">
          Ürün bulunamadı
        </h1>
        <Link
          to="/flowers"
          className="mt-6 inline-flex rounded-md bg-bordo px-5 py-2 font-body text-sm font-semibold text-white"
        >
          Çiçeklere Dön
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
          <Link to="/flowers" className="text-bordo">
            Çiçekler
          </Link>{' '}
          <span aria-hidden="true">&gt;</span>{' '}
          <span>{flower.name}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
          <div className="overflow-hidden rounded-xl bg-white">
            <img
              src={flower.image}
              alt={flower.name}
              className="aspect-square w-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1487530811015-780780b58c25?w=600&q=80' }}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-display text-4xl font-bold text-bordo">
                {flower.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-4">
                <div className="font-body text-2xl font-bold text-bordo">
                  {flower.price}₺
                </div>
                {hasDiscount ? (
                  <div className="font-body text-sm text-[#1A1A1A]/60 line-through">
                    {flower.originalPrice}₺
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="font-body text-sm font-semibold text-[#1A1A1A]">
                Adet
              </div>
              <div className="inline-flex items-center rounded-md border border-[#1A1A1A]/10 bg-white">
                <button
                  type="button"
                  className="px-4 py-2 font-body text-xl text-bordo disabled:opacity-40"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Azalt"
                >
                  -
                </button>
                <div className="px-4 py-2 font-body text-sm font-semibold text-[#1A1A1A]">
                  {qty}
                </div>
                <button
                  type="button"
                  className="px-4 py-2 font-body text-xl text-bordo"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Artır"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => cart.addToCart(flower.id, qty)}
              className="w-full rounded-md bg-bordo px-5 py-3 font-body text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#601530] hover:shadow-md active:scale-95"
            >
              Sepete Ekle
            </button>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F5F0E8] p-4 text-sm">
              <div className="flex items-center gap-2 font-body text-[#1A1A1A]/70">
                <span>🌿</span><span>Taze Garanti</span>
              </div>
              <div className="flex items-center gap-2 font-body text-[#1A1A1A]/70">
                <span>📦</span><span>Özel Ambalaj</span>
              </div>
              <div className="flex items-center gap-2 font-body text-[#1A1A1A]/70">
                <span>🚚</span><span>Aynı Gün Teslimat</span>
              </div>
              <div className="flex items-center gap-2 font-body text-[#1A1A1A]/70">
                <span>💌</span><span>Hediye Notu Ekle</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-4 md:space-y-5">
          <AccordionItem title="Ürün Bilgisi">
            {flower.description
              ? flower.description
              : 'Doğal tonları ve özenle seçilmiş çiçekleriyle bu buket, her mevsimde zarif bir dokunuş sunar.'}
          </AccordionItem>
          <AccordionItem title="İade Politikası">
            Ürün tesliminden itibaren 14 gün içinde iade talebi
            oluşturabilirsiniz. İade koşulları ve paketleme kuralları için
            lütfen destek ekibimizle iletişime geçin.
          </AccordionItem>
        </div>

        <CommentsSection productId={flower.id} />
      </div>
    </div>
  )
}

