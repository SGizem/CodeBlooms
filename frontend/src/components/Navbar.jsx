import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ShoppingCart } from 'lucide-react'

export default function Navbar({ cartCount = 0 }) {
  const [openMenu, setOpenMenu] = useState(null)
  const navRef = useRef(null)

  const menuData = useMemo(
    () => ({
      purpose: [
        { label: 'Doğum Günü', category: 'Güller' },
        { label: 'Sevgililer Günü', category: 'Orkideler' },
        { label: 'Anneler Günü', category: 'Lilyumlar' },
        { label: 'Tebrik & Motivasyon', category: 'Teraryumlar' },
      ],
      flowerType: [
        { label: 'Güller', category: 'Güller' },
        { label: 'Papatyalar', category: 'Papatyalar' },
        { label: 'Orkideler', category: 'Orkideler' },
        { label: 'Lilyumlar', category: 'Lilyumlar' },
        { label: 'Teraryumlar', category: 'Teraryumlar' },
      ],
      gift: [
        { label: 'Çikolata', category: 'Papatyalar' },
        { label: 'Peluş', category: 'Orkideler' },
        { label: 'Kart', category: 'Güller' },
        { label: 'Mum', category: 'Teraryumlar' },
      ],
      bonnyFood: [
        { label: 'Kurabiye Seti', category: 'Teraryumlar' },
        { label: 'Kahve', category: 'Lilyumlar' },
        { label: 'Çay & İkram', category: 'Orkideler' },
        { label: 'Tatlı Paketi', category: 'Güller' },
      ],
    }),
    []
  )

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!navRef.current) return
      if (navRef.current.contains(e.target)) return
      setOpenMenu(null)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  function menuButton(label, id) {
    const isOpen = openMenu === id
    return (
      <button
        type="button"
        className="flex items-center gap-2 border-b border-transparent pb-1 font-body text-sm transition hover:border-bordo"
        aria-expanded={isOpen}
        onClick={() => setOpenMenu((v) => (v === id ? null : id))}
      >
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 text-[#1A1A1A] transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    )
  }

  function menuPanel(items, id) {
    if (openMenu !== id) return null
    return (
      <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-72 rounded-lg border border-[#1A1A1A]/10 bg-white p-3 shadow-lg">
        <div className="px-2 pb-2 font-body text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/60">
          Kategoriler
        </div>
        <div className="space-y-1">
          {items.map((it) => (
            <Link
              key={it.label}
              to={`/flowers?category=${encodeURIComponent(it.category)}`}
              onClick={() => setOpenMenu(null)}
              className="flex items-center justify-between rounded-md px-3 py-2 font-body text-sm text-[#1A1A1A] transition hover:bg-krem hover:text-[#1A1A1A]"
            >
              <span>{it.label}</span>
              <span className="text-xs font-semibold text-bordo/80">{it.category}</span>
            </Link>
          ))}
        </div>
      </div>
    )
  }

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

            <nav ref={navRef} className="relative flex items-center gap-6 font-body text-sm text-[#1A1A1A]">
              <div className="relative">
                {menuButton('Gönderim Amacı', 'purpose')}
                {menuPanel(menuData.purpose, 'purpose')}
              </div>
              <div className="relative">
                {menuButton('Çiçek Türü', 'flowerType')}
                {menuPanel(menuData.flowerType, 'flowerType')}
              </div>
              <div className="relative">
                {menuButton('Hediye', 'gift')}
                {menuPanel(menuData.gift, 'gift')}
              </div>
              <div className="relative">
                {menuButton('BonnyFood', 'bonnyFood')}
                {menuPanel(menuData.bonnyFood, 'bonnyFood')}
              </div>

              <Link
                to="/about"
                className="border-b border-transparent pb-1 transition-colors hover:border-bordo"
              >
                Hakkımızda
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
              <Link
                to="/admin/products"
                className="border-b border-transparent pb-1 transition-colors hover:border-bordo"
              >
                Ürün Yönetimi
              </Link>
            </nav>

            <Link
              className="relative inline-flex items-center gap-2 font-body text-sm text-[#1A1A1A] transition-opacity hover:opacity-80"
              aria-label={`Sepet (${cartCount})`}
              to="/cart"
            >
              <ShoppingCart className="h-5 w-5 text-bordo" strokeWidth={1.75} />
              {cartCount > 0 ? (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-bordo px-1 text-[11px] font-semibold text-white">
                  {cartCount}
                </span>
              ) : null}
              <span className="hidden sm:inline">Sepet</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

