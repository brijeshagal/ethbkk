import { DEFAULT_MULTICALL_ADDRESS } from "@/constants/chains";
import { HexString } from "@/types/address";
import { Chain, createPublicClient, http } from "viem";
import * as allViemChains from "viem/chains";

export const viemChainsById: Record<number, Chain> = Object.values(
  allViemChains
).reduce((acc, chainData) => {
  return chainData.id
    ? {
        ...acc,
        [chainData.id]: chainData,
      }
    : acc;
}, {});

export const getPublicClient = (chainId: number) =>
  createPublicClient({
    chain: viemChainsById[chainId],
    transport: http(),
  });

export const getMulticall3Address = (chainId: number): HexString => {
  return (
    viemChainsById[chainId].contracts?.multicall3?.address ||
    DEFAULT_MULTICALL_ADDRESS
  );
};
