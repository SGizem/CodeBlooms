import { useMemo } from 'react'
import {
  Flower2,
  Leaf,
  Wind,
  Sparkles,
  HeartHandshake,
  Sprout,
} from 'lucide-react'

function iconForCategory(name) {
  const n = String(name ?? '').toLowerCase()
  if (n.includes('gül')) return Flower2
  if (n.includes('orkid')) return Sparkles
  if (n.includes('papat')) return Leaf
  if (n.includes('lale')) return Wind
  if (n.includes('şakayık')) return HeartHandshake
  return Sprout
}

export default function CategoriesMenu({
  categories,
  selected,
  onSelect,
}) {
  const normalizedSelected = selected || 'Tümü'

  const activeStyles = 'bg-bordo text-white border-bordo'
  const baseStyles =
    'rounded-md border border-[#1A1A1A]/10 bg-white px-3 py-2 transition hover:bg-krem hover:border-[#1A1A1A]/15'

  const items = useMemo(() => {
    return (categories ?? [])
      .slice()
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
  }, [categories])

  return (
    <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-4">
      <div>
        <div className="font-display text-xl font-bold text-bordo">Kategoriler</div>
        <div className="mt-1 font-body text-sm text-[#1A1A1A]/70">
          Filtreleyin ve hızlı seçim yapın.
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={[
            baseStyles,
            normalizedSelected === 'Tümü' ? activeStyles : 'text-[#1A1A1A] font-body text-sm font-semibold',
          ].join(' ')}
          onClick={() => onSelect('Tümü')}
        >
          Tümü
        </button>

        {items.map((c) => {
          const Icon = iconForCategory(c.name)
          const isActive = normalizedSelected === c.name
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onSelect(c.name)}
              className={[
                baseStyles,
                isActive ? activeStyles : 'text-[#1A1A1A] font-body text-sm font-semibold',
                'flex items-center gap-2',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span>{c.name}</span>
              <span className={isActive ? 'text-white/80' : 'text-[#1A1A1A]/60'}>({c.count})</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-md border border-bordo/15 bg-bordo/5 p-3 font-body text-xs text-[#1A1A1A]/70">
        İpucu: Ürün yönetiminden kategori alanını güncelleyerek menüyü değiştirebilirsiniz.
      </div>
    </div>
  )
}

