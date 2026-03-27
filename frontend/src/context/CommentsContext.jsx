/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api'

export const CommentsContext = createContext(null)

export function CommentsProvider({ children }) {
  const [comments, setComments] = useState([])

  // Herhangi bir ürün sayfası açıldığında API'den tüm yorumları getirebiliriz
  // Ancak backend /api/products/:productId/comments şeklinde istiyor.
  // Performans için şimdilik global olarak değil, sayfa bazlı çekmek daha doğru, 
  // ancak mevcut kod mimarini bozmamak için frontend'i "ürün sayfasına girildiğinde oradan beslenen" bir yapıya uygun tutacağız.
  // Not: Backend yapına göre yorumlar ürüne özel çekiliyor, bu yüzden Context'i dinamik hale getiriyoruz.

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
        list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
    }
    return map
  }, [comments])

  // Yorumları dinamik olarak ürün sayfasından çekmek için dışarıya fonksiyon açıyoruz
  async function fetchCommentsForProduct(productId) {
    try {
      const res = await api.get(`/api/products/${productId}/comments`)
      const fetchedComments = res.data.comments.map(c => ({
        id: String(c._id),
        productId: String(c.product),
        authorName: c.userName,
        text: c.text,
        rating: c.rating,
        createdAt: new Date(c.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        userId: String(c.user)
      }))

      // Sadece o ürüne ait yorumları yenile
      setComments(prev => {
        const otherComments = prev.filter(c => c.productId !== String(productId))
        return [...otherComments, ...fetchedComments]
      })
    } catch (err) {
      console.error('Yorumlar çekilemedi:', err)
    }
  }

  async function addComment(productId, { authorName, text, rating }) {
    const pid = String(productId)
    const body = String(text ?? '').trim()
    const stars = Number(rating) || 0

    if (!pid || !body) return { ok: false, error: 'Lütfen tüm alanları doldurun.' }

    try {
      const res = await api.post(`/api/products/${pid}/comments`, { text: body, rating: stars })
      const c = res.data.comment
      const newComment = {
        id: String(c._id),
        productId: String(c.product),
        authorName: c.userName,
        text: c.text,
        rating: c.rating,
        createdAt: new Date(c.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        userId: String(c.user)
      }
      setComments((prev) => [newComment, ...prev])
      return { ok: true, id: newComment.id }
    } catch (err) {
      return { ok: false, error: err.response?.data?.message || 'Yorum eklenemedi.' }
    }
  }

  async function deleteComment(productId, commentId) {
    try {
      await api.delete(`/api/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== String(commentId)))
    } catch (err) {
      console.error('Yorum silme hatası:', err)
    }
  }

  const value = { comments, commentsByProductId, fetchCommentsForProduct, addComment, deleteComment }

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>
}

export function useComments() {
  const ctx = useContext(CommentsContext)
  if (!ctx) throw new Error('useComments must be used inside CommentsProvider')
  return ctx
}