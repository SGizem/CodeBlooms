import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()
  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function validate() {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'Ad ve soyad zorunludur.'
    if (!form.email.includes('@')) return 'Geçerli bir e-posta girin.'
    if (form.password.length < 6) return 'Şifre en az 6 karakter olmalıdır.'
    if (form.password !== form.confirmPassword) return 'Şifreler eşleşmiyor.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const msg = validate()
    if (msg) { setError(msg); return }

    // Gerçek API'ye gönderiyoruz
    const res = await register(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    setSuccess(true)
    setTimeout(() => navigate('/flowers'), 2000)
  }

  return (
    <div className="w-full">
      <div className="mx-auto flex min-h-[calc(100svh-160px)] max-w-md items-center px-4 py-12">
        <div className="w-full rounded-2xl bg-white shadow-lg overflow-hidden">
          <div className="bg-[#7B1C3E] px-6 py-8 text-center">
            <h1 className="font-display text-3xl font-bold text-white">Hesap Oluştur</h1>
            <p className="mt-2 font-jost text-sm text-white/70">CodeBlooms ailesine katılın</p>
          </div>

          <div className="px-6 py-8">
            {success ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center">
                <div className="text-2xl mb-2">🌸</div>
                <p className="font-jost text-sm font-semibold text-green-700">
                  Kayıt başarılı! Yönlendiriliyorsunuz...
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Ad</label>
                    <input
                      className="w-full rounded-lg border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={form.firstName}
                      onChange={e => update('firstName', e.target.value)}
                      type="text"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Soyad</label>
                    <input
                      className="w-full rounded-lg border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={form.lastName}
                      onChange={e => update('lastName', e.target.value)}
                      type="text"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">E-posta</label>
                  <input
                    className="w-full rounded-lg border border-[#EDE8DE] bg-white px-4 py-3 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Şifre</label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border border-[#EDE8DE] bg-white px-4 py-3 pr-12 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#7B1C3E] transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-jost text-sm font-semibold text-[#1A1A1A] mb-1">Şifre Tekrar</label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border border-[#EDE8DE] bg-white px-4 py-3 pr-12 font-jost text-sm outline-none transition-all focus:border-[#7B1C3E] focus:ring-2 focus:ring-[#7B1C3E]/20"
                      value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#7B1C3E] transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-jost text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#7B1C3E] px-4 py-4 font-jost text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5a1530] active:scale-95"
                >
                  Kayıt Ol
                </button>

                <div className="text-center font-jost text-sm text-[#1A1A1A]">
                  Zaten hesabın var mı?{' '}
                  <Link to="/login" className="font-semibold text-[#7B1C3E] underline">
                    Giriş Yap
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
