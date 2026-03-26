import { Link } from 'react-router-dom'
import { Sparkles, Truck, HeartHandshake } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Seçim Süreci',
    desc: 'Mevsime uygun renk ve form dengesiyle buketler tasarlıyoruz. Her çiçek özenle seçilir.',
  },
  {
    icon: Truck,
    title: 'Hızlı Teslimat',
    desc: 'Siparişleriniz özenle hazırlanır ve aynı gün içinde güvenle kapınıza ulaştırılır.',
  },
  {
    icon: HeartHandshake,
    title: 'Müşteri Memnuniyeti',
    desc: 'Her soruda destek ekibimiz yanınızda. Memnuniyetiniz bizim önceliğimizdir.',
  },
]

const stats = [
  { value: '10.000+', label: 'Mutlu Müşteri' },
  { value: '500+', label: 'Çiçek Çeşidi' },
  { value: '4.9 ⭐', label: 'Ortalama Puan' },
  { value: '3 Yıl', label: 'Deneyim' },
]

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative min-h-[60svh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1400"
          alt="Hakkımızda"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1487530811015-780780b58c25?w=600&q=80' }}
        />
        <div className="absolute inset-0 bg-[#7B1C3E]/50" />
        <div className="relative mx-auto flex min-h-[60svh] max-w-4xl items-center justify-center px-4 text-center">
          <div className="space-y-5">
            <div className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">
              Hakkımızda
            </div>
            <div className="font-jost text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              CODEBLOOMS olarak taze çiçekleri özenle seçiyor, zarif buketler tasarlıyor
              ve her siparişte aynı kaliteyi sunuyoruz.
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                to="/flowers"
                className="inline-flex items-center justify-center rounded-full bg-white text-[#7B1C3E] px-8 py-3 font-jost font-semibold shadow-sm transition-all hover:bg-[#F5F0E8] active:scale-95"
              >
                Çiçekleri Keşfet
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/10 text-white px-8 py-3 font-jost font-semibold transition-all hover:bg-white/20 active:scale-95"
              >
                Siparişlerim
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#F5F0E8] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-bold text-[#7B1C3E]">{s.value}</div>
                <div className="mt-1 font-jost text-sm text-[#1A1A1A]/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="font-display text-4xl font-bold text-[#7B1C3E] mb-3">Neden CodeBlooms?</h2>
        <p className="font-jost text-[#1A1A1A]/60 max-w-2xl mx-auto mb-12">
          Çiçeğin tazeliğinden teslimatın hızına, her adımda mükemmeliyeti hedefliyoruz.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-[#EDE8DE] bg-white p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F0E8]">
                <Icon className="h-6 w-6 text-[#7B1C3E]" strokeWidth={1.75} />
              </div>
              <div className="font-display text-xl font-bold text-[#7B1C3E] mb-2">{title}</div>
              <p className="font-jost text-sm text-[#1A1A1A]/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA — Birlikte Daha Güzel */}
      <section className="py-20 bg-[#7B1C3E]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Birlikte Daha Güzel
          </div>
          <div className="font-jost text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
            Sevdiklerinize göndermek istediğiniz duyguyu, çiçeklerin diliyle anlatın.
            Her buket, her çikolata kutusu — hepsi sizin için özenle hazırlanıyor.
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              to="/flowers"
              className="px-8 py-4 bg-white text-[#7B1C3E] font-jost font-semibold rounded-full hover:bg-[#F5F0E8] transition-all duration-200 active:scale-95"
            >
              Çiçekleri Keşfet
            </Link>
            <Link
              to="/orders"
              className="px-8 py-4 border border-white text-white font-jost font-semibold rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95"
            >
              Siparişlerim
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
