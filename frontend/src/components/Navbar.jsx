import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

export default function Navbar({ cartCount = 0 }) {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-bordo text-white">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center font-body text-xs tracking-wide">
          Ücretsiz Kargo — 500₺ Üzeri Siparişlerde
        </div>
      </div>

      <div className="w-full border-b border-bordo/15 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between py-4">
            <Link
              to="/"
              className="font-display text-lg font-bold tracking-[0.22em] text-bordo"
            >
              CODEBLOOMS
            </Link>

            <nav className="flex items-center gap-8 font-body text-sm text-[#1A1A1A]">
              <Link
                to="/flowers"
                className="border-b border-transparent pb-1 transition-colors hover:border-bordo"
              >
                Çiçekler
              </Link>
              <Link
                to="/orders"
                className="border-b border-transparent pb-1 transition-colors hover:border-bordo"
              >
                Siparişlerim
              </Link>
              <Link
                to="/register"
                className="border-b border-transparent pb-1 transition-colors hover:border-bordo"
              >
                Kayıt Ol
              </Link>
            </nav>

            <button
              type="button"
              className="relative inline-flex items-center gap-2 font-body text-sm text-[#1A1A1A] transition-opacity hover:opacity-80"
              aria-label={`Sepet (${cartCount})`}
            >
              <ShoppingCart className="h-5 w-5 text-bordo" strokeWidth={1.75} />
              {cartCount > 0 ? (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-bordo px-1 text-[11px] font-semibold text-white">
                  {cartCount}
                </span>
              ) : null}
              <span className="hidden sm:inline">Sepet</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

