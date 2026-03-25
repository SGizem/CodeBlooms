import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import FlowerCard from '../components/FlowerCard'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

export default function HomePage() {
  const cart = useContext(CartContext)
  const { products } = useProducts()

  // Pick the 3 named featured products (first 3 in the array)
  const featured = products.slice(0, 3)

  return (
    <div className="w-full">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[100svh] overflow-hidden" id="hero-section">
        <style>{`
          @keyframes heroZoom {
            0% { transform: scale(1); }
            50% { transform: scale(1.06); }
            100% { transform: scale(1); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1644248423203-80e317d78aee?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ animation: 'heroZoom 20s ease-in-out infinite' }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50" />

        {/* Content */}
        <div className="relative mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 text-center">
          <div style={{ animation: 'fadeUp 1s ease-out' }}>
            {/* Subtitle */}
            <p className="mb-4 font-body text-xs font-light uppercase tracking-[0.35em] text-white/70 sm:text-sm">
              Taze Çiçekler & Zarif Hediyeler
            </p>

            {/* Main heading */}
            <h1 className="font-display text-5xl font-semibold leading-[1.1] text-white drop-shadow-md sm:text-7xl lg:text-8xl">
              Çiçeklerle
              <br />
              <span className="italic">Mutluluk</span> Taşıyın
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-lg font-body text-base font-light leading-relaxed text-white/80 sm:text-lg">
              Özenle hazırlanan buketlerimiz, sevdiklerinize en güzel şekilde ulaşsın.
              Aynı gün teslimat ile anları özel kılın.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/flowers"
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 font-body text-sm font-semibold text-bordo shadow-xl shadow-black/10 transition-all duration-300 hover:bg-bordo hover:text-white hover:shadow-2xl"
                id="hero-cta-primary"
              >
                Çiçekleri Keşfet
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 font-body text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                id="hero-cta-secondary"
              >
                Siparişlerim
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-krem to-transparent" />
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="featured-section">
        {/* Section heading */}
        <div className="mb-14 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-bordo/60" strokeWidth={1.5} />
            <span className="font-body text-xs font-medium uppercase tracking-[0.2em] text-bordo/70">
              Seçili Ürünler
            </span>
            <Sparkles className="h-4 w-4 text-bordo/60" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-4xl font-semibold text-[#1A1A1A] sm:text-5xl" id="featured-heading">
            Öne Çıkanlar
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-bordo/30" />
        </div>

        {/* 3-column product grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" id="featured-grid">
          {featured.map((flower) => (
            <FlowerCard
              key={flower.id}
              {...flower}
              onAddToCart={(fId) => cart.addToCart(fId, 1)}
            />
          ))}
        </div>

        {/* View all link */}
        <div className="mt-14 text-center">
          <Link
            to="/flowers"
            className="group inline-flex items-center gap-2 font-body text-sm font-medium text-bordo transition-colors hover:text-[#601530]"
            id="view-all-link"
          >
            Tüm Çiçekleri Görüntüle
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="w-full bg-bordo" id="promo-banner">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-14">
          <p className="font-body text-xs font-light uppercase tracking-[0.3em] text-white/60">
            Sınırlı Süre
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
            Sevgililer Günü İndirimi — Tüm Buketlerde %10
          </h2>
          <Link
            to="/flowers"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3 font-body text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
            id="promo-cta"
          >
            Fırsatları Keşfet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
