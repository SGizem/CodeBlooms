import { useContext } from 'react'
import { Link } from 'react-router-dom'
import FlowerCard from '../components/FlowerCard'
import { CartContext } from '../context/CartContext'
import { mockFlowers } from '../data/mockFlowers'

export default function HomePage() {
  const cart = useContext(CartContext)
  const featured = [mockFlowers[0], mockFlowers[2], mockFlowers[4]].filter(Boolean)

  return (
    <div className="w-full">
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490750967868-88df5691cc9e?w=1400"
          alt="Çiçek arka planı"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-bordo/35" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center justify-center px-4 text-center">
          <div className="space-y-5">
            <div className="font-display text-4xl font-bold tracking-[0.22em] text-white sm:text-6xl">
              CODEBLOOMS
            </div>
            <div className="font-body text-lg text-white/95 sm:text-2xl">
              Taze, Mevsimlik, Güzel
            </div>
            <Link
              to="/flowers"
              className="inline-flex items-center justify-center rounded-md bg-bordo px-7 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md sm:text-base"
            >
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-bordo sm:text-4xl">
          Öne Çıkanlar
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {featured.map((flower) => (
            <FlowerCard
              key={flower.id}
              {...flower}
              onAddToCart={(id) => cart.addToCart(id, 1)}
            />
          ))}
        </div>
      </section>

      <section className="w-full bg-bordo">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center">
          <div className="font-body text-lg font-semibold text-white sm:text-2xl">
            Sevgililer Günü İndirimi — Tüm Buketlerde %10
          </div>
        </div>
      </section>
    </div>
  )
}

