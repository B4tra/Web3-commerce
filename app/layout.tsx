import type { Metadata } from 'next';
import './globals.css';
// 1. Import Providers yang telah dibuat
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Bstore - Marketplace Produk Digital Web3',
  description: 'Temukan e-book, template, dan resource digital premium. Transaksi aman dengan teknologi Web3.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* 2. Bungkus children dengan Providers */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}