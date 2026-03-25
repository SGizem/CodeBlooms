import { useContext, useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { CartContext } from '../context/CartContext'

export default function CartToast() {
  const { toast } = useContext(CartContext)
  const toastKey = toast?.key
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toastKey) return
    const t0 = window.setTimeout(() => setVisible(false), 0)
    const t1 = window.setTimeout(() => setVisible(true), 10)
    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
    }
  }, [toastKey])

  if (!toast) return null

  const isRemove = String(toast.message ?? '').toLowerCase().includes('kaldırıldı')
  const Icon = isRemove ? XCircle : CheckCircle2

  return (
    <div className="pointer-events-none fixed left-1/2 top-16 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div
        className={[
          'flex items-center gap-3 rounded-lg border border-[#1A1A1A]/10 bg-white px-4 py-3 shadow-lg transition-all',
          visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95',
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        <Icon className="h-5 w-5 text-bordo" strokeWidth={1.75} />
        <div className="font-body text-sm font-semibold text-[#1A1A1A]">{toast.message}</div>
      </div>
    </div>
  )
}

