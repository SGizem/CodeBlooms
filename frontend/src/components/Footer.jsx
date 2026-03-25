import { Link } from 'react-router-dom'
import { Globe, MessageCircle, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-[#1A1A1A]" id="site-footer">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Link to="/" className="font-display text-xl tracking-[0.25em] text-white">
              CODEBLOOMS
            </Link>
            <p className="max-w-xs font-body text-sm leading-relaxed text-white/50">
              Taze çiçekler, zarif buketler ve botanik ilham.
              Sevdiklerinize en güzel hediyeyi verin.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60 transition-colors hover:bg-bordo hover:text-white"
                aria-label="Instagram"
              >
                <Globe className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60 transition-colors hover:bg-bordo hover:text-white"
                aria-label="Twitter"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
              Hızlı Menü
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/flowers" className="font-body text-sm text-white/60 transition-colors hover:text-white">
                  Çiçekler
                </Link>
              </li>
              <li>
                <Link to="/orders" className="font-body text-sm text-white/60 transition-colors hover:text-white">
                  Siparişlerim
                </Link>
              </li>
              <li>
                <Link to="/about" className="font-body text-sm text-white/60 transition-colors hover:text-white">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/register" className="font-body text-sm text-white/60 transition-colors hover:text-white">
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
              Politikalar
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="font-body text-sm text-white/60">İade Politikası</span>
              </li>
              <li>
                <span className="font-body text-sm text-white/60">Gizlilik</span>
              </li>
              <li>
                <span className="font-body text-sm text-white/60">Kullanım Şartları</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
              İletişim
            </h3>
            <ul className="space-y-3 font-body text-sm text-white/60">
              <li>support@codeblooms.com</li>
              <li>+90 555 000 00 00</li>
              <li>İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center gap-2 border-t border-white/8 pt-8 sm:flex-row sm:justify-between">
          <p className="font-body text-xs text-white/30">
            © 2026 CodeBlooms. Tüm hakları saklıdır.
          </p>
          <p className="flex items-center gap-1 font-body text-xs text-white/30">
            <Heart className="h-3 w-3 text-bordo" fill="currentColor" />
            ile yapıldı
          </p>
        </div>
      </div>
    </footer>
  )
}
