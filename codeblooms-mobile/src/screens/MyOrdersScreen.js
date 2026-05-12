import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, TextInput, Modal,
  Image, KeyboardAvoidingView, Platform
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getOrders, updateOrder } from '../api/api'

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

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  // Güncelleme modali
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [recipient, setRecipient] = useState('')
  const [address, setAddress] = useState('')
  const [giftNote, setGiftNote] = useState('')
  const [updating, setUpdating] = useState(false)

  // Özel pop-up state
  const [popup, setPopup] = useState({ visible: false, title: '', message: '' })
  const showPopup = (title, message) => setPopup({ visible: true, title, message })
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }))

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const userStr = await AsyncStorage.getItem('user')
      if (!userStr) {
        showPopup('Hata', 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.')
        return
      }
      const user = JSON.parse(userStr)
      const userId = user._id || user.id
      const data = await getOrders(userId)
      setOrders(data || [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Siparişler yüklenemedi'
      showPopup('Hata', msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const openUpdateModal = (order) => {
    setSelectedOrder(order)
    setRecipient(order.recipient || '')
    setAddress(order.address || '')
    setGiftNote(order.giftNote || '')
    setModalVisible(true)
  }

  const handleUpdate = async () => {
    if (!recipient.trim() || !address.trim()) {
      showPopup('Hata', 'Alıcı adı ve adres zorunludur')
      return
    }
    setUpdating(true)
    try {
      await updateOrder(selectedOrder._id, address.trim(), recipient.trim(), giftNote.trim())
      setModalVisible(false)
      showPopup('Başarılı', 'Sipariş güncellendi ✓')
      fetchOrders()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Güncelleme başarısız'
      showPopup('Hata', msg)
    } finally {
      setUpdating(false)
    }
  }

  const isActive = (status) => status !== 'delivered' && status !== 'cancelled'

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const renderOrder = ({ item }) => {
    const statusColor = STATUS_COLORS[item.status] || '#9CA3AF'
    const statusLabel = STATUS_LABELS[item.status] || item.status

    return (
      <View style={styles.card}>
        {/* Kart Başlığı */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>
              #{String(item._id).slice(-8).toUpperCase()}
            </Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Ürünler — resimli */}
        {item.items && item.items.length > 0 && (
          <View style={styles.itemsContainer}>
            {item.items.map((p, idx) => {
              const imgUrl = p.product?.imageUrl ?? p.imageUrl ?? ''
              const pName = p.name || p.product?.name || p.productId || 'Ürün'
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

        {/* Alıcı & Adres & Hediye Notu */}
        {item.recipient ? (
          <Text style={styles.infoLine}>👤 {item.recipient}</Text>
        ) : null}
        {item.address ? (
          <Text style={styles.infoLine} numberOfLines={2}>📍 {item.address}</Text>
        ) : null}
        {item.giftNote ? (
          <Text style={styles.infoLine} numberOfLines={2}>🎁 {item.giftNote}</Text>
        ) : null}

        {/* Toplam */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalAmount}>{item.total ?? item.totalPrice ?? '—'} ₺</Text>
        </View>

        {/* Güncelle Butonu */}
        {isActive(item.status) && (
          <TouchableOpacity style={styles.updateBtn} onPress={() => openUpdateModal(item)}>
            <Text style={styles.updateBtnText}>✏️ Güncelle</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7B1C3E" />
          <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.listHeaderRow}>
              <Text style={styles.pageTitle}>Siparişlerim ({orders.length})</Text>
              <TouchableOpacity onPress={fetchOrders}>
                <Text style={styles.refreshText}>🔄</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Henüz sipariş yok</Text>
            </View>
          }
        />
      )}

      {/* ── Güncelleme Modali ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Siparişi Güncelle</Text>

            <Text style={styles.modalLabel}>Alıcı Adı *</Text>
            <TextInput
              style={styles.modalInput}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Ad Soyad"
            />

            <Text style={styles.modalLabel}>Teslimat Adresi *</Text>
            <TextInput
              style={[styles.modalInput, styles.modalMultiline]}
              value={address}
              onChangeText={setAddress}
              placeholder="Adres"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.modalLabel}>Hediye Notu</Text>
            <TextInput
              style={[styles.modalInput, styles.modalMultiline]}
              value={giftNote}
              onChangeText={setGiftNote}
              placeholder="İsteğe bağlı hediye notu"
              multiline
              numberOfLines={2}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={updating}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, updating && styles.modalSaveBtnDisabled]}
                onPress={handleUpdate}
                disabled={updating}
              >
                {updating
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalSaveText}>Kaydet</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Özel Pop-up ── */}
      <Modal
        visible={popup.visible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupTitle}>{popup.title}</Text>
            <Text style={styles.popupMessage}>{popup.message}</Text>
            <TouchableOpacity style={styles.popupBtn} onPress={closePopup}>
              <Text style={styles.popupBtnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },

  listContent: { padding: 16, paddingBottom: 40 },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#7B1C3E' },
  refreshText: { fontSize: 22 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  orderDate: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },

  itemsContainer: {
    backgroundColor: '#F9F7F3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
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

  infoLine: { fontSize: 13, color: '#555', marginBottom: 4 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EDE8DE',
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: { fontSize: 14, color: '#666' },
  totalAmount: { fontSize: 16, fontWeight: 'bold', color: '#7B1C3E' },

  updateBtn: {
    marginTop: 10,
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    padding: 12,
    alignItems: 'center',
  },
  updateBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#7B1C3E', fontSize: 14 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#999' },

  // Güncelleme Modal
  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7B1C3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#EDE8DE',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  modalMultiline: { minHeight: 70, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EDE8DE',
    borderRadius: 50,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, color: '#666' },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    padding: 14,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: { opacity: 0.6 },
  modalSaveText: { fontSize: 15, color: '#fff', fontWeight: 'bold' },

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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  popupTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#7B1C3E',
    marginBottom: 10,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 15,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  popupBtn: {
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  popupBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
})
