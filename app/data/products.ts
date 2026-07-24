import { Product } from '../context/CartContext';

/**
 * Data produk — di production, data ini akan di-fetch dari database.
 * 
 * `reviewSummary` berisi data aggregasi review dari semua user:
 *   - averageRating: rata-rata rating (1-5)
 *   - totalReviews: jumlah total review
 *   - ratingDistribution: jumlah review per bintang (untuk progress bar)
 *
 * `recentReviews` berisi beberapa review terbaru untuk preview.
 *
 * `price` dan `originalPrice` dalam satuan USDT/USDC (stablecoin).
 */
export const products: Product[] = [
  {
    id: 1,
    title: 'Mastering Web3 Development',
    description: 'Panduan lengkap membangun aplikasi terdesentralisasi dengan Solidity, Ethereum, dan smart contracts.',
    price: 24.99,
    originalPrice: 49.99,
    currency: 'USDT',
    image: '/products/ebook-web3.png',
    category: 'E-Book',
    badge: 'Bestseller',
    reviewSummary: {
      averageRating: 4.9,
      totalReviews: 234,
      ratingDistribution: { 5: 189, 4: 32, 3: 10, 2: 2, 1: 1 },
    },
    recentReviews: [
      { id: 'r1', userId: 'u1', userName: 'Andi S.', rating: 5, comment: 'Sangat lengkap dan mudah dipahami!', createdAt: '2026-05-28T10:30:00Z' },
      { id: 'r2', userId: 'u2', userName: 'Budi R.', rating: 5, comment: 'Worth every penny, penjelasan Web3 terbaik.', createdAt: '2026-05-27T14:15:00Z' },
      { id: 'r3', userId: 'u3', userName: 'Citra M.', rating: 4, comment: 'Bagus tapi ada bagian yang perlu update.', createdAt: '2026-05-25T09:00:00Z' },
    ],
  },
  {
    id: 2,
    title: 'UI/UX Design Handbook',
    description: 'Kuasai prinsip desain modern, prototyping, dan user research untuk produk digital yang memukau.',
    price: 19.99,
    originalPrice: 34.99,
    currency: 'USDT',
    image: '/products/ebook-uiux.png',
    category: 'E-Book',
    badge: 'New',
    reviewSummary: {
      averageRating: 4.7,
      totalReviews: 189,
      ratingDistribution: { 5: 120, 4: 48, 3: 15, 2: 4, 1: 2 },
    },
    recentReviews: [
      { id: 'r4', userId: 'u4', userName: 'Dian K.', rating: 5, comment: 'Contoh case study-nya sangat real world!', createdAt: '2026-05-29T08:20:00Z' },
      { id: 'r5', userId: 'u5', userName: 'Eka P.', rating: 4, comment: 'Materi solid, cocok untuk pemula.', createdAt: '2026-05-26T16:45:00Z' },
    ],
  },
  {
    id: 3,
    title: 'Social Media Template Pack',
    description: '50+ template Instagram, TikTok & LinkedIn siap pakai untuk branding bisnis profesional.',
    price: 12.50,
    currency: 'USDT',
    image: '/products/template-social.png',
    category: 'Template',
    badge: 'Popular',
    reviewSummary: {
      averageRating: 4.8,
      totalReviews: 412,
      ratingDistribution: { 5: 310, 4: 72, 3: 20, 2: 7, 1: 3 },
    },
    recentReviews: [
      { id: 'r6', userId: 'u6', userName: 'Farah W.', rating: 5, comment: 'Template-nya keren dan mudah di-customize!', createdAt: '2026-05-29T12:00:00Z' },
      { id: 'r7', userId: 'u7', userName: 'Galih T.', rating: 5, comment: 'Hemat waktu banget buat konten sosmed.', createdAt: '2026-05-28T20:30:00Z' },
    ],
  },
  {
    id: 4,
    title: 'Crypto Trading Strategies',
    description: 'Strategi trading cryptocurrency untuk pemula hingga advanced, lengkap dengan analisis teknikal.',
    price: 29.99,
    originalPrice: 59.99,
    currency: 'USDT',
    image: '/products/ebook-crypto.png',
    category: 'E-Book',
    reviewSummary: {
      averageRating: 4.6,
      totalReviews: 156,
      ratingDistribution: { 5: 90, 4: 40, 3: 18, 2: 5, 1: 3 },
    },
    recentReviews: [
      { id: 'r8', userId: 'u8', userName: 'Hadi N.', rating: 5, comment: 'Strategi-nya applicable dan profit!', createdAt: '2026-05-27T11:10:00Z' },
      { id: 'r9', userId: 'u9', userName: 'Indah L.', rating: 4, comment: 'Banyak insight baru, recommended.', createdAt: '2026-05-24T09:30:00Z' },
    ],
  },
  {
    id: 5,
    title: 'Notion Template Bundle',
    description: 'Koleksi 30+ template Notion untuk produktivitas, project management, dan life planning.',
    price: 9.99,
    currency: 'USDT',
    image: '/products/template-notion.png',
    category: 'Template',
    badge: 'Hot Deal',
    reviewSummary: {
      averageRating: 4.9,
      totalReviews: 523,
      ratingDistribution: { 5: 440, 4: 60, 3: 15, 2: 5, 1: 3 },
    },
    recentReviews: [
      { id: 'r10', userId: 'u10', userName: 'Joko A.', rating: 5, comment: 'Produktivitas naik drastis!', createdAt: '2026-05-29T15:00:00Z' },
      { id: 'r11', userId: 'u11', userName: 'Karin S.', rating: 5, comment: 'Template terlengkap yang pernah saya beli.', createdAt: '2026-05-28T18:45:00Z' },
    ],
  },
  {
    id: 6,
    title: 'AI & Machine Learning Guide',
    description: 'Pelajari AI dari dasar hingga implementasi model ML dengan Python, TensorFlow & PyTorch.',
    price: 34.99,
    originalPrice: 69.99,
    currency: 'USDT',
    image: '/products/ebook-ai.png',
    category: 'E-Book',
    badge: 'Trending',
    reviewSummary: {
      averageRating: 4.8,
      totalReviews: 301,
      ratingDistribution: { 5: 230, 4: 50, 3: 14, 2: 4, 1: 3 },
    },
    recentReviews: [
      { id: 'r12', userId: 'u12', userName: 'Luki H.', rating: 5, comment: 'Dari nol bisa bikin model ML sendiri!', createdAt: '2026-05-29T07:00:00Z' },
      { id: 'r13', userId: 'u13', userName: 'Maya D.', rating: 4, comment: 'Penjelasan teori dan praktiknya seimbang.', createdAt: '2026-05-26T22:15:00Z' },
    ],
  },
  {
    id: 7,
    title: 'Premium Resume Templates',
    description: '20 template CV/Resume premium ATS-friendly untuk berbagai industri dan profesi.',
    price: 7.99,
    originalPrice: 14.99,
    currency: 'USDT',
    image: '/products/template-resume.png',
    category: 'Template',
    reviewSummary: {
      averageRating: 4.5,
      totalReviews: 267,
      ratingDistribution: { 5: 150, 4: 75, 3: 28, 2: 10, 1: 4 },
    },
    recentReviews: [
      { id: 'r14', userId: 'u14', userName: 'Nanda F.', rating: 5, comment: 'Langsung dapat panggilan interview!', createdAt: '2026-05-28T13:30:00Z' },
      { id: 'r15', userId: 'u15', userName: 'Oscar B.', rating: 4, comment: 'Desainnya profesional dan clean.', createdAt: '2026-05-25T10:45:00Z' },
    ],
  },
  {
    id: 8,
    title: 'DeFi Revolution',
    description: 'Memahami ekosistem DeFi: yield farming, liquidity pools, DEX, dan strategi investasi.',
    price: 27.50,
    originalPrice: 54.99,
    currency: 'USDT',
    image: '/products/ebook-defi.png',
    category: 'E-Book',
    badge: 'Featured',
    reviewSummary: {
      averageRating: 4.7,
      totalReviews: 198,
      ratingDistribution: { 5: 130, 4: 45, 3: 15, 2: 5, 1: 3 },
    },
    recentReviews: [
      { id: 'r16', userId: 'u16', userName: 'Putri A.', rating: 5, comment: 'DeFi jadi nggak intimidating lagi.', createdAt: '2026-05-29T09:15:00Z' },
      { id: 'r17', userId: 'u17', userName: 'Reza M.', rating: 4, comment: 'Bab yield farming-nya paling berguna.', createdAt: '2026-05-27T17:00:00Z' },
    ],
  },
];
