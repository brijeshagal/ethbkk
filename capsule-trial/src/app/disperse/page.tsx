"use client";

import CapsuleButton from "@/components/capsule/CapsuleButton";
import { initializeKlaster } from "@/service/klaster/basic";
import { preTransactKlaster } from "@/service/klaster/pretransfer";
import { HexString } from "@/types/address";
import { parseEther } from "viem";
import { sepolia } from "viem/chains";
import { useAccount } from "wagmi";

export default function Disperse() {
  const { address: account } = useAccount();
  return (
    <div className="flex flex-col gap-4">
      <CapsuleButton />
      <button
        disabled={!account}
        onClick={() => {
          initializeKlaster();
        }}
      >
        Disperse From Smart Wallet
      </button>
      <button
        disabled={!account}
        onClick={() => {
          preTransactKlaster({
            account: account as HexString,
            amount: parseEther("0.01"),
            gasFeeChainId: sepolia.id,
          });
        }}
      >
        Disperse from EOA
      </button>
    </div>
  );
}
