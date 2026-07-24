'use client';

import * as React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './context/CartContext';

const queryClient = new QueryClient();

const config = getDefaultConfig({
    appName: 'BStore',
    projectId: 'd1cbd83f5080849c3f24e0433fc9ff0a', // Dapatkan dari cloud.walletconnect.com
    chains: [sepolia],
    ssr: true, // Sangat penting untuk Next.js App Router
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme({
                    accentColor: '#ffffff',
                    accentColorForeground: '#000000',
                    borderRadius: 'none',
                })}>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}