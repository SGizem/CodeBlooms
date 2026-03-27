import axios from 'axios';

// ── BASE CONFIG ──────────────────────────────────────────────
// Vite proxy (/api → localhost:5000) sayesinde baseURL'e gerek yok;
// yine de açık bırakıyoruz ki proxy olmayan ortamlarda da çalışsın.
const api = axios.create({
  baseURL: '',          // Vite proxy /api → http://localhost:5000
  timeout: 15000,
});

// ── REQUEST INTERCEPTOR: Token ekle ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR: 401 → Login'e yönlendir ───────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('cb_current_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ════════════════════════════════════════════════════════════
//  MERKEZİ API FONKSİYONLARI
// ════════════════════════════════════════════════════════════

// ── KULLANICI ────────────────────────────────────────────────
export const registerUser = (data) =>
  api.post('/api/users/register', data);

export const loginUser = (data) =>
  api.post('/api/users/login', data);

// ── ÜRÜNLER ──────────────────────────────────────────────────
export const fetchProducts = () =>
  api.get('/api/products');

export const createProduct = (data) =>
  api.post('/api/products', data);

export const deleteProduct = (productId) =>
  api.delete(`/api/products/${productId}`);

// ── YORUMLAR ─────────────────────────────────────────────────
export const addComment = (productId, data) =>
  api.post(`/api/products/${productId}/comments`, data);

export const deleteComment = (commentId) =>
  api.delete(`/api/comments/${commentId}`);

export const fetchComments = (productId) =>
  api.get(`/api/products/${productId}/comments`);

// ── SEPET ────────────────────────────────────────────────────
export const fetchCart = () =>
  api.get('/api/cart');

export const addToCartAPI = (productId, quantity) =>
  api.post('/api/cart/add', { productId, quantity });

export const removeCartItem = (itemId) =>
  api.delete(`/api/cart/items/${itemId}`);

export const updateCartItem = (itemId, quantity) =>
  api.put(`/api/cart/items/${itemId}`, { quantity });

// ── SİPARİŞLER ───────────────────────────────────────────────
export const createOrder = (data) =>
  api.post('/api/orders', data);

export const fetchOrders = (userId) =>
  api.get(`/api/orders/${userId}`);

export const cancelOrder = (orderId) =>
  api.delete(`/api/orders/${orderId}/cancel`);

export const updateOrder = (orderId, data) =>
  api.put(`/api/orders/${orderId}`, data);

// ── HEDİYE NOTU ──────────────────────────────────────────────
export const addGiftNote = (orderId, message) =>
  api.post(`/api/orders/${orderId}/notes`, { note: message });

export const deleteGiftNote = (orderId, noteId) =>
  api.delete(`/api/orders/${orderId}/notes/${noteId}`);