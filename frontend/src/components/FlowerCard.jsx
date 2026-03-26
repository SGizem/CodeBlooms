import { useMemo } from 'react'
import { ShoppingBag } from 'lucide-react'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1487530811015-780780b58c25?w=600&q=80'

export default function FlowerCard({
  id,
  name,
  price,
  originalPrice,
  image,
  onAddToCart,
}) {
  const hasDiscount = useMemo(() => {
    return typeof originalPrice === 'number' && originalPrice > price
  }, [originalPrice, price])

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl border border-[#1A1A1A]/6 bg-white transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 cursor-pointer"
      id={`product-card-${id}`}
    >
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-krem">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_IMG }}
        />
        {hasDiscount && (
          <div className="absolute left-3 top-3 rounded-full bg-bordo px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            İndirim
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-[#1A1A1A] leading-snug">
          {name}
        </h3>

        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="font-body text-lg font-bold text-bordo">
            {price}₺
          </span>
          {hasDiscount && (
            <span className="font-body text-sm text-[#1A1A1A]/40 line-through">
              {originalPrice}₺
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(id)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-bordo px-4 py-3 font-body text-sm font-semibold text-white transition-all duration-200 hover:bg-[#601530] hover:shadow-lg hover:shadow-bordo/20 active:scale-95"
            id={`add-to-cart-${id}`}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            Sepete Ekle
          </button>
        </div>
      </div>
    </article>
  )
}
