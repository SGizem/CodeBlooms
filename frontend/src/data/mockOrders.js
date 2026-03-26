import { mockFlowers } from './mockData'

const p = (id) => mockFlowers.find((x) => x.id === id) ?? null

const rose1 = p(1)
const choco1 = p(16)
const lily1 = p(13)

export const mockOrders = [
  {
    id: 'SP001',
    date: '2026-03-20',
    status: 'Kargoda',
    total: rose1?.price ? rose1.price : 450,
    items: [
      rose1
        ? {
            productId: rose1.id,
            name: rose1.name,
            price: rose1.price,
            qty: 1,
            image: rose1.image,
          }
        : null,
    ].filter(Boolean),
    giftNote: 'İyi ki doğdun!',
    buyer: {
      fullName: 'Ayşe Yılmaz',
      email: 'ayse@example.com',
      phone: '+90 555 123 45 67',
      address: 'İstanbul, Kadıköy, Örnek Sk. No:12',
    },
    createdAt: '2026-03-20',
    updatedAt: '2026-03-20',
  },
  {
    id: 'SP002',
    date: '2026-03-15',
    status: 'Teslim Edildi',
    total: choco1 && lily1 ? choco1.price + lily1.price : 680,
    items: [
      choco1
        ? {
            productId: choco1.id,
            name: choco1.name,
            price: choco1.price,
            qty: 1,
            image: choco1.image,
          }
        : null,
      lily1
        ? {
            productId: lily1.id,
            name: lily1.name,
            price: lily1.price,
            qty: 1,
            image: lily1.image,
          }
        : null,
    ].filter(Boolean),
    giftNote: null,
    buyer: {
      fullName: 'Mehmet Demir',
      email: 'mehmet@example.com',
      phone: '+90 555 000 11 22',
      address: 'İstanbul, Beşiktaş, Örnek Cad. No:7',
    },
    createdAt: '2026-03-15',
    updatedAt: '2026-03-16',
  },
]
