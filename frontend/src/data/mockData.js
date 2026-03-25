const IMG_BASE = 'https://images.unsplash.com'

function img(photoId, w = 1100) {
  return `${IMG_BASE}/${photoId}?auto=format&fit=crop&w=${w}&q=80`
}

function makeCategoryProducts({
  category,
  namePrefix,
  startId,
  count,
  images,
  priceBase,
  priceSpread,
  descriptionLead,
}) {
  return Array.from({ length: count }).map((_, idx) => {
    const id = startId + idx
    const image = images[idx % images.length]
    const price = priceBase + ((idx % 10) * priceSpread)
    const hasDiscount = idx % 6 === 0
    const originalPrice = hasDiscount ? price + 70 + (idx % 4) * 20 : null

    const shortNo = String(idx + 1).padStart(2, '0')
    const name = `${namePrefix} ${shortNo}`

    return {
      id,
      name,
      price,
      originalPrice,
      category,
      description: `${descriptionLead}. Özenle hazırlanır, taze görünümünü korur ve sevdiklerinize iyi dilekler taşır.`,
      image: img(image),
    }
  })
}

// Not: Görseller doğrudan images.unsplash.com üzerinden (yerel dosya yolu yok).
// Her kategori için en az 30 ürün üretilir.
export const mockFlowers = [
  // Güller (rose)
  ...makeCategoryProducts({
    category: 'Güller',
    namePrefix: 'Gül Buketi',
    startId: 1,
    count: 30,
    images: [
      'photo-1548460268-1f9e6a2b8d11',
      'photo-1644248423203-80e317d78aee',
      'photo-1713094010686-7e071fb887da',
      'photo-1648854607533-d6ff6af33b47',
    ],
    priceBase: 260,
    priceSpread: 15,
    descriptionLead: 'Güllerin zarafetiyle hazırlanan bu özel buket',
  }),

  // Papatyalar (daisy)
  ...makeCategoryProducts({
    category: 'Papatyalar',
    namePrefix: 'Papatya Buketi',
    startId: 31,
    count: 30,
    images: [
      'photo-1490750967868-88df5691cc9e',
      'photo-1713885248286-64e3839bfb48',
      'photo-1743096108784-8a76e56324b4',
      'photo-1756626184388-bf38a6a305ed',
    ],
    priceBase: 140,
    priceSpread: 10,
    descriptionLead: 'Sadelik ve ferahlığı bir araya getiren papatya dokunuşu',
  }),

  // Orkideler (orchid)
  ...makeCategoryProducts({
    category: 'Orkideler',
    namePrefix: 'Orkide Buketi',
    startId: 61,
    count: 30,
    images: [
      'photo-1596436241601-37f5f1b3e3e6',
      'photo-1758635591755-f9e08cb4c34e',
      'photo-1756524990302-43785caf2263',
      'photo-1744912684485-ab4d00d4c712',
    ],
    priceBase: 220,
    priceSpread: 18,
    descriptionLead: 'Orkidelerin şıklığını taşıyan, hediye değeri yüksek buket',
  }),

  // Lilyumlar (lily)
  ...makeCategoryProducts({
    category: 'Lilyumlar',
    namePrefix: 'Lilyum Buketi',
    startId: 91,
    count: 30,
    images: [
      'photo-1559563458-527698bf5295',
      'photo-1759527793938-e3ba6c2bb1c7',
      'photo-1761835250050-15826e2cafea',
    ],
    priceBase: 190,
    priceSpread: 16,
    descriptionLead: 'Zarif lilyumların zarafetini yansıtan özel buket',
  }),

  // Teraryumlar (teraryum)
  ...makeCategoryProducts({
    category: 'Teraryumlar',
    namePrefix: 'Teraryum',
    startId: 121,
    count: 30,
    images: [
      'photo-1416339657728-db4f81e78693',
      'photo-1416339411116-62e1226aacd8',
    ],
    priceBase: 320,
    priceSpread: 12,
    descriptionLead: 'Modern dekorla uyumlu, uzun ömürlü teraryum seçkisi',
  }),
]

