/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

function safeParseJSON(raw) {
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getDefaultUsers() {
  return []
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const parsedUsers = safeParseJSON(localStorage.getItem('cb_users'))
    return Array.isArray(parsedUsers) ? parsedUsers : getDefaultUsers()
  })

  const [currentUserId, setCurrentUserId] = useState(() => {
    const parsedCurrent = safeParseJSON(localStorage.getItem('cb_currentUserId'))
    return parsedCurrent ? String(parsedCurrent) : null
  })

  useEffect(() => {
    try {
      localStorage.setItem('cb_users', JSON.stringify(users))
    } catch {
      // ignore
    }
  }, [users])

  useEffect(() => {
    try {
      localStorage.setItem('cb_currentUserId', JSON.stringify(currentUserId))
    } catch {
      // ignore
    }
  }, [currentUserId])

  const currentUser = useMemo(
    () => users.find((u) => String(u.id) === String(currentUserId)) ?? null,
    [users, currentUserId]
  )

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim())
  }

  function register({ fullName, email, password }) {
    const name = String(fullName ?? '').trim()
    const e = String(email ?? '').trim().toLowerCase()
    const p = String(password ?? '')

    if (!name) return { ok: false, error: 'Ad Soyad zorunludur.' }
    if (!validateEmail(e)) return { ok: false, error: 'Geçerli bir e-posta girin.' }
    if (p.length < 6) return { ok: false, error: 'Şifre en az 6 karakter olmalı.' }

    const exists = users.some((u) => String(u.email).toLowerCase() === e)
    if (exists) return { ok: false, error: 'Bu e-posta ile kayıtlı hesap zaten var.' }

    const id = `U${String(Date.now()).slice(-8)}`
    const user = { id, fullName: name, email: e, password: p, role: 'user', createdAt: new Date().toISOString() }
    setUsers((prev) => [user, ...prev])
    setCurrentUserId(id)
    return { ok: true, user }
  }

  function login({ email, password }) {
    const e = String(email ?? '').trim().toLowerCase()
    const p = String(password ?? '')
    if (!validateEmail(e)) return { ok: false, error: 'Geçerli bir e-posta girin.' }
    if (!p) return { ok: false, error: 'Şifre zorunludur.' }

    const user = users.find((u) => String(u.email).toLowerCase() === e && u.password === p) ?? null
    if (!user) return { ok: false, error: 'E-posta veya şifre hatalı.' }
    setCurrentUserId(user.id)
    return { ok: true, user }
  }

  function logout() {
    setCurrentUserId(null)
  }

  const value = { currentUser, users, register, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

