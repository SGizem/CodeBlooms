/**
 * CodeBlooms Mobile — MyOrdersScreen
 * API: getOrders, updateOrder
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { getOrders, updateOrder } from '../api/api';

// ---------------------------------------------------------------------------
// Sabitler
// ---------------------------------------------------------------------------

const COLORS = {
  cream: '#F5F0E8', beige: '#EDE8DE', bordeaux: '#7B1C3E',
  text: '#1A1A1A', white: '#FFFFFF', placeholder: '#9E9E9E',
  border: '#C8C0B0', overlay: 'rgba(0,0,0,0.45)',
};

const STATUS_MAP = {
  beklemede:       { label: 'Beklemede',       bg: '#FFF3CD', color: '#856404' },
  hazirlaniyor:    { label: 'Hazırlanıyor',    bg: '#CCE5FF', color: '#004085' },
  kargoya_verildi: { label: 'Kargoya Verildi', bg: '#D4EDDA', color: '#155724' },
  kargoda:         { label: 'Kargoda',          bg: '#D1ECF1', color: '#0C5460' },
  teslim_edildi:   { label: 'Teslim Edildi',   bg: '#D4EDDA', color: '#155724' },
  iptal_edildi:    { label: 'İptal Edildi',    bg: '#F8D7DA', color: '#721C24' },
};

const EDITABLE = new Set(['beklemede', 'hazirlaniyor', '', undefined, null]);
const isEditable = (s) => EDITABLE.has(s?.toLowerCase?.());

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return d; }
};

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase?.() ?? '';
  const m = STATUS_MAP[key] ?? { label: status ?? 'Bilinmiyor', bg: '#E2E3E5', color: '#383D41' };
  return (
    <View style={[styles.badge, { backgroundColor: m.bg }]}>
      <Text style={[styles.badgeText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// OrderCard
// ---------------------------------------------------------------------------

const OrderCard = ({ item, onEdit }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.orderId}>#{item._id?.slice(-8).toUpperCase() ?? '—'}</Text>
      <StatusBadge status={item.status} />
    </View>

    <View style={styles.cardBody}>
      <Text style={styles.infoText}>📅 {formatDate(item.createdAt)}</Text>
      <Text style={styles.infoText}>📦 {item.items?.length ?? 0} ürün</Text>
      {item.address ? (
        <Text style={styles.infoText} numberOfLines={1}>
          📍 {typeof item.address === 'string' ? item.address : item.address?.street ?? '—'}
        </Text>
      ) : null}
      {item.giftNote ? (
        <Text style={styles.infoText} numberOfLines={1}>🎁 {item.giftNote}</Text>
      ) : null}
    </View>

    <Text style={styles.total}>
      {Number(item.totalPrice ?? item.total ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
    </Text>

    {isEditable(item.status) && (
      <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)} activeOpacity={0.8}>
        <Text style={styles.editBtnText}>✏️  Adresi / Notu Güncelle</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ---------------------------------------------------------------------------
// MyOrdersScreen
// ---------------------------------------------------------------------------

export default function MyOrdersScreen() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected]         = useState(null);
  const [newAddress, setNewAddress]     = useState('');
  const [newGiftNote, setNewGiftNote]   = useState('');
  const [saving, setSaving]             = useState(false);

  // ── Veri Çek ──────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getOrders();
      const list = Array.isArray(data) ? data : data?.orders ?? [];
      setOrders([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      Alert.alert('Hata', 'Siparişler yüklenirken bir sorun oluştu.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Modal Aç/Kapat ────────────────────────────────────────────────────────

  const openModal = (order) => {
    setSelected(order);
    setNewAddress(typeof order.address === 'string' ? order.address : order.address?.street ?? '');
    setNewGiftNote(order.giftNote ?? '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
    setNewAddress('');
    setNewGiftNote('');
  };

  // ── Güncelle ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!newAddress.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen adres alanını doldurun.');
      return;
    }
    setSaving(true);
    try {
      await updateOrder(selected._id, { address: newAddress.trim(), giftNote: newGiftNote.trim() });
      closeModal();
      fetchOrders();
    } catch {
      // api.js hata gösteriyor
    } finally {
      setSaving(false);
    }
  };

  // ── Boş Durum ─────────────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>Henüz Sipariş Yok</Text>
      <Text style={styles.emptyText}>Verdiğiniz siparişler burada görünecek.</Text>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.bordeaux} />
          <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => <OrderCard item={item} onEdit={openModal} />}
          ListEmptyComponent={renderEmpty}
          onRefresh={() => fetchOrders(true)}
          refreshing={refreshing}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ══ GÜNCELLEME MODALİ ═══════════════════════════════════════════════ */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            {/* Başlık */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sipariş Güncelle</Text>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>#{selected?._id?.slice(-8).toUpperCase()}</Text>

            {/* Adres */}
            <Text style={styles.label}>Yeni Adres *</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Teslimat adresinizi girin..."
              placeholderTextColor={COLORS.placeholder}
              value={newAddress}
              onChangeText={setNewAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Hediye Notu */}
            <Text style={styles.label}>Hediye Notu</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Sevdiğinize bir not... (isteğe bağlı)"
              placeholderTextColor={COLORS.placeholder}
              value={newGiftNote}
              onChangeText={setNewGiftNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Butonlar */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.btnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={styles.saveBtnText}>Kaydet</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// StyleSheet
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  listContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.bordeaux, opacity: 0.7 },

  // Kart
  card: {
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 14, fontWeight: '700', color: COLORS.bordeaux, flex: 1, marginRight: 8 },
  cardBody: { gap: 4, marginBottom: 10 },
  infoText: { fontSize: 13, color: COLORS.text, opacity: 0.75 },
  total: { fontSize: 17, fontWeight: '800', color: COLORS.bordeaux, textAlign: 'right', marginBottom: 10 },

  // Rozet
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  // Düzenle
  editBtn: { borderWidth: 1.5, borderColor: COLORS.bordeaux, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.bordeaux },

  // Boş
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.bordeaux, marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.text, opacity: 0.5, textAlign: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.bordeaux },
  modalClose: { fontSize: 18, color: COLORS.text, opacity: 0.5 },
  modalSubtitle: { fontSize: 12, color: COLORS.text, opacity: 0.45, marginBottom: 16, letterSpacing: 0.5 },

  label: { fontSize: 12, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 10, letterSpacing: 0.3 },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: COLORS.text, minHeight: 44,
  },
  inputMultiline: { minHeight: 80, paddingTop: 10 },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text, opacity: 0.7 },
  saveBtn: {
    flex: 2, height: 50, borderRadius: 8, backgroundColor: COLORS.bordeaux,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.bordeaux, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
