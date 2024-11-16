import { createWalletClient, custom } from "viem";
import { viemChainsById } from "./publicClient";

export const walletClient = (chainId: number) =>
  createWalletClient({
    chain: viemChainsById[chainId],
    transport: custom(window.ethereum!),
  });
