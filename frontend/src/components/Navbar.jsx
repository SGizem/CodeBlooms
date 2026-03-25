import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="w-full border-b border-[#F2E6D5] bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <Link
            to="/"
            className="font-heading text-lg tracking-[0.2em] text-[#2a2a2a] underline-offset-4 decoration-[#a8c5a0]"
          >
            CODEBLOOMS
          </Link>
        </div>

        <div className="flex items-center gap-10">
          <Link
            to="/flowers"
            className="font-body text-sm text-[#2a2a2a] border-b border-transparent pb-1 transition-colors hover:border-[#a8c5a0]"
          >
            Çiçekler
          </Link>
          <Link
            to="/orders"
            className="font-body text-sm text-[#2a2a2a] border-b border-transparent pb-1 transition-colors hover:border-[#a8c5a0]"
          >
            Siparişlerim
          </Link>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 border-b border-transparent pb-1 font-body text-sm text-[#2a2a2a] transition-colors hover:border-[#a8c5a0]"
          >
            Kayıt Ol
            <ShoppingCart className="h-4 w-4 text-[#a8c5a0]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </nav>
  )
}

