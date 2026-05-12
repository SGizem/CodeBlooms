import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, ScrollView,
  KeyboardAvoidingView, Platform, Modal, Keyboard
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { addToCart, addComment, deleteComment } from '../api/api'

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params

  const [comments, setComments] = useState(product.comments || [])
  const [commentText, setCommentText] = useState('')
  const [rating, setRating] = useState(5)
  const [addingComment, setAddingComment] = useState(false)
  const [addingCart, setAddingCart] = useState(false)

  // Giriş yapmış kullanıcı — yorum user bilgisi backend'den dönmezse buradan enjekte edilir
  const [currentUser, setCurrentUser] = useState(null)

  // Sayfa açılınca AsyncStorage'dan kullanıcıyı çek
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user')
        if (userStr) setCurrentUser(JSON.parse(userStr))
      } catch {
        // sessizce geç
      }
    }
    loadUser()
  }, [])

  // ScrollView ref — yorum alanına odaklanınca sayfayı otomatik afla kaydır
  const scrollViewRef = useRef(null)

  // Özel Pop-up state
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    actions: null,
  })
  const showPopup = (title, message, actions = null) =>
    setPopup({ visible: true, title, message, actions })
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }))

  // ── Sepete Ekle — Auth Guard ────────────────────────────────────────────────
  const handleAddToCart = async () => {
    // Token kontrolü — yoksa giriş ekranına yönlendir
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      showPopup(
        'Giriş Gerekli',
        'Sepete ürün eklemek için giriş yapmanız gerekmektedir.',
        [
          {
            text: 'Giriş Yap',
            onPress: () => {
              closePopup()
              navigation.navigate('Login')
            },
          },
          { text: 'İptal', style: 'cancel', onPress: closePopup },
        ]
      )
      return
    }

    setAddingCart(true)
    try {
      await addToCart(product._id, 1)
      showPopup(
        '🛒 Sepete Eklendi',
        `${product.name} sepetinize eklendi!`,
        [
          {
            text: 'Sepete Git',
            onPress: () => {
              closePopup()
              navigation.navigate('Cart')
            },
          },
          { text: 'Alışverişe Devam', style: 'cancel', onPress: closePopup },
        ]
      )
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Sepete eklenemedi'
      showPopup('Hata', msg)
    } finally {
      setAddingCart(false)
    }
  }

  // ── Yorum Ekle ──────────────────────────────────────────────────────────────
  const handleAddComment = async () => {
    // Klavyeyi hemen kapat — buton basılınca klavye kapanmalı
    Keyboard.dismiss()

    if (!commentText.trim()) {
      showPopup('Hata', 'Yorum metni boş olamaz')
      return
    }
    setAddingComment(true)
    try {
      const newComment = await addComment(product._id, commentText.trim(), rating)
      if (newComment) {
        // ── Backend user objesini populate etmemiş olabilir.
        // Eksikse AsyncStorage'dan alınan currentUser'ı enjekte et.
        const commentToStore = { ...newComment }
        const hasUserName =
          commentToStore.user?.firstName ||
          commentToStore.user?.lastName ||
          commentToStore.user?.name ||
          commentToStore.user?.username ||
          commentToStore.user?.email
        if (!hasUserName && currentUser) {
          commentToStore.user = currentUser
        }
        setComments((prev) => [commentToStore, ...prev])
      }
      // State sıfırlanırken klavyenin yeniden açılmasını önle
      Keyboard.dismiss()
      setCommentText('')
      setRating(5)
      showPopup('✓ Yorum Eklendi', 'Yorumunuz başarıyla paylaşıldı.')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Yorum eklenemedi'
      showPopup('Hata', msg)
    } finally {
      setAddingComment(false)
    }
  }

  // ── Yorum Sil ───────────────────────────────────────────────────────────────
  const handleDeleteComment = (comment) => {
    showPopup(
      'Yorumu Sil',
      'Bu yorum kalıcı olarak silinecek. Emin misiniz?',
      [
        {
          text: 'Sil',
          onPress: async () => {
            closePopup()
            try {
              await deleteComment(comment._id)
              setComments((prev) => prev.filter((c) => c._id !== comment._id))
            } catch (err) {
              const msg = err.response?.data?.message || err.message || 'Yorum silinemedi'
              showPopup('Hata', msg)
            }
          },
        },
        { text: 'İptal', style: 'cancel', onPress: closePopup },
      ]
    )
  }

  // ── Yıldız render ───────────────────────────────────────────────────────────
  const renderStars = (count, interactive = false) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity
          key={s}
          onPress={interactive ? () => setRating(s) : undefined}
          disabled={!interactive}
          activeOpacity={interactive ? 0.7 : 1}
        >
          <Text style={[styles.star, s <= count && styles.starFilled]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Ürün Resmi */}
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🌸</Text>
          </View>
        )}

        {/* Ürün Bilgisi */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price} ₺</Text>
          {product.description ? (
            <Text style={styles.productDesc}>{product.description}</Text>
          ) : null}
          {product.stock !== undefined && (
            <Text style={styles.stockText}>
              {product.stock > 0 ? `Stok: ${product.stock} adet` : '⚠️ Stokta yok'}
            </Text>
          )}
        </View>

        {/* Sepete Ekle */}
        <TouchableOpacity
          style={[styles.cartBtn, addingCart && styles.cartBtnDisabled]}
          onPress={handleAddToCart}
          disabled={addingCart || product.stock === 0}
        >
          {addingCart
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.cartBtnText}>🛒 Sepete Ekle</Text>
          }
        </TouchableOpacity>

        {/* Yorum Formu */}
        <View style={styles.commentForm}>
          <Text style={styles.sectionTitle}>💬 Yorum Yap</Text>
          <Text style={styles.ratingLabel}>Puanınız:</Text>
          {renderStars(rating, true)}
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Ürün hakkında düşünceleriniz..."
            multiline
            numberOfLines={3}
            autoFocus={false}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }, 300)
            }}
          />
          <TouchableOpacity
            style={[styles.submitBtn, addingComment && styles.submitBtnDisabled]}
            onPress={handleAddComment}
            disabled={addingComment}
          >
            {addingComment
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.submitBtnText}>Yorum Gönder</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Yorumlar */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>📝 Yorumlar ({comments.length})</Text>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Henüz yorum yok. İlk yorumu siz yapın!</Text>
          ) : (
            comments.map((c) => (
              <View key={String(c._id)} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>
                    {(() => {
                      const u = c.user || c.userId
                      if (!u) return 'İsimsiz Kullanıcı'
                      // firstName + lastName birleştir
                      const fullName = [
                        u.firstName || '',
                        u.lastName || '',
                      ].filter(Boolean).join(' ')
                      if (fullName.trim()) return fullName.trim()
                      // Fallback zinciri
                      return u.name || u.username || u.email || 'İsimsiz Kullanıcı'
                    })()}
                  </Text>
                  {renderStars(c.rating)}
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
                <TouchableOpacity
                  style={styles.deleteCommentBtn}
                  onPress={() => handleDeleteComment(c)}
                >
                  <Text style={styles.deleteCommentText}>🗑 Sil</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Özel Pop-up Modal ── */}
      <Modal
        visible={popup.visible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            {popup.title ? (
              <Text style={styles.popupTitle}>{popup.title}</Text>
            ) : null}
            {popup.message ? (
              <Text style={styles.popupMessage}>{popup.message}</Text>
            ) : null}
            <View style={styles.popupActions}>
              {popup.actions ? (
                popup.actions.map((a, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.popupBtn,
                      a.style === 'cancel' && styles.popupBtnCancel,
                    ]}
                    onPress={a.onPress}
                  >
                    <Text
                      style={[
                        styles.popupBtnText,
                        a.style === 'cancel' && styles.popupBtnCancelText,
                      ]}
                    >
                      {a.text}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity style={styles.popupBtn} onPress={closePopup}>
                  <Text style={styles.popupBtnText}>Tamam</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  content: { flexGrow: 1, paddingBottom: 150 },

  productImage: { width: '100%', height: 280 },
  imagePlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: '#EDE8DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { fontSize: 72 },

  infoSection: { padding: 20 },
  productName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  productPrice: { fontSize: 24, fontWeight: 'bold', color: '#7B1C3E', marginBottom: 8 },
  productDesc: { fontSize: 15, color: '#555', lineHeight: 22 },
  stockText: { marginTop: 8, fontSize: 13, color: '#888' },

  cartBtn: {
    marginHorizontal: 20,
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  cartBtnDisabled: { opacity: 0.6 },
  cartBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  commentForm: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#7B1C3E', marginBottom: 12 },
  ratingLabel: { fontSize: 13, color: '#555', marginBottom: 6 },
  starsRow: { flexDirection: 'row', marginBottom: 12 },
  star: { fontSize: 28, color: '#D1D5DB', marginRight: 4 },
  starFilled: { color: '#F59E0B' },
  commentInput: {
    borderWidth: 1,
    borderColor: '#EDE8DE',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    padding: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  commentsSection: { marginHorizontal: 20 },
  noComments: { color: '#999', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUser: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  commentText: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 8 },
  deleteCommentBtn: { alignSelf: 'flex-end' },
  deleteCommentText: { fontSize: 12, color: '#CC2222' },

  // Özel Pop-up
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  popupBox: {
    backgroundColor: '#F5F0E8',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  popupTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#7B1C3E',
    textAlign: 'center',
    marginBottom: 10,
  },
  popupMessage: {
    fontSize: 15,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  popupActions: { flexDirection: 'row', gap: 10 },
  popupBtn: {
    flex: 1,
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
  },
  popupBtnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EDE8DE',
  },
  popupBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  popupBtnCancelText: { color: '#7B1C3E' },
})
