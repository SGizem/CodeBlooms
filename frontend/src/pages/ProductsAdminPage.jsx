import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { useProducts } from '../context/ProductsContext'

function formatPrice(value) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? `${n}₺` : '—'
}

export default function ProductsAdminPage() {
  const { products, addProduct, deleteProduct } = useProducts()

  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const [form, setForm] = useState({
    name: '',
    category: '',
    image: '',
    price: '',
    originalPrice: '',
    description: '',
  })
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      return (
        String(p.name).toLowerCase().includes(q) ||
        String(p.category).toLowerCase().includes(q)
      )
    })
  }, [products, search])

  function openAdd() {
    setError('')
    setForm({
      name: '',
      category: '',
      image: '',
      price: '',
      originalPrice: '',
      description: '',
    })
    setAddOpen(true)
  }

  function submitAdd(e) {
    e.preventDefault()
    setError('')
    const res = addProduct({
      name: form.name,
      description: form.description,
      category: form.category,
      image: form.image,
      price: form.price,
      originalPrice: form.originalPrice === '' ? null : form.originalPrice,
    })
    if (!res.ok) {
      setError(res.error || 'Ürün eklenemedi.')
      return
    }
    setAddOpen(false)
  }

  function confirmDelete() {
    if (!pendingDeleteId) return
    deleteProduct(pendingDeleteId)
    setDeleteOpen(false)
    setPendingDeleteId(null)
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold text-bordo">Ürün Yönetimi</h1>
            <div className="mt-2 font-body text-sm text-[#1A1A1A]/70">
              Ürünleri ekleyin veya kaldırın. (Mock + localStorage)
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="w-full sm:w-72 rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara (isim / kategori)"
            />
            <button
              type="button"
              onClick={openAdd}
              className="rounded-md bg-bordo px-5 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Ürün Ekle
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((p) => {
            const hasDiscount = typeof p.originalPrice === 'number' && p.originalPrice > p.price
            return (
              <article
                key={p.id}
                className="group relative overflow-hidden rounded-lg border border-[#1A1A1A]/10 bg-bej transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                {hasDiscount ? (
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-bordo px-2 py-1 text-[11px] font-semibold text-white">
                    İNDİRİMLİ
                  </div>
                ) : null}

                <div className="aspect-square w-full overflow-hidden bg-bej">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-body text-sm font-semibold text-[#1A1A1A]">{p.name}</div>
                      <div className="mt-1 font-body text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/60">
                        {p.category}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingDeleteId(p.id)
                        setDeleteOpen(true)
                      }}
                      className="rounded-md border border-red-500/20 bg-white p-2 text-red-700 transition hover:bg-red-600 hover:text-white"
                      aria-label="Ürünü sil"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-baseline gap-3">
                    <div className="font-body text-base font-bold text-bordo">{formatPrice(p.price)}</div>
                    {hasDiscount ? (
                      <div className="font-body text-sm text-[#1A1A1A]/60 line-through">{formatPrice(p.originalPrice)}</div>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <Modal open={addOpen} title="Ürün Ekle" onClose={() => setAddOpen(false)}>
        <form className="space-y-4" onSubmit={submitAdd}>
          <div>
            <label className="font-body text-sm font-semibold text-[#1A1A1A]">Ürün Adı</label>
            <input
              className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="font-body text-sm font-semibold text-[#1A1A1A]">Kategori</label>
            <select
              className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              required
            >
              <option value="">Seçin...</option>
              <option value="Güller">Güller</option>
              <option value="Orkideler">Orkideler</option>
              <option value="Papatyalar">Papatyalar</option>
              <option value="Lilyumlar">Lilyumlar</option>
              <option value="Çikolatalar">Çikolatalar</option>
            </select>
          </div>

          <div>
            <label className="font-body text-sm font-semibold text-[#1A1A1A]">Görsel URL</label>
            <input
              className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
              value={form.image}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              required
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="font-body text-sm font-semibold text-[#1A1A1A]">Açıklama</label>
            <textarea
              className="mt-2 min-h-[110px] w-full resize-none rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              required
              placeholder="Örn: Özenle hazırlanan bu buket..."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="font-body text-sm font-semibold text-[#1A1A1A]">Fiyat (₺)</label>
              <input
                className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                type="number"
                min="1"
                step="1"
                required
              />
            </div>
            <div>
              <label className="font-body text-sm font-semibold text-[#1A1A1A]">İndirimli Fiyat (Opsiyonel)</label>
              <input
                className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                value={form.originalPrice}
                onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value }))}
                type="number"
                min="1"
                step="1"
                placeholder="Boş bırak"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 font-body text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-bordo px-4 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            Kaydet
          </button>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Ürünü Sil"
        onClose={() => {
          setDeleteOpen(false)
          setPendingDeleteId(null)
        }}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(false)
                setPendingDeleteId(null)
              }}
              className="rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-2 font-body text-sm font-semibold text-bordo transition hover:bg-bordo hover:text-white"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-md bg-red-600 px-5 py-2.5 font-body text-sm font-semibold text-white transition hover:opacity-90"
            >
              Sil
            </button>
          </div>
        }
      >
        <div className="font-body text-sm text-[#1A1A1A]/80">
          Bu işlem ürünü listeden kaldırır. Mock olarak localStorage verisi güncellenir.
        </div>
      </Modal>
    </div>
  )
}

