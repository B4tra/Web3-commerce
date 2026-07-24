// Konfigurasi Terpusat Web3, Smart Contracts, dan Alamat Merchant
export const MERCHANT_ADDRESS = (
  process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || '0x47A739F94Bf5662641c8beE8D9463E1e7736DBD5'
).toLowerCase() as `0x${string}`;

// Pemetaan Alamat Smart Contract USDT / Stablecoin per Jaringan Blockchain (Hanya Testnet Sepolia)
export const USDT_ADDRESSES: Record<number, `0x${string}`> = {
  11155111: '0x6b25442abad6c9a19616d8e5e1b6b7c3a772dc23', // Sepolia Testnet (MockUSDT)
};

// Pemetaan Alamat Smart Contract USDC / Stablecoin per Jaringan Blockchain (Hanya Testnet Sepolia)
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  11155111: '0x6b25442abad6c9a19616d8e5e1b6b7c3a772dc23', // Sepolia Testnet (MockUSDC)
};

// RPC Fallback URLs
export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';
