# BStore — Decentralized E-Book Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Web3](https://img.shields.io/badge/Web3-Wagmi%20%7C%20Viem-purple?style=for-the-badge&logo=ethereum)](https://wagmi.sh/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **BStore** adalah platform e-commerce e-book terdesentralisasi generasi baru yang memadukan performa **Next.js 14 App Router** dengan keamanan pembayaran **Web3 Smart Contract (USDT/USDC)** di atas jaringan blockchain multichain.

---

## 🌟 Mengapa BStore Unik? (Key Highlights)

* **🌐 Multi-Chain Web3 Payments:** Pembayaran instan menggunakan stablecoin (USDT / USDC) di Ethereum Mainnet, Sepolia Testnet, Polygon, Arbitrum, Optimism, dan BSC.
* **🛡️ Fraud-Proof On-Chain Verification:** Backend memverifikasi tanda tangan transaksi (*txHash*) secara real-time langsung ke node blockchain sebelum memberikan akses unduhan.
* **🔒 Protected E-Book Streaming System:** File fisik PDF disimpan di folder privat terisolasi (di luar `/public`) dan di-stream secara aman hanya untuk dompet terverifikasi di MySQL database.
* **⚙️ Interactive Admin Dashboard:** Dilengkapi dengan analisis ulasan, manajemen produk, dan badge *Transaction Hash* yang langsung terhubung ke **Etherscan**.
* **💎 Sci-Fi Glassmorphism UI:** Desain antarmuka modern dengan mode gelap, animasi mikro, dan UI/UX interaktif berbasis CSS variables kustom.

---

## 🏗️ Arsitektur Sistem (System Architecture)

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Pembeli (MetaMask)
    participant FE as 💻 Next.js Frontend
    participant API as ⚡ Next.js API Routes
    participant BC as 🌐 Ethereum Blockchain (Sepolia)
    participant DB as 🗄️ MySQL Database
    participant Storage as 📁 Private E-Book Storage

    User->>FE: 1. Pilih E-Book & Klik "Checkout Sekarang"
    FE->>User: 2. Transaksi Transfer USDT (Wagmi/Viem)
    User->>BC: 3. Konfirmasi Transaksi di MetaMask
    BC-->>FE: 4. Transaksi Sukses & Kembalikan TxHash
    FE->>API: 5. POST /api/purchases (txHash, walletAddress, productId)
    API->>BC: 6. Verifikasi Receipt TxHash On-Chain
    BC-->>API: 7. Status Verified SUCCESS
    API->>DB: 8. Simpan Catatan Pembelian
    API-->>FE: 9. Respon Sukses
    FE->>API: 10. GET /api/download?productId=X&walletAddress=Y
    API->>DB: 11. Cek Hak Akses Dompet di Database
    DB-->>API: 12. Hak Akses Dikonfirmasi
    API->>Storage: 13. Baca Stream File PDF
    Storage-->>User: 14. Otomatis Download E-Book PDF
```

---

## 🚀 Fitur Utama (Core Features)

### 🛒 1. Shopping Cart & Web3 Checkout
- Keranjang belanja interaktif dengan kalkulasi instan.
- Deteksi otomatis jaringan dompet (Sepolia, Arbitrum, Polygon, dll).
- Integrasi dompet modern via **RainbowKit & Wagmi**.
- Proteksi harga dengan konversi desimal token presisi tinggi.

### 🔐 2. Sistem Unduhan Terproteksi
- Menolak akses (*403 Forbidden*) jika dompet belum memiliki riwayat transaksi terverifikasi di MySQL.
- Mencegah kebocoran tautan dan unduhan ilegal secara otomatis.

### 📊 3. Admin Dashboard & Verifikasi Ulasan
- Kelola katalog produk e-book (Tambah, Edit, Hapus).
- Pantau ulasan pembeli terverifikasi beserta link bukti **Transaction Hash** ke Etherscan.
- Proteksi sesi admin menggunakan **JWT Token & Web Crypto API**.

---

## 🛠️ Teknologi & Stack (Tech Stack)

| Kategori | Teknologi Yang Digunakan |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & Theme** | Vanilla CSS3 (Sci-Fi Glassmorphism System), CSS Variables |
| **Web3 Libraries** | Wagmi v2, Viem, RainbowKit, Ethers.js |
| **Smart Contracts** | Solidity 0.8.28, Hardhat, OpenZeppelin ERC-20 |
| **Database** | MySQL (Connection Pooling via `mysql2/promise`) |
| **State Management** | React Query (TanStack Query v5), React Context API |
| **Security & Auth** | Web Crypto API (`crypto.subtle`), JWT, HTTP-Only Cookies |

---

## ⚙️ Panduan Instalasi & Memulai (Getting Started)

### 1. Kloning Repository
```bash
git clone https://github.com/username-anda/my-ebook-store.git
cd my-ebook-store
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Buat file `.env.local` di root folder proyek Anda:

```env
# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=my_ebook_store

# Web3 & Merchant
NEXT_PUBLIC_MERCHANT_ADDRESS=0x71C7656EC7ab88b098defB751B7401B5f6d8976F
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=wallet_connect_project_id_anda
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia

# Auth & Secrets
ADMIN_SESSION_SECRET=rahasia_super_aman_jwt_admin_anda
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📄 Smart Contract Info

- **Token Name:** Mock Tether USD (`MockUSDT`)
- **Sepolia Testnet Contract Address:** [`0x6b25442abad6c9a19616d8e5e1b6b7c3a772dc23`](https://sepolia.etherscan.io/address/0x6b25442abad6c9a19616d8e5e1b6b7c3a772dc23)
- **Decimals:** 6

---

## 👨‍💻 Author & Creator

* **Developer:** [Nama Anda](https://github.com/username-anda)
* **Contract Deployer Wallet:** `0x47a...6dbd5`
* **License:** [MIT License](LICENSE)

---

<p align="center">
  <i>Developed with ❤️ for the Web3 & Open-Source Community</i>
</p>
