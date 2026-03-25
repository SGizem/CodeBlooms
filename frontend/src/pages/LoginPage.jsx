import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Lütfen tüm alanları doldurun.')
      return
    }

    const res = login(form)
    if (!res.ok) {
      setError(res.error || 'Giriş başarısız.')
      return
    }
    navigate('/flowers')
  }

  return (
    <div className="w-full">
      <div className="mx-auto flex min-h-[calc(100svh-160px)] max-w-md items-center px-4 py-12">
        <div className="w-full rounded-lg bg-white shadow-lg text-left">
          <div className="px-6 py-8">
            <h1 className="font-display text-3xl font-bold text-bordo">
              Giriş Yap
            </h1>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="font-body text-sm font-semibold text-[#1A1A1A]">
                  E-posta
                </label>
                <input
                  className="mt-2 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-4 py-3 font-body text-sm outline-none focus:border-bordo"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
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
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  type="password"
                  autoComplete="current-password"
                  required
                />
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
                Giriş Yap
              </button>
            </form>

            <div className="mt-6 text-center font-body text-sm text-[#1A1A1A]">
              Hesabın yok mu?{' '}
              <Link to="/register" className="text-bordo font-semibold underline">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

