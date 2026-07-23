// Konfigurasi Terpusat Web3, Smart Contracts, dan Alamat Merchant
export const MERCHANT_ADDRESS = (
  process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
).toLowerCase() as `0x${string}`;

// Pemetaan Alamat Smart Contract USDT / Stablecoin per Jaringan Blockchain
export const USDT_ADDRESSES: Record<number, `0x${string}`> = {
  1: '0xdac17f958d2ee523a2206206994597c13d831ec7',        // Ethereum Mainnet
  137: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',      // Polygon Mainnet
  42161: '0xfd086bc7cd5c481dcc9c85ebe478a1d0ce538380',    // Arbitrum One
  10: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',       // Optimism
  56: '0x55d398326f99059ff775485246999027b3197955',       // BNB Smart Chain
  11155111: '0x6b25442abad6c9a19616d8e5e1b6b7c3a772dc23', // Sepolia Testnet (MockUSDT)
};

// RPC Fallback URLs
export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';
