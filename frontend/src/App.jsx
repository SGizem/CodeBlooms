import { useContext } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartToast from './components/CartToast'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import FlowersPage from './pages/FlowersPage'
import FlowerDetailPage from './pages/FlowerDetailPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderUpdatePage from './pages/OrderUpdatePage'
import OrderCancelPage from './pages/OrderCancelPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import { CartContext, CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import { CommentsProvider } from './context/CommentsContext'
import { OrdersProvider } from './context/OrdersContext'
import ProductsAdminPage from './pages/ProductsAdminPage'
import AboutPage from './pages/AboutPage'
import { AuthProvider } from './context/AuthContext'

function AppLayout() {
  const cart = useContext(CartContext)
  const cartCount = cart?.cartCount ?? 0

  return (
    <div className="w-full min-h-screen bg-krem flex flex-col">
      {/* Her route değişiminde sayfayı en üste atar */}
      <ScrollToTop />
      <Navbar cartCount={cartCount} />
      <main className="flex-1" aria-label="Sayfa içeriği">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flowers" element={<FlowersPage />} />
          <Route path="/flowers/:id" element={<FlowerDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/update" element={<OrderUpdatePage />} />
          <Route path="/orders/:id/cancel" element={<OrderCancelPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin/products" element={<ProductsAdminPage />} />
          <Route path="/admin" element={<ProductsAdminPage />} />
          <Route
            path="*"
            element={
              <div className="w-full">
                <div className="mx-auto max-w-7xl px-4 py-16 text-left">
                  <h1 className="font-display text-4xl font-bold text-bordo">Sayfa bulunamadı</h1>
                  <p className="mt-3 font-body text-sm text-[#1A1A1A]/70">
                    İstediğiniz sayfa mevcut değil veya taşınmış olabilir.
                  </p>
                  <Link
                    to="/"
                    className="mt-6 inline-flex rounded-md bg-bordo px-5 py-2 font-body text-sm font-semibold text-white transition hover:shadow-md"
                  >
                    Anasayfaya dön
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <CartToast />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <ProductsProvider>
        <CommentsProvider>
          <OrdersProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppLayout />
              </BrowserRouter>
            </AuthProvider>
          </OrdersProvider>
        </CommentsProvider>
      </ProductsProvider>
    </CartProvider>
  )
}
