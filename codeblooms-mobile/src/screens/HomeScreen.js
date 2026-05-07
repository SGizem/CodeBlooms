/**
 * CodeBlooms Mobile — HomeScreen
 *
 * Ürün listeleme ekranı.
 * API: src/api/api.js → getProducts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { getProducts } from '../api/api';

// ---------------------------------------------------------------------------
// Sabitler
// ---------------------------------------------------------------------------

const COLORS = {
  cream:     '#F5F0E8',
  beige:     '#EDE8DE',
  bordeaux:  '#7B1C3E',
  text:      '#1A1A1A',
  white:     '#FFFFFF',
  placeholder: '#9E9E9E',
  border:    '#C8C0B0',
  cardShadow:'#00000014',
  error:     '#C0392B',
};

const FALLBACK_IMAGE =
  'https://via.placeholder.com/300x200/EDE8DE/7B1C3E?text=CodeBlooms';

// ---------------------------------------------------------------------------
// Yardımcı — Fiyat Formatlama
// ---------------------------------------------------------------------------

const formatPrice = (price) =>
  `${Number(price).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;

// ---------------------------------------------------------------------------
// ProductCard bileşeni (FlatList item)
// ---------------------------------------------------------------------------

const ProductCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(item)}
    activeOpacity={0.85}
  >
    <Image
      source={{ uri: item.imageUrl || item.image || FALLBACK_IMAGE }}
      style={styles.cardImage}
      resizeMode="cover"
      onError={(e) => {
        // Resim yüklenemezse fallback gösterilir (source değiştirilemeyeceğinden
        // bu sadece loglama amaçlı)
        console.warn('[HomeScreen] Resim yüklenemedi:', item._id);
      }}
    />

    <View style={styles.cardBody}>
      <Text style={styles.cardName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
    </View>
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// HomeScreen
// ---------------------------------------------------------------------------

export default function HomeScreen({ navigation }) {
  const [products, setProducts]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [refreshing, setRefreshing]     = useState(false);

  // ── Ürünleri Çek ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getProducts();
      const list = Array.isArray(data) ? data : data?.products ?? [];
      setProducts(list);
      setFiltered(list);
      console.log(`[HomeScreen] ${list.length} ürün yüklendi.`);
    } catch (err) {
      Alert.alert('Hata', 'Ürünler yüklenirken bir sorun oluştu.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Arama ─────────────────────────────────────────────────────────────────

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFiltered(products);
      return;
    }
    const lower = text.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower)
      )
    );
  };

  // ── Ürüne Tıklama ─────────────────────────────────────────────────────────

  const handleProductPress = (item) => {
    navigation.navigate('ProductDetail', {
      productId: item._id,
      productName: item.name,
    });
  };

  // ── Boş Liste ─────────────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌸</Text>
      <Text style={styles.emptyText}>
        {search ? 'Aramanızla eşleşen ürün bulunamadı.' : 'Henüz ürün bulunmuyor.'}
      </Text>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      {/* ── Arama Çubuğu ── */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün ara..."
          placeholderTextColor={COLORS.placeholder}
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── İçerik ── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.bordeaux} />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={handleProductPress} />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          onRefresh={() => fetchProducts(true)}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// StyleSheet
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // ── Arama ───────────────────────────────────────────────────────────────
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },

  // ── Liste ────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // ── Ürün Kartı ───────────────────────────────────────────────────────────
  card: {
    flex: 0.5,
    marginHorizontal: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.beige,
  },
  cardBody: {
    padding: 10,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.bordeaux,
  },

  // ── Yükleme ──────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.bordeaux,
    opacity: 0.7,
  },

  // ── Boş Durum ────────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.text,
    opacity: 0.5,
    textAlign: 'center',
  },
});
