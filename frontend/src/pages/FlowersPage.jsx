import { useContext, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import FlowerCard from '../components/FlowerCard'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

const CATEGORIES = ['Tümü', 'Güller', 'Orkideler', 'Papatyalar', 'Lilyumlar', 'Çikolatalar']

export default function FlowersPage() {
  const cart = useContext(CartContext)
  const { products, loading } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = searchParams.get('category')

  const [searchTerm, setSearchTerm] = useState('')
  const activeCategory = urlCategory || 'Tümü'

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'Tümü' || p.category === activeCategory
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, activeCategory, searchTerm])

  function selectCategory(cat) {
    if (cat === 'Tümü') {
      setSearchParams({})
    } else {
      setSearchParams({ category: cat })
    }
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page title */}
        <h1 className="font-display text-4xl font-bold text-bordo">
          {activeCategory === 'Tümü' ? 'Tüm Ürünler' : activeCategory}
        </h1>

        {/* Search bar */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/40" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#EDE8DE] bg-white py-3 pl-10 pr-4 font-body text-sm text-[#1A1A1A] outline-none transition-all duration-200 focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
          />
        </div>

        {/* Category filter buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => selectCategory(cat)}
              className={`rounded-full px-5 py-2 font-body text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeCategory === cat
                  ? 'bg-[#7B1C3E] text-white shadow-md'
                  : 'border border-[#7B1C3E] text-[#7B1C3E] hover:bg-[#7B1C3E]/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product count */}
        <div className="mt-4 font-body text-sm text-[#1A1A1A]/50">
          {filtered.length} ürün bulundu
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" id="flowers-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#EDE8DE] bg-white overflow-hidden animate-pulse">
                <div className="h-56 bg-[#EDE8DE]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#EDE8DE] rounded w-3/4" />
                  <div className="h-3 bg-[#EDE8DE] rounded w-1/2" />
                  <div className="h-8 bg-[#EDE8DE] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" id="flowers-grid">
            {filtered.map((flower) => (
              <Link key={flower.id} to={`/flowers/${flower.id}`} className="block">
                <FlowerCard
                  {...flower}
                  onAddToCart={(id) => {
                    cart.addToCart(id, 1)
                  }}
                />
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="mt-10 rounded-xl border border-[#EDE8DE] bg-white p-8 text-center">
            <div className="text-3xl" aria-hidden="true">🔍</div>
            <p className="mt-3 font-body text-sm text-[#1A1A1A]/60">
              {searchTerm
                ? `"${searchTerm}" için sonuç bulunamadı.`
                : 'Bu kategoride ürün bulunamadı.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
