import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Image,
  KeyboardAvoidingView, Platform, Modal
} from 'react-native'
import { getCart, cancelOrder, deleteGiftNote, getOrders } from '../api/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function CheckoutScreen({ navigation, route }) {
  const [address, setAddress] = useState('')
  const [recipient, setRecipient] = useState('')
  const [giftNote, setGiftNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Sipariş listesi (iptal / hediye notu silme için)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)
  const [deletingNoteId, setDeletingNoteId] = useState(null)

  // Özel Pop-up state
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', actions: null })
  const showPopup = (title, message, actions = null) =>
    setPopup({ visible: true, title, message, actions })
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }))

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const userStr = await AsyncStorage.getItem('user')
      if (!userStr) return
      const user = JSON.parse(userStr)
      const userId = user._id || user.id
      const data = await getOrders(userId)
      setOrders(data || [])
    } catch {
      // Sessizce başarısız ol
    } finally {
      setLoadingOrders(false)
    }
  }

  // Teslimat bilgilerini doğrula ve Ödeme sayfasına geç
  const handleGoToPayment = async () => {
    if (!address.trim() || !recipient.trim()) {
      showPopup('Hata', 'Adres ve alıcı adı zorunludur')
      return
    }
    setLoading(true)
    try {
      const cart = await getCart()
      if (!cart?.items || cart.items.length === 0) {
        showPopup('Hata', 'Sepetiniz boş')
        return
      }
      const cartItems = cart.items.map((i) => ({
        productId: i.product?._id || i.productId,
        quantity: i.quantity,
        price: i.product?.price ?? i.price ?? 0,
        name: i.product?.name ?? i.name ?? '',
        imageUrl: i.product?.imageUrl ?? i.imageUrl ?? '',
      }))
      navigation.navigate('Payment', {
        address: address.trim(),
        recipient: recipient.trim(),
        giftNote: giftNote.trim(),
        cartItems,
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Sepet alınamadı'
      showPopup('Hata', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = (order) => {
    showPopup(
      'Siparişi İptal Et',
      `#${String(order._id).slice(-6).toUpperCase()} numaralı sipariş iptal edilsin mi?`,
      [
        {
          text: 'İptal Et',
          onPress: async () => {
            closePopup()
            setCancellingId(order._id)
            try {
              await cancelOrder(order._id)
              fetchOrders()
              showPopup('Başarılı', 'Sipariş iptal edildi.')
            } catch (err) {
              const msg = err.response?.data?.message || err.message || 'İptal başarısız'
              showPopup('Hata', msg)
            } finally {
              setCancellingId(null)
            }
          },
        },
        { text: 'Vazgeç', style: 'cancel', onPress: closePopup },
      ]
    )
  }

  const handleDeleteNote = (orderId, noteId) => {
    const key = `${orderId}_${noteId}`
    showPopup('Hediye Notunu Sil', 'Bu not kalıcı olarak silinecek. Emin misiniz?', [
      {
        text: 'Sil',
        onPress: async () => {
          closePopup()
          setDeletingNoteId(key)
          try {
            await deleteGiftNote(orderId, noteId)
            fetchOrders()
            showPopup('Başarılı', 'Hediye notu silindi.')
          } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Not silinemedi'
            showPopup('Hata', msg)
          } finally {
            setDeletingNoteId(null)
          }
        },
      },
      { text: 'İptal', style: 'cancel', onPress: closePopup },
    ])
  }

  const isActive = (status) => status !== 'delivered' && status !== 'cancelled'

  const STATUS_LABELS = {
    preparing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
  }
  const STATUS_COLORS = {
    preparing: '#F59E0B',
    shipped: '#3B82F6',
    delivered: '#10B981',
    cancelled: '#9CA3AF',
  }

  const renderOrder = ({ item }) => {
    const isCancelling = cancellingId === item._id
    const statusColor = STATUS_COLORS[item.status] || '#9CA3AF'
    const statusLabel = STATUS_LABELS[item.status] || item.status

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>#{String(item._id).slice(-8).toUpperCase()}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Ürün Thumbnails */}
        {item.items && item.items.length > 0 && (
          <View style={styles.itemsContainer}>
            {item.items.map((p, idx) => {
              const imgUrl = p.product?.imageUrl ?? p.imageUrl ?? ''
              const pName = p.name || p.product?.name || 'Ürün'
              return (
                <View key={idx} style={styles.productRow}>
                  {imgUrl ? (
                    <Image
                      source={{ uri: imgUrl }}
                      style={styles.productThumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.productThumbPlaceholder}>
                      <Text style={{ fontSize: 14 }}>🌸</Text>
                    </View>
                  )}
                  <Text style={styles.productLine} numberOfLines={1}>
                    {pName} × {p.quantity}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Hediye Notları */}
        {item.giftNotes && item.giftNotes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>🎀 Hediye Notları</Text>
            {item.giftNotes.map((n) => {
              const noteId = n._id || n.id
              const key = `${item._id}_${noteId}`
              return (
                <View key={key} style={styles.noteRow}>
                  <Text style={styles.noteText} numberOfLines={2}>{n.note || n.text}</Text>
                  <TouchableOpacity
                    style={styles.deleteNoteBtn}
                    onPress={() => handleDeleteNote(item._id, noteId)}
                    disabled={deletingNoteId === key}
                  >
                    {deletingNoteId === key
                      ? <ActivityIndicator size="small" color="#CC2222" />
                      : <Text style={styles.deleteNoteBtnText}>✕</Text>
                    }
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        )}

        {/* İptal Butonu */}
        {isActive(item.status) && (
          <TouchableOpacity
            style={[styles.cancelBtn, isCancelling && styles.cancelBtnDisabled]}
            onPress={() => handleCancelOrder(item)}
            disabled={isCancelling}
          >
            {isCancelling
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.cancelBtnText}>✕ Siparişi İptal Et</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ── Sipariş Formu ── */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>📦 Teslimat Bilgileri</Text>

          <Text style={styles.label}>Alıcı Adı Soyadı *</Text>
          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Ad Soyad"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Teslimat Adresi *</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={address}
            onChangeText={setAddress}
            placeholder="Mahalle, cadde, sokak, kapı no, şehir"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>🎀 Hediye Notu (İsteğe Bağlı)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={giftNote}
            onChangeText={setGiftNote}
            placeholder="Sevdiklerinize özel bir mesaj yazın..."
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.orderBtn, loading && styles.orderBtnDisabled]}
            onPress={handleGoToPayment}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.orderBtnText}>Ödeme Adımına Geç →</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Sipariş Yönetimi ── */}
        <Text style={styles.orderListTitle}>📋 Siparişlerim</Text>

        {loadingOrders ? (
          <View style={styles.centerSmall}>
            <ActivityIndicator color="#7B1C3E" />
          </View>
        ) : orders.length === 0 ? (
          <Text style={styles.emptyOrders}>Henüz sipariş yok</Text>
        ) : (
          orders.map((item) => (
            <View key={String(item._id)}>
              {renderOrder({ item })}
            </View>
          ))
        )}
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
  content: { padding: 16, paddingBottom: 40 },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#7B1C3E', marginBottom: 16 },

  label: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#EDE8DE',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },

  orderBtn: {
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  orderListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B1C3E',
    marginBottom: 12,
  },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  notesSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  notesTitle: { fontSize: 13, fontWeight: '600', color: '#7B1C3E', marginBottom: 8 },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteText: { flex: 1, fontSize: 13, color: '#444', marginRight: 8 },
  deleteNoteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteNoteBtnText: { fontSize: 12, color: '#CC2222', fontWeight: 'bold' },

  cancelBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 50,
    padding: 12,
    alignItems: 'center',
  },
  cancelBtnDisabled: { opacity: 0.6 },
  cancelBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  centerSmall: { paddingVertical: 20, alignItems: 'center' },
  emptyOrders: { textAlign: 'center', color: '#999', paddingVertical: 20, fontSize: 14 },

  // Ürün thumbnails
  itemsContainer: {
    backgroundColor: '#F9F7F3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  productThumbPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#EDE8DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  productLine: { flex: 1, fontSize: 13, color: '#444' },

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
