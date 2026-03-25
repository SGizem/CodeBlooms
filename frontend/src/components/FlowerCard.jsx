import { useMemo } from 'react'

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
      className="group relative overflow-hidden rounded-lg border border-[#1A1A1A]/10 bg-bej transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
    >
      {hasDiscount ? (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-bordo px-2 py-1 text-[11px] font-semibold text-white">
          İNDİRİMLİ
        </div>
      ) : null}

      <div className="aspect-square w-full overflow-hidden bg-bej">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-body text-sm font-medium text-[#1A1A1A]">
          {name}
        </h3>

        <div className="flex items-baseline gap-3">
          <div className="font-body text-base font-bold text-bordo">
            {price}₺
          </div>
          {hasDiscount ? (
            <div className="font-body text-sm text-[#1A1A1A]/60 line-through">
              {originalPrice}₺
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <button
          type="button"
          onClick={() => onAddToCart(id)}
          className="w-full rounded-md bg-bordo px-4 py-2 text-center font-body text-sm font-semibold text-white opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto"
        >
          Sepete Ekle
        </button>
      </div>
    </article>
  )
}

