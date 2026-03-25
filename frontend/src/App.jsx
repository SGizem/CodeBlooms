import { useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import FlowersPage from './pages/FlowersPage'
import FlowerDetailPage from './pages/FlowerDetailPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import { CartContext, CartProvider } from './context/CartContext'

function AppLayout() {
  const cart = useContext(CartContext)
  const cartCount = cart?.cartCount ?? 0

  return (
    <div className="w-full min-h-screen bg-krem flex flex-col">
      <Navbar cartCount={cartCount} />
      <main className="flex-1" aria-label="Sayfa içeriği">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flowers" element={<FlowersPage />} />
          <Route path="/flowers/:id" element={<FlowerDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </CartProvider>
  )
}
