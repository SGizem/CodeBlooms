import { useContext } from 'react'
import { Link } from 'react-router-dom'
import FlowerCard from '../components/FlowerCard'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

export default function HomePage() {
  const cart = useContext(CartContext)
  const { products } = useProducts()
  const featured = [products[0], products[2], products[4]].filter(Boolean)

  return (
    <div className="w-full">
      <section className="relative min-h-[100svh] overflow-hidden">
        <style>{`
          @keyframes heroZoom {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
          }
          @keyframes petalFloat1 {
            0% { transform: translate(0px, 18px) rotate(-8deg) scale(0.98); opacity: 0.25; }
            50% { transform: translate(18px, -30px) rotate(10deg) scale(1.05); opacity: 0.38; }
            100% { transform: translate(0px, 18px) rotate(-8deg) scale(0.98); opacity: 0.25; }
          }
          @keyframes petalFloat2 {
            0% { transform: translate(0px, 22px) rotate(6deg) scale(0.98); opacity: 0.18; }
            50% { transform: translate(-22px, -34px) rotate(-10deg) scale(1.06); opacity: 0.32; }
            100% { transform: translate(0px, 22px) rotate(6deg) scale(0.98); opacity: 0.18; }
          }
          @keyframes petalFloat3 {
            0% { transform: translate(0px, 26px) rotate(-4deg) scale(0.97); opacity: 0.16; }
            50% { transform: translate(16px, -26px) rotate(8deg) scale(1.04); opacity: 0.30; }
            100% { transform: translate(0px, 26px) rotate(-4deg) scale(0.97); opacity: 0.16; }
          }
        `}</style>

        <img
          src="https://images.unsplash.com/photo-1644248423203-80e317d78aee?auto=format&fit=crop&w=1600&q=80"
          alt="Hoş Geldiniz"
          className="hero-bg absolute inset-0 h-full w-full object-cover"
          style={{ animation: 'heroZoom 22s ease-in-out infinite' }}
        />
        <div className="absolute inset-0 bg-bordo/25" />

        {/* Petal efektleri */}
        <img
          src="https://images.unsplash.com/photo-1648854607533-d6ff6af33b47?auto=format&fit=crop&w=700&q=80"
          alt=""
          aria-hidden="true"
          className="absolute top-20 left-6 h-[140px] w-[140px] rounded-full opacity-30 blur-[0.5px]"
          style={{ animation: 'petalFloat1 10s ease-in-out infinite' }}
        />
        <img
          src="https://images.unsplash.com/photo-1713094010686-7e071fb887da?auto=format&fit=crop&w=700&q=80"
          alt=""
          aria-hidden="true"
          className="absolute top-40 right-8 h-[170px] w-[170px] rounded-full opacity-25 blur-[0.5px]"
          style={{ animation: 'petalFloat2 12s ease-in-out infinite' }}
        />
        <img
          src="https://images.unsplash.com/photo-1644248423203-80e317d78aee?auto=format&fit=crop&w=720&q=80"
          alt=""
          aria-hidden="true"
          className="absolute bottom-20 left-14 h-[160px] w-[160px] rounded-full opacity-20 blur-[0.5px]"
          style={{ animation: 'petalFloat3 11s ease-in-out infinite' }}
        />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 text-center">
          <div className="space-y-6">
            <div className="font-display text-5xl font-bold text-white drop-shadow-sm sm:text-7xl">
              Hoş Geldiniz
            </div>
            <div className="font-body text-lg text-white/95 sm:text-2xl">
              Taze çiçekler, zarif buketler ve hızlı teslimat.
            </div>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/flowers"
                className="inline-flex items-center justify-center rounded-md bg-bordo px-7 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md sm:text-base"
              >
                Çiçekleri Keşfet
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-7 py-3 font-body text-sm font-semibold text-white transition hover:bg-white/15 sm:text-base"
              >
                Siparişlerim
              </Link>
            </div>
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

