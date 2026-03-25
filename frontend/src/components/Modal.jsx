import { useEffect } from 'react'

export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1A1A1A]/40"
        onClick={() => onClose()}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-[#1A1A1A]/10 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-[#1A1A1A]/10 px-5 py-4">
          <div className="font-display text-xl font-bold text-bordo">{title}</div>
          <button
            type="button"
            onClick={() => onClose()}
            className="rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-1 font-body text-xs font-semibold text-bordo transition hover:bg-bordo hover:text-white"
          >
            Kapat
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-[#1A1A1A]/10 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}

