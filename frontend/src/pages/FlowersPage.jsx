import { useContext } from 'react'
import FlowerCard from '../components/FlowerCard'
import { CartContext } from '../context/CartContext'
import { mockFlowers } from '../data/mockFlowers'

export default function FlowersPage() {
  const cart = useContext(CartContext)

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-4xl font-bold text-bordo">Çiçekler</h1>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {mockFlowers.map((flower) => (
            <FlowerCard
              key={flower.id}
              {...flower}
              onAddToCart={(id) => cart.addToCart(id, 1)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

