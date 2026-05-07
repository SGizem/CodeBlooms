/**
 * CodeBlooms Mobile - Merkezi API Servisi
 * Base URL: https://codeblooms.onrender.com
 *
 * Auth gereken tüm isteklerde AsyncStorage'dan token alınır
 * ve Authorization: Bearer <token> header'ı olarak eklenir.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// ---------------------------------------------------------------------------
// Axios Instance
// ---------------------------------------------------------------------------

const BASE_URL = 'https://codeblooms.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request Interceptor — Auth token ekleme
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(
        `[API İstek] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.data ?? ''
      );
    } catch (err) {
      console.warn('[API] Token okunurken hata:', err);
    }
    return config;
  },
  (error) => {
    console.error('[API İstek Hatası]', error);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Response Interceptor — Hata loglama
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => {
    console.log(
      `[API Yanıt] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`[API Hata] ${status ?? 'Bağlantı'}: ${message}`);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Yardımcı — Standart hata mesajı
// ---------------------------------------------------------------------------

const handleError = (error, defaultMsg = 'Bir hata oluştu.') => {
  const msg = error.response?.data?.message || defaultMsg;
  Alert.alert('Hata', msg);
  throw error;
};

// ===========================================================================
// 1. AUTH
// ===========================================================================

/**
 * Yeni kullanıcı kaydı
 * @param {{ name: string, email: string, password: string }} data
 */
export const registerUser = async (data) => {
  try {
    const response = await api.post('/api/auth/register', data);
    Alert.alert('Başarılı', 'Kayıt işlemi tamamlandı! Giriş yapabilirsiniz.');
    return response.data;
  } catch (error) {
    handleError(error, 'Kayıt olurken bir hata oluştu.');
  }
};

/**
 * Kullanıcı girişi — token AsyncStorage'a kaydedilir
 * @param {{ email: string, password: string }} data
 */
export const loginUser = async (data) => {
  try {
    const response = await api.post('/api/auth/login', data);
    const { token, user } = response.data;
    if (token) {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('[Auth] Token kaydedildi.');
    }
    Alert.alert('Hoş Geldiniz', `Merhaba, ${user?.name ?? 'Kullanıcı'}!`);
    return response.data;
  } catch (error) {
    handleError(error, 'E-posta veya şifre hatalı.');
  }
};

// ===========================================================================
// 2. ÜRÜNLER (Products)
// ===========================================================================

/**
 * Tüm ürünleri getir
 * @param {{ category?: string, search?: string }} params
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/api/products', { params });
    return response.data;
  } catch (error) {
    handleError(error, 'Ürünler yüklenirken bir hata oluştu.');
  }
};

/**
 * Yeni ürün ekle (Admin)
 * @param {FormData | object} data
 */
export const addProduct = async (data) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await api.post('/api/products', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    Alert.alert('Başarılı', 'Ürün başarıyla eklendi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Ürün eklenirken bir hata oluştu.');
  }
};

/**
 * Ürün sil (Admin)
 * @param {string} productId
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/api/products/${productId}`);
    Alert.alert('Başarılı', 'Ürün başarıyla silindi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Ürün silinirken bir hata oluştu.');
  }
};

// ===========================================================================
// 3. SİPARİŞLER (Orders)
// ===========================================================================

/**
 * Tüm siparişleri getir (Admin veya kullanıcının kendi siparişleri)
 */
export const getOrders = async () => {
  try {
    const response = await api.get('/api/orders');
    return response.data;
  } catch (error) {
    handleError(error, 'Siparişler yüklenirken bir hata oluştu.');
  }
};

/**
 * Sipariş durumunu güncelle (Admin)
 * @param {string} orderId
 * @param {{ status: string }} data
 */
export const updateOrder = async (orderId, data) => {
  try {
    const response = await api.put(`/api/orders/${orderId}`, data);
    Alert.alert('Başarılı', 'Sipariş güncellendi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Sipariş güncellenirken bir hata oluştu.');
  }
};

/**
 * Sipariş oluştur
 * @param {{ items: Array, address: object, note?: string }} data
 */
export const createOrder = async (data) => {
  try {
    const response = await api.post('/api/orders', data);
    Alert.alert('Başarılı', 'Siparişiniz alındı! En kısa sürede hazırlanacak.');
    return response.data;
  } catch (error) {
    handleError(error, 'Sipariş oluşturulurken bir hata oluştu.');
  }
};

/**
 * Sipariş iptal et
 * @param {string} orderId
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/api/orders/${orderId}/cancel`);
    Alert.alert('Başarılı', 'Siparişiniz iptal edildi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Sipariş iptal edilirken bir hata oluştu.');
  }
};

// ===========================================================================
// 4. YORUMLAR (Comments)
// ===========================================================================

/**
 * Ürüne yorum ekle
 * @param {string} productId
 * @param {{ text: string, rating: number }} data
 */
export const addComment = async (productId, data) => {
  try {
    const response = await api.post(`/api/products/${productId}/comments`, data);
    Alert.alert('Başarılı', 'Yorumunuz eklendi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Yorum eklenirken bir hata oluştu.');
  }
};

/**
 * Yorumu sil
 * @param {string} productId
 * @param {string} commentId
 */
export const deleteComment = async (productId, commentId) => {
  try {
    const response = await api.delete(
      `/api/products/${productId}/comments/${commentId}`
    );
    Alert.alert('Başarılı', 'Yorum silindi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Yorum silinirken bir hata oluştu.');
  }
};

// ===========================================================================
// 5. SEPET (Cart)
// ===========================================================================

/**
 * Sepeti getir
 */
export const getCart = async () => {
  try {
    const response = await api.get('/api/cart');
    return response.data;
  } catch (error) {
    handleError(error, 'Sepet yüklenirken bir hata oluştu.');
  }
};

/**
 * Sepete ürün ekle
 * @param {{ productId: string, quantity: number }} data
 */
export const addToCart = async (data) => {
  try {
    const response = await api.post('/api/cart', data);
    Alert.alert('Başarılı', 'Ürün sepete eklendi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Ürün sepete eklenirken bir hata oluştu.');
  }
};

/**
 * Sepetten ürün çıkar
 * @param {string} itemId
 */
export const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/api/cart/${itemId}`);
    Alert.alert('Başarılı', 'Ürün sepetten çıkarıldı.');
    return response.data;
  } catch (error) {
    handleError(error, 'Ürün sepetten çıkarılırken bir hata oluştu.');
  }
};

/**
 * Sepetteki ürün miktarını güncelle
 * @param {string} itemId
 * @param {{ quantity: number }} data
 */
export const updateCartItem = async (itemId, data) => {
  try {
    const response = await api.put(`/api/cart/${itemId}`, data);
    return response.data;
  } catch (error) {
    handleError(error, 'Sepet güncellenirken bir hata oluştu.');
  }
};

// ===========================================================================
// 6. HEDİYE NOTU (Gift Note)
// ===========================================================================

/**
 * Siparişe hediye notu ekle
 * @param {string} orderId
 * @param {{ note: string }} data
 */
export const addGiftNote = async (orderId, data) => {
  try {
    const response = await api.post(`/api/orders/${orderId}/gift-note`, data);
    Alert.alert('Başarılı', 'Hediye notunuz eklendi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Hediye notu eklenirken bir hata oluştu.');
  }
};

/**
 * Hediye notunu sil
 * @param {string} orderId
 */
export const deleteGiftNote = async (orderId) => {
  try {
    const response = await api.delete(`/api/orders/${orderId}/gift-note`);
    Alert.alert('Başarılı', 'Hediye notu silindi.');
    return response.data;
  } catch (error) {
    handleError(error, 'Hediye notu silinirken bir hata oluştu.');
  }
};

export default api;
