/**
 * CodeBlooms Mobile — AdminProductsScreen
 *
 * Yönetici ürün yönetimi ekranı.
 * API: src/api/api.js → getProducts, addProduct, deleteProduct
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { getProducts, addProduct, deleteProduct } from '../api/api';

// ---------------------------------------------------------------------------
// Sabitler
// ---------------------------------------------------------------------------

const COLORS = {
  cream:      '#F5F0E8',
  beige:      '#EDE8DE',
  bordeaux:   '#7B1C3E',
  text:       '#1A1A1A',
  white:      '#FFFFFF',
  placeholder:'#9E9E9E',
  border:     '#C8C0B0',
  danger:     '#C0392B',
  dangerBg:   '#FDECEA',
  success:    '#27AE60',
};

const FALLBACK_IMAGE =
  'https://via.placeholder.com/80x80/EDE8DE/7B1C3E?text=%F0%9F%8C%B8';

const INITIAL_FORM = {
  name:        '',
  description: '',
  price:       '',
  stock:       '',
  imageUrl:    '',
};

// ---------------------------------------------------------------------------
// Küçük bileşen — Ürün Listesi Satırı
// ---------------------------------------------------------------------------

const ProductRow = ({ item, onDelete }) => (
  <View style={styles.row}>
    <Image
      source={{ uri: item.imageUrl || item.image || FALLBACK_IMAGE }}
      style={styles.rowImage}
      resizeMode="cover"
    />

    <View style={styles.rowInfo}>
      <Text style={styles.rowName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.rowPrice}>
        {Number(item.price).toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
        })}{' '}
        ₺
      </Text>
      <Text style={styles.rowStock}>Stok: {item.stock ?? '—'}</Text>
    </View>

    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() => onDelete(item)}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.deleteBtnText}>🗑</Text>
    </TouchableOpacity>
  </View>
);

// ---------------------------------------------------------------------------
// AdminProductsScreen
// ---------------------------------------------------------------------------

export default function AdminProductsScreen() {
  const [products, setProducts]     = useState([]);
  const [form, setForm]             = useState(INITIAL_FORM);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingAdd, setLoadingAdd]   = useState(false);
  const [deletingId, setDeletingId]   = useState(null);

  // ── Ürünleri Çek ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await getProducts();
      const list = Array.isArray(data) ? data : data?.products ?? [];
      setProducts(list);
    } catch (err) {
      Alert.alert('Hata', 'Ürün listesi alınamadı.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Form Değişimi ─────────────────────────────────────────────────────────

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Ürün Ekle ─────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    const { name, description, price, stock, imageUrl } = form;

    if (!name.trim() || !price.trim()) {
      Alert.alert('Eksik Bilgi', 'Ürün adı ve fiyat alanları zorunludur.');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Geçersiz Fiyat', 'Lütfen geçerli bir fiyat girin.');
      return;
    }

    setLoadingAdd(true);
    try {
      await addProduct({
        name:        name.trim(),
        description: description.trim(),
        price:       Number(price),
        stock:       Number(stock) || 0,
        imageUrl:    imageUrl.trim(),
      });
      setForm(INITIAL_FORM);
      fetchProducts(); // Listeyi yenile
    } catch (_err) {
      // Hata api.js'te gösterildi
    } finally {
      setLoadingAdd(false);
    }
  };

  // ── Ürün Sil ──────────────────────────────────────────────────────────────

  const handleDelete = (item) => {
    Alert.alert(
      'Ürünü Sil',
      `"${item.name}" ürününü silmek istediğinizden emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item._id);
            try {
              await deleteProduct(item._id);
              setProducts((prev) => prev.filter((p) => p._id !== item._id));
            } catch (_err) {
              // Hata api.js'te gösterildi
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={products}
        keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) =>
          deletingId === item._id ? (
            <View style={[styles.row, styles.rowDeleting]}>
              <ActivityIndicator color={COLORS.bordeaux} />
              <Text style={styles.deletingText}>Siliniyor...</Text>
            </View>
          ) : (
            <ProductRow item={item} onDelete={handleDelete} />
          )
        }
        ListHeaderComponent={
          <>
            {/* ── FORM ALANI ────────────────────────────────────────── */}
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>➕ Yeni Ürün Ekle</Text>

              <Text style={styles.label}>Ürün Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Kırmızı Güller Buketi"
                placeholderTextColor={COLORS.placeholder}
                value={form.name}
                onChangeText={(v) => handleChange('name', v)}
                returnKeyType="next"
              />

              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Ürünü kısaca tanımlayın..."
                placeholderTextColor={COLORS.placeholder}
                value={form.description}
                onChangeText={(v) => handleChange('description', v)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.rowForm}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Fiyat (₺) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.placeholder}
                    value={form.price}
                    onChangeText={(v) => handleChange('price', v)}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.halfField}>
                  <Text style={styles.label}>Stok</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                    value={form.stock}
                    onChangeText={(v) => handleChange('stock', v)}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <Text style={styles.label}>Görsel URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={COLORS.placeholder}
                value={form.imageUrl}
                onChangeText={(v) => handleChange('imageUrl', v)}
                keyboardType="url"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />

              {/* Ürün Ekle Butonu */}
              <TouchableOpacity
                style={[styles.addBtn, loadingAdd && styles.btnDisabled]}
                onPress={handleAdd}
                disabled={loadingAdd}
                activeOpacity={0.8}
              >
                {loadingAdd ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.addBtnText}>Ürün Ekle</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ── ÜRÜN LİSTESİ BAŞLIĞI ──────────────────────────────── */}
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>📦 Mevcut Ürünler</Text>
              {loadingList && (
                <ActivityIndicator size="small" color={COLORS.bordeaux} />
              )}
            </View>

            {!loadingList && products.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🌸</Text>
                <Text style={styles.emptyText}>Henüz ürün eklenmemiş.</Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// StyleSheet
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  listContent: {
    paddingBottom: 32,
  },

  // ── Form Kartı ────────────────────────────────────────────────────────────
  formCard: {
    margin: 16,
    backgroundColor: COLORS.beige,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bordeaux,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 44,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 10,
  },

  // Yan yana input çifti
  rowForm: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },

  // ── Ekle Butonu ───────────────────────────────────────────────────────────
  addBtn: {
    backgroundColor: COLORS.bordeaux,
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: COLORS.bordeaux,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // ── Liste Başlığı ─────────────────────────────────────────────────────────
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
  },

  // ── Ürün Satırı ───────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  rowDeleting: {
    opacity: 0.5,
    gap: 12,
  },
  deletingText: {
    fontSize: 13,
    color: COLORS.bordeaux,
    opacity: 0.7,
  },
  rowImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.beige,
    marginRight: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  rowPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.bordeaux,
    marginBottom: 2,
  },
  rowStock: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.5,
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },

  // ── Boş Durum ─────────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.5,
  },
});
