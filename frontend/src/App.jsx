import { BrowserRouter, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1" aria-label="Sayfa içeriği">
          <Routes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
