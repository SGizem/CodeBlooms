/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockComments } from '../data/mockComments'

export const CommentsContext = createContext(null)

function normalizeComment(raw) {
  if (!raw) return null
  const productId = Number(raw.productId)
  if (!Number.isFinite(productId)) return null
  return {
    id: String(raw.id ?? ''),
    productId,
    authorName: String(raw.authorName ?? '').trim(),
    text: String(raw.text ?? '').trim(),
    rating: Number(raw.rating) || 0,
    createdAt: String(raw.createdAt ?? ''),
  }
}

export function CommentsProvider({ children }) {
  const [comments, setComments] = useState(() => {
    try {
      const raw = localStorage.getItem('cb_comments')
      if (!raw) return mockComments.map(normalizeComment).filter(Boolean)
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map(normalizeComment).filter(Boolean)
        if (normalized.length > 0) return normalized
      }
    } catch {
      // ignore
    }
    return mockComments.map(normalizeComment).filter(Boolean)
  })

  useEffect(() => {
    try {
      localStorage.setItem('cb_comments', JSON.stringify(comments))
    } catch {
      // ignore
    }
  }, [comments])

  const commentsByProductId = useMemo(() => {
    const map = new Map()
    for (const c of comments) {
      const list = map.get(c.productId) ?? []
      list.push(c)
      map.set(c.productId, list)
    }
    for (const [k, list] of map.entries()) {
      map.set(
        k,
        list.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      )
    }
    return map
  }, [comments])

  function addComment(productId, { authorName, text, rating }) {
    const pid = Number(productId)
    const author = String(authorName ?? '').trim()
    const body = String(text ?? '').trim()
    const stars = Number(rating) || 0
    if (!pid || !author || !body) return { ok: false, error: 'Lütfen tüm alanları doldurun.' }
    if (body.length < 3) return { ok: false, error: 'Yorum en az 3 karakter olmalı.' }
    if (body.length > 400) return { ok: false, error: 'Yorum en fazla 400 karakter olmalı.' }

    const createdAt = new Date().toISOString().slice(0, 10)
    const id = `CO${String(Date.now()).slice(-7)}`
    const comment = { id, productId: pid, authorName: author, text: body, rating: stars, createdAt }
    setComments((prev) => [comment, ...prev])
    return { ok: true, id }
  }

  function deleteComment(productId, commentId) {
    const pid = Number(productId)
    const cid = String(commentId)
    setComments((prev) => prev.filter((c) => !(c.productId === pid && c.id === cid)))
  }

  const value = { comments, commentsByProductId, addComment, deleteComment }

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>
}

export function useComments() {
  const ctx = useContext(CommentsContext)
  if (!ctx) throw new Error('useComments must be used inside CommentsProvider')
  return ctx
}

