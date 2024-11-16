"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CapsuleEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
} from "@usecapsule/evm-wallet-connectors";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  gnosis,
  mainnet,
  optimism,
  polygon,
  scroll,
  sepolia,
} from "wagmi/chains";

const queryClient = new QueryClient();

export const CapsuleWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CapsuleEvmProvider
        config={{
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_API as string,
          appName: "Your App Name",
          chains: [arbitrumSepolia, sepolia, arbitrum, optimism, scroll, base, gnosis, mainnet, polygon],
          wallets: [
            metaMaskWallet,
            rainbowWallet,
            walletConnectWallet,
            zerionWallet,
            coinbaseWallet,
          ],
        }}
      >
        {children}
      </CapsuleEvmProvider>
    </QueryClientProvider>
  );
};
