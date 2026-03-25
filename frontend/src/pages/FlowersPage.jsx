import { useContext, useMemo } from 'react'
import FlowerCard from '../components/FlowerCard'
import { CartContext } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import CategoriesMenu from '../components/CategoriesMenu'
import { useSearchParams } from 'react-router-dom'

export default function FlowersPage() {
  const cart = useContext(CartContext)
  const { products } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = searchParams.get('category')
  const selectedCategory = urlCategory || 'Tümü'

  const categories = useMemo(() => {
    const map = new Map()
    for (const p of products) {
      const key = p.category || 'Diğer'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
  }, [products])

  const filtered = useMemo(() => {
    if (selectedCategory === 'Tümü') return products
    return products.filter((p) => p.category === selectedCategory)
  }, [products, selectedCategory])

  function onSelectCategory(next) {
    if (!next || next === 'Tümü') {
      setSearchParams({})
      return
    }
    setSearchParams({ category: next })
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-4xl font-bold text-bordo">Çiçekler</h1>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-1">
            <CategoriesMenu
              categories={categories}
              selected={selectedCategory}
              onSelect={onSelectCategory}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {filtered.map((flower) => (
                <FlowerCard
                  key={flower.id}
                  {...flower}
                  onAddToCart={(id) => cart.addToCart(id, 1)}
                />
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="mt-10 rounded-lg border border-[#1A1A1A]/10 bg-white p-6 text-center font-body text-sm text-[#1A1A1A]/70">
                Bu kategori için ürün bulunamadı.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

