import axios from 'axios';

// ── BASE CONFIG ──────────────────────────────────────────────
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

// ── GEREKSİNİM 1: Kullanıcı Kaydı ───────────────────────────
// POST /api/users/register
export const registerUser = async (firstName, lastName, email, password) => {
  const res = await api.post('/api/users/register', { firstName, lastName, email, password });
  const data = res.data;
  localStorage.setItem('token', data.token);
  localStorage.setItem('cb_current_user', JSON.stringify(data.user));
  return data;
};

// ── GEREKSİNİM 2: Ürün Ekleme (admin) ───────────────────────
// POST /api/products
export const addProductAPI = async (productData) => {
  const res = await api.post('/api/products', productData);
  return res.data.product;
};

// ── GEREKSİNİM 3: Ürün Silme (admin) ────────────────────────
// DELETE /api/products/:productId
export const deleteProductAPI = async (productId) => {
  const res = await api.delete(`/api/products/${productId}`);
  return res.data;
};

// ── GEREKSİNİM 4: Ürünleri Listeleme ────────────────────────
// GET /api/products
export const getProductsAPI = async (category = '', search = '') => {
  const params = {};
  if (category && category !== 'Tümü') params.category = category;
  if (search) params.search = search;
  const res = await api.get('/api/products', { params });
  return (res.data.products || []).map(p => ({
    ...p,
    id: p._id,
    image: p.imageUrl,
    _mongoId: p._id,
  }));
};

// ── GEREKSİNİM 5: Sipariş Güncelleme ────────────────────────
// PUT /api/orders/:orderId
export const updateOrderAPI = async (orderId, updateData) => {
  const res = await api.put(`/api/orders/${orderId}`, updateData);
  return res.data.order;
};

// ── GEREKSİNİM 6: Sipariş Listeleme ─────────────────────────
// GET /api/orders/:userId
export const getOrdersAPI = async (userId) => {
  const res = await api.get(`/api/orders/${userId}`);
  return res.data.orders;
};

// ── GEREKSİNİM 7: Yorum Ekleme ───────────────────────────────
// POST /api/comments/products/:productId/comments
export const addCommentAPI = async (productId, text, rating) => {
  const res = await api.post(`/api/comments/products/${productId}/comments`, { text, rating });
  return res.data.comment;
};

// ── GEREKSİNİM 8: Yorum Silme ────────────────────────────────
// DELETE /api/comments/:commentId
export const deleteCommentAPI = async (commentId) => {
  const res = await api.delete(`/api/comments/${commentId}`);
  return res.data;
};

// ── EDA GEREKSİNİM 1: Sepete Ürün Ekleme ────────────────────
// POST /api/cart/add
export const addToCartAPI = async (productId, quantity = 1) => {
  const res = await api.post('/api/cart/add', { productId: String(productId), quantity: Number(quantity) });
  return res.data.cart;
};

// ── EDA GEREKSİNİM 2: Sepetten Ürün Silme ───────────────────
// DELETE /api/cart/items/:itemId
export const removeFromCartAPI = async (itemId) => {
  const res = await api.delete(`/api/cart/items/${itemId}`);
  return res.data.cart;
};

// ── EDA GEREKSİNİM 3: Sepet Güncelleme ──────────────────────
// PUT /api/cart/items/:itemId
export const updateCartItemAPI = async (itemId, quantity) => {
  const res = await api.put(`/api/cart/items/${itemId}`, { quantity: Number(quantity) });
  return res.data.cart;
};

// ── EDA GEREKSİNİM 4: Sepet Listeleme ───────────────────────
// GET /api/cart
export const getCartAPI = async () => {
  const res = await api.get('/api/cart');
  return res.data.cart;
};

// ── EDA GEREKSİNİM 5: Sipariş Oluşturma ─────────────────────
// POST /api/orders
export const createOrderAPI = async (address, recipient, items, giftNote = '') => {
  const res = await api.post('/api/orders', { address, recipient, items, giftNote });
  return res.data.order;
};

// ── EDA GEREKSİNİM 6: Sipariş İptali ────────────────────────
// DELETE /api/orders/:orderId/cancel
export const cancelOrderAPI = async (orderId) => {
  const res = await api.delete(`/api/orders/${orderId}/cancel`);
  return res.data;
};

// ── EDA GEREKSİNİM 7: Hediye Notu Ekleme ────────────────────
// POST /api/orders/:orderId/notes   Body: { message }
export const addGiftNoteAPI = async (orderId, note) => {
  const res = await api.post(`/api/orders/${orderId}/notes`, { message: note });
  return res.data.note;
};

// ── EDA GEREKSİNİM 8: Hediye Notu Silme ─────────────────────
// DELETE /api/orders/:orderId/notes/:noteId
export const deleteGiftNoteAPI = async (orderId, noteId) => {
  const res = await api.delete(`/api/orders/${orderId}/notes/${noteId}`);
  return res.data;
};

// ── AXIOS ALIAS'LAR (context dosyaları için eski isimler) ───
export const loginUser   = (data) => api.post('/api/users/login', data);
export const fetchProducts = ()   => api.get('/api/products');
export const createProduct  = (data) => api.post('/api/products', data);
export const deleteProduct  = (id)   => api.delete(`/api/products/${id}`);
export const addComment     = (productId, data) => api.post(`/api/comments/products/${productId}/comments`, data);
export const deleteComment  = (commentId)       => api.delete(`/api/comments/${commentId}`);
export const fetchComments  = (productId)       => api.get(`/api/comments/products/${productId}/comments`);
export const fetchCart      = ()                => api.get('/api/cart');
export const removeCartItem = (itemId)          => api.delete(`/api/cart/items/${itemId}`);
export const updateCartItem = (itemId, quantity) => api.put(`/api/cart/items/${itemId}`, { quantity });
export const createOrder    = (data)            => api.post('/api/orders', data);
export const fetchOrders    = (userId)          => api.get(`/api/orders/${userId}`);
export const cancelOrder    = (orderId)         => api.delete(`/api/orders/${orderId}/cancel`);
export const updateOrder    = (orderId, data)   => api.put(`/api/orders/${orderId}`, data);
export const addGiftNote    = (orderId, message) => api.post(`/api/orders/${orderId}/notes`, { message });
export const deleteGiftNote = (orderId, noteId)  => api.delete(`/api/orders/${orderId}/notes/${noteId}`);