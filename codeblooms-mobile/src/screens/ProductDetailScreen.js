/**
 * CodeBlooms Mobile — ProductDetailScreen
 *
 * Ürün detay, yıldız değerlendirme ve yorum ekranı.
 * API: getProducts (tek ürün), addComment, deleteComment
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProducts, addComment, deleteComment } from '../api/api';

// ---------------------------------------------------------------------------
// Sabitler
// ---------------------------------------------------------------------------

const COLORS = {
  cream: '#F5F0E8', beige: '#EDE8DE', bordeaux: '#7B1C3E',
  text: '#1A1A1A', white: '#FFFFFF', placeholder: '#9E9E9E',
  border: '#C8C0B0', star: '#F4C430', starEmpty: '#D0C8B8',
  danger: '#C0392B', dangerBg: '#FDECEA',
};

const FALLBACK = 'https://via.placeholder.com/600x400/EDE8DE/7B1C3E?text=CodeBlooms';

// ---------------------------------------------------------------------------
// StarRow — tıklanabilir yıldız satırı
// ---------------------------------------------------------------------------

const StarRow = ({ value, onChange }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((n) => (
      <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
        <Text style={[styles.star, { color: n <= value ? COLORS.star : COLORS.starEmpty }]}>
          ★
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ---------------------------------------------------------------------------
// CommentItem
// ---------------------------------------------------------------------------

const CommentItem = ({ item, currentUserId, onDelete }) => {
  const isOwner =
    currentUserId &&
    (item.user?._id === currentUserId || item.user === currentUserId);

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>
          {item.user?.name ?? 'Kullanıcı'}
        </Text>
        <View style={styles.commentRight}>
          <Text style={styles.commentStars}>
            {'★'.repeat(item.rating ?? 0)}
            {'☆'.repeat(5 - (item.rating ?? 0))}
          </Text>
          {isOwner && (
            <TouchableOpacity
              style={styles.deleteCommentBtn}
              onPress={() => onDelete(item._id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.deleteCommentText}>Sil</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// ProductDetailScreen
// ---------------------------------------------------------------------------

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, productName } = route.params ?? {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Yorum state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ── Kullanıcı ID'sini AsyncStorage'dan al ─────────────────────────────────

  useEffect(() => {
    AsyncStorage.getItem('user')
      .then((raw) => {
        if (raw) {
          const u = JSON.parse(raw);
          setCurrentUserId(u._id ?? u.id ?? null);
        }
      })
      .catch(() => { });
  }, []);

  // ── Ürünü Çek ─────────────────────────────────────────────────────────────

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await getProducts();
      const list = Array.isArray(data) ? data : data?.products ?? [];
      const found = list.find((p) => p._id === productId);
      if (found) {
        setProduct(found);
        navigation.setOptions({ title: found.name });
      } else {
        Alert.alert('Hata', 'Ürün bulunamadı.');
      }
    } catch {
      Alert.alert('Hata', 'Ürün yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // ── Yorum Gönder ──────────────────────────────────────────────────────────

  const handleAddComment = async () => {
    if (rating === 0) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir puan seçin.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen yorum yazın.');
      return;
    }
    setSubmitting(true);
    try {
      await addComment(productId, { text: comment.trim(), rating });
      setComment('');
      setRating(0);
      fetchProduct();
    } catch {
      // api.js hata alert'i gösteriyor
    } finally {
      setSubmitting(false);
    }
  };

  // ── Yorum Sil ─────────────────────────────────────────────────────────────

  const handleDeleteComment = (commentId) => {
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğinizden emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(commentId);
          try {
            await deleteComment(productId, commentId);
            fetchProduct();
          } catch {
            // api.js hata gösteriyor
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  // ── Yükleniyor ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.bordeaux} />
        <Text style={styles.loadingText}>Ürün yükleniyor...</Text>
      </View>
    );
  }

  if (!product) return null;

  const comments = product.comments ?? [];
  const avgRating = comments.length
    ? (comments.reduce((s, c) => s + (c.rating ?? 0), 0) / comments.length).toFixed(1)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Ürün Görseli ── */}
        <Image
          source={{ uri: product.imageUrl || product.image || FALLBACK }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* ── Ürün Bilgileri ── */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {Number(product.price).toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
              })}{' '}
              ₺
            </Text>
            {avgRating && (
              <View style={styles.ratingPill}>
                <Text style={styles.ratingPillText}>★ {avgRating}</Text>
                <Text style={styles.ratingCount}> ({comments.length})</Text>
              </View>
            )}
          </View>

          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          {product.stock !== undefined && (
            <Text style={styles.stockText}>
              {product.stock > 0
                ? `✅ Stokta ${product.stock} adet var`
                : '❌ Stokta yok'}
            </Text>
          )}
        </View>

        {/* ── Sepete Ekle (Eda'nın ekleyeceği placeholder) ── */}
        <TouchableOpacity
          style={styles.cartBtn}
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert('Yakında', 'Sepet özelliği çok yakında eklenecek! 🌸')
          }
        >
          <Text style={styles.cartBtnText}>🛒  Sepete Ekle</Text>
        </TouchableOpacity>

        {/* ════ YORUMLAR ════ */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Değerlendirmeler</Text>

          {/* ── Yorum Yazma Formu ── */}
          <View style={styles.commentForm}>
            <Text style={styles.formLabel}>Puanınız</Text>
            <StarRow value={rating} onChange={setRating} />

            <Text style={styles.formLabel}>Yorumunuz</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
              placeholderTextColor={COLORS.placeholder}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleAddComment}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Yorumu Gönder</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Mevcut Yorumlar ── */}
          {comments.length === 0 ? (
            <View style={styles.noComment}>
              <Text style={styles.noCommentText}>
                Henüz yorum yok. İlk yorumu sen yap! 🌸
              </Text>
            </View>
          ) : (
            comments.map((c) => (
              <CommentItem
                key={c._id}
                item={c}
                currentUserId={currentUserId}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cream,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.bordeaux,
    opacity: 0.7,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.beige,
  },

  // ── Bilgi ─────────────────────────────────────────────────────────────────
  infoSection: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.bordeaux,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B8860B',
  },
  ratingCount: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    lineHeight: 21,
    marginBottom: 10,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    opacity: 0.65,
  },

  // ── Sepete Ekle ───────────────────────────────────────────────────────────
  cartBtn: {
    backgroundColor: COLORS.bordeaux,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.bordeaux,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 5,
  },
  cartBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ══ YORUMLAR ══════════════════════════════════════════════════════════════
  commentsSection: {
    padding: 16,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.bordeaux,
    marginBottom: 14,
  },

  // ── Yorum Formu ───────────────────────────────────────────────────────────
  commentForm: {
    backgroundColor: COLORS.beige,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 4,
  },
  star: {
    fontSize: 32,
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
    minHeight: 88,
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.bordeaux,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: COLORS.bordeaux,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Yorum Kartı ───────────────────────────────────────────────────────────
  commentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.bordeaux,
    flex: 1,
  },
  commentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentStars: {
    fontSize: 13,
    color: COLORS.star,
    letterSpacing: 1,
  },
  deleteCommentBtn: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 36,
    minHeight: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCommentText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.text,
    opacity: 0.75,
    lineHeight: 19,
  },

  // ── Boş Yorum ─────────────────────────────────────────────────────────────
  noComment: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noCommentText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.45,
    textAlign: 'center',
  },
});
