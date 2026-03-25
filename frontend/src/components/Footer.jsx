export default function Footer() {
  return (
    <footer className="w-full bg-krem">
      <div className="mx-auto max-w-7xl px-4 pt-12 text-left">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="font-display text-lg tracking-[0.22em] text-bordo">
              CODEBLOOMS
            </div>
            <p className="max-w-xs font-body text-sm text-[#1A1A1A]">
              Taze çiçekler, zarif buketler ve botanik ilham. Alışverişe başlayın
              ve sevdiklerinizi mutlu edin.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-bordo">
              Hızlı Menü
            </h3>
            <ul className="space-y-2 font-body text-sm text-[#1A1A1A]">
              <li>Çiçekler</li>
              <li>Siparişlerim</li>
              <li>Kayıt Ol</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-bordo">
              Politika
            </h3>
            <ul className="space-y-2 font-body text-sm text-[#1A1A1A]">
              <li>İade Politikası</li>
              <li>Gizlilik</li>
              <li>Şartlar</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-bordo">
              İletişim
            </h3>
            <ul className="space-y-2 font-body text-sm text-[#1A1A1A]">
              <li>support@codeblooms.com</li>
              <li>+90 555 000 00 00</li>
              <li>İstanbul</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#1A1A1A]/10 pb-8 pt-6 text-center font-body text-sm text-[#1A1A1A]">
          © 2026 CodeBlooms
        </div>
      </div>
    </footer>
  )
}

