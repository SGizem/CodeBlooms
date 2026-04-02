import axios from 'axios';

// ── BASE CONFIG ──────────────────────────────────────────────
// Production: https://codeblooms.onrender.com
// Dev: Vite proxy /api → localhost:5000
const api = axios.create({
  baseURL: 'https://codeblooms.onrender.com',
  timeout: 15000,
});

// ── REQUEST INTERCEPTOR: Her isteğe token ekle ───────────────
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

// ── 11. KULLANICI KAYIT ──────────────────────────────────────
// POST /api/users/register
export const registerUser = (data) =>
  api.post('/api/users/register', data);

// ── 12. KULLANICI GİRİŞ ──────────────────────────────────────
// POST /api/users/login
export const loginUser = (data) =>
  api.post('/api/users/login', data);

// ── 15. ÜRÜNLERİ LİSTELE ─────────────────────────────────────
// GET /api/products
export const fetchProducts = () =>
  api.get('/api/products');

// ── 13. ÜRÜN EKLE (admin) ─────────────────────────────────────
// POST /api/products
export const createProduct = (data) =>
  api.post('/api/products', data);

// ── 14. ÜRÜN SİL (admin) ──────────────────────────────────────
// DELETE /api/products/:productId
export const deleteProduct = (productId) =>
  api.delete(`/api/products/${productId}`);

// ── 16. YORUM EKLE ───────────────────────────────────────────
// POST /api/comments/products/:productId/comments
// Backend mount: app.use('/api/comments', commentRoutes)
// Router path:   router.post('/products/:productId/comments', ...)
export const addComment = (productId, data) =>
  api.post(`/api/comments/products/${productId}/comments`, data);

// ── 17. YORUM SİL ───────────────────────────────────────────
// DELETE /api/comments/:commentId
export const deleteComment = (commentId) =>
  api.delete(`/api/comments/${commentId}`);

// Yorum oku
// GET /api/comments/products/:productId/comments
export const fetchComments = (productId) =>
  api.get(`/api/comments/products/${productId}/comments`);

// ── 4. SEPETİ LİSTELE ────────────────────────────────────────
// GET /api/cart
export const fetchCart = () =>
  api.get('/api/cart');

// ── 1. SEPETE ÜRÜN EKLE ──────────────────────────────────────
// POST /api/cart/add   Body: { productId, quantity }
export const addToCartAPI = (productId, quantity) =>
  api.post('/api/cart/add', { productId, quantity });

// ── 2. SEPETTEN SİL ──────────────────────────────────────────
// DELETE /api/cart/items/:itemId
export const removeCartItem = (itemId) =>
  api.delete(`/api/cart/items/${itemId}`);

// ── 3. SEPET ADET GÜNCELLE ───────────────────────────────────
// PUT /api/cart/items/:itemId   Body: { quantity }
export const updateCartItem = (itemId, quantity) =>
  api.put(`/api/cart/items/${itemId}`, { quantity });

// ── 5. SİPARİŞ OLUŞTUR ───────────────────────────────────────
// POST /api/orders   Body: { address, recipient, items?, giftNote? }
export const createOrder = (data) =>
  api.post('/api/orders', data);

// ── 8. SİPARİŞLERİ LİSTELE ──────────────────────────────────
// GET /api/orders/:userId
export const fetchOrders = (userId) =>
  api.get(`/api/orders/${userId}`);

// ── 6. SİPARİŞ İPTAL ─────────────────────────────────────────
// DELETE /api/orders/:orderId/cancel
export const cancelOrder = (orderId) =>
  api.delete(`/api/orders/${orderId}/cancel`);

// ── 7. SİPARİŞ GÜNCELLE ──────────────────────────────────────
// PUT /api/orders/:orderId   Body: { address?, recipient?, giftNote? }
export const updateOrder = (orderId, data) =>
  api.put(`/api/orders/${orderId}`, data);

// ── 9. HEDİYE NOTU EKLE ──────────────────────────────────────
// POST /api/orders/:orderId/notes   Body: { message }
// ÖNEMLİ: Backend noteController { message } bekliyor
export const addGiftNote = (orderId, message) =>
  api.post(`/api/orders/${orderId}/notes`, { message });

// ── 10. HEDİYE NOTU SİL ──────────────────────────────────────
// DELETE /api/orders/:orderId/notes/:noteId
export const deleteGiftNote = (orderId, noteId) =>
  api.delete(`/api/orders/${orderId}/notes/${noteId}`);