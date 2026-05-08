import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, ScrollView,
  Platform, Modal, Keyboard
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getProducts } from '../api/api'

const CATEGORIES = ['Tümü', 'Güller', 'Orkideler', 'Papatyalar', 'Lilyumlar', 'Çikolatalar']

// ── Hero Banner — modül düzeyinde sabit bileşen (her render'da yeni instance oluşmaz)
function HeroBanner() {
  return (
    <View style={bannerStyles.container}>
      <View style={bannerStyles.inner}>
        <Text style={bannerStyles.emoji}>🌸</Text>
        <Text style={bannerStyles.title}>CodeBlooms'a Hoş Geldiniz</Text>
        <Text style={bannerStyles.subtitle}>
          Sevdiklerinize en özel çiçekleri{'\n'}ve hediyeleri keşfedin
        </Text>
        <View style={bannerStyles.pill}>
          <Text style={bannerStyles.pillText}>✨ Özel tasarım buketler</Text>
        </View>
      </View>
    </View>
  )
}

const bannerStyles = StyleSheet.create({
  container: {
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#7B1C3E',
    shadowColor: '#7B1C3E',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  inner: { padding: 24, alignItems: 'center' },
  emoji: { fontSize: 40, marginBottom: 8 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  pillText: { fontSize: 12, color: '#fff', fontWeight: '600' },
})

// ── Arama çubuğu — modül düzeyinde bağımsız bileşen.
// Neden burada? FlatList/ScrollView içinde inline ya da ok fonksiyonu
// olarak tanımlanan bileşenler her render'da yeniden mount edilir ve
// klavye kapanır. Modül düzeyinde tanımlamak bunu önler.
const SearchBar = React.memo(function SearchBar({ value, onChange, onSubmit }) {
  return (
    <View style={styles.searchRow}>
      <TextInput
        style={styles.searchInput}
        placeholder="Ürün ara..."
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholderTextColor="#999"
        autoCorrect={false}
        blurOnSubmit={false}
      />
      <TouchableOpacity style={styles.searchBtn} onPress={onSubmit}>
        <Text style={styles.searchBtnText}>🔍</Text>
      </TouchableOpacity>
    </View>
  )
})

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  // searchQuery: yalnızca input değerini tutar — her harfte API isteği ATILMAZ
  const [searchQuery, setSearchQuery] = useState('')
  // search: fetchProducts'a geçilen, yalnızca Enter/buton ile güncellenen değer
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [isAdmin, setIsAdmin] = useState(false)

  // Özel pop-up state
  const [popup, setPopup] = useState({ visible: false, title: '', message: '' })
  const showPopup = (title, message) => setPopup({ visible: true, title, message })
  const closePopup = () => setPopup((p) => ({ ...p, visible: false }))

  // Admin kontrolü
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user')
        if (!userStr) return
        const user = JSON.parse(userStr)
        const admin = user?.isAdmin === true || user?.role === 'admin'
        setIsAdmin(admin)
      } catch {
        // sessizce geç
      }
    }
    checkAdmin()
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProducts(selectedCategory, search)
      setProducts(data || [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Ürünler yüklenemedi'
      showPopup('Hata', msg)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Arama tetikleyici:
  //   1) searchQuery → search state'e yazar → fetchProducts tetiklenir
  //   2) Keyboard.dismiss() → klavye kapanır (yalnızca bu noktada)
  const handleSearch = useCallback(() => {
    Keyboard.dismiss()
    setSearch(searchQuery)
  }, [searchQuery])

  // Ürün kartı — useCallback ile sabitlenmiş, stable referans
  const renderProduct = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.85}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImagePlaceholderText}>🌸</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardPrice}>{item.price} ₺</Text>
      </View>
    </TouchableOpacity>
  ), [navigation])

  return (
    <View style={styles.container}>
      {/* ── Arama çubuğu — ScrollView'ın DIŞINDA, sabit konumda ── */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearch}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Banner */}
        <HeroBanner />

        {/* Kategoriler */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          keyboardShouldPersistTaps="handled"
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bölüm Başlığı */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>
            {selectedCategory === 'Tümü' ? 'Tüm Ürünler' : selectedCategory}
          </Text>
          <Text style={styles.sectionCount}>{products.length} ürün</Text>
        </View>

        {/* Ürün Grid veya Loading */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#7B1C3E" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌷</Text>
            <Text style={styles.emptyText}>Ürün bulunamadı</Text>
          </View>
        ) : (
          chunk(products, 2).map((pair, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {pair.map((item) => (
                <View key={String(item._id)} style={styles.cardWrapper}>
                  {renderProduct({ item })}
                </View>
              ))}
              {pair.length === 1 && <View style={styles.cardWrapper} />}
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB Butonları */}
      <View style={styles.fabContainer}>
        {/* Admin butonu yalnızca admin kullanıcılara görünür */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.fab, styles.fabAdmin]}
            onPress={() => navigation.navigate('AdminProducts')}
          >
            <Text style={styles.fabText}>⚙️</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.fabText}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Özel Pop-up */}
      <Modal visible={popup.visible} transparent animationType="fade" onRequestClose={closePopup}>
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

/** Diziyi n'li parçalara böler */
function chunk(arr, n) {
  const result = []
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n))
  return result
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  scrollContent: { paddingBottom: 20 },

  searchRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDE8DE',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1A1A1A',
  },
  searchBtn: {
    backgroundColor: '#7B1C3E',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: { fontSize: 18 },

  // Kategoriler — sabit boyut, zıplama yok
  catList: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  catBtn: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#EDE8DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBtnActive: { backgroundColor: '#7B1C3E' },
  catText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 18,
    includeFontPadding: false,
  },
  catTextActive: { color: '#fff' },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: 10,
  },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  sectionCount: { fontSize: 13, color: '#999' },

  // Grid
  row: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 12,
    gap: 8,
  },
  cardWrapper: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardImage: { width: '100%', height: 140 },
  cardImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#EDE8DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholderText: { fontSize: 36 },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  cardPrice: { fontSize: 15, fontWeight: 'bold', color: '#7B1C3E' },

  center: { alignItems: 'center', paddingTop: 40 },
  loadingText: { marginTop: 12, color: '#7B1C3E', fontSize: 14 },

  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#1A1A1A', opacity: 0.5 },

  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    gap: 12,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7B1C3E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  fabAdmin: { backgroundColor: '#444' },
  fabText: { fontSize: 22 },

  // Pop-up
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
  },
  popupBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
})
