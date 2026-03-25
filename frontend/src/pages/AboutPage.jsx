import { Link } from 'react-router-dom'
import { Sparkles, Truck, HeartHandshake } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="w-full">
      <div className="relative min-h-[55svh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1400"
          alt="Hakkımızda"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-bordo/35" />
        <div className="relative mx-auto flex min-h-[55svh] max-w-7xl items-center px-4">
          <div className="space-y-4">
            <div className="font-display text-5xl font-bold text-white">Hakkımızda</div>
            <div className="font-body text-lg text-white/95 max-w-2xl">
              CODEBLOOMS olarak taze çiçekleri seçiyor, zarif buketler tasarlıyor ve her siparişte aynı özenle hazırlanmasını sağlıyoruz.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/flowers"
                className="inline-flex items-center justify-center rounded-md bg-bordo px-7 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Çiçekleri Keşfet
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 px-7 py-3 font-body text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Siparişlerim
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-bordo" strokeWidth={1.75} />
              <div className="font-display text-xl font-bold text-bordo">Seçim Süreci</div>
            </div>
            <p className="mt-3 font-body text-sm text-[#1A1A1A]/70">
              Mevsime uygun renk ve form dengesiyle buketler tasarlıyoruz.
            </p>
          </div>
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-bordo" strokeWidth={1.75} />
              <div className="font-display text-xl font-bold text-bordo">Hızlı Teslimat</div>
            </div>
            <p className="mt-3 font-body text-sm text-[#1A1A1A]/70">
              Siparişleriniz özenle hazırlanır ve zamanında ulaştırılır.
            </p>
          </div>
          <div className="rounded-lg border border-[#1A1A1A]/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <HeartHandshake className="h-6 w-6 text-bordo" strokeWidth={1.75} />
              <div className="font-display text-xl font-bold text-bordo">Müşteri Memnuniyeti</div>
            </div>
            <p className="mt-3 font-body text-sm text-[#1A1A1A]/70">
              Her soruda destek ekibimiz yanınızda.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-lg border border-[#1A1A1A]/10 bg-krem p-7">
          <div className="font-display text-2xl font-bold text-bordo">Birlikte Daha Güzel</div>
          <div className="mt-3 font-body text-sm text-[#1A1A1A]/70 max-w-3xl">
            Sevdiklerinize göndermek istediğiniz duyguyu, çiçeklerin diliyle anlatın.
            Bu projede backend hazır olmadığı için arayüz akışları mock veriler ve localStorage ile simüle edilir.
          </div>
        </div>
      </div>
    </div>
  )
}

