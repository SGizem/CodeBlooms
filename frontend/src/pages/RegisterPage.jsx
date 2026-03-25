import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    const res = register({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
    })

    if (!res.ok) {
      setError(res.error || 'Kayıt başarısız.')
      return
    }

    setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.')
    // Kullanıcı deneyimi: kısa gecikme sonrası login'e yönlendir.
    window.setTimeout(() => navigate('/login'), 1200)
  }

  return (
    <div className="w-full">
      <div className="mx-auto flex min-h-[calc(100svh-160px)] max-w-md items-center px-4 py-12">
        <div className="w-full rounded-lg bg-white shadow-lg text-left">
          <div className="px-6 py-8">
            <h1 className="font-display text-3xl font-bold text-bordo">Kullanıcı Kaydı</h1>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="font-body text-sm font-semibold text-[#1A1A1A]">
                  Ad Soyad
                </label>
                <input
                  className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  type="text"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="font-body text-sm font-semibold text-[#1A1A1A]">
                  E-posta
                </label>
                <input
                  className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="font-body text-sm font-semibold text-[#1A1A1A]">
                  Şifre
                </label>
                <input
                  className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label className="font-body text-sm font-semibold text-[#1A1A1A]">
                  Şifre Tekrar
                </label>
                <input
                  className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 font-body text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-md border border-green-500/20 bg-green-500/5 px-4 py-3 font-body text-sm text-green-700">
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-md bg-bordo px-4 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Kayıt Ol
              </button>
            </form>

            <div className="mt-6 text-center font-body text-sm text-[#1A1A1A]">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="text-bordo font-semibold underline">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

