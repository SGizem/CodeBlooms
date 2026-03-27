import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

export const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sayfa açıldığında MongoDB'den ürünleri getir
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.get('/api/products');

        // SİHİRLİ DOKUNUŞ: Backend dilini Frontend diline çeviriyoruz
        const mappedProducts = (res.data.products || []).map(p => ({
          ...p,
          id: p._id,           // MongoDB '_id'sini React'in 'id'sine çevir
          image: p.imageUrl    // Backend'in 'imageUrl'unu React'in 'image'ına çevir
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Ürünler çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);


  const productById = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      map.set(p.id, p);
      map.set(String(p.id), p);
    }
    return map;
  }, [products]);

  async function addProduct(input) {
    try {
      // Frontend'den gelen 'image' kelimesini backend'e gönderirken 'imageUrl' yapıyoruz
      const dataToSend = { ...input, imageUrl: input.image };
      const res = await api.post('/api/products', dataToSend);

      // Gelen yeni ürünü de yine çevirerek listeye ekliyoruz
      const newProduct = {
        ...res.data.product,
        id: res.data.product._id,
        image: res.data.product.imageUrl
      };

      setProducts((prev) => [newProduct, ...prev]);
      return { ok: true, id: newProduct.id };
    } catch (err) {
      return { ok: false, error: err.response?.data?.message || 'Ürün eklenemedi.' };
    }
  }

  async function deleteProduct(id) {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  }

  const value = { products, productById, loading, addProduct, deleteProduct };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider');
  return ctx;
}