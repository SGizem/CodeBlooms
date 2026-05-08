import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform, Modal
} from 'react-native'
import { createOrder, addGiftNote } from '../api/api'

/**
 * PaymentScreen — Ödeme Bilgileri
 *
 * route.params: { address, recipient, giftNote, cartItems }
 *
 * Burada asıl sipariş API isteği (createOrder + addGiftNote) atılır.
 * Başarı durumunda MyOrders'a yönlendirilir.
 */
export default function PaymentScreen({ route, navigation }) {
  const { address, recipient, giftNote, cartItems } = route.params || {}

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)

  // Özel pop-up state
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', actions: null })
  const showPopup = (title, message, actions = null) =>
    setPopup({ visible: true, title, message, actions })
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }))

  // ── Kart numarası formatlayıcı (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  // ── Son kullanma tarihi formatlayıcı (MM/YY)
  const formatExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  // ── Sipariş oluştur
  const handleCompleteOrder = async () => {
    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      showPopup('Eksik Bilgi', 'Lütfen tüm kart bilgilerini eksiksiz doldurun.')
      return
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      showPopup('Geçersiz Kart', 'Kart numarası 16 haneli olmalıdır.')
      return
    }
    if (cvv.length < 3) {
      showPopup('Geçersiz CVV', 'CVV en az 3 haneli olmalıdır.')
      return
    }

    setLoading(true)
    try {
      // 1) Siparişi oluştur
      const order = await createOrder(address, recipient, cartItems, giftNote)

      // 2) Hediye notu varsa ekle
      if (giftNote?.trim() && order?._id) {
        try {
          await addGiftNote(order._id, giftNote.trim())
        } catch {
          // Hediye notu eklenemedi — sipariş yine de tamamlandı
        }
      }

      showPopup(
        '🎉 Sipariş Tamamlandı!',
        'Siparişiniz başarıyla alındı. Kısa süre içinde hazırlanmaya başlanacak.',
        [
          {
            text: 'Siparişlerime Git',
            onPress: () => {
              closePopup()
              navigation.navigate('MyOrders')
            },
          },
        ]
      )
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Sipariş oluşturulamadı'
      showPopup('Hata', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Özet ──────────────────────────────────────────── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📦 Sipariş Özeti</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Alıcı</Text>
            <Text style={styles.summaryValue}>{recipient}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Adres</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>{address}</Text>
          </View>
          {giftNote ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hediye Notu</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>{giftNote}</Text>
            </View>
          ) : null}
          {cartItems && cartItems.length > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ürünler</Text>
              <Text style={styles.summaryValue}>
                {cartItems.map((i) => `${i.name} x${i.quantity}`).join(', ')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Ödeme Formu ───────────────────────────────────── */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>💳 Kart Bilgileri</Text>

          {/* Kart Üzerindeki İsim */}
          <Text style={styles.label}>Kart Üzerindeki İsim</Text>
          <TextInput
            style={styles.input}
            value={cardName}
            onChangeText={setCardName}
            placeholder="AD SOYAD"
            autoCapitalize="characters"
            placeholderTextColor="#BDBDBD"
          />

          {/* Kart Numarası */}
          <Text style={styles.label}>Kart Numarası</Text>
          <TextInput
            style={[styles.input, styles.cardNumberInput]}
            value={cardNumber}
            onChangeText={(t) => setCardNumber(formatCardNumber(t))}
            placeholder="0000 0000 0000 0000"
            keyboardType="number-pad"
            maxLength={19}
            placeholderTextColor="#BDBDBD"
          />

          {/* Son Kullanma & CVV */}
          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Son Kullanma</Text>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={(t) => setExpiry(formatExpiry(t))}
                placeholder="AA/YY"
                keyboardType="number-pad"
                maxLength={5}
                placeholderTextColor="#BDBDBD"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                placeholderTextColor="#BDBDBD"
              />
            </View>
          </View>

          {/* Güvenlik notu */}
          <View style={styles.secureNote}>
            <Text style={styles.secureNoteText}>🔒 Ödeme bilgileriniz SSL ile korunmaktadır</Text>
          </View>
        </View>

        {/* ── Siparişi Tamamla Butonu ───────────────────────── */}
        <TouchableOpacity
          style={[styles.orderBtn, loading && styles.orderBtnDisabled]}
          onPress={handleCompleteOrder}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="large" />
            : (
              <>
                <Text style={styles.orderBtnText}>Siparişi Tamamla 🎉</Text>
                <Text style={styles.orderBtnSub}>Güvenli Ödeme</Text>
              </>
            )
          }
        </TouchableOpacity>
      </ScrollView>

      {/* ── Özel Pop-up ── */}
      <Modal
        visible={popup.visible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            {popup.title ? <Text style={styles.popupTitle}>{popup.title}</Text> : null}
            {popup.message ? <Text style={styles.popupMessage}>{popup.message}</Text> : null}
            <View style={styles.popupActions}>
              {popup.actions ? (
                popup.actions.map((a, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.popupBtn, a.style === 'cancel' && styles.popupBtnCancel]}
                    onPress={a.onPress}
                  >
                    <Text style={[styles.popupBtnText, a.style === 'cancel' && styles.popupBtnCancelText]}>
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
  content: { padding: 16, paddingBottom: 50 },

  // ── Özet Kartı
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B1C3E',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 13, color: '#888', flex: 1 },
  summaryValue: { fontSize: 13, color: '#1A1A1A', fontWeight: '600', flex: 2, textAlign: 'right' },

  // ── Form Kartı
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#7B1C3E',
    marginBottom: 18,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B1C3E',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#7B1C3E',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: '#FEFCF9',
    color: '#1A1A1A',
  },
  cardNumberInput: {
    letterSpacing: 2,
    fontWeight: '600',
  },

  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: { flex: 1 },

  secureNote: {
    backgroundColor: '#F0FFF4',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  secureNoteText: {
    fontSize: 12,
    color: '#2D6A4F',
    textAlign: 'center',
    fontWeight: '600',
  },

  // ── Sipariş Butonu
  orderBtn: {
    backgroundColor: '#7B1C3E',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7B1C3E',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  orderBtnSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },

  // ── Pop-up
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
    paddingVertical: 13,
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
