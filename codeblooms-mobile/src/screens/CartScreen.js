import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Image, Modal
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getCart, updateCartItem, removeFromCart } from '../api/api'

// ── Özel Pop-up Bileşeni ──────────────────────────────────────────────────────
function PopupModal({ visible, title, message, onClose, actions }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={popupStyles.overlay}>
        <View style={popupStyles.box}>
          {title ? <Text style={popupStyles.title}>{title}</Text> : null}
          {message ? <Text style={popupStyles.message}>{message}</Text> : null}
          <View style={popupStyles.actions}>
            {actions
              ? actions.map((a, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[popupStyles.btn, a.style === 'cancel' && popupStyles.btnCancel]}
                    onPress={a.onPress}
                  >
                    <Text style={[popupStyles.btnText, a.style === 'cancel' && popupStyles.btnCancelText]}>
                      {a.text}
                    </Text>
                  </TouchableOpacity>
                ))
              : (
                <TouchableOpacity style={popupStyles.btn} onPress={onClose}>
                  <Text style={popupStyles.btnText}>Tamam</Text>
                </TouchableOpacity>
              )
            }
          </View>
        </View>
      </View>
    </Modal>
  )
}

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  box: {
    backgroundColor: '#F5F0E8',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#7B1C3E',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EDE8DE',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnCancelText: { color: '#7B1C3E' },
})
// ─────────────────────────────────────────────────────────────────────────────

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets()

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  // Pop-up state
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', actions: null })
  const showPopup = (title, message, actions = null) =>
    setPopup({ visible: true, title, message, actions })
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }))

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCart()
      setCart(data)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Sepet yüklenemedi'
      showPopup('Hata', msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const handleUpdateQty = async (item, newQty) => {
    if (newQty < 1) {
      handleRemove(item)
      return
    }
    setUpdatingId(item._id)
    try {
      const updated = await updateCartItem(item._id, newQty)
      setCart(updated)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Güncelleme başarısız'
      showPopup('Hata', msg)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (item) => {
    setUpdatingId(item._id)
    try {
      const updated = await removeFromCart(item._id)
      setCart(updated)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Ürün kaldırılamadı'
      showPopup('Hata', msg)
    } finally {
      setUpdatingId(null)
    }
  }

  const calcTotal = () => {
    if (!cart?.items || cart.items.length === 0) return '0.00'
    return cart.items
      .reduce((sum, item) => {
        const price = item.product?.price ?? item.price ?? 0
        return sum + price * item.quantity
      }, 0)
      .toFixed(2)
  }

  const renderItem = ({ item }) => {
    const price = item.product?.price ?? item.price ?? 0
    const name = item.product?.name ?? item.name ?? 'Ürün'
    const imageUrl = item.product?.imageUrl ?? item.imageUrl ?? ''
    const isUpdating = updatingId === item._id

    return (
      <View style={styles.itemCard}>
        {/* Ürün Görseli */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Text style={styles.itemImageEmoji}>🌸</Text>
          </View>
        )}

        {/* Ürün Bilgisi */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
          <Text style={styles.itemPrice}>{price} ₺</Text>

          {/* Miktar Kontrolü */}
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleUpdateQty(item, item.quantity - 1)}
              disabled={isUpdating}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            {isUpdating ? (
              <ActivityIndicator size="small" color="#7B1C3E" style={styles.qtyLoading} />
            ) : (
              <Text style={styles.qtyValue}>{item.quantity}</Text>
            )}

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleUpdateQty(item, item.quantity + 1)}
              disabled={isUpdating}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sil Butonu */}
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item)}
          disabled={isUpdating}
        >
          <Text style={styles.removeBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const items = cart?.items || []

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7B1C3E" />
        <Text style={styles.loadingText}>Sepet yükleniyor...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Sepetiniz boş</Text>
            <Text style={styles.emptySubtitle}>Ürün eklemek için alışverişe başlayın</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopBtnText}>Alışverişe Başla</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? <View style={styles.footerSpace} /> : null
        }
      />

      {/* Özet & Sipariş Butonu */}
      {items.length > 0 && (
        <View style={[styles.summary, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ürünler ({items.length})</Text>
            <Text style={styles.summaryValue}>{calcTotal()} ₺</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{calcTotal()} ₺</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout', { cart })}
          >
            <Text style={styles.checkoutBtnText}>Siparişe Git →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Özel Pop-up */}
      <PopupModal
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        actions={popup.actions}
        onClose={closePopup}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },

  listContent: { padding: 16, paddingBottom: 10 },
  footerSpace: { height: 20 },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EDE8DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImageEmoji: { fontSize: 28 },

  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#7B1C3E', marginBottom: 8 },

  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EDE8DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#7B1C3E', lineHeight: 22 },
  qtyValue: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  qtyLoading: { minWidth: 32 },

  removeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    marginLeft: 8,
  },
  removeBtnText: { fontSize: 18 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#7B1C3E', fontSize: 14 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#999', marginBottom: 24 },
  shopBtn: {
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  summary: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 20, // insets ile runtime'da override edilir
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EDE8DE', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#7B1C3E' },
  checkoutBtn: {
    backgroundColor: '#7B1C3E',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  checkoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
})
