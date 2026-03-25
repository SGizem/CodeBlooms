import { mockFlowers } from './mockData'

const p = (id) => mockFlowers.find((x) => x.id === id) ?? null

const rose1 = p(1)
const orchid1 = p(61)
const ter1 = p(121)

export const mockOrders = [
  {
    id: 'SP001',
    date: '2026-03-20',
    status: 'Kargoda',
    total: rose1?.price ? rose1.price : 260,
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
    giftNote: 'Doğum günün kutlu olsun!',
    buyer: {
      fullName: 'Ayşe Demir',
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
    total: orchid1 && ter1 ? orchid1.price + ter1.price : 680,
    items: [
      orchid1
        ? {
            productId: orchid1.id,
            name: orchid1.name,
            price: orchid1.price,
            qty: 1,
            image: orchid1.image,
          }
        : null,
      ter1
        ? {
            productId: ter1.id,
            name: ter1.name,
            price: ter1.price,
            qty: 1,
            image: ter1.image,
          }
        : null,
    ].filter(Boolean),
    giftNote: null,
    buyer: {
      fullName: 'Mehmet Yılmaz',
      email: 'mehmet@example.com',
      phone: '+90 555 000 11 22',
      address: 'İstanbul, Beşiktaş, Örnek Cad. No:7',
    },
    createdAt: '2026-03-15',
    updatedAt: '2026-03-16',
  },
]

