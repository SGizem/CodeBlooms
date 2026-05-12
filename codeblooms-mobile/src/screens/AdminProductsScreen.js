import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, ScrollView,
  Modal, KeyboardAvoidingView, Platform
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getProducts, addProduct, deleteProduct } from '../api/api'

const CATEGORIES = ['Güller', 'Orkideler', 'Papatyalar', 'Lilyumlar', 'Çikolatalar']

export default function AdminProductsScreen({ navigation }) {
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [showCatPicker, setShowCatPicker] = useState(false)

  // Liste state
  const [products, setProducts] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingAdd, setLoadingAdd] = useState(false)

  // Özel pop-up state
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', actions: null })
  const showPopup = (title, message, actions = null) =>
    setPopup({ visible: true, title, message, actions })
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }))

  useEffect(() => {
    // Auth Guard: admin değilse sayfaya erişim engelle
    const checkAdmin = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user')
        if (!userStr) {
          showPopup(
            'Yetkisiz Erişim',
            'Bu sayfaya erişmek için giriş yapmanız gerekiyor.',
            [{ text: 'Geri Dön', onPress: () => { closePopup(); navigation.goBack() } }]
          )
          return
        }
        const user = JSON.parse(userStr)
        const admin = user?.isAdmin === true || user?.role === 'admin'
        if (!admin) {
          showPopup(
            'Yetkisiz Erişim',
            'Bu sayfaya erişmek için admin yetkisine sahip olmalısınız.',
            [{ text: 'Geri Dön', onPress: () => { closePopup(); navigation.goBack() } }]
          )
          return
        }
      } catch {
        navigation.goBack()
      }
    }
    checkAdmin()
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoadingList(true)
    try {
      const data = await getProducts()
      setProducts(data || [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Ürünler yüklenemedi'
      showPopup('Hata', msg)
    } finally {
      setLoadingList(false)
    }
  }

  const handleAdd = async () => {
    if (!name.trim() || !price || !stock) {
      showPopup('Hata', 'Ad, fiyat ve stok zorunludur')
      return
    }
    const priceNum = parseFloat(price)
    const stockNum = parseInt(stock, 10)
    if (isNaN(priceNum) || priceNum <= 0) {
      showPopup('Hata', 'Geçerli bir fiyat girin')
      return
    }
    if (isNaN(stockNum) || stockNum < 0) {
      showPopup('Hata', 'Geçerli bir stok miktarı girin')
      return
    }
    setLoadingAdd(true)
    try {
      await addProduct({
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        stock: stockNum,
        imageUrl: imageUrl.trim(),
        category,
      })
      setName('')
      setDescription('')
      setPrice('')
      setStock('')
      setImageUrl('')
      setCategory(CATEGORIES[0])
      fetchProducts()
      showPopup('Başarılı', 'Ürün başarıyla eklendi! ✓')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Ürün eklenemedi'
      showPopup('Hata', msg)
    } finally {
      setLoadingAdd(false)
    }
  }

  const handleDelete = (item) => {
    showPopup(
      'Ürünü Sil',
      `"${item.name}" silinsin mi?`,
      [
        {
          text: 'Sil',
          onPress: async () => {
            closePopup()
            try {
              await deleteProduct(item._id)
              fetchProducts()
              showPopup('Başarılı', 'Ürün silindi.')
            } catch (err) {
              const msg = err.response?.data?.message || err.message || 'Ürün silinemedi'
              showPopup('Hata', msg)
            }
          },
        },
        { text: 'İptal', style: 'cancel', onPress: closePopup },
      ]
    )
  }

  const renderProduct = ({ item }) => (
    <View style={styles.productRow}>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productMeta}>{item.category} · {item.price} ₺ · Stok: {item.stock}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Text style={styles.deleteBtnText}>🗑</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Form */}
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>➕ Yeni Ürün Ekle</Text>

          <Text style={styles.label}>Ürün Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ürün adı"
          />

          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ürün açıklaması"
            multiline
            numberOfLines={3}
          />

          <View style={styles.row2}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Fiyat (₺) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Stok *</Text>
              <TextInput
                style={styles.input}
                value={stock}
                onChangeText={setStock}
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.label}>Görsel URL</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://..."
            autoCapitalize="none"
          />

          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity style={styles.catSelect} onPress={() => setShowCatPicker(true)}>
            <Text style={styles.catSelectText}>{category}</Text>
            <Text style={styles.catSelectArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addBtn, loadingAdd && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={loadingAdd}
          >
            {loadingAdd
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.addBtnText}>Ürün Ekle</Text>
            }
          </TouchableOpacity>
        </ScrollView>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Ürün Listesi */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>📦 Ürün Listesi ({products.length})</Text>
            <TouchableOpacity onPress={fetchProducts} disabled={loadingList}>
              <Text style={styles.refreshText}>{loadingList ? '...' : '🔄'}</Text>
            </TouchableOpacity>
          </View>

          {loadingList ? (
            <View style={styles.center}>
              <ActivityIndicator size="small" color="#7B1C3E" />
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => String(item._id)}
              renderItem={renderProduct}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Henüz ürün yok</Text>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>

        {/* Kategori Seçici Modal */}
        <Modal
          visible={showCatPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCatPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCatPicker(false)}
          >
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Kategori Seç</Text>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalOption, category === cat && styles.modalOptionActive]}
                  onPress={() => {
                    setCategory(cat)
                    setShowCatPicker(false)
                  }}
                >
                  <Text style={[styles.modalOptionText, category === cat && styles.modalOptionTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Özel Pop-up */}
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
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },

  formScroll: { flexShrink: 0, maxHeight: '55%' },
  formContent: { padding: 16 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#7B1C3E', marginBottom: 12 },

  label: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#EDE8DE',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  multiline: { minHeight: 70, textAlignVertical: 'top' },

  row2: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },

  catSelect: {
    borderWidth: 1,
    borderColor: '#EDE8DE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catSelectText: { fontSize: 14, color: '#1A1A1A' },
  catSelectArrow: { fontSize: 12, color: '#7B1C3E' },

  addBtn: {
    backgroundColor: '#7B1C3E',
    padding: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  divider: { height: 1, backgroundColor: '#EDE8DE', marginVertical: 4 },

  listSection: { flex: 1, paddingHorizontal: 16 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  refreshText: { fontSize: 18 },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  productMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
  },
  deleteBtnText: { fontSize: 18 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  emptyText: { textAlign: 'center', color: '#999', paddingVertical: 20, fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: 280,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B1C3E',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalOptionActive: { backgroundColor: '#7B1C3E' },
  modalOptionText: { fontSize: 15, color: '#1A1A1A', textAlign: 'center' },
  modalOptionTextActive: { color: '#fff', fontWeight: 'bold' },

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
