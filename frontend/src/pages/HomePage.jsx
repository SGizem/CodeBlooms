import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import FlowerCard from '../components/FlowerCard'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1487530811015-780780b58c25?w=1920&q=80'

export default function HomePage() {
  const cart = useContext(CartContext)
  const { products } = useProducts()
  const featured = products.slice(0, 3)

  return (
    <div className="w-full">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen overflow-hidden" id="hero-section">
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
        `}</style>

        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1644248423203-80e317d78aee?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ animation: 'heroZoom 20s ease-in-out infinite' }}
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG }}
        />

        {/* Dark overlay — CRITICAL for text legibility */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        {/* Content — z-10 required to appear above overlay */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
          <div style={{ animation: 'fadeUp 1s ease-out' }}>
            {/* Subtitle */}
            <p className="mb-4 font-body text-xs font-light uppercase tracking-[0.35em] text-white/85 sm:text-sm">
              Taze Çiçekler & Zarif Hediyeler
            </p>

            {/* Main heading — ALWAYS WHITE */}
            <h1
              className="text-white relative z-10 font-display text-5xl font-semibold leading-[1.1] drop-shadow-lg sm:text-7xl lg:text-8xl"
              style={{ color: 'white' }}
            >
              Çiçeklerle
              <br />
              <span className="italic">Mutluluk</span> Taşıyın
            </h1>

            {/* Description — WHITE */}
            <p className="mx-auto mt-6 max-w-lg font-body text-base font-light leading-relaxed text-white/85 sm:text-lg">
              Özenle hazırlanan buketlerimiz, sevdiklerinize en güzel şekilde ulaşsın.
              Aynı gün teslimat ile anları özel kılın.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/flowers"
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 font-body text-sm font-semibold text-bordo shadow-xl shadow-black/10 transition-all duration-300 hover:bg-bordo hover:text-white hover:shadow-2xl active:scale-95"
                id="hero-cta-primary"
              >
                Çiçekleri Keşfet
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 font-body text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-95"
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

      {/* ===== WHY US CARDS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="why-us-section">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: '🌸', title: 'Seçim Süreci', desc: 'Her çiçek, uzman floristlerimiz tarafından özenle seçilir ve taze tutulur.' },
            { icon: '🚀', title: 'Hızlı Teslimat', desc: 'Aynı gün teslimat garantisiyle sevdiklerinize zamanında ulaşın.' },
            { icon: '💖', title: 'Müşteri Memnuniyeti', desc: '%100 memnuniyet garantisi. Beğenmediğiniz ürünü değiştiriyoruz.' },
          ].map((item, i) => (
            <div
              key={i}
              className="group flex flex-col items-center rounded-2xl border border-[#EDE8DE] bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#7B1C3E]/15 cursor-pointer"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F0E8] text-3xl transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-[#1A1A1A]">{item.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[#1A1A1A]/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="featured-section">
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

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" id="featured-grid">
          {featured.map((flower) => (
            <Link key={flower.id} to={`/flowers/${flower.id}`} className="block">
              <FlowerCard
                {...flower}
                onAddToCart={(fId) => cart.addToCart(fId, 1)}
              />
            </Link>
          ))}
        </div>

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
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3 font-body text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-95"
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
