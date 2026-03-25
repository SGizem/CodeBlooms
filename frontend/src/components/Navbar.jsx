import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ShoppingCart, User, Truck } from 'lucide-react'

export default function Navbar({ cartCount = 0 }) {
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef(null)

  const categories = useMemo(
    () => [
      { label: 'Güller', to: '/flowers?category=Güller' },
      { label: 'Orkideler', to: '/flowers?category=Orkideler' },
      { label: 'Papatyalar', to: '/flowers?category=Papatyalar' },
      { label: 'Lilyumlar', to: '/flowers?category=Lilyumlar' },
      { label: 'Çikolatalar', to: '/flowers?category=Çikolatalar' },
    ],
    []
  )


  useEffect(() => {
    function onDocClick(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full" id="site-header">
      {/* Top delivery banner */}
      <div className="bg-bordo">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2">
          <Truck className="h-3.5 w-3.5 text-white/80" strokeWidth={1.75} />
          <span className="font-body text-[11px] font-light tracking-[0.08em] text-white/90 sm:text-xs">
            Ücretsiz Kargo — 500₺ Üzeri Siparişlerde
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="w-full border-b border-[#1A1A1A]/8 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link
              to="/"
              className="font-display text-xl font-semibold tracking-[0.25em] text-bordo transition-opacity hover:opacity-80 sm:text-2xl"
              id="logo"
            >
              CODEBLOOMS
            </Link>

            {/* Center navigation */}
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Ana menü">
              {/* Kategoriler dropdown */}
              <div className="relative" ref={catRef}>
                <button
                  type="button"
                  className="flex items-center gap-1.5 font-body text-[13px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A]/80 transition-colors hover:text-bordo"
                  aria-expanded={catOpen}
                  onClick={() => setCatOpen((v) => !v)}
                  id="categories-menu-btn"
                >
                  Kategoriler
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                  />
                </button>

                {catOpen && (
                  <div className="absolute left-1/2 top-[calc(100%+12px)] z-50 w-52 -translate-x-1/2 rounded-lg border border-[#1A1A1A]/8 bg-white p-2 shadow-xl shadow-black/5">
                    {categories.map((c) => (
                      <Link
                        key={c.label}
                        to={c.to}
                        onClick={() => setCatOpen(false)}
                        className="block rounded-md px-4 py-2.5 font-body text-sm text-[#1A1A1A]/80 transition-colors hover:bg-krem hover:text-bordo"
                        id={`cat-link-${c.label}`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className="font-body text-[13px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A]/80 transition-colors hover:text-bordo"
                id="nav-about"
              >
                Hakkımızda
              </Link>
              <Link
                to="/orders"
                className="font-body text-[13px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A]/80 transition-colors hover:text-bordo"
                id="nav-orders"
              >
                Siparişlerim
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-5">
              <Link
                to="/cart"
                className="group relative flex items-center gap-2 transition-opacity hover:opacity-80"
                aria-label={`Sepet (${cartCount})`}
                id="cart-link"
              >
                <ShoppingCart className="h-5 w-5 text-[#1A1A1A]/70 transition-colors group-hover:text-bordo" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bordo px-1 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="hidden h-5 w-px bg-[#1A1A1A]/10 sm:block" />

              <Link
                to="/register"
                className="hidden items-center gap-2 font-body text-[13px] font-medium text-[#1A1A1A]/70 transition-colors hover:text-bordo sm:flex"
                id="nav-register"
              >
                <User className="h-4 w-4" strokeWidth={1.5} />
                <span>Kayıt Ol</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
