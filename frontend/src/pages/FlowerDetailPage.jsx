import { useContext, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { mockFlowers } from '../data/mockFlowers'

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
  const flowerId = Number(id)

  const flower = useMemo(() => {
    return mockFlowers.find((f) => f.id === flowerId) ?? null
  }, [flowerId])

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
          <div className="rounded-lg bg-white p-2">
            <img
              src={flower.image}
              alt={flower.name}
              className="h-full w-full rounded-md object-cover"
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
              className="w-full rounded-md bg-bordo px-5 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Sepete Ekle
            </button>

            <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-4 font-body text-sm text-[#1A1A1A]">
              Sevdikleriniz için hazır. Hızlı hazırlanır ve özenle kargoya
              verilir.
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-4 md:space-y-5">
          <AccordionItem title="Ürün Bilgisi">
            Doğal tonları ve özenle seçilmiş çiçekleriyle bu buket, her
            mevsimde zarif bir dokunuş sunar. Renkler ve form, gönderim
            boyunca tazeliği koruyacak şekilde hazırlanır.
          </AccordionItem>
          <AccordionItem title="İade Politikası">
            Ürün tesliminden itibaren 14 gün içinde iade talebi
            oluşturabilirsiniz. İade koşulları ve paketleme kuralları için
            lütfen destek ekibimizle iletişime geçin.
          </AccordionItem>
        </div>
      </div>
    </div>
  )
}

